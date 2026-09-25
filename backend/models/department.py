"""
IntelliMed - Department Model
Hospital departments (Cardiology, Neurology, etc.)
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from backend.database import Base


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(String(500))
    icon = Column(String(50))  # Icon identifier for frontend
    head_doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    doctors = relationship("Doctor", back_populates="department", foreign_keys="Doctor.department_id")
    appointments = relationship("Appointment", back_populates="department")

    def __repr__(self):
        return f"<Department(id={self.id}, name='{self.name}')>"
