@echo off
REM VAGS Backup Runner - Easy backup creation
echo 🚀 VAGS Backup System
echo ===================

echo.
echo Choose backup type:
echo 1. Quick Backup (Configuration files)
echo 2. Database Backup (Full database export)
echo 3. Show All Backups
echo 4. Exit

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo Creating quick backup...
    ..\env\Scripts\python.exe quick_backup.py
) else if "%choice%"=="2" (
    echo.
    echo Creating database backup...
    ..\env\Scripts\python.exe python_backup.py
) else if "%choice%"=="3" (
    echo.
    echo Showing all backups...
    ..\env\Scripts\python.exe show_backups.py
) else if "%choice%"=="4" (
    echo Goodbye!
    exit
) else (
    echo Invalid choice. Please try again.
    pause
    goto :eof
)

echo.
echo Backup operation completed!
pause
