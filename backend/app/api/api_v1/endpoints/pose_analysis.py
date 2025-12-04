from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import List, Optional
import os
import shutil
from datetime import datetime
import uuid

from app.core.config import settings
from app.services.pose_analysis import PoseAnalysisService
from app.models.schemas import (
    PoseAnalysisResponse,
    VideoAnalysisResponse,
    UploadResponse,
    PlayerProgressResponse
)

router = APIRouter()

# Initialize pose analysis service
pose_service = PoseAnalysisService()

@router.post("/upload-image", response_model=UploadResponse)
async def upload_image(file: UploadFile = File(...)):
    """Upload an image for pose analysis."""
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(settings.UPLOAD_FOLDER, unique_filename)
    
    try:
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return UploadResponse(
            filename=unique_filename,
            file_path=file_path,
            file_size=os.path.getsize(file_path),
            upload_time=datetime.now()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@router.post("/upload-video", response_model=UploadResponse)
async def upload_video(file: UploadFile = File(...)):
    """Upload a video for pose analysis."""
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith('video/'):
        raise HTTPException(status_code=400, detail="File must be a video")
    
    # Check file size
    if file.size and file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413, 
            detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE / 1024 / 1024}MB"
        )
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(settings.UPLOAD_FOLDER, unique_filename)
    
    try:
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return UploadResponse(
            filename=unique_filename,
            file_path=file_path,
            file_size=os.path.getsize(file_path),
            upload_time=datetime.now()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@router.post("/analyze-image/{filename}", response_model=PoseAnalysisResponse)
async def analyze_image(filename: str):
    """Analyze basketball pose from uploaded image."""
    
    file_path = os.path.join(settings.UPLOAD_FOLDER, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        # Perform pose analysis
        analysis_result = pose_service.analyze_image(file_path)
        
        if "error" in analysis_result:
            raise HTTPException(status_code=400, detail=analysis_result["error"])
        
        return PoseAnalysisResponse(
            success=True,
            filename=filename,
            analysis=analysis_result
        )
    
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Analysis error: {error_trace}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)} | {error_trace}")

@router.post("/analyze-video/{filename}", response_model=VideoAnalysisResponse)
async def analyze_video(filename: str, background_tasks: BackgroundTasks):
    """Analyze basketball poses from uploaded video."""
    
    file_path = os.path.join(settings.UPLOAD_FOLDER, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        # Perform video pose analysis
        analysis_result = pose_service.analyze_video(file_path)
        
        if "error" in analysis_result:
            raise HTTPException(status_code=400, detail=analysis_result["error"])
        
        # Schedule cleanup of uploaded file
        background_tasks.add_task(cleanup_file, file_path)
        
        return VideoAnalysisResponse(
            success=True,
            filename=filename,
            analysis=analysis_result
        )
    
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Video analysis error: {error_trace}")
        raise HTTPException(status_code=500, detail=f"Video analysis failed: {str(e)} | {error_trace}")

@router.get("/pose-classes")
async def get_pose_classes():
    """Get list of supported basketball pose classes."""
    from app.models.pose_transformer import BASKETBALL_POSE_CLASSES
    
    return {
        "pose_classes": BASKETBALL_POSE_CLASSES,
        "total_classes": len(BASKETBALL_POSE_CLASSES)
    }

@router.get("/analysis-history")
async def get_analysis_history(limit: int = 10):
    """Get recent pose analysis history."""
    # This would typically query a database
    # For now, return a mock response
    return {
        "message": "Analysis history endpoint - would connect to database",
        "limit": limit
    }

@router.post("/player-progress")
async def track_player_progress(player_id: str, analysis_data: dict):
    """Track and analyze player progress over time."""
    # This would typically update player progress in database
    # For now, return a mock response
    return {
        "message": f"Progress tracking for player {player_id}",
        "data": analysis_data,
        "status": "recorded"
    }

@router.get("/player-progress/{player_id}")
async def get_player_progress(player_id: str):
    """Get player progress analytics."""
    # This would typically query player progress from database
    # For now, return a mock response
    return PlayerProgressResponse(
        player_id=player_id,
        total_sessions=10,
        improvement_trend="improving",
        average_pose_quality=0.75,
        recent_analyses=[],
        recommendations=["Focus on shooting form", "Improve defensive stance"]
    )

@router.delete("/cleanup/{filename}")
async def cleanup_file_endpoint(filename: str):
    """Manually cleanup uploaded files."""
    file_path = os.path.join(settings.UPLOAD_FOLDER, filename)
    
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"message": f"File {filename} deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="File not found")

def cleanup_file(file_path: str):
    """Background task to cleanup uploaded files."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Failed to cleanup file {file_path}: {e}")
