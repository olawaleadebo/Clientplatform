@echo off
echo ========================================
echo Starting BTMTravel Backend Server
echo ========================================
echo.

cd backend

echo Checking for existing server processes...
echo.

REM Kill any existing Deno processes
taskkill /F /IM deno.exe 2>nul
timeout /t 2 /nobreak >nul

echo Starting server on http://localhost:8000...
echo.
echo Backend is starting... Keep this window open!
echo Press Ctrl+C to stop the server
echo.

deno run --allow-net --allow-env --allow-read --allow-write server.tsx

pause
