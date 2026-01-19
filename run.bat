@echo off
echo Starting Story Generator...

:: Start backend server in a new window
start "Story Generator - Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

:: Start frontend server in a new window
start "Story Generator - Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

:: Wait a moment for servers to start
timeout /t 3 /nobreak >nul

:: Open browser
start http://localhost:5173

echo.
echo Servers started! Browser opening...
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
