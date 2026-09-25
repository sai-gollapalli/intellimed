"""
IntelliMed - Billing Model
Invoice generation with GST calculation and insurance details.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, func
from sqlalchemy.orm import relationship
from backend.database import Base


class Billing(Base):
    __tablename__ = "billing"

    id = Column(Integer, primary_key=True, autoincrement=True)
    invoice_no = Column(String(20), unique=True, nullable=False, index=True)  # INV-000001
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True)

    # Line items as JSONB:
    # [{"description": "Consultation Fee", "quantity": 1, "unit_price": 500, "amount": 500}]
    items = Column(JSON, default=list, nullable=False)

    subtotal = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    gst_percent = Column(Float, default=18.0)
    gst_amount = Column(Float, default=0.0)
    total = Column(Float, default=0.0)

    # Insurance
    insurance_claim = Column(Float, default=0.0)
    insurance_status = Column(String(30))  # pending, approved, rejected
    amount_payable = Column(Float, default=0.0)  # total - insurance_claim

    status = Column(String(30), default="unpaid")  # unpaid, partial, paid, cancelled
    notes = Column(Text)
    pdf_path = Column(String(500))

    due_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    patient = relationship("Patient", back_populates="billing_records")
    appointment = relationship("Appointment", back_populates="billing")
    payments = relationship("Payment", back_populates="billing")

    def __repr__(self):
        return f"<Billing(id={self.id}, invoice='{self.invoice_no}', total={self.total})>"
