@echo off
title MWU Online Library Management System - Next.js Frontend
color 0B
echo.
echo ========================================================
echo    MWU ONLINE LIBRARY MANAGEMENT SYSTEM
echo    Next.js Frontend Setup & Start
echo ========================================================
echo.
echo Checking frontend setup...
echo.
cd /d "C:\xampp3\htdocs\NewLaravel\frontend"

if not exist "node_modules" (
    echo Installing frontend dependencies...
    echo This may take a few minutes...
    npm install
    echo.
    echo ✅ Dependencies installed!
    echo.
)

echo Starting Next.js Frontend...
echo Frontend will start at: http://localhost:3000
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:3000
echo.
echo ✅ Browser opened! 
echo ✅ Frontend starting...
echo.
echo 🎓 MWU Online Library Management System
echo 🌐 Frontend Interface: http://localhost:3000
echo 🔗 Backend API: http://localhost:8000/api
echo.
echo ⚠️  Make sure Laravel backend is running first!
echo ⚠️  Keep this window open while using the system
echo ❌ Close this window to stop the frontend
echo.
npm run dev