"""
IntelliMed - Medicine Model
Medicine catalog with generic names, categories, and pricing.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from backend.database import Base


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False, index=True)
    generic_name = Column(String(200), index=True)
    category = Column(String(100))  # antibiotic, analgesic, antacid, etc.
    manufacturer = Column(String(200))
    composition = Column(String(500))
    dosage_form = Column(String(50))  # tablet, capsule, syrup, injection, etc.
    strength = Column(String(50))  # 500mg, 250ml, etc.
    unit_price = Column(Float, default=0.0)
    requires_prescription = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    inventory = relationship("Inventory", back_populates="medicine")

    def __repr__(self):
        return f"<Medicine(id={self.id}, name='{self.name}')>"
