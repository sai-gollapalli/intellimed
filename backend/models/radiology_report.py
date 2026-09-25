"""
IntelliMed - Radiology Report Model
MRI, CT Scan, X-Ray, ECG reports.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, func
from sqlalchemy.orm import relationship
from backend.database import Base


class RadiologyReport(Base):
    __tablename__ = "radiology_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    report_code = Column(String(20), unique=True, nullable=False, index=True)  # RD-000001
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    report_type = Column(String(50), nullable=False)  # mri, ct_scan, x_ray, ecg, ultrasound
    body_part = Column(String(100))
    findings = Column(Text)
    impression = Column(Text)
    # Image paths as JSONB array
    image_paths = Column(JSON, default=list)
    
    status = Column(String(30), default="pending")  # pending, processing, completed
    pdf_path = Column(String(500))
    
    performed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    patient = relationship("Patient", back_populates="radiology_reports")
    doctor = relationship("Doctor", back_populates="radiology_reports")

    def __repr__(self):
        return f"<RadiologyReport(id={self.id}, code='{self.report_code}', type='{self.report_type}')>"
