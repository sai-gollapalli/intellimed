"""
IntelliMed - Models Package
Imports all ORM models so SQLAlchemy discovers them for migrations and table creation.
"""

from backend.models.role import Role
from backend.models.user import User
from backend.models.department import Department
from backend.models.doctor import Doctor
from backend.models.patient import Patient
from backend.models.patient_face_embedding import PatientFaceEmbedding
from backend.models.appointment import Appointment
from backend.models.medical_history import MedicalHistory
from backend.models.diagnosis import Diagnosis
from backend.models.prescription import Prescription
from backend.models.lab_report import LabReport
from backend.models.radiology_report import RadiologyReport
from backend.models.billing import Billing
from backend.models.payment import Payment
from backend.models.medicine import Medicine
from backend.models.inventory import Inventory
from backend.models.notification import Notification
from backend.models.email_log import EmailLog
from backend.models.otp_code import OTPCode
from backend.models.audit_log import AuditLog
from backend.models.session import Session
from backend.models.patient_document import PatientDocument

__all__ = [
    "Role",
    "User",
    "Department",
    "Doctor",
    "Patient",
    "PatientFaceEmbedding",
    "Appointment",
    "MedicalHistory",
    "Diagnosis",
    "Prescription",
    "LabReport",
    "RadiologyReport",
    "Billing",
    "Payment",
    "Medicine",
    "Inventory",
    "Notification",
    "EmailLog",
    "OTPCode",
    "AuditLog",
    "Session",
    "PatientDocument",
]
