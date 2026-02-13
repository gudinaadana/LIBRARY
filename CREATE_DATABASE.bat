@echo off
echo ========================================
echo Creating MWU Library Database
echo ========================================
echo.

REM Try to find MySQL in common XAMPP locations
set MYSQL_PATH=

if exist "C:\xampp\mysql\bin\mysql.exe" (
    set MYSQL_PATH=C:\xampp\mysql\bin\mysql.exe
) else if exist "C:\xampp3\mysql\bin\mysql.exe" (
    set MYSQL_PATH=C:\xampp3\mysql\bin\mysql.exe
) else if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
    set MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe
)

if "%MYSQL_PATH%"=="" (
    echo ERROR: MySQL not found!
    echo Please make sure XAMPP is installed.
    echo.
    echo Alternative: Use phpMyAdmin
    echo 1. Open http://localhost/phpmyadmin
    echo 2. Click "New" in left sidebar
    echo 3. Enter database name: mwu_library
    echo 4. Click "Create"
    pause
    exit /b 1
)

echo Found MySQL at: %MYSQL_PATH%
echo.
echo Creating database...
"%MYSQL_PATH%" -u root < CREATE_DATABASE.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Database created successfully!
    echo ========================================
    echo.
    echo Database Name: mwu_library
    echo.
    echo Next step: Run migrations
    echo Command: php artisan migrate
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Failed to create database
    echo ========================================
    echo.
    echo Please use phpMyAdmin instead:
    echo 1. Open http://localhost/phpmyadmin
    echo 2. Click "New" in left sidebar
    echo 3. Enter database name: mwu_library
    echo 4. Click "Create"
    echo.
)

pause
