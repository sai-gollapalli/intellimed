"""
IntelliMed - Inventory Model
Medicine stock tracking with batch numbers and expiry dates.
"""

from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from backend.database import Base


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, autoincrement=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False, index=True)
    batch_no = Column(String(50), nullable=False)
    quantity = Column(Integer, default=0)
    reorder_level = Column(Integer, default=10)
    expiry_date = Column(Date, nullable=False)
    supplier = Column(String(200))
    purchase_price = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    medicine = relationship("Medicine", back_populates="inventory")

    def __repr__(self):
        return f"<Inventory(id={self.id}, medicine={self.medicine_id}, qty={self.quantity})>"
