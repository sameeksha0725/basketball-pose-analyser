# Basketball Pose Analyser

An advanced AI-powered system for analyzing basketball player poses and movements using state-of-the-art Transformer-based models. This system provides comprehensive pose evaluation with both global body structure analysis and detailed joint-level coordination assessment.

## 🏀 Overview

The Basketball Pose Analyser combines cutting-edge computer vision and machine learning techniques to provide:

- **Top-Down Analysis**: Global body structure evaluation using Transformer attention mechanisms
- **Bottom-Up Analysis**: Joint-level coordination and movement precision assessment  
- **Spatial Reasoning**: Advanced keypoint relationship analysis with attention weighting
- **Motion Tracking**: Temporal pattern analysis for video sequences
- **Progress Analytics**: Continuous player development monitoring with actionable feedback

## 🎯 Key Features

### AI-Powered Analysis
- **Transformer Architecture**: Custom pose analysis model with multi-head attention
- **Spatial Attention**: Intelligent keypoint relationship modeling
- **Temporal Modeling**: Motion pattern analysis across video sequences
- **Quality Assessment**: Automated pose quality scoring and feedback

### Basketball-Specific Poses
- Shooting form and mechanics
- Dribbling technique analysis
- Defensive stance evaluation
- Layup and jump shot assessment
- Free throw form analysis
- Passing and rebounding posture

### Interactive Frontend
- Modern React TypeScript interface
- Drag-and-drop file upload
- Real-time analysis visualization
- Progress tracking with charts
- Mobile-responsive design

### Player Development
- Historical performance tracking
- Improvement trend analysis
- Personalized training recommendations
- Session-by-session progress metrics

## 🛠️ Technology Stack

### Backend
- **Python 3.8+** with FastAPI framework
- **PyTorch** for deep learning models
- **Transformers** library for model architecture
- **MediaPipe** for pose detection
- **OpenCV** for image/video processing
- **SQLAlchemy** for data persistence

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for components
- **Recharts** for data visualization
- **Axios** for API communication
- **React Dropzone** for file uploads

### AI/ML Components
- Custom Transformer-based pose analysis model
- Spatial attention mechanisms
- Temporal feature extraction
- Multi-head analysis architecture
- Pose quality assessment algorithms

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/basketball-pose-analyser.git
cd basketball-pose-analyser
```

2. **Set up the backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Set up the frontend**
```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start the backend server**
```bash
cd backend
python main.py
```
Server will be available at http://localhost:8000

2. **Start the frontend development server**
```bash
cd frontend
npm start
```
Application will be available at http://localhost:3000

## 📊 System Architecture

```
┌─────────────────┐    ┌───────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend        │    │   AI Models     │
│   (React TS)    │◄──►│   (FastAPI)       │◄──►│  (Transformers) │
└─────────────────┘    └───────────────────┘    └─────────────────┘
│                      │                       │
│ • File Upload        │ • Pose Analysis API   │ • Keypoint Extraction
│ • Visualization      │ • Progress Tracking   │ • Spatial Attention  
│ • Progress Charts    │ • Data Validation     │ • Temporal Modeling
│ • User Interface     │ • Error Handling      │ • Quality Assessment
└─────────────────────┘└─────────────────────┘└─────────────────────┘
```

## 🧠 AI Model Architecture

The system uses a custom Transformer-based architecture featuring:

### Core Components
- **Keypoint Encoder**: Projects 3D keypoints to model dimensions
- **Spatial Attention**: Analyzes relationships between body joints
- **Temporal Transformer**: Models motion patterns over time
- **Multi-Head Analysis**: Combines global and local pose evaluation

### Analysis Heads
- **Top-Down Head**: Global body structure classification
- **Bottom-Up Head**: Joint-level coordination assessment
- **Quality Head**: Pose quality scoring (0-1 scale)

### Training Data
- Basketball-specific pose annotations
- Multi-angle player recordings
- Professional technique examples
- Progressive difficulty levels

## 📈 API Endpoints

### File Management
- `POST /api/v1/pose/upload-image` - Upload image for analysis
- `POST /api/v1/pose/upload-video` - Upload video for analysis
- `DELETE /api/v1/pose/cleanup/{filename}` - Remove uploaded files

### Analysis
- `POST /api/v1/pose/analyze-image/{filename}` - Analyze uploaded image
- `POST /api/v1/pose/analyze-video/{filename}` - Analyze uploaded video
- `GET /api/v1/pose/pose-classes` - Get supported pose types

### Player Progress
- `POST /api/v1/pose/player-progress` - Record training session
- `GET /api/v1/pose/player-progress/{player_id}` - Get player analytics
- `GET /api/v1/pose/analysis-history` - Get recent analyses

## 🏃‍♂️ Usage Examples

### Image Analysis
1. Upload a basketball pose image
2. Click "Start Analysis"
3. View pose classification and quality score
4. Review feedback and improvement suggestions

### Video Analysis
1. Upload a short basketball video clip (3-10 seconds)
2. Start video analysis for motion patterns
3. Review smoothness and rhythm metrics
4. Get personalized training recommendations

### Progress Tracking
1. Record analysis sessions for a player
2. View improvement trends over time
3. Compare performance across different poses
4. Access detailed training recommendations

## 🎨 User Interface

The frontend provides an intuitive interface with:

- **Upload Tab**: Drag-and-drop file upload with progress indicators
- **Analysis Tab**: Real-time pose analysis with visual feedback
- **Video Tab**: Motion analysis with temporal metrics
- **Progress Tab**: Historical performance tracking and analytics

## 🔧 Configuration

### Backend Configuration
Create `.env` file in the backend directory:
```env
DATABASE_URL=sqlite:///./basketball_poses.db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key
UPLOAD_FOLDER=./uploads
MODEL_PATH=./models
```

### Frontend Configuration
Create `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:8000
```

## 📝 Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- MediaPipe team for pose detection capabilities
- Hugging Face Transformers library
- Material-UI for frontend components
- FastAPI for the backend framework
- Basketball coaching community for domain expertise

## 📞 Support

For questions, issues, or contributions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in each module

---

**Built with ❤️ for the basketball community**
