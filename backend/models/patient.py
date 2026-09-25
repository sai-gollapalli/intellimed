"""
IntelliMed - Patient Model
Comprehensive patient record with all demographic, medical, and insurance fields.
"""

from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Text, JSON, ForeignKey, func
from sqlalchemy.orm import relationship
from backend.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_code = Column(String(20), unique=True, nullable=False, index=True)  # Auto-generated: IM-000001
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Nullable - patient may not have login

    # Personal Info
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    age = Column(Integer)
    gender = Column(String(20), nullable=False)  # Male, Female, Other
    phone = Column(String(20), nullable=False, index=True)
    email = Column(String(255), index=True)
    photo_path = Column(String(500))

    # Address
    address_line1 = Column(String(255))
    address_line2 = Column(String(255))
    city = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(10))

    # Medical Info
    blood_group = Column(String(10))
    height = Column(Float)  # cm
    weight = Column(Float)  # kg
    known_allergies = Column(Text)  # Comma-separated or free text
    medical_history_summary = Column(Text)

    # Emergency Contact
    emergency_contact_name = Column(String(200))
    emergency_contact_phone = Column(String(20))
    emergency_contact_relation = Column(String(50))

    # Insurance
    insurance_provider = Column(String(200))
    insurance_policy_no = Column(String(100))
    insurance_card_path = Column(String(500))

    # Documents
    id_proof_path = Column(String(500))
    qr_code_path = Column(String(500))

    # Metadata
    registered_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    face_embeddings = relationship("PatientFaceEmbedding", back_populates="patient", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="patient")
    medical_history = relationship("MedicalHistory", back_populates="patient")
    diagnoses = relationship("Diagnosis", back_populates="patient")
    prescriptions = relationship("Prescription", back_populates="patient")
    lab_reports = relationship("LabReport", back_populates="patient")
    radiology_reports = relationship("RadiologyReport", back_populates="patient")
    billing_records = relationship("Billing", back_populates="patient")
    documents = relationship("PatientDocument", back_populates="patient", cascade="all, delete-orphan")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    def __repr__(self):
        return f"<Patient(id={self.id}, code='{self.patient_code}', name='{self.full_name}')>"
