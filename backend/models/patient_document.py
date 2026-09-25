"""
IntelliMed - Patient Document Model
Stores uploaded patient documents (ID proofs, insurance cards, medical reports).
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from backend.database import Base


class PatientDocument(Base):
    __tablename__ = "patient_documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    document_type = Column(String(50), nullable=False)  # id_proof, insurance_card, medical_report, other
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)  # bytes
    mime_type = Column(String(100))
    description = Column(String(500))
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    patient = relationship("Patient", back_populates="documents")

    def __repr__(self):
        return f"<PatientDocument(id={self.id}, type='{self.document_type}')>"
