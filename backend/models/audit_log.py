"""
IntelliMed - Audit Log Model
Tracks all user actions for security and compliance.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, func
from sqlalchemy.orm import relationship
from backend.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String(50), nullable=False, index=True)  # create, read, update, delete, login, logout
    resource = Column(String(100), nullable=False)  # patients, appointments, etc.
    resource_id = Column(Integer)
    details = Column(JSON)  # Additional context
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relationships
    user = relationship("User", back_populates="audit_logs")

    def __repr__(self):
        return f"<AuditLog(id={self.id}, action='{self.action}', resource='{self.resource}')>"
