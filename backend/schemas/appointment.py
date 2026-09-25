"""
IntelliMed - Appointment Schemas
Pydantic schemas for appointment booking, updates, and responses.
"""

from typing import Optional, List
from datetime import datetime, date, time
from pydantic import BaseModel, Field

from backend.schemas.patient import PatientListItem
from backend.schemas.auth import UserResponse


class DoctorBriefResponse(BaseModel):
    id: int
    specialization: str
    qualification: Optional[str] = None
    consultation_fee: float
    is_available: bool
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class DepartmentResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: int
    department_id: int
    appointment_date: date
    time_slot_start: time
    time_slot_end: time
    appointment_type: str = "consultation"  # consultation, follow_up, emergency
    reason: Optional[str] = None
    notes: Optional[str] = None


class AppointmentUpdate(BaseModel):
    appointment_date: Optional[date] = None
    time_slot_start: Optional[time] = None
    time_slot_end: Optional[time] = None
    appointment_type: Optional[str] = None
    reason: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    cancelled_reason: Optional[str] = None


class AppointmentCheckIn(BaseModel):
    appointment_id: int


class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    department_id: int
    appointment_date: date
    time_slot_start: time
    time_slot_end: time
    status: str
    appointment_type: str
    reason: Optional[str] = None
    notes: Optional[str] = None
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    cancelled_reason: Optional[str] = None
    created_at: datetime
    # Nested
    patient: Optional[PatientListItem] = None
    department: Optional[DepartmentResponse] = None

    class Config:
        from_attributes = True


class AppointmentListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    results: List[AppointmentResponse]
