@echo off
title MWU Library System - Frontend Setup
color 0B
echo.
echo ========================================================
echo    MWU LIBRARY SYSTEM - FRONTEND SETUP
echo ========================================================
echo.
echo This will install the frontend dependencies
echo.
cd /d "C:\xampp3\htdocs\NewLaravel\frontend"
echo Installing Node.js dependencies...
echo This may take a few minutes...
echo.
npm install
echo.
if %errorlevel%==0 (
    echo ✅ Frontend setup complete!
    echo ✅ You can now run START_FRONTEND.bat
) else (
    echo ❌ Setup failed - check if Node.js is installed
    echo 💡 Download Node.js from: https://nodejs.org
)
echo.
echo Press any key to exit...
pause >nul