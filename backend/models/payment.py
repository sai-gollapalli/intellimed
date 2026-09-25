"""
IntelliMed - Payment Model
Tracks individual payments against billing invoices.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from backend.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    billing_id = Column(Integer, ForeignKey("billing.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=False)  # cash, card, upi, insurance, online
    transaction_id = Column(String(100))
    status = Column(String(30), default="completed")  # completed, pending, failed, refunded
    notes = Column(String(500))
    
    paid_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    billing = relationship("Billing", back_populates="payments")

    def __repr__(self):
        return f"<Payment(id={self.id}, amount={self.amount}, method='{self.payment_method}')>"
