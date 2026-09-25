"""
IntelliMed - Lab Report Model
Blood, urine, and other lab test reports.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, func
from sqlalchemy.orm import relationship
from backend.database import Base


class LabReport(Base):
    __tablename__ = "lab_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    report_code = Column(String(20), unique=True, nullable=False, index=True)  # LR-000001
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    report_type = Column(String(50), nullable=False)  # blood, urine, cbc, liver_function, etc.
    test_name = Column(String(200), nullable=False)

    # Results stored as JSONB:
    # [{"parameter": "Hemoglobin", "value": "14.5", "unit": "g/dL", "normal_range": "12-16", "status": "normal"}]
    results = Column(JSON, default=list)

    status = Column(String(30), default="pending")  # pending, processing, completed, cancelled
    notes = Column(Text)
    pdf_path = Column(String(500))
    
    sample_collected_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    patient = relationship("Patient", back_populates="lab_reports")
    doctor = relationship("Doctor", back_populates="lab_reports")

    def __repr__(self):
        return f"<LabReport(id={self.id}, code='{self.report_code}', type='{self.report_type}')>"
