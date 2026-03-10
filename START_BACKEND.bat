@echo off
title MWU DIGITAL LIBRARY - Backend Server
color 0A

echo ========================================
echo   MWU DIGITAL LIBRARY - Backend
echo ========================================
echo.
echo Starting Backend Server...
echo.
echo Backend will run on: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Navigate to project directory
cd /d "%~dp0"

REM Start PHP Built-in Server
php -S localhost:8000 -t public

pause
