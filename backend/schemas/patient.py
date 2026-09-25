"""
IntelliMed - Patient Schemas
Pydantic schemas for patient creation, updates, responses, and search queries.
"""

from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, EmailStr, Field


class PatientBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: date
    gender: str  # Male, Female, Other
    phone: str = Field(..., min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    
    # Address
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

    # Medical Info
    blood_group: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    known_allergies: Optional[str] = None
    medical_history_summary: Optional[str] = None

    # Emergency Contact
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None

    # Insurance
    insurance_provider: Optional[str] = None
    insurance_policy_no: Optional[str] = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address_line1: Optional[str] = None
    city: Optional[str] = None
    blood_group: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    known_allergies: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_policy_no: Optional[str] = None


class PatientResponse(PatientBase):
    id: int
    patient_code: str
    age: Optional[int] = None
    photo_path: Optional[str] = None
    insurance_card_path: Optional[str] = None
    id_proof_path: Optional[str] = None
    qr_code_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PatientListItem(PatientBase):
    id: int
    patient_code: str
    age: Optional[int] = None
    photo_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PatientSearchResponse(BaseModel):
    total: int
    page: int
    page_size: int
    results: List[PatientListItem]


class PatientSearchQuery(BaseModel):
    query: str  # Code, phone, QR code payload, or name
