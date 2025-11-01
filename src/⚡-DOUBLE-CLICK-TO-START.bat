@echo off
cls
color 0A
title BTM Travel CRM - Auto Start Backend

echo.
echo  ╔═══════════════════════════════════════════════════════════╗
echo  ║                                                           ║
echo  ║        🚀 BTM TRAVEL CRM - BACKEND AUTO-START 🚀          ║
echo  ║                                                           ║
echo  ║         Starting backend server automatically...          ║
echo  ║                                                           ║
echo  ╚═══════════════════════════════════════════════════════════╝
echo.
echo.

REM Check if Deno is installed
where deno >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  ❌ ERROR: Deno is not installed!
    echo.
    echo  Please install Deno first:
    echo  https://deno.land/
    echo.
    echo  Windows installation:
    echo  PowerShell: irm https://deno.land/install.ps1 ^| iex
    echo.
    start https://deno.land/
    pause
    exit /b 1
)

echo  ✅ Deno found!
echo.

REM Kill any existing servers
echo  🔄 Cleaning up old processes...
taskkill /F /IM deno.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo  ✅ Old processes cleared
echo.

REM Check if backend folder exists
if not exist "backend\server.tsx" (
    color 0C
    echo  ❌ ERROR: Backend files not found!
    echo.
    echo  Make sure you're running this from the project root directory.
    echo  This file should be in the same folder as 'backend' folder.
    echo.
    pause
    exit /b 1
)

echo  ✅ Backend files found
echo.

REM Open the guide in browser
echo  📖 Opening startup guide in browser...
start START-BACKEND-GUIDE.html
timeout /t 2 /nobreak >nul

REM Start the backend
echo.
echo  ╔═══════════════════════════════════════════════════════════╗
echo  ║  🚀 STARTING BACKEND SERVER...                            ║
echo  ║                                                           ║
echo  ║  ⚠️  KEEP THIS WINDOW OPEN!                               ║
echo  ║                                                           ║
echo  ║  Waiting for MongoDB connection...                       ║
echo  ║  (This may take 10-45 seconds on first start)            ║
echo  ║                                                           ║
echo  ║  Press Ctrl+C to stop the server                         ║
echo  ╚═══════════════════════════════════════════════════════════╝
echo.
echo.

cd backend
deno run --allow-net --allow-env --allow-read --allow-write server.tsx

REM If server stops
color 0E
echo.
echo.
echo  ⚠️  Backend server has stopped!
echo.
echo  If this was unexpected, check the error messages above.
echo.
pause
