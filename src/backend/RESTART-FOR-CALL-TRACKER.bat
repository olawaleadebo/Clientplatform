@echo off
echo.
echo ========================================================
echo  BTM Travel CRM - Backend Server Restart
echo  Version 9.2.0 - CALL TRACKER UPDATE
echo ========================================================
echo.
echo Killing old server processes...
taskkill /F /IM deno.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting backend server with Call Progress endpoints...
echo.
cd /d "%~dp0"
deno run --allow-all server.tsx

pause
