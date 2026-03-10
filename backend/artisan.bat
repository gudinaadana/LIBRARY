@echo off
REM Artisan wrapper - runs from backend folder

cd ..
php -S localhost:8000 -t public
