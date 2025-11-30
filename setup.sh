#!/bin/bash
# Basketball Pose Analyser - Setup Script

echo "🏀 Basketball Pose Analyser - Setup"
echo "=================================="

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+"
    exit 1
fi

echo "✅ Python and Node.js found"

# Setup backend
echo "📦 Setting up backend..."
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create uploads directory
mkdir -p uploads
mkdir -p models

echo "✅ Backend setup complete"

# Setup frontend
echo "📦 Setting up frontend..."
cd ../frontend

# Install dependencies
npm install

echo "✅ Frontend setup complete"

# Copy environment files
echo "⚙️ Setting up configuration..."
cd ..
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

echo "✅ Configuration files created"

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "To start the application:"
echo "1. Backend: cd backend && python main.py"
echo "2. Frontend: cd frontend && npm start"
echo ""
echo "Or use VS Code tasks:"
echo "- Ctrl+Shift+P -> 'Tasks: Run Task' -> 'Start Full Application'"
