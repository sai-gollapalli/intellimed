"""
IntelliMed - Appointment Model
Tracks patient appointments with doctors including check-in/check-out.
"""

from sqlalchemy import Column, Integer, String, Date, Time, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from backend.database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    appointment_date = Column(Date, nullable=False, index=True)
    time_slot_start = Column(Time, nullable=False)
    time_slot_end = Column(Time, nullable=False)
    status = Column(String(30), default="scheduled", index=True)
    # Status values: scheduled, confirmed, checked_in, in_progress, completed, cancelled, no_show
    appointment_type = Column(String(50), default="consultation")  # consultation, follow_up, emergency
    reason = Column(Text)
    notes = Column(Text)
    check_in_time = Column(DateTime(timezone=True))
    check_out_time = Column(DateTime(timezone=True))
    cancelled_reason = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    department = relationship("Department", back_populates="appointments")
    diagnoses = relationship("Diagnosis", back_populates="appointment")
    billing = relationship("Billing", back_populates="appointment", uselist=False)

    def __repr__(self):
        return f"<Appointment(id={self.id}, patient={self.patient_id}, doctor={self.doctor_id}, date={self.appointment_date})>"
