@echo off
title MWU DIGITAL LIBRARY - Backend Server
color 0A

echo ========================================
echo   MWU DIGITAL LIBRARY - Backend
echo ========================================
echo.
echo Starting Backend Server...
echo Backend: http://localhost:8000
echo.
echo Press Ctrl+C to stop
echo ========================================
echo.

cd ..
php -S localhost:8000 -t public
