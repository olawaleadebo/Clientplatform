@echo off
cls
echo ========================================
echo BTM Travel Backend Diagnostics
echo ========================================
echo.

echo [STEP 1] Checking if Deno is installed...
where deno >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Deno is not installed!
    echo.
    echo Please install Deno from: https://deno.land/
    echo.
    echo Windows installation:
    echo   irm https://deno.land/install.ps1 ^| iex
    echo.
    pause
    exit /b 1
)
echo ✅ Deno is installed
deno --version
echo.

echo [STEP 2] Checking if port 8000 is available...
netstat -an | findstr ":8000.*LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ WARNING: Port 8000 is already in use!
    echo.
    echo Attempting to kill any existing server...
    taskkill /F /IM deno.exe 2>nul
    timeout /t 3 /nobreak >nul
    echo ✅ Old processes killed
    echo.
) else (
    echo ✅ Port 8000 is available
    echo.
)

echo [STEP 3] Checking backend files...
if not exist "backend\server.tsx" (
    echo ❌ ERROR: backend\server.tsx not found!
    echo Make sure you're running this from the project root directory.
    pause
    exit /b 1
)
echo ✅ Backend files found
echo.

echo [STEP 4] Testing internet connection...
ping -n 1 google.com >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ WARNING: No internet connection detected
    echo MongoDB Atlas requires internet connection!
    echo.
) else (
    echo ✅ Internet connection available
    echo.
)

echo [STEP 5] Starting backend server...
echo.
echo ========================================
echo 🚀 BACKEND SERVER STARTING
echo ========================================
echo.
echo Keep this window OPEN!
echo Press Ctrl+C to stop the server
echo.
echo The server will start on http://localhost:8000
echo.
echo Waiting for MongoDB connection...
echo (This may take 10-45 seconds on first start)
echo.

cd backend
deno run --allow-net --allow-env --allow-read --allow-write server.tsx

pause
