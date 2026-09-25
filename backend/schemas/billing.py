"""
IntelliMed - Billing Schemas
Pydantic schemas for billing, invoices, and payments.
"""

from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, Field


class BillingItem(BaseModel):
    description: str
    quantity: float = 1.0
    unit_price: float
    amount: float


class BillingCreate(BaseModel):
    patient_id: int
    appointment_id: Optional[int] = None
    items: List[BillingItem] = Field(..., min_length=1)
    discount: float = 0.0
    gst_percent: float = 18.0
    insurance_claim: float = 0.0
    notes: Optional[str] = None


class BillingUpdate(BaseModel):
    status: Optional[str] = None      # unpaid, partial, paid, cancelled
    insurance_claim: Optional[float] = None
    insurance_status: Optional[str] = None
    notes: Optional[str] = None


class BillingResponse(BaseModel):
    id: int
    invoice_no: str
    patient_id: int
    appointment_id: Optional[int] = None
    items: List[Any]
    subtotal: float
    discount: float
    gst_percent: float
    gst_amount: float
    total: float
    insurance_claim: float
    insurance_status: Optional[str] = None
    amount_payable: float
    status: str
    notes: Optional[str] = None
    pdf_path: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentCreate(BaseModel):
    billing_id: int
    amount: float
    payment_method: str  # cash, card, upi, insurance
    transaction_id: Optional[str] = None
    notes: Optional[str] = None
