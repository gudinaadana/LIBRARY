@echo off
title MWU Library System - Cleanup
color 0C
echo.
echo ========================================================
echo    MWU LIBRARY SYSTEM - CLEANUP UTILITY
echo ========================================================
echo.
echo This will remove the old duplicate library-system folder
echo that contains only build files and no source code.
echo.
echo ⚠️  WARNING: This will permanently delete the folder!
echo.
pause
echo.
echo Attempting to remove library-system folder...
echo.
rmdir /s /q library-system
if %errorlevel%==0 (
    echo ✅ Successfully removed library-system folder!
    echo ✅ System cleanup complete!
) else (
    echo ❌ Could not remove folder - files may be in use
    echo 💡 Try restarting your computer and run this again
    echo 💡 Or manually delete the library-system folder
)
echo.
echo Press any key to exit...
pause >nul