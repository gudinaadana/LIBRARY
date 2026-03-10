@echo off
title MWU Library - Backend Server
color 0A

echo ========================================
echo   MWU Library Backend Server
echo ========================================
echo.
echo Starting PHP Development Server...
echo Backend will run on: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd ..
php artisan serve
