@echo off
title MWU Library - Database Seeder
color 0B

echo ========================================
echo   Running Database Seeders
echo ========================================
echo.

cd ..
php artisan db:seed

echo.
echo ========================================
echo   Seeding Complete!
echo ========================================
echo.
pause
