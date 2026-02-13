@echo off
title MWU Library Management System - Launcher
color 0A

echo ========================================
echo   MWU Library Management System
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

REM Start Backend (PHP Server) in new window
start "MWU Library - Backend (PHP)" cmd /k "cd /d %~dp0 && echo Starting Backend Server... && echo. && php -S localhost:8000 -t public"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start Frontend (Next.js) in new window
start "MWU Library - Frontend (Next.js)" cmd /k "cd /d %~dp0frontend && echo Starting Frontend Server... && echo. && npm run dev"

REM Wait 3 seconds
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   Servers Starting...
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul

REM Open browser
start http://localhost:3000

echo.
echo ========================================
echo   System Running!
echo ========================================
echo.
echo To stop servers:
echo - Close the Backend and Frontend CMD windows
echo - Or press Ctrl+C in each window
echo.
echo This window can be closed safely.
echo.
pause
