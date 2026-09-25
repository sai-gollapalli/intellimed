"""
IntelliMed - OTP Code Model
One-time passwords for email verification, password reset, etc.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from backend.database import Base


class OTPCode(Base):
    __tablename__ = "otp_codes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    email = Column(String(255), nullable=False, index=True)
    code = Column(String(10), nullable=False)
    purpose = Column(String(50), nullable=False)
    # Purposes: registration, email_verification, forgot_password, appointment_confirmation, login
    is_used = Column(Boolean, default=False)
    attempts = Column(Integer, default=0)  # Track failed attempts
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="otp_codes")

    def __repr__(self):
        return f"<OTPCode(id={self.id}, email='{self.email}', purpose='{self.purpose}')>"
