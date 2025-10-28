@echo off
cls
echo ========================================
echo   VERSION CHECK
echo ========================================
echo.

echo 1. Checking file version...
findstr "SERVER_VERSION = " backend\server.tsx
echo.

echo 2. Checking running server version...
curl -s http://localhost:8000/test-setup | findstr "version"
echo.

echo ========================================
echo.
echo If they DON'T match, you need to restart!
echo Run: RESTART-BACKEND-NOW-SIMPLE.bat
echo.
pause
