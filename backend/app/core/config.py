import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Basketball Pose Analyser"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite:///./basketball_poses.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT Settings
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # File Upload
    UPLOAD_FOLDER: str = "./uploads"
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    
    # Model Settings
    MODEL_PATH: str = "./models"
    POSE_MODEL_NAME: str = "basketball_pose_transformer"
    
    # CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:8080"]

    class Config:
        env_file = ".env"

settings = Settings()
