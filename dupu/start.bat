@echo off
title Sign Language App Launcher

echo ==========================================
echo    Starting Sign Language App...
echo ==========================================
echo.

:: Start the Flask backend
echo [1/3] Starting backend server...
cd /d "%~dp0backend"
start "Backend Server" cmd /k "python app.py"

:: Wait a moment for the backend to initialize
echo [2/3] Starting frontend dev server...
timeout /t 3 /nobreak >nul

:: Start the Vite frontend
cd /d "%~dp0frontend"
start "Frontend Server" cmd /k "npm run dev"

:: Wait for frontend to be ready, then open in browser
echo [3/3] Opening website in browser...
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo ==========================================
echo    App is running!
echo    Backend:  http://localhost:5000
echo    Frontend: http://localhost:5173
echo ==========================================
echo.
echo Close this window or press any key to exit this launcher.
echo (The servers will keep running in their own windows)
pause >nul
