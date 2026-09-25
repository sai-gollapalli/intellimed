"""
IntelliMed - Billing Router
Invoice creation, payment recording, and billing management.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database import get_db
from backend.models.billing import Billing
from backend.models.payment import Payment
from backend.models.user import User
from backend.schemas.billing import BillingCreate, BillingUpdate, BillingResponse, PaymentCreate
from backend.middleware.auth_middleware import get_current_user, require_receptionist
from backend.middleware.audit_middleware import create_audit_log
from backend.utils.security import generate_code

router = APIRouter(prefix="/api/billing", tags=["Billing"])


def _next_invoice_no(db: Session) -> str:
    last = db.query(func.max(Billing.id)).scalar() or 0
    return generate_code("INV", last)


def _calculate_billing(data: BillingCreate) -> dict:
    """Compute billing totals from line items."""
    subtotal = sum(item.amount for item in data.items)
    discount = data.discount
    taxable = subtotal - discount
    gst_amount = round(taxable * data.gst_percent / 100, 2)
    total = round(taxable + gst_amount, 2)
    amount_payable = round(total - data.insurance_claim, 2)
    return {
        "subtotal": subtotal,
        "discount": discount,
        "gst_percent": data.gst_percent,
        "gst_amount": gst_amount,
        "total": total,
        "insurance_claim": data.insurance_claim,
        "amount_payable": max(amount_payable, 0.0),
    }


@router.post("", response_model=BillingResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    data: BillingCreate,
    request: Request,
    current_user: User = Depends(require_receptionist),
    db: Session = Depends(get_db),
):
    """Create a new billing invoice."""
    totals = _calculate_billing(data)

    bill = Billing(
        invoice_no=_next_invoice_no(db),
        patient_id=data.patient_id,
        appointment_id=data.appointment_id,
        items=[item.model_dump() for item in data.items],
        notes=data.notes,
        status="unpaid",
        **totals,
    )
    db.add(bill)
    db.commit()
    db.refresh(bill)

    create_audit_log(
        db, user_id=current_user.id, action="create_invoice",
        resource="billing", resource_id=bill.id,
        ip_address=request.client.host if request.client else None,
    )
    return bill


@router.get("", response_model=list[BillingResponse])
async def list_invoices(
    patient_id: Optional[int] = Query(None),
    bill_status: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List invoices with optional filters."""
    query = db.query(Billing)

    if patient_id:
        query = query.filter(Billing.patient_id == patient_id)
    if bill_status:
        query = query.filter(Billing.status == bill_status)

    if current_user.role.name == "patient":
        from backend.models.patient import Patient as PatientModel
        patient = db.query(PatientModel).filter(PatientModel.user_id == current_user.id).first()
        if patient:
            query = query.filter(Billing.patient_id == patient.id)
        else:
            return []

    return (
        query
        .order_by(Billing.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )


@router.get("/{billing_id}", response_model=BillingResponse)
async def get_invoice(
    billing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get single invoice."""
    bill = db.query(Billing).filter(Billing.id == billing_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Invoice not found.")
    return bill


@router.put("/{billing_id}", response_model=BillingResponse)
async def update_invoice(
    billing_id: int,
    data: BillingUpdate,
    current_user: User = Depends(require_receptionist),
    db: Session = Depends(get_db),
):
    """Update invoice status or insurance info."""
    bill = db.query(Billing).filter(Billing.id == billing_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(bill, field, value)

    db.commit()
    db.refresh(bill)
    return bill


@router.post("/{billing_id}/payment", status_code=status.HTTP_201_CREATED)
async def record_payment(
    billing_id: int,
    data: PaymentCreate,
    request: Request,
    current_user: User = Depends(require_receptionist),
    db: Session = Depends(get_db),
):
    """Record a payment against an invoice."""
    bill = db.query(Billing).filter(Billing.id == billing_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Invoice not found.")
    if bill.status == "paid":
        raise HTTPException(status_code=400, detail="Invoice is already fully paid.")

    payment = Payment(
        billing_id=billing_id,
        amount=data.amount,
        payment_method=data.payment_method,
        transaction_id=data.transaction_id,
        notes=data.notes,
    )
    db.add(payment)

    # Update billing status
    total_paid = sum(p.amount for p in bill.payments) + data.amount
    if total_paid >= bill.amount_payable:
        bill.status = "paid"
    else:
        bill.status = "partial"

    db.commit()

    create_audit_log(
        db, user_id=current_user.id, action="record_payment",
        resource="billing", resource_id=billing_id,
        ip_address=request.client.host if request.client else None,
    )
    return {"message": "Payment recorded.", "billing_status": bill.status, "total_paid": total_paid}
