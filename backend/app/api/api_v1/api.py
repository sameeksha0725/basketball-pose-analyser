from fastapi import APIRouter
from app.api.api_v1.endpoints import pose_analysis

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(
    pose_analysis.router, 
    prefix="/pose", 
    tags=["pose-analysis"]
)
