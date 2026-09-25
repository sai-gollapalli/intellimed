"""
IntelliMed - Prescription Schemas
Pydantic schemas for prescriptions.
"""

from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, Field


class PrescriptionMedicineItem(BaseModel):
    medicine_id: Optional[int] = None
    name: str
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None


class PrescriptionCreate(BaseModel):
    patient_id: int
    diagnosis_id: Optional[int] = None
    medicines: List[PrescriptionMedicineItem] = Field(..., min_length=1)
    notes: Optional[str] = None


class PrescriptionDispense(BaseModel):
    """Schema for pharmacist to mark a prescription as dispensed."""
    prescription_id: int
    status: str = Field(..., pattern="^(partial|dispensed)$")
    notes: Optional[str] = None


class PrescriptionResponse(BaseModel):
    id: int
    prescription_code: str
    patient_id: int
    doctor_id: int
    diagnosis_id: Optional[int] = None
    medicines: List[Any]
    notes: Optional[str] = None
    pdf_path: Optional[str] = None
    is_dispensed: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
