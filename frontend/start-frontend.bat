@echo off
title MWU Library - Frontend Server
color 0B

echo ========================================
echo   MWU Library Frontend Server
echo ========================================
echo.
echo Starting Next.js Development Server...
echo Frontend will run on: http://localhost:3000
echo.
echo Opening browser in 5 seconds...
echo ========================================
echo.

REM Start Next.js in background
start /B npm run dev

REM Wait 5 seconds for server to start
timeout /t 5 /nobreak >nul

REM Try to open port 3000, if fails try 3001
start http://localhost:3000 2>nul || start http://localhost:3001

echo.
echo Browser opened! Server is running...
echo Press Ctrl+C to stop the server
echo.

REM Keep window open and show server output
npm run dev
