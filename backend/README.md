# Basketball Pose Analyser Backend

A FastAPI-based backend for analyzing basketball player poses using Transformer-based models.

## Features

- **Pose Analysis**: Real-time pose detection and analysis from images and videos
- **Transformer Models**: Advanced attention-weighted keypoint extraction
- **Spatial Reasoning**: Top-down posture evaluation and bottom-up motion analysis  
- **Visual Feedback**: Comprehensive pose quality assessment and improvement suggestions
- **Progress Tracking**: Player performance monitoring over time
- **RESTful API**: Clean API endpoints for frontend integration

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Running the Server

Development mode:
```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Pose Analysis
- `POST /api/v1/pose/upload-image` - Upload image for analysis
- `POST /api/v1/pose/upload-video` - Upload video for analysis  
- `POST /api/v1/pose/analyze-image/{filename}` - Analyze uploaded image
- `POST /api/v1/pose/analyze-video/{filename}` - Analyze uploaded video
- `GET /api/v1/pose/pose-classes` - Get supported pose classes

### Player Progress
- `POST /api/v1/pose/player-progress` - Record player progress
- `GET /api/v1/pose/player-progress/{player_id}` - Get player analytics

### Utility
- `GET /health` - Health check endpoint
- `DELETE /api/v1/pose/cleanup/{filename}` - Cleanup uploaded files

## Model Architecture

The system uses a Transformer-based architecture with:

- **Spatial Attention**: Analyzes relationships between body keypoints
- **Temporal Modeling**: Processes motion patterns over time  
- **Multi-Head Analysis**: Combines top-down and bottom-up pose evaluation
- **Quality Assessment**: Provides pose quality scores and feedback

## Basketball Pose Classes

The model can detect and analyze:
- Shooting form
- Dribbling technique
- Defensive stance
- Layup execution
- Jump shot mechanics
- Free throw form
- Passing posture
- Rebounding position
- Pivot movements
- Idle/ready position

## Development

Run tests:
```bash
pytest
```

Code formatting:
```bash
black app/
isort app/
flake8 app/
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
