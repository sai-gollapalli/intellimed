"""
IntelliMed - Appointments Router
Book, manage, check-in, complete, and cancel patient appointments.
"""

from datetime import date, datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from backend.database import get_db
from backend.models.appointment import Appointment
from backend.models.patient import Patient
from backend.models.doctor import Doctor
from backend.models.user import User
from backend.schemas.appointment import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
    AppointmentListResponse,
)
from backend.middleware.auth_middleware import get_current_user, require_receptionist
from backend.middleware.audit_middleware import create_audit_log

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def book_appointment(
    data: AppointmentCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Book a new appointment (Receptionist / Admin / Patient for self)."""
    # If patient role, ensure they're booking for themselves
    if current_user.role.name == "patient":
        from backend.models.patient import Patient as PatientModel
        patient = db.query(PatientModel).filter(PatientModel.user_id == current_user.id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found.")
        # Override patient_id to ensure patients can only book for themselves
        data.patient_id = patient.id
    else:
        # For staff, validate the patient exists
        patient = db.query(Patient).filter(Patient.id == data.patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found.")

    doctor = db.query(Doctor).filter(Doctor.id == data.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found.")

    if not doctor.is_available:
        raise HTTPException(status_code=409, detail="Doctor is currently unavailable.")

    # Check slot conflict for this doctor
    conflict = db.query(Appointment).filter(
        and_(
            Appointment.doctor_id == data.doctor_id,
            Appointment.appointment_date == data.appointment_date,
            Appointment.status.notin_(["cancelled", "completed"]),
            or_(
                and_(
                    Appointment.time_slot_start <= data.time_slot_start,
                    Appointment.time_slot_end > data.time_slot_start,
                ),
                and_(
                    Appointment.time_slot_start < data.time_slot_end,
                    Appointment.time_slot_end >= data.time_slot_end,
                ),
            )
        )
    ).first()

    if conflict:
        raise HTTPException(
            status_code=409,
            detail=f"Doctor already has an appointment in this time slot: {conflict.time_slot_start} – {conflict.time_slot_end}."
        )

    appointment = Appointment(
        patient_id=data.patient_id,
        doctor_id=data.doctor_id,
        department_id=data.department_id,
        appointment_date=data.appointment_date,
        time_slot_start=data.time_slot_start,
        time_slot_end=data.time_slot_end,
        appointment_type=data.appointment_type,
        reason=data.reason,
        notes=data.notes,
        status="scheduled",
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    create_audit_log(
        db, user_id=current_user.id, action="book_appointment",
        resource="appointments", resource_id=appointment.id,
        ip_address=request.client.host if request.client else None,
    )
    return appointment


@router.get("", response_model=AppointmentListResponse)
async def list_appointments(
    patient_id: Optional[int] = Query(None),
    doctor_id: Optional[int] = Query(None),
    appointment_date: Optional[date] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List/filter appointments with optional filters."""
    query = db.query(Appointment)

    if patient_id:
        query = query.filter(Appointment.patient_id == patient_id)
    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
    if appointment_date:
        query = query.filter(Appointment.appointment_date == appointment_date)
    if status:
        query = query.filter(Appointment.status == status)

    # For patient role: only show their own appointments
    if current_user.role.name == "patient":
        from backend.models.patient import Patient as PatientModel
        patient = db.query(PatientModel).filter(PatientModel.user_id == current_user.id).first()
        if patient:
            query = query.filter(Appointment.patient_id == patient.id)
        else:
            return AppointmentListResponse(total=0, page=page, page_size=page_size, results=[])

    total = query.count()
    results = (
        query
        .order_by(Appointment.appointment_date.desc(), Appointment.time_slot_start.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return AppointmentListResponse(
        total=total,
        page=page,
        page_size=page_size,
        results=[AppointmentResponse.model_validate(a) for a in results],
    )


@router.get("/today", response_model=AppointmentListResponse)
async def today_appointments(
    doctor_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all appointments for today (optionally filtered by doctor)."""
    today = date.today()
    query = db.query(Appointment).filter(Appointment.appointment_date == today)

    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
    elif current_user.role.name == "doctor":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if doctor:
            query = query.filter(Appointment.doctor_id == doctor.id)

    total = query.count()
    results = query.order_by(Appointment.time_slot_start).all()

    return AppointmentListResponse(
        total=total,
        page=1,
        page_size=total or 1,
        results=[AppointmentResponse.model_validate(a) for a in results],
    )


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single appointment by ID."""
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    return appt


@router.patch("/{appointment_id}/check-in", response_model=AppointmentResponse)
async def check_in(
    appointment_id: int,
    request: Request,
    current_user: User = Depends(require_receptionist),
    db: Session = Depends(get_db),
):
    """Mark patient as checked-in for their appointment."""
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    if appt.status not in ("scheduled", "confirmed"):
        raise HTTPException(status_code=400, detail=f"Cannot check in appointment with status '{appt.status}'.")

    appt.status = "checked_in"
    appt.check_in_time = datetime.now(timezone.utc)
    db.commit()
    db.refresh(appt)

    create_audit_log(
        db, user_id=current_user.id, action="checkin_patient",
        resource="appointments", resource_id=appt.id,
        ip_address=request.client.host if request.client else None,
    )
    return appt


@router.patch("/{appointment_id}/complete", response_model=AppointmentResponse)
async def complete_appointment(
    appointment_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark appointment as completed (Doctor / Admin)."""
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    appt.status = "completed"
    appt.check_out_time = datetime.now(timezone.utc)
    db.commit()
    db.refresh(appt)

    create_audit_log(
        db, user_id=current_user.id, action="complete_appointment",
        resource="appointments", resource_id=appt.id,
        ip_address=request.client.host if request.client else None,
    )
    return appt


@router.patch("/{appointment_id}/cancel", response_model=AppointmentResponse)
async def cancel_appointment(
    appointment_id: int,
    reason: str = Query(...),
    request: Request = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel an appointment."""
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    if appt.status in ("completed", "cancelled"):
        raise HTTPException(status_code=400, detail=f"Cannot cancel appointment with status '{appt.status}'.")

    appt.status = "cancelled"
    appt.cancelled_reason = reason
    db.commit()
    db.refresh(appt)
    return appt


@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: int,
    data: AppointmentUpdate,
    request: Request,
    current_user: User = Depends(require_receptionist),
    db: Session = Depends(get_db),
):
    """Update appointment details."""
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(appt, field, value)

    db.commit()
    db.refresh(appt)
    return appt
