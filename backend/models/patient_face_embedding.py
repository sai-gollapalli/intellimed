"""
IntelliMed - Patient Face Embedding Model
Stores face embeddings (512-dim vectors) for AI-based patient identification.
"""

from sqlalchemy import Column, Integer, String, LargeBinary, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from backend.database import Base


class PatientFaceEmbedding(Base):
    __tablename__ = "patient_face_embeddings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    embedding = Column(LargeBinary, nullable=False)  # Serialized numpy array (512-d float32)
    image_path = Column(String(500))  # Path to the original face image
    quality_score = Column(Integer)  # Face image quality score (0-100)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    patient = relationship("Patient", back_populates="face_embeddings")

    def __repr__(self):
        return f"<PatientFaceEmbedding(id={self.id}, patient_id={self.patient_id})>"
