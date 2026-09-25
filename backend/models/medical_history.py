"""
IntelliMed - Medical History Model
Stores vitals and medical history entries for patients.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, func
from sqlalchemy.orm import relationship
from backend.database import Base


class MedicalHistory(Base):
    __tablename__ = "medical_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    recorded_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Vitals
    blood_pressure_systolic = Column(Integer)
    blood_pressure_diastolic = Column(Integer)
    temperature = Column(Float)  # Fahrenheit
    pulse_rate = Column(Integer)  # BPM
    respiratory_rate = Column(Integer)
    oxygen_saturation = Column(Float)  # SpO2 %
    blood_sugar = Column(Float)  # mg/dL

    # Additional vitals as JSONB for extensibility
    vitals_extra = Column(JSON, default=dict)

    # Notes
    chief_complaint = Column(Text)
    notes = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    patient = relationship("Patient", back_populates="medical_history")

    def __repr__(self):
        return f"<MedicalHistory(id={self.id}, patient_id={self.patient_id})>"
