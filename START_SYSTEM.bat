@echo off
title MWU Library Management System - Launcher
color 0A

echo ========================================
echo   MWU DIGITAL LIBRARY
echo ========================================
echo.
echo Starting Backend and Frontend...
echo.
echo Backend will run on: http://localhost:8000
echo Frontend will run on: http://localhost:3000
echo.
echo Press Ctrl+C in each window to stop servers
echo ========================================
echo.

REM Start Backend (Laravel Artisan) in new window
start "MWU Library - Backend (Laravel)" cmd /k "cd /d %~dp0 && echo Starting Backend Server... && echo. && php artisan serve"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start Frontend (Next.js) in new window
start "MWU Library - Frontend (Next.js)" cmd /k "cd /d %~dp0frontend && echo Starting Frontend Server... && echo. && npm run dev"

REM Wait 5 seconds for servers to start
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   Opening Browser...
echo ========================================
echo.

REM Try to open port 3000, if fails try 3001
start http://localhost:3000 2>nul
timeout /t 2 /nobreak >nul
start http://localhost:3001 2>nul

echo.
echo ========================================
echo   System Running!
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000 or http://localhost:3001
echo.
echo Browser should open automatically!
echo If not, manually open: http://localhost:3000
echo.
echo To stop servers:
echo - Close the Backend and Frontend CMD windows
echo - Or press Ctrl+C in each window
echo.
echo This window can be closed safely.
echo.
pause
