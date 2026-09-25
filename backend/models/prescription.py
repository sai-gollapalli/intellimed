"""
IntelliMed - Prescription Model
Doctor prescriptions with medicines stored as JSONB.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, func
from sqlalchemy.orm import relationship
from backend.database import Base


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    prescription_code = Column(String(20), unique=True, nullable=False, index=True)  # RX-000001
    diagnosis_id = Column(Integer, ForeignKey("diagnoses.id"), nullable=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)

    # Medicines stored as JSONB array:
    # [{"medicine_id": 1, "name": "...", "dosage": "500mg", "frequency": "twice daily", 
    #   "duration": "7 days", "instructions": "after meals"}]
    medicines = Column(JSON, default=list, nullable=False)

    notes = Column(Text)
    pdf_path = Column(String(500))
    is_dispensed = Column(String(20), default="pending")  # pending, partial, dispensed
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    diagnosis = relationship("Diagnosis", back_populates="prescriptions")
    patient = relationship("Patient", back_populates="prescriptions")
    doctor = relationship("Doctor", back_populates="prescriptions")

    def __repr__(self):
        return f"<Prescription(id={self.id}, code='{self.prescription_code}')>"
