@echo off
REM Basketball Pose Analyser - Windows Setup Script

echo 🏀 Basketball Pose Analyser - Setup
echo ==================================

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8+
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+
    exit /b 1
)

echo ✅ Python and Node.js found

REM Setup backend
echo 📦 Setting up backend...
cd backend

REM Create virtual environment
python -m venv venv
call venv\Scripts\activate.bat

REM Install dependencies
pip install -r requirements.txt

REM Create directories
mkdir uploads 2>nul
mkdir models 2>nul

echo ✅ Backend setup complete

REM Setup frontend
echo 📦 Setting up frontend...
cd ..\frontend

REM Install dependencies
npm install

echo ✅ Frontend setup complete

REM Copy environment files
echo ⚙️ Setting up configuration...
cd ..
copy backend\.env.example backend\.env >nul
copy frontend\.env.example frontend\.env >nul

echo ✅ Configuration files created

echo.
echo 🎉 Setup Complete!
echo.
echo To start the application:
echo 1. Backend: cd backend ^&^& python main.py
echo 2. Frontend: cd frontend ^&^& npm start
echo.
echo Or use VS Code tasks:
echo - Ctrl+Shift+P -^> 'Tasks: Run Task' -^> 'Start Full Application'

pause
