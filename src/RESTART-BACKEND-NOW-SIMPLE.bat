@echo off
color 0A
cls
echo.
echo ========================================
echo   RESTARTING BACKEND SERVER NOW
echo ========================================
echo.
echo Killing old server...
taskkill /F /IM deno.exe 2>nul
timeout /t 2 /nobreak >nul
echo Done!
echo.
echo Starting new server...
cd backend
start "BTM CRM Server" cmd /k "deno run --allow-net --allow-env --allow-read server.tsx"
echo.
echo ========================================
echo   Server restarted!
echo   Wait 30 seconds, then refresh browser
echo ========================================
echo.
pause
