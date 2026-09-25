"""
IntelliMed - Role Model
Defines user roles: Super Admin, Hospital Admin, Receptionist, Doctor, Lab Technician, Pharmacist, Patient
"""

from sqlalchemy import Column, Integer, String, JSON, DateTime, func
from sqlalchemy.orm import relationship
from backend.database import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    description = Column(String(500))
    permissions = Column(JSON, default=list)  # List of permission strings
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    users = relationship("User", back_populates="role")

    def __repr__(self):
        return f"<Role(id={self.id}, name='{self.name}')>"
