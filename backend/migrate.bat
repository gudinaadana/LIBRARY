@echo off
title MWU Library - Database Migration
color 0B

echo ========================================
echo   Running Database Migrations
echo ========================================
echo.

cd ..
php artisan migrate

echo.
echo ========================================
echo   Migration Complete!
echo ========================================
echo.
pause
