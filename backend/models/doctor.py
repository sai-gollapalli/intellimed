"""
IntelliMed - Doctor Model
Doctor profile linked to user account with specialization and availability.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import relationship
from backend.database import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    specialization = Column(String(200), nullable=False)
    qualification = Column(String(300))
    license_no = Column(String(50), unique=True, nullable=False)
    experience_years = Column(Integer, default=0)
    consultation_fee = Column(Float, default=0.0)
    bio = Column(String(1000))
    # Availability stored as JSON: {"monday": [{"start": "09:00", "end": "17:00"}], ...}
    availability = Column(JSON, default=dict)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="doctor_profile")
    department = relationship("Department", back_populates="doctors", foreign_keys=[department_id])
    appointments = relationship("Appointment", back_populates="doctor")
    diagnoses = relationship("Diagnosis", back_populates="doctor")
    prescriptions = relationship("Prescription", back_populates="doctor")
    lab_reports = relationship("LabReport", back_populates="doctor")
    radiology_reports = relationship("RadiologyReport", back_populates="doctor")

    def __repr__(self):
        return f"<Doctor(id={self.id}, specialization='{self.specialization}')>"
