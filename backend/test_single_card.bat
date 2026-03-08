@echo off
chcp 65001 >nul
echo ========================================
echo TAROT API TEST - SINGLE CARD
echo ========================================
echo.
echo Testing with ONE card: The Star (upright)
echo.
echo This will take 30-60 seconds for AI response...
echo ========================================
echo.

cd /d "%~dp0"
.\venv\Scripts\python test_single_card.py

echo.
echo ========================================
echo TEST COMPLETE
echo ========================================
pause
