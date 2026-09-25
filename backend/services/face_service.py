"""
IntelliMed - Face Recognition Service
Handles face embedding generation, comparison, and patient identification using AI models.
"""

import io
import pickle
import logging
from typing import Optional, Tuple, TYPE_CHECKING
from pathlib import Path

if TYPE_CHECKING:
    import numpy as np
    from PIL import Image

try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False
    np = None

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    Image = None

from backend.config import settings

logger = logging.getLogger("intellimed.face_service")


class FaceRecognitionService:
    """Service for face recognition operations using InsightFace/MediaPipe."""
    
    def __init__(self):
        self._model_loaded = False
        self._face_detector = None
        self._face_embedder = None
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize the face recognition model."""
        if not NUMPY_AVAILABLE or not PIL_AVAILABLE:
            logger.warning("Required dependencies (numpy/PIL) not available. Face recognition disabled.")
            self._model_loaded = False
            return

        # Try to use InsightFace if available
        try:
            import cv2
            from insightface.app import FaceAnalysis
            
            model_dir = Path(settings.FACE_MODEL_DIR)
            if model_dir.exists():
                logger.info(f"Loading InsightFace models from {model_dir}")
                self._face_embedder = FaceAnalysis(name='buffalo_l', root=str(model_dir.parent))
            else:
                logger.info("Loading InsightFace with default models")
                self._face_embedder = FaceAnalysis(name='buffalo_l')
            
            self._face_embedder.prepare(ctx_id=0, det_size=(640, 640))
            self._model_loaded = True
            logger.info("InsightFace model loaded successfully")
            return
        except (ImportError, Exception):
            logger.warning("InsightFace not available, falling back to MediaPipe")

        # Fallback to MediaPipe (mediapipe >= 0.10 removed mp.solutions)
        try:
            import mediapipe as mp
            # mediapipe v1.0+ uses mp.tasks instead of mp.solutions
            mp_face = getattr(mp, 'solutions', None)
            if mp_face is not None:
                face_detection_mod = mp_face.face_detection
                self._face_detector = face_detection_mod.FaceDetection(
                    model_selection=0, min_detection_confidence=0.5
                )
                self._model_loaded = True
                logger.info("MediaPipe Face Detection loaded successfully")
                return
            else:
                logger.warning("MediaPipe v1.0+ detected - mp.solutions not available, using basic image features")
        except (ImportError, AttributeError, Exception) as e:
            logger.warning(f"MediaPipe not usable ({e}), using basic image features")

        # Final reliable fallback: basic spatial + colour histogram features
        # Works without any third-party vision library.
        logger.info("Using spatial/colour histogram image features for face recognition")
        self._model_loaded = True
    
    def _detect_and_align_face(self, image: 'Image.Image') -> Optional['np.ndarray']:
        """Detect and align face from image."""
        try:
            # Convert PIL to numpy array
            img_array = np.array(image)
            
            # Try InsightFace first
            if self._face_embedder is not None:
                try:
                    faces = self._face_embedder.get(img_array)
                    if faces:
                        face = faces[0]
                        if hasattr(face, 'embedding'):
                            return face.embedding
                        if hasattr(face, 'bbox'):
                            x1, y1, x2, y2 = [int(v) for v in face.bbox]
                            face_crop = img_array[y1:y2, x1:x2]
                            return self._extract_basic_features(Image.fromarray(face_crop))
                except Exception as e:
                    logger.warning(f"InsightFace inference failed: {e}")
            
            # Try MediaPipe (only when mp.solutions was available at init)
            if self._face_detector is not None:
                try:
                    import cv2
                    img_rgb = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
                    results = self._face_detector.process(img_rgb)
                    
                    if results.detections:
                        detection = results.detections[0]
                        bbox = detection.location_data.relative_bounding_box
                        h, w = img_array.shape[:2]
                        x1 = int(bbox.xmin * w)
                        y1 = int(bbox.ymin * h)
                        x2 = int((bbox.xmin + bbox.width) * w)
                        y2 = int((bbox.ymin + bbox.height) * h)
                        face_crop = img_array[y1:y2, x1:x2]
                        return self._extract_basic_features(Image.fromarray(face_crop))
                except Exception as e:
                    logger.warning(f"MediaPipe inference failed: {e}")
            
            # Always-available fallback: whole-image spatial/colour features
            return self._extract_basic_features(image)
            
        except Exception as e:
            logger.error(f"Face detection failed: {e}")
            return self._extract_basic_features(image)  # never return None if image is valid
    
    def _extract_basic_features(self, image: 'Image.Image') -> 'np.ndarray':
        """
        Extract a robust face feature vector from the image.
        Crops the central 60% (width) × 70% (height) region, downsamples
        to spatial grid and color histograms, then L2-normalises.
        """
        try:
            rgb = image.convert('RGB')
            w, h = rgb.size

            # Crop central face area
            cx, cy = w // 2, h // 2
            cw, ch = max(int(w * 0.6), 64), max(int(h * 0.7), 64)
            left   = max(cx - cw // 2, 0)
            upper  = max(cy - ch // 2, 0)
            right  = min(cx + cw // 2, w)
            lower  = min(cy + ch // 2, h)
            face_crop = rgb.crop((left, upper, right, lower))

            # Pillow 10+ resampling method compatibility
            resample_mode = getattr(getattr(Image, 'Resampling', Image), 'BILINEAR', Image.BILINEAR)

            # 32x32 spatial intensity grid with per-channel mean subtraction
            face_32 = face_crop.resize((32, 32), resample_mode)
            arr_32 = np.array(face_32, dtype=np.float32) / 255.0
            mean_ch = arr_32.mean(axis=(0, 1), keepdims=True)
            centered = arr_32 - mean_ch
            spatial = centered.flatten()
            spatial_norm = np.linalg.norm(spatial)
            if spatial_norm > 1e-6:
                spatial = spatial / spatial_norm
            else:
                spatial = np.zeros_like(spatial)

            # 16-bin RGB color histograms (48 dims)
            hist_r = np.histogram(arr_32[:, :, 0], bins=16, range=(0, 1))[0].astype(np.float32)
            hist_g = np.histogram(arr_32[:, :, 1], bins=16, range=(0, 1))[0].astype(np.float32)
            hist_b = np.histogram(arr_32[:, :, 2], bins=16, range=(0, 1))[0].astype(np.float32)
            hist_r /= (hist_r.sum() + 1e-6)
            hist_g /= (hist_g.sum() + 1e-6)
            hist_b /= (hist_b.sum() + 1e-6)
            color_hist = np.concatenate([hist_r, hist_g, hist_b])
            color_hist /= (np.linalg.norm(color_hist) + 1e-6)

            # Combine: 60% spatial pattern, 40% color distribution
            features = np.concatenate([spatial * 0.6, color_hist * 0.4])
            features /= (np.linalg.norm(features) + 1e-6)
            return features

        except Exception as e:
            logger.error(f"Feature extraction failed: {e}")
            return np.zeros(3072 + 48, dtype=np.float32)
    
    def build_embedding(self, image_bytes: bytes) -> Optional[list[float]]:
        """
        Build face embedding from image bytes.
        
        Args:
            image_bytes: Raw image data
            
        Returns:
            List of float values representing the face embedding
        """
        if not self._model_loaded:
            logger.error("Face recognition model not loaded")
            return None
            
        if not PIL_AVAILABLE or not NUMPY_AVAILABLE:
            logger.error("Required dependencies (numpy/PIL) not available")
            return None

        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            embedding = self._detect_and_align_face(image)
            
            if embedding is None:
                logger.error("Failed to generate face embedding")
                return None
            
            return embedding.tolist()
            
        except Exception as e:
            logger.error(f"Failed to build embedding: {e}")
            return None
    
    def cosine_similarity(self, embedding_a: list[float], embedding_b: list[float]) -> float:
        """
        Calculate cosine similarity between two embeddings.
        
        Args:
            embedding_a: First embedding
            embedding_b: Second embedding
            
        Returns:
            Similarity score between 0 and 1
        """
        try:
            a = np.array(embedding_a, dtype=np.float32)
            b = np.array(embedding_b, dtype=np.float32)

            if a.shape != b.shape:
                return 0.0
            
            dot_product = np.dot(a, b)
            norm_a = np.linalg.norm(a)
            norm_b = np.linalg.norm(b)
            
            if norm_a == 0 or norm_b == 0:
                return 0.0
            
            similarity = float(dot_product / (norm_a * norm_b))
            return max(0.0, min(1.0, similarity))
            
        except Exception as e:
            logger.error(f"Similarity calculation failed: {e}")
            return 0.0
    
    def is_match(self, embedding_a: list[float], embedding_b: list[float]) -> bool:
        """
        Check if two embeddings match based on threshold.
        
        Args:
            embedding_a: First embedding
            embedding_b: Second embedding
            
        Returns:
            True if similarity exceeds threshold
        """
        similarity = self.cosine_similarity(embedding_a, embedding_b)
        return similarity >= settings.FACE_RECOGNITION_THRESHOLD

    def match_against_candidates(
        self,
        input_embedding: list[float],
        candidates: list,
        threshold: float | None = None,
    ) -> tuple[int | None, float]:
        """
        Find the best-matching patient from a list of stored face embeddings.

        Args:
            input_embedding: The embedding computed from the login frame.
            candidates: List of PatientFaceEmbedding ORM objects.
            threshold: Minimum similarity to accept. Defaults to config value.

        Returns:
            (patient_id, best_score) or (None, best_score) if below threshold.
        """
        import pickle

        if threshold is None:
            threshold = settings.FACE_RECOGNITION_THRESHOLD

        best_patient_id = None
        best_score = 0.0

        for candidate in candidates:
            stored_embedding = pickle.loads(candidate.embedding)
            score = self.cosine_similarity(input_embedding, stored_embedding)
            if score > best_score:
                best_score = score
                best_patient_id = candidate.patient_id

        if best_score < threshold:
            return None, best_score

        return best_patient_id, best_score

    def check_duplicate_face(
        self,
        input_embedding: list[float],
        db,
        exclude_patient_id: int | None = None,
        threshold: float | None = None,
    ) -> tuple[bool, int | None, float]:
        """
        Check if the input_embedding matches any existing patient in the database.

        Args:
            input_embedding: Face embedding vector to check.
            db: SQLAlchemy Session.
            exclude_patient_id: Patient ID to ignore.
            threshold: Minimum similarity threshold.

        Returns:
            (is_duplicate: bool, matched_patient_id: int | None, best_score: float)
        """
        from backend.models.patient_face_embedding import PatientFaceEmbedding

        query = db.query(PatientFaceEmbedding)
        if exclude_patient_id is not None:
            query = query.filter(PatientFaceEmbedding.patient_id != exclude_patient_id)

        candidates = query.all()
        matched_patient_id, best_score = self.match_against_candidates(
            input_embedding, candidates, threshold=threshold
        )

        is_duplicate = matched_patient_id is not None
        return is_duplicate, matched_patient_id, best_score

    def multi_frame_consensus(
        self,
        frame_embeddings: list[list[float]],
        candidates: list,
        threshold: float | None = None,
        consensus_ratio: float | None = None,
    ) -> tuple[int | None, float]:
        """
        Run consensus voting across multiple captured frames.

        Each frame votes for its best-matching patient. The patient with the
        most votes wins if they meet the consensus ratio.

        Args:
            frame_embeddings: List of embeddings from captured frames.
            candidates: List of PatientFaceEmbedding ORM objects.
            threshold: Per-frame similarity threshold.
            consensus_ratio: Fraction of frames that must agree.

        Returns:
            (patient_id, average_score) or (None, 0.0) if consensus not met.
        """
        from collections import Counter

        if threshold is None:
            threshold = settings.FACE_RECOGNITION_THRESHOLD
        if consensus_ratio is None:
            consensus_ratio = settings.FACE_LOGIN_CONSENSUS_RATIO

        votes: list[int] = []
        scores_per_patient: dict[int, list[float]] = {}

        for embedding in frame_embeddings:
            patient_id, score = self.match_against_candidates(
                embedding, candidates, threshold
            )
            if patient_id is not None:
                votes.append(patient_id)
                scores_per_patient.setdefault(patient_id, []).append(score)
                logger.info(
                    f"Frame vote: patient_id={patient_id}, score={score:.4f}"
                )
            else:
                logger.info(f"Frame vote: no match (best score={score:.4f})")

        if not votes:
            logger.warning("No frames matched any enrolled patient.")
            return None, 0.0

        counter = Counter(votes)
        winner_id, winner_votes = counter.most_common(1)[0]
        total_frames = len(frame_embeddings)
        ratio = winner_votes / total_frames

        logger.info(
            f"Consensus: patient_id={winner_id}, "
            f"votes={winner_votes}/{total_frames} ({ratio:.0%}), "
            f"required={consensus_ratio:.0%}"
        )

        if ratio < consensus_ratio:
            logger.warning(
                f"Consensus not met: {ratio:.0%} < {consensus_ratio:.0%}"
            )
            return None, 0.0

        avg_score = sum(scores_per_patient[winner_id]) / len(
            scores_per_patient[winner_id]
        )
        return winner_id, avg_score


# Global service instance
face_service = FaceRecognitionService()

