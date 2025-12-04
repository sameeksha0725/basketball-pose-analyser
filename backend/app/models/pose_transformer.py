import torch
import torch.nn as nn
import numpy as np
from typing import Dict, List, Tuple, Optional
from transformers import PreTrainedModel, PretrainedConfig
import cv2
import mediapipe as mp

class BasketballPoseConfig(PretrainedConfig):
    """Configuration class for Basketball Pose Transformer."""
    
    model_type = "basketball_pose_transformer"
    
    def __init__(
        self,
        num_keypoints: int = 33,  # MediaPipe pose keypoints
        d_model: int = 256,
        nhead: int = 8,
        num_encoder_layers: int = 6,
        num_decoder_layers: int = 6,
        dim_feedforward: int = 1024,
        dropout: float = 0.1,
        max_sequence_length: int = 100,
        num_classes: int = 10,  # Basketball pose classes
        spatial_dims: int = 3,  # x, y, z coordinates
        **kwargs
    ):
        super().__init__(**kwargs)
        self.num_keypoints = num_keypoints
        self.d_model = d_model
        self.nhead = nhead
        self.num_encoder_layers = num_encoder_layers
        self.num_decoder_layers = num_decoder_layers
        self.dim_feedforward = dim_feedforward
        self.dropout = dropout
        self.max_sequence_length = max_sequence_length
        self.num_classes = num_classes
        self.spatial_dims = spatial_dims


class PositionalEncoding(nn.Module):
    """Positional encoding for transformer input."""
    
    def __init__(self, d_model: int, max_len: int = 5000):
        super().__init__()
        
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * 
                           (-np.log(10000.0) / d_model))
        
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0).transpose(0, 1)
        
        self.register_buffer('pe', pe)
    
    def forward(self, x):
        return x + self.pe[:x.size(0), :]


class SpatialAttention(nn.Module):
    """Spatial attention mechanism for keypoint relationships."""
    
    def __init__(self, d_model: int):
        super().__init__()
        self.d_model = d_model
        self.query = nn.Linear(d_model, d_model)
        self.key = nn.Linear(d_model, d_model)
        self.value = nn.Linear(d_model, d_model)
        self.softmax = nn.Softmax(dim=-1)
        
    def forward(self, keypoints):
        B, N, D = keypoints.shape
        
        Q = self.query(keypoints)
        K = self.key(keypoints)
        V = self.value(keypoints)
        
        # Compute attention weights
        attention_scores = torch.matmul(Q, K.transpose(-2, -1)) / np.sqrt(self.d_model)
        attention_weights = self.softmax(attention_scores)
        
        # Apply attention
        attended_features = torch.matmul(attention_weights, V)
        return attended_features, attention_weights


class BasketballPoseTransformer(PreTrainedModel):
    """Transformer-based model for basketball pose analysis."""
    
    config_class = BasketballPoseConfig
    
    def __init__(self, config: BasketballPoseConfig):
        super().__init__(config)
        self.config = config
        
        # Input projection
        self.keypoint_projection = nn.Linear(
            config.spatial_dims, config.d_model
        )
        
        # Positional encoding
        self.pos_encoding = PositionalEncoding(config.d_model)
        
        # Spatial attention for keypoint relationships
        self.spatial_attention = SpatialAttention(config.d_model)
        
        # Transformer encoder for temporal modeling
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=config.d_model,
            nhead=config.nhead,
            dim_feedforward=config.dim_feedforward,
            dropout=config.dropout,
            batch_first=True
        )
        self.transformer_encoder = nn.TransformerEncoder(
            encoder_layer, num_layers=config.num_encoder_layers
        )
        
        # Top-down analysis head (global body structure)
        self.top_down_head = nn.Sequential(
            nn.Linear(config.d_model, config.dim_feedforward),
            nn.ReLU(),
            nn.Dropout(config.dropout),
            nn.Linear(config.dim_feedforward, config.num_classes)
        )
        
        # Bottom-up analysis head (joint-level coordination)
        self.bottom_up_head = nn.Sequential(
            nn.Linear(config.d_model * config.num_keypoints, config.dim_feedforward),
            nn.ReLU(),
            nn.Dropout(config.dropout),
            nn.Linear(config.dim_feedforward, config.num_classes)
        )
        
        # Pose quality assessment
        self.quality_head = nn.Sequential(
            nn.Linear(config.d_model, 128),
            nn.ReLU(),
            nn.Dropout(config.dropout),
            nn.Linear(128, 1),
            nn.Sigmoid()
        )
        
        self.init_weights()
    
    @classmethod
    def from_pretrained(cls, pretrained_model_name_or_path, *args, **kwargs):
        """Load model from pretrained checkpoint or create new instance."""
        try:
            # Try to load from path using parent class method
            return super().from_pretrained(pretrained_model_name_or_path, *args, **kwargs)
        except Exception as e:
            print(f"Warning: Could not load pretrained model from {pretrained_model_name_or_path}: {e}")
            # Return new instance with default config if loading fails
            config = cls.config_class()
            return cls(config)
    
    def forward(
        self,
        keypoints: torch.Tensor,
        attention_mask: Optional[torch.Tensor] = None
    ) -> Dict[str, torch.Tensor]:
        """
        Forward pass of the model.
        
        Args:
            keypoints: Tensor of shape (batch_size, seq_len, num_keypoints, spatial_dims)
            attention_mask: Optional attention mask
            
        Returns:
            Dictionary containing predictions and attention weights
        """
        batch_size, seq_len, num_keypoints, spatial_dims = keypoints.shape
        
        # Reshape for processing: (batch_size * seq_len, num_keypoints, spatial_dims)
        keypoints_flat = keypoints.view(-1, num_keypoints, spatial_dims)
        
        # Project keypoints to model dimension
        keypoint_features = self.keypoint_projection(keypoints_flat)
        
        # Apply spatial attention for keypoint relationships
        spatial_features, spatial_attention = self.spatial_attention(keypoint_features)
        
        # Add positional encoding
        spatial_features = self.pos_encoding(spatial_features.transpose(0, 1)).transpose(0, 1)
        
        # Reshape back for temporal modeling
        temporal_features = spatial_features.view(batch_size, seq_len, num_keypoints, -1)
        
        # Global pooling for temporal transformer input
        global_features = temporal_features.mean(dim=2)  # Average over keypoints
        
        # Apply transformer encoder for temporal modeling
        if attention_mask is not None:
            temporal_output = self.transformer_encoder(global_features, src_key_padding_mask=attention_mask)
        else:
            temporal_output = self.transformer_encoder(global_features)
        
        # Top-down analysis (use last timestep)
        top_down_output = self.top_down_head(temporal_output[:, -1, :])
        
        # Bottom-up analysis (use temporal features from last timestep)
        # temporal_features shape: (batch_size, seq_len, num_keypoints, d_model)
        last_temporal_features = temporal_features[:, -1, :, :]  # (batch_size, num_keypoints, d_model)
        bottom_up_input = last_temporal_features.view(batch_size, -1)  # (batch_size, num_keypoints * d_model)
        bottom_up_output = self.bottom_up_head(bottom_up_input)
        
        # Pose quality assessment
        quality_score = self.quality_head(temporal_output[:, -1, :])
        
        return {
            "top_down_prediction": top_down_output,
            "bottom_up_prediction": bottom_up_output,
            "quality_score": quality_score,
            "spatial_attention": spatial_attention,
            "temporal_features": temporal_output
        }


class PoseExtractor:
    """Utility class for extracting pose keypoints from images/videos."""
    
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=2,
            enable_segmentation=False,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
    
    def extract_keypoints(self, image: np.ndarray) -> Optional[np.ndarray]:
        """Extract 3D keypoints from image."""
        try:
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = self.pose.process(image_rgb)
            
            if results.pose_landmarks:
                keypoints = []
                for landmark in results.pose_landmarks.landmark:
                    keypoints.append([landmark.x, landmark.y, landmark.z])
                return np.array(keypoints)
            return None
        except Exception as e:
            print(f"Error extracting keypoints: {str(e)}")
            return None
    
    def extract_from_video(self, video_path: str) -> List[np.ndarray]:
        """Extract keypoints from video sequence."""
        cap = cv2.VideoCapture(video_path)
        keypoint_sequence = []
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            keypoints = self.extract_keypoints(frame)
            if keypoints is not None:
                keypoint_sequence.append(keypoints)
        
        cap.release()
        return keypoint_sequence


# Basketball-specific pose classes
BASKETBALL_POSE_CLASSES = [
    "shooting",
    "dribbling", 
    "defensive_stance",
    "layup",
    "jump_shot",
    "free_throw",
    "passing",
    "rebounding",
    "pivot",
    "idle"
]
