"""
IntelliMed - Notification Model
In-app notifications for users.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from backend.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50))  # appointment, report, prescription, billing, system
    reference_type = Column(String(50))  # appointment, lab_report, prescription, etc.
    reference_id = Column(Integer)  # ID of the referenced entity
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="notifications")

    def __repr__(self):
        return f"<Notification(id={self.id}, user={self.user_id}, type='{self.notification_type}')>"
