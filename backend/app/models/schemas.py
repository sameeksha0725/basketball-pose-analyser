from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class UploadResponse(BaseModel):
    filename: str
    file_path: str
    file_size: int
    upload_time: datetime

class PoseMetrics(BaseModel):
    shoulder_width: float
    hip_width: float
    torso_angle: float
    balance_ratio: float
    left_leg_length: float
    right_leg_length: float
    body_symmetry: float

class QualityAssessment(BaseModel):
    score: float = Field(..., ge=0, le=1)
    rating: str

class PoseFeedback(BaseModel):
    strengths: List[str]
    improvements: List[str]
    technique_tips: List[str]

class PoseAnalysis(BaseModel):
    detected_pose: str
    pose_metrics: PoseMetrics
    quality_assessment: QualityAssessment
    important_joints: List[str]
    feedback: PoseFeedback

class TopDownPrediction(BaseModel):
    class_name: str = Field(..., alias="class")
    confidence: float
    all_probabilities: Dict[str, float]

class BottomUpPrediction(BaseModel):
    class_name: str = Field(..., alias="class")
    confidence: float

class ImageAnalysisResult(BaseModel):
    keypoints_detected: bool
    keypoints: Optional[List[List[float]]] = None
    top_down_prediction: Optional[TopDownPrediction] = None
    bottom_up_prediction: Optional[BottomUpPrediction] = None
    quality_score: Optional[float] = None
    analysis: Optional[PoseAnalysis] = None
    timestamp: str
    error: Optional[str] = None

class MotionAnalysis(BaseModel):
    average_velocity: float
    max_velocity: float
    velocity_variance: float
    smoothness_score: float
    rhythm_consistency: float
    motion_quality: str

class VideoFeedback(BaseModel):
    overall_assessment: str
    motion_quality: str
    key_observations: List[str]
    improvement_areas: List[str]
    drills_recommended: List[str]

class OverallPrediction(BaseModel):
    top_down_class: str
    bottom_up_class: str
    quality_score: float

class VideoAnalysisResult(BaseModel):
    keypoints_detected: bool
    sequence_length: Optional[int] = None
    overall_prediction: Optional[OverallPrediction] = None
    motion_analysis: Optional[MotionAnalysis] = None
    feedback: Optional[VideoFeedback] = None
    timestamp: str
    error: Optional[str] = None

class PoseAnalysisResponse(BaseModel):
    success: bool
    filename: str
    analysis: ImageAnalysisResult

class VideoAnalysisResponse(BaseModel):
    success: bool
    filename: str
    analysis: VideoAnalysisResult

class PlayerProgressResponse(BaseModel):
    player_id: str
    total_sessions: int
    improvement_trend: str
    average_pose_quality: float
    recent_analyses: List[Dict[str, Any]]
    recommendations: List[str]

class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)
