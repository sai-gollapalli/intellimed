"""
IntelliMed - Diagnosis Model
Doctor's diagnosis for a patient visit.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from backend.database import Base


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)

    condition = Column(String(300), nullable=False)
    icd_code = Column(String(20))  # ICD-10 code
    severity = Column(String(20))  # mild, moderate, severe, critical
    notes = Column(Text)
    follow_up_date = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    appointment = relationship("Appointment", back_populates="diagnoses")
    patient = relationship("Patient", back_populates="diagnoses")
    doctor = relationship("Doctor", back_populates="diagnoses")
    prescriptions = relationship("Prescription", back_populates="diagnosis")

    def __repr__(self):
        return f"<Diagnosis(id={self.id}, condition='{self.condition}')>"
