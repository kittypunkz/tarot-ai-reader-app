@echo off
chcp 65001 >nul
title Ask The Tarot - Development Server

echo 🚀 Starting Development Environment...
echo.

:: Check if already running
netstat -ano | findstr :3000 >nul
if %errorlevel% == 0 (
    echo ⚠️  Frontend might already be running on port 3000
)
netstat -ano | findstr :8000 >nul
if %errorlevel% == 0 (
    echo ⚠️  Backend might already be running on port 8000
)

echo.
echo Starting Backend...
start "Backend Server" powershell -NoExit -Command "cd '%~dp0backend'; python -m uvicorn src.main:app --reload"

timeout /t 2 /nobreak >nul

echo Starting Frontend...
start "Frontend Server" powershell -NoExit -Command "cd '%~dp0frontend'; npm run dev"

echo.
echo ✅ Both servers started in separate windows!
echo.
echo 📍 URLs:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.
pause
