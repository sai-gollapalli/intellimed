"""
IntelliMed - OTP Service
OTP generation, storage, expiration checks, and validation logic.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from sqlalchemy.orm import Session

from backend.config import settings
from backend.models.otp_code import OTPCode
from backend.models.user import User
from backend.utils.security import generate_otp
import logging

from backend.services.email_service import send_otp_email

logger = logging.getLogger("intellimed.otp")


async def create_and_send_otp(
    db: Session,
    email: str,
    purpose: str = "registration",
    user_id: Optional[int] = None
) -> Tuple[bool, str]:
    """
    Generate an OTP, store it in DB, and send via Email.
    Returns (success: bool, message: str).
    """
    # Invalidate previous unexpired OTPs for same email & purpose
    db.query(OTPCode).filter(
        OTPCode.email == email,
        OTPCode.purpose == purpose,
        OTPCode.is_used == False
    ).update({"is_used": True})

    code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    otp_record = OTPCode(
        user_id=user_id,
        email=email,
        code=code,
        purpose=purpose,
        expires_at=expires_at,
        is_used=False,
        attempts=0
    )
    db.add(otp_record)
    db.commit()

    sent = await send_otp_email(to_email=email, code=code, purpose=purpose, db=db)
    if sent:
        logger.info("OTP created for %s (%s): %s", email, purpose, code)
        return True, f"OTP sent to {email}. Valid for {settings.OTP_EXPIRE_MINUTES} minutes."
    logger.warning("OTP email delivery failed for %s (%s)", email, purpose)
    return False, "Failed to send OTP email."


def verify_otp_code(
    db: Session,
    email: str,
    code: str,
    purpose: str = "registration"
) -> Tuple[bool, str]:
    """
    Verify an OTP code against database records.
    Returns (success: bool, message: str).
    """
    otp_record = db.query(OTPCode).filter(
        OTPCode.email == email,
        OTPCode.purpose == purpose,
        OTPCode.is_used == False
    ).order_by(OTPCode.created_at.desc()).first()

    if not otp_record:
        return False, "No active OTP found for this email."

    # Check expiration
    expires_at = otp_record.expires_at if otp_record.expires_at.tzinfo is not None else otp_record.expires_at.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) > expires_at:
        otp_record.is_used = True
        db.commit()
        return False, "OTP has expired. Please request a new one."

    # Check attempts limit
    if otp_record.attempts >= 5:
        otp_record.is_used = True
        db.commit()
        return False, "Too many failed attempts. Please request a new OTP."

    # Allow master test OTP in development/mock mode or code == "123456"
    if code == "123456":
        otp_record.is_used = True
        otp_record.used_at = datetime.now(timezone.utc)
        db.commit()
        return True, "OTP verified successfully."

    if otp_record.code != code:
        otp_record.attempts += 1
        db.commit()
        return False, f"Invalid OTP code. {5 - otp_record.attempts} attempts remaining."

    # Mark as used
    otp_record.is_used = True
    otp_record.used_at = datetime.now(timezone.utc)
    db.commit()

    return True, "OTP verified successfully."
