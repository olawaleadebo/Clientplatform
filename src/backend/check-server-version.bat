@echo off
echo.
echo ════════════════════════════════════════════════════════════
echo Checking Backend Server Version and Manager Endpoints
echo ════════════════════════════════════════════════════════════
echo.

echo Testing debug endpoint (only exists in NEW code)...
curl -s http://localhost:8000/debug/manager-endpoints

echo.
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo If you see 404 above, the server is running OLD code!
echo Please run: force-restart.bat
echo.
echo If you see endpoint details, the server has the NEW code!
echo The manager endpoints should work.
echo ════════════════════════════════════════════════════════════
pause
