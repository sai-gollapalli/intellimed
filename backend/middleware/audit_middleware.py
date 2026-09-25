"""
IntelliMed - Audit Middleware
Automatically logs user actions for security compliance.
"""

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session as DBSession

from backend.models.audit_log import AuditLog


def create_audit_log(
    db: DBSession,
    user_id: Optional[int],
    action: str,
    resource: str,
    resource_id: Optional[int] = None,
    details: dict = None,
    ip_address: str = None,
    user_agent: str = None,
):
    """
    Create an audit log entry.
    
    Args:
        db: Database session
        user_id: ID of the user performing the action
        action: Action type (create, read, update, delete, login, logout, etc.)
        resource: Resource being acted upon (patients, appointments, etc.)
        resource_id: ID of the specific resource
        details: Additional context as dict
        ip_address: Client IP address
        user_agent: Client user agent string
    """
    log = AuditLog(
        user_id=user_id,
        action=action,
        resource=resource,
        resource_id=resource_id,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.add(log)
    db.commit()
    return log
