@echo off
echo ========================================
echo MWU Library Database Setup
echo ========================================
echo.

REM Find MySQL
set MYSQL_PATH=
if exist "C:\xampp\mysql\bin\mysql.exe" set MYSQL_PATH=C:\xampp\mysql\bin\mysql.exe
if exist "C:\xampp3\mysql\bin\mysql.exe" set MYSQL_PATH=C:\xampp3\mysql\bin\mysql.exe

if "%MYSQL_PATH%"=="" (
    echo MySQL not found automatically.
    echo.
    echo Please create database manually:
    echo 1. Open http://localhost/phpmyadmin
    echo 2. Click "New" in left sidebar
    echo 3. Enter database name: mwu_library
    echo 4. Click "Create"
    echo.
    echo Then press any key to continue with migrations...
    pause
    goto MIGRATIONS
)

echo Step 1: Creating Database...
echo.
"%MYSQL_PATH%" -u root -e "CREATE DATABASE IF NOT EXISTS mwu_library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if %ERRORLEVEL% EQU 0 (
    echo SUCCESS: Database 'mwu_library' created!
) else (
    echo WARNING: Database might already exist or creation failed
)

:MIGRATIONS
echo.
echo ========================================
echo Step 2: Running Migrations...
echo ========================================
echo.

php artisan migrate --force

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Database setup complete!
    echo ========================================
    echo.
    echo Database: mwu_library
    echo Tables created successfully!
    echo.
    echo You can now run the system:
    echo Backend: php -S localhost:8000 -t public
    echo Frontend: cd frontend ^&^& npm run dev
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Migration failed
    echo ========================================
    echo.
    echo Please check:
    echo 1. XAMPP MySQL is running
    echo 2. Database credentials in .env file
    echo 3. Run: php artisan migrate
    echo.
)

pause
