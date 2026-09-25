"""
IntelliMed - Email Service
Asynchronous email dispatch using aiosmtplib with HTML template support and logging fallback.
"""

import logging
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone
import aiosmtplib
from sqlalchemy.orm import Session

from backend.config import settings
from backend.models.email_log import EmailLog

logger = logging.getLogger("intellimed.email")


def log_email(
    db: Session,
    to_email: str,
    subject: str,
    body: str,
    template: str,
    status: str,
    error_message: str = None
):
    """Save an email log entry to the database."""
    try:
        email_entry = EmailLog(
            to_email=to_email,
            subject=subject,
            body_preview=body[:500] if body else "",
            template=template,
            status=status,
            error_message=error_message,
            sent_at=datetime.now(timezone.utc) if status == "sent" else None
        )
        db.add(email_entry)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to log email to DB: {e}")


async def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    template_name: str = "generic",
    db: Session = None
) -> bool:
    """
    Send an email via SMTP when configured, otherwise fall back to a local log-based delivery.
    """
    if not settings.email_configured:
        logger.warning(f"[MOCK EMAIL] To: {to_email} | Subject: {subject}")
        if db:
            log_email(db, to_email, subject, html_content, template_name, "mock_sent")
        return True

    sender_address = settings.smtp_from_address
    if not sender_address:
        logger.warning("SMTP sender email is empty; falling back to a local mail log instead of sending.")
        if db:
            log_email(db, to_email, subject, html_content, template_name, "mock_sent")
        return True

    message = MIMEMultipart("alternative")
    message["From"] = f"{settings.SMTP_FROM_NAME} <{sender_address}>"
    message["To"] = to_email
    message["Subject"] = subject

    html_part = MIMEText(html_content, "html")
    message.attach(html_part)

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            start_tls=True,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            timeout=10,
        )
        logger.info(f"Email sent successfully to {to_email}")
        if db:
            log_email(db, to_email, subject, html_content, template_name, "sent")
        return True
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Failed to send email to {to_email}: {error_msg}")
        if db:
            log_email(db, to_email, subject, html_content, template_name, "failed", error_msg)
        return False


async def send_otp_email(to_email: str, code: str, purpose: str, db: Session = None) -> bool:
    """Send an OTP code email."""
    subject = f"IntelliMed - Verification Code ({code})"
    html_content = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; borderRadius: 8px;">
        <h2 style="color: #0284c7; text-align: center;">IntelliMed Smart Hospital</h2>
        <hr style="border: none; border-top: 1px solid #e2e8f0;" />
        <p>Hello,</p>
        <p>Your verification code for <strong>{purpose.replace('_', ' ').title()}</strong> is:</p>
        <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a; background: #f1f5f9; padding: 12px 24px; border-radius: 8px; border: 1px dashed #0284c7;">
                {code}
            </span>
        </div>
        <p style="color: #64748b; font-size: 14px;">This code will expire in {settings.OTP_EXPIRE_MINUTES} minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 30px;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; {datetime.now().year} IntelliMed Hospital Management System. All rights reserved.</p>
    </div>
    """
    return await send_email(to_email, subject, html_content, template_name="otp_verification", db=db)


async def send_welcome_email(to_email: str, name: str, role_name: str, db: Session = None) -> bool:
    """Send a welcome email upon registration."""
    subject = "Welcome to IntelliMed Hospital System"
    html_content = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; borderRadius: 8px;">
        <h2 style="color: #0284c7; text-align: center;">Welcome to IntelliMed</h2>
        <p>Dear {name},</p>
        <p>Your account has been successfully created as a <strong>{role_name.title()}</strong>.</p>
        <p>You can now log in to the IntelliMed Portal using your registered email address.</p>
        <br/>
        <p>Best regards,<br/>The IntelliMed Medical Team</p>
    </div>
    """
    return await send_email(to_email, subject, html_content, template_name="welcome", db=db)
