"""
IntelliMed - Email Log Model
Tracks all emails sent by the system.
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, func
from backend.database import Base


class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    to_email = Column(String(255), nullable=False, index=True)
    subject = Column(String(500), nullable=False)
    body_preview = Column(Text)  # First 500 chars of body
    template = Column(String(100))  # Template name used
    status = Column(String(30), default="queued")  # queued, sent, failed
    error_message = Column(Text)
    sent_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<EmailLog(id={self.id}, to='{self.to_email}', status='{self.status}')>"
