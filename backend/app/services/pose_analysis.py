import torch
import numpy as np
from typing import Dict, List, Tuple, Optional
from datetime import datetime
from app.models.pose_transformer import BasketballPoseTransformer, PoseExtractor, BASKETBALL_POSE_CLASSES
import cv2
import json

class PoseAnalysisService:
    """Service for basketball pose analysis and feedback generation."""
    
    def __init__(self, model_path: Optional[str] = None):
        self.pose_extractor = PoseExtractor()
        self.model = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        if model_path:
            self.load_model(model_path)
        else:
            # Initialize default model if no path provided
            self._init_default_model()
    
    def _init_default_model(self):
        """Initialize default model with configuration."""
        from app.models.pose_transformer import BasketballPoseConfig
        config = BasketballPoseConfig()
        self.model = BasketballPoseTransformer(config)
        self.model.to(self.device)
        self.model.eval()
    
    def load_model(self, model_path: str):
        """Load the trained pose transformer model."""
        try:
            self.model = BasketballPoseTransformer.from_pretrained(model_path)
            self.model.to(self.device)
            self.model.eval()
        except Exception as e:
            print(f"Warning: Could not load model from {model_path}: {e}")
            # For demo purposes, create a default model
            self._init_default_model()
    
    def analyze_image(self, image_path: str) -> Dict:
        """Analyze basketball pose from a single image."""
        # Load and process image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image from {image_path}")
        
        # Extract keypoints
        keypoints = self.pose_extractor.extract_keypoints(image)
        if keypoints is None:
            return {
                "error": "No pose detected in image",
                "keypoints_detected": False
            }
        
        # Prepare input for model (single frame, so repeat for sequence)
        keypoint_tensor = torch.tensor(keypoints, dtype=torch.float32).unsqueeze(0).unsqueeze(0)
        keypoint_tensor = keypoint_tensor.to(self.device)
        
        # Run inference
        with torch.no_grad():
            predictions = self.model(keypoint_tensor)
        
        # Process predictions
        top_down_probs = torch.softmax(predictions["top_down_prediction"], dim=-1)
        bottom_up_probs = torch.softmax(predictions["bottom_up_prediction"], dim=-1)
        quality_score = predictions["quality_score"].item()
        
        # Get predicted classes
        top_down_class = torch.argmax(top_down_probs, dim=-1).item()
        bottom_up_class = torch.argmax(bottom_up_probs, dim=-1).item()
        
        # Generate analysis
        analysis = self._generate_pose_analysis(
            keypoints, top_down_class, bottom_up_class, quality_score,
            predictions["spatial_attention"].cpu().numpy()
        )
        
        return {
            "keypoints_detected": True,
            "keypoints": keypoints.tolist(),
            "top_down_prediction": {
                "class": BASKETBALL_POSE_CLASSES[top_down_class],
                "confidence": top_down_probs[0, top_down_class].item(),
                "all_probabilities": {
                    cls: prob.item() for cls, prob in 
                    zip(BASKETBALL_POSE_CLASSES, top_down_probs[0])
                }
            },
            "bottom_up_prediction": {
                "class": BASKETBALL_POSE_CLASSES[bottom_up_class],
                "confidence": bottom_up_probs[0, bottom_up_class].item()
            },
            "quality_score": quality_score,
            "analysis": analysis,
            "timestamp": datetime.now().isoformat()
        }
    
    def analyze_video(self, video_path: str) -> Dict:
        """Analyze basketball poses from a video sequence."""
        # Extract keypoint sequence
        keypoint_sequence = self.pose_extractor.extract_from_video(video_path)
        
        if not keypoint_sequence:
            return {
                "error": "No poses detected in video",
                "keypoints_detected": False
            }
        
        # Convert to tensor and process in batches
        sequence_tensor = torch.tensor(keypoint_sequence, dtype=torch.float32).unsqueeze(0)
        sequence_tensor = sequence_tensor.to(self.device)
        
        frame_analyses = []
        motion_patterns = []
        
        # Analyze the full sequence
        with torch.no_grad():
            predictions = self.model(sequence_tensor)
        
        # Process sequence-level predictions
        top_down_probs = torch.softmax(predictions["top_down_prediction"], dim=-1)
        bottom_up_probs = torch.softmax(predictions["bottom_up_prediction"], dim=-1)
        quality_score = predictions["quality_score"].item()
        
        # Analyze motion patterns
        motion_analysis = self._analyze_motion_patterns(keypoint_sequence)
        
        # Generate comprehensive feedback
        feedback = self._generate_video_feedback(
            keypoint_sequence, predictions, motion_analysis
        )
        
        return {
            "keypoints_detected": True,
            "sequence_length": len(keypoint_sequence),
            "overall_prediction": {
                "top_down_class": BASKETBALL_POSE_CLASSES[torch.argmax(top_down_probs).item()],
                "bottom_up_class": BASKETBALL_POSE_CLASSES[torch.argmax(bottom_up_probs).item()],
                "quality_score": quality_score
            },
            "motion_analysis": motion_analysis,
            "feedback": feedback,
            "timestamp": datetime.now().isoformat()
        }
    
    def _generate_pose_analysis(
        self, 
        keypoints: np.ndarray, 
        top_down_class: int, 
        bottom_up_class: int, 
        quality_score: float,
        attention_weights: np.ndarray
    ) -> Dict:
        """Generate detailed pose analysis and feedback."""
        
        # Calculate basic pose metrics
        pose_metrics = self._calculate_pose_metrics(keypoints)
        
        # Find key body parts with high attention
        important_joints = self._find_important_joints(attention_weights)
        
        # Generate feedback based on predicted pose
        pose_name = BASKETBALL_POSE_CLASSES[top_down_class]
        feedback = self._generate_pose_specific_feedback(pose_name, keypoints, pose_metrics)
        
        return {
            "detected_pose": pose_name,
            "pose_metrics": pose_metrics,
            "quality_assessment": {
                "score": quality_score,
                "rating": "Excellent" if quality_score > 0.8 else 
                         "Good" if quality_score > 0.6 else
                         "Needs Improvement"
            },
            "important_joints": important_joints,
            "feedback": feedback
        }
    
    def _calculate_pose_metrics(self, keypoints: np.ndarray) -> Dict:
        """Calculate various pose quality metrics."""
        # Define key body part indices (MediaPipe pose landmarks)
        shoulder_left = keypoints[11]  # Left shoulder
        shoulder_right = keypoints[12]  # Right shoulder
        hip_left = keypoints[23]  # Left hip
        hip_right = keypoints[24]  # Right hip
        knee_left = keypoints[25]  # Left knee
        knee_right = keypoints[26]  # Right knee
        ankle_left = keypoints[27]  # Left ankle
        ankle_right = keypoints[28]  # Right ankle
        
        # Calculate metrics
        shoulder_width = np.linalg.norm(shoulder_left[:2] - shoulder_right[:2])
        hip_width = np.linalg.norm(hip_left[:2] - hip_right[:2])
        
        # Body alignment (how straight the torso is)
        torso_center_top = (shoulder_left[:2] + shoulder_right[:2]) / 2
        torso_center_bottom = (hip_left[:2] + hip_right[:2]) / 2
        torso_angle = np.arctan2(
            torso_center_top[1] - torso_center_bottom[1],
            torso_center_top[0] - torso_center_bottom[0]
        ) * 180 / np.pi
        
        # Balance assessment (feet positioning)
        feet_distance = np.linalg.norm(ankle_left[:2] - ankle_right[:2])
        balance_ratio = feet_distance / shoulder_width if shoulder_width > 0 else 0
        
        # Knee alignment
        left_knee_ankle_dist = np.linalg.norm(knee_left[:2] - ankle_left[:2])
        right_knee_ankle_dist = np.linalg.norm(knee_right[:2] - ankle_right[:2])
        
        return {
            "shoulder_width": float(shoulder_width),
            "hip_width": float(hip_width),
            "torso_angle": float(torso_angle),
            "balance_ratio": float(balance_ratio),
            "left_leg_length": float(left_knee_ankle_dist),
            "right_leg_length": float(right_knee_ankle_dist),
            "body_symmetry": float(abs(left_knee_ankle_dist - right_knee_ankle_dist))
        }
    
    def _find_important_joints(self, attention_weights: np.ndarray) -> List[str]:
        """Identify joints with highest attention weights."""
        # MediaPipe pose landmark names
        landmark_names = [
            "nose", "left_eye_inner", "left_eye", "left_eye_outer", "right_eye_inner",
            "right_eye", "right_eye_outer", "left_ear", "right_ear", "mouth_left",
            "mouth_right", "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
            "left_wrist", "right_wrist", "left_pinky", "right_pinky", "left_index",
            "right_index", "left_thumb", "right_thumb", "left_hip", "right_hip",
            "left_knee", "right_knee", "left_ankle", "right_ankle", "left_heel",
            "right_heel", "left_foot_index", "right_foot_index"
        ]
        
        # Get average attention for each joint
        # Flatten and take mean to get single score per joint
        if attention_weights.ndim == 3:
            # Shape: (batch*seq, num_keypoints, num_keypoints)
            avg_attention = np.mean(attention_weights, axis=(0, 2))  # Average over batch/seq and attention heads
        elif attention_weights.ndim == 2:
            # Shape: (num_keypoints, num_keypoints)
            avg_attention = np.mean(attention_weights, axis=1)  # Average over attention heads
        else:
            avg_attention = attention_weights.flatten()
        
        # Find top 5 most attended joints
        top_indices = np.argsort(avg_attention)[-5:][::-1]
        
        return [landmark_names[int(i)] for i in top_indices if int(i) < len(landmark_names)]
    
    def _generate_pose_specific_feedback(
        self, pose_name: str, keypoints: np.ndarray, metrics: Dict
    ) -> Dict:
        """Generate specific feedback based on the detected pose."""
        
        feedback = {
            "strengths": [],
            "improvements": [],
            "technique_tips": []
        }
        
        if pose_name == "shooting":
            # Shooting form analysis
            if metrics["torso_angle"] > -10 and metrics["torso_angle"] < 10:
                feedback["strengths"].append("Good torso alignment")
            else:
                feedback["improvements"].append("Work on keeping torso straight")
            
            if metrics["balance_ratio"] > 0.8 and metrics["balance_ratio"] < 1.2:
                feedback["strengths"].append("Good foot positioning")
            else:
                feedback["improvements"].append("Adjust foot width for better balance")
            
            feedback["technique_tips"].extend([
                "Keep your shooting elbow under the ball",
                "Follow through with your wrist snap",
                "Maintain consistent foot positioning"
            ])
        
        elif pose_name == "defensive_stance":
            if metrics["balance_ratio"] > 1.0:
                feedback["strengths"].append("Good wide stance for defense")
            else:
                feedback["improvements"].append("Widen your stance for better mobility")
            
            feedback["technique_tips"].extend([
                "Keep your knees bent and ready to move",
                "Stay low with arms extended",
                "Keep your weight on the balls of your feet"
            ])
        
        elif pose_name == "dribbling":
            feedback["technique_tips"].extend([
                "Keep your head up to see the court",
                "Use fingertips, not palm",
                "Protect the ball with your off hand"
            ])
        
        # Add general feedback
        if metrics["body_symmetry"] < 0.05:
            feedback["strengths"].append("Excellent body symmetry")
        elif metrics["body_symmetry"] > 0.1:
            feedback["improvements"].append("Work on balancing both sides of your body")
        
        return feedback
    
    def _analyze_motion_patterns(self, keypoint_sequence: List[np.ndarray]) -> Dict:
        """Analyze motion patterns across the video sequence."""
        if len(keypoint_sequence) < 2:
            return {"error": "Insufficient frames for motion analysis"}
        
        # Calculate velocities and accelerations
        velocities = []
        for i in range(1, len(keypoint_sequence)):
            velocity = keypoint_sequence[i] - keypoint_sequence[i-1]
            velocities.append(np.linalg.norm(velocity, axis=1))
        
        velocities = np.array(velocities)
        
        # Key motion metrics
        avg_velocity = np.mean(velocities)
        max_velocity = np.max(velocities)
        velocity_variance = np.var(velocities)
        
        # Smoothness analysis
        smoothness = self._calculate_smoothness(velocities)
        
        # Rhythm analysis
        rhythm_consistency = self._analyze_rhythm(velocities)
        
        return {
            "average_velocity": float(avg_velocity),
            "max_velocity": float(max_velocity),
            "velocity_variance": float(velocity_variance),
            "smoothness_score": smoothness,
            "rhythm_consistency": rhythm_consistency,
            "motion_quality": "Smooth" if smoothness > 0.7 else 
                            "Moderate" if smoothness > 0.4 else "Jerky"
        }
    
    def _calculate_smoothness(self, velocities: np.ndarray) -> float:
        """Calculate motion smoothness score."""
        if len(velocities) < 3:
            return 0.0
        
        # Calculate jerk (derivative of acceleration)
        accelerations = np.diff(velocities, axis=0)
        jerks = np.diff(accelerations, axis=0)
        
        # Smoothness is inverse of jerk magnitude
        jerk_magnitude = np.mean(np.abs(jerks))
        smoothness = 1.0 / (1.0 + jerk_magnitude)
        
        return float(smoothness)
    
    def _analyze_rhythm(self, velocities: np.ndarray) -> float:
        """Analyze rhythm consistency in the movement."""
        if len(velocities) < 5:
            return 0.0
        
        # Find peaks in velocity (indicating movement phases)
        from scipy.signal import find_peaks
        peaks, _ = find_peaks(np.mean(velocities, axis=1))
        
        if len(peaks) < 2:
            return 0.5  # Neutral score for insufficient data
        
        # Calculate intervals between peaks
        intervals = np.diff(peaks)
        
        # Consistency is inverse of interval variance
        if len(intervals) > 1:
            consistency = 1.0 / (1.0 + np.var(intervals))
        else:
            consistency = 0.5
        
        return float(consistency)
    
    def _generate_video_feedback(
        self, keypoint_sequence: List[np.ndarray], 
        predictions: Dict, motion_analysis: Dict
    ) -> Dict:
        """Generate comprehensive feedback for video analysis."""
        
        feedback = {
            "overall_assessment": "",
            "motion_quality": motion_analysis.get("motion_quality", "Unknown"),
            "key_observations": [],
            "improvement_areas": [],
            "drills_recommended": []
        }
        
        # Overall assessment based on quality and motion
        quality_score = predictions["quality_score"].item()
        smoothness = motion_analysis.get("smoothness_score", 0)
        
        if quality_score > 0.8 and smoothness > 0.7:
            feedback["overall_assessment"] = "Excellent technique with smooth execution"
        elif quality_score > 0.6 and smoothness > 0.5:
            feedback["overall_assessment"] = "Good form with room for refinement"
        else:
            feedback["overall_assessment"] = "Technique needs significant improvement"
        
        # Motion-specific observations
        if motion_analysis.get("rhythm_consistency", 0) > 0.7:
            feedback["key_observations"].append("Consistent rhythm throughout movement")
        else:
            feedback["improvement_areas"].append("Work on maintaining consistent rhythm")
        
        if motion_analysis.get("velocity_variance", 0) < 0.1:
            feedback["key_observations"].append("Good speed control")
        else:
            feedback["improvement_areas"].append("Focus on controlling movement speed")
        
        # Recommend drills based on analysis
        if smoothness < 0.5:
            feedback["drills_recommended"].extend([
                "Slow-motion practice drills",
                "Balance and stability exercises",
                "Form shooting with focus on consistency"
            ])
        
        if motion_analysis.get("rhythm_consistency", 0) < 0.5:
            feedback["drills_recommended"].extend([
                "Metronome training for rhythm",
                "Repetitive motion drills",
                "Video analysis with rhythm counting"
            ])
        
        return feedback
