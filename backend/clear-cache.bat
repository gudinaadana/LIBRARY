@echo off
title MWU Library - Clear Cache
color 0E

echo ========================================
echo   Clearing Laravel Cache
echo ========================================
echo.

cd ..

echo Clearing application cache...
php artisan cache:clear

echo Clearing configuration cache...
php artisan config:clear

echo Clearing route cache...
php artisan route:clear

echo Clearing view cache...
php artisan view:clear

echo.
echo ========================================
echo   All Caches Cleared!
echo ========================================
echo.
pause
