<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Basketball Pose Analyser - Project Context

This is a comprehensive basketball pose analysis system built with:
- **Backend**: Python FastAPI with Transformer-based AI models
- **Frontend**: React TypeScript with Material-UI
- **AI/ML**: MediaPipe, PyTorch, and custom Transformer architecture

## Project Architecture

### Backend Structure
- FastAPI application with async support
- Transformer-based pose analysis models using attention mechanisms
- Top-down (global body structure) and bottom-up (joint-level) analysis
- Real-time pose detection with MediaPipe
- Player progress tracking and analytics

### Frontend Structure
- React TypeScript with Material-UI components
- Drag-and-drop file upload interface
- Real-time analysis visualization
- Progress tracking with interactive charts
- Responsive design for mobile and desktop

### Key Technologies
- **AI Models**: Custom Transformer architecture with spatial attention
- **Pose Detection**: MediaPipe for keypoint extraction
- **Backend**: FastAPI, SQLAlchemy, Pydantic
- **Frontend**: React, TypeScript, Material-UI, Recharts
- **Data**: NumPy, OpenCV, PyTorch

## Basketball-Specific Context

The system analyzes these basketball poses:
- Shooting form and mechanics
- Dribbling technique
- Defensive stance
- Layup execution
- Jump shot mechanics
- Free throw form
- Passing posture
- Rebounding position
- Pivot movements

## Code Style Guidelines

### Python (Backend)
- Use type hints consistently
- Follow PEP 8 style guidelines
- Use Pydantic models for data validation
- Implement proper error handling
- Use async/await for I/O operations

### TypeScript (Frontend)
- Use strict TypeScript configuration
- Implement proper interface definitions
- Use Material-UI components consistently
- Follow React best practices with hooks
- Implement proper error boundaries

## Development Patterns

### API Design
- RESTful endpoints with clear naming
- Consistent response formats
- Proper HTTP status codes
- Comprehensive error handling

### Model Architecture
- Transformer-based pose analysis
- Attention mechanisms for keypoint relationships
- Spatial and temporal feature extraction
- Multi-head analysis (top-down + bottom-up)

### Data Flow
1. File upload (image/video)
2. Pose keypoint extraction
3. Transformer model inference
4. Analysis result generation
5. Progress tracking update
6. Visual feedback display

## Testing Considerations
- Unit tests for model components
- API endpoint testing
- Frontend component testing
- Integration testing for full workflow

## Performance Optimization
- Efficient keypoint extraction
- Model inference optimization
- Frontend lazy loading
- API response caching
- Image/video compression
