@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo TAROT API TEST
echo ========================================
echo.

.\venv\Scripts\python test_api_script.py

echo.
echo ========================================
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Test failed with code %ERRORLEVEL%
)
pause
