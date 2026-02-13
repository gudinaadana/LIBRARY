@echo off
title MWU Library System - Laravel Backend Setup
color 0A
echo.
echo ========================================================
echo    MWU LIBRARY SYSTEM - LARAVEL BACKEND SETUP
echo ========================================================
echo.
echo This will set up the Laravel backend
echo.
cd /d "C:\xampp3\htdocs\NewLaravel"

echo Step 1: Installing Composer dependencies...
echo This may take a few minutes...
echo.
composer install --no-dev --optimize-autoloader
echo.

if %errorlevel%==0 (
    echo ✅ Composer dependencies installed!
    echo.
    
    echo Step 2: Setting up environment...
    if not exist ".env" (
        copy ".env.example" ".env"
        echo ✅ Environment file created!
    ) else (
        echo ✅ Environment file already exists!
    )
    echo.
    
    echo Step 3: Generating application key...
    php artisan key:generate --force
    echo.
    
    echo ✅ Laravel backend setup complete!
    echo ✅ You can now run START_LIBRARY.bat
    echo.
    echo 💡 Note: Make sure XAMPP MySQL is running for database features
    
) else (
    echo ❌ Setup failed - check if Composer is installed
    echo 💡 Download Composer from: https://getcomposer.org
)
echo.
echo Press any key to exit...
pause >nul