@echo off
title MWU Online Library Management System - Backend Server
color 0A
echo.
echo ========================================================
echo    MWU ONLINE LIBRARY MANAGEMENT SYSTEM
echo    Backend Server (PHP + API)
echo ========================================================
echo.
echo Starting Backend Server...
echo.
cd /d "C:\xampp3\htdocs\NewLaravel"
echo Backend API starting at: http://localhost:8000
echo.
echo ✅ Backend server starting...
echo.
echo 🎓 MWU Online Library Management System
echo 📚 Role-based access control active
echo 🔗 API Endpoints: http://localhost:8000/api.php
echo.
echo 👨‍💼 Administrator: User management, security, backups
echo 📚 Librarian: Book management, issue/return, reports  
echo 🎓 Student: Search, borrow, return, history
echo 📝 New Students: Can register using the registration form
echo.
echo ⚠️  Keep this window open while using the system
echo ❌ Close this window to stop the backend server
echo.
echo 💡 To start frontend: Open another terminal and run:
echo    START_FRONTEND.bat
echo.
php -S localhost:8000 -t public