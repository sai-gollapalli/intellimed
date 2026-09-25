"""
IntelliMed - Prescriptions Router
Doctor prescription creation and pharmacist dispensing.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.prescription import Prescription
from backend.models.doctor import Doctor
from backend.models.user import User
from backend.schemas.prescription import PrescriptionCreate, PrescriptionDispense, PrescriptionResponse
from backend.middleware.auth_middleware import get_current_user, require_doctor, require_roles
from backend.middleware.audit_middleware import create_audit_log
from backend.utils.security import generate_code

router = APIRouter(prefix="/api/prescriptions", tags=["Prescriptions"])


def _next_prescription_code(db: Session) -> str:
    from sqlalchemy import func
    last = db.query(func.max(Prescription.id)).scalar() or 0
    return generate_code("RX", last)


@router.post("", response_model=PrescriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_prescription(
    data: PrescriptionCreate,
    request: Request,
    current_user: User = Depends(require_doctor),
    db: Session = Depends(get_db),
):
    """Create a new prescription (Doctor only)."""
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=400, detail="No doctor profile associated with this account.")

    prescription = Prescription(
        prescription_code=_next_prescription_code(db),
        patient_id=data.patient_id,
        doctor_id=doctor.id,
        diagnosis_id=data.diagnosis_id,
        medicines=[m.model_dump() for m in data.medicines],
        notes=data.notes,
        is_dispensed="pending",
    )
    db.add(prescription)
    db.commit()
    db.refresh(prescription)

    create_audit_log(
        db, user_id=current_user.id, action="create_prescription",
        resource="prescriptions", resource_id=prescription.id,
        ip_address=request.client.host if request.client else None,
    )
    return prescription


@router.get("", response_model=list[PrescriptionResponse])
async def list_prescriptions(
    patient_id: Optional[int] = Query(None),
    doctor_id: Optional[int] = Query(None),
    is_dispensed: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List prescriptions with filters."""
    query = db.query(Prescription)

    if patient_id:
        query = query.filter(Prescription.patient_id == patient_id)
    if doctor_id:
        query = query.filter(Prescription.doctor_id == doctor_id)
    if is_dispensed:
        query = query.filter(Prescription.is_dispensed == is_dispensed)

    # Patients see only their own
    if current_user.role.name == "patient":
        from backend.models.patient import Patient as PatientModel
        patient = db.query(PatientModel).filter(PatientModel.user_id == current_user.id).first()
        if patient:
            query = query.filter(Prescription.patient_id == patient.id)
        else:
            return []

    results = (
        query
        .order_by(Prescription.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return results


@router.get("/{prescription_id}", response_model=PrescriptionResponse)
async def get_prescription(
    prescription_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get single prescription by ID."""
    rx = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found.")
    return rx


@router.patch("/{prescription_id}/dispense", response_model=PrescriptionResponse)
async def dispense_prescription(
    prescription_id: int,
    data: PrescriptionDispense,
    request: Request,
    current_user: User = Depends(require_roles(["super_admin", "hospital_admin", "pharmacist"])),
    db: Session = Depends(get_db),
):
    """Pharmacist marks prescription as dispensed or partially dispensed."""
    rx = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found.")

    rx.is_dispensed = data.status
    if data.notes:
        rx.notes = (rx.notes or "") + f"\n[Pharmacist Note] {data.notes}"
    db.commit()
    db.refresh(rx)

    create_audit_log(
        db, user_id=current_user.id, action="dispense_prescription",
        resource="prescriptions", resource_id=rx.id,
        ip_address=request.client.host if request.client else None,
    )
    return rx
