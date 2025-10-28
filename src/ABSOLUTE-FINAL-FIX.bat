@echo off
color 0C
cls
echo.
echo ███████████████████████████████████████████████████████████
echo █                                                         █
echo █   ABSOLUTE FINAL FIX FOR 404 ERRORS                    █
echo █                                                         █
echo ███████████████████████████████████████████████████████████
echo.
color 0E
echo.
echo ═══════════════════════════════════════════════════════════
echo   STEP 1: Verify File Has Correct Version
echo ═══════════════════════════════════════════════════════════
echo.
findstr /C:"SERVER_VERSION = '8.0.0" backend\server.tsx >nul
if %errorlevel% equ 0 (
    color 0A
    echo ✅ File has v8.0.0 - CORRECT!
) else (
    color 0C
    echo ❌ ERROR: File does NOT have v8.0.0!
    echo    Something went wrong with the file update.
    echo    Please contact support.
    pause
    exit /b 1
)
echo.
timeout /t 2 /nobreak >nul

color 0E
echo ═══════════════════════════════════════════════════════════
echo   STEP 2: Kill ALL Deno Processes
echo ═══════════════════════════════════════════════════════════
echo.
taskkill /F /IM deno.exe 2>nul
if %errorlevel% equ 0 (
    color 0A
    echo ✅ Killed running server(s)
) else (
    color 0E
    echo ℹ️  No server was running
)
timeout /t 3 /nobreak >nul
echo.

color 0E
echo ═══════════════════════════════════════════════════════════
echo   STEP 3: Start Server with v8.0.0 Code
echo ═══════════════════════════════════════════════════════════
echo.
echo Starting server in new window...
cd backend
start "BTM CRM Server v8.0.0" cmd /k "deno run --allow-net --allow-env --allow-read server.tsx"
echo.
color 0A
echo ✅ Server started!
echo.
timeout /t 10 /nobreak >nul

color 0E
echo ═══════════════════════════════════════════════════════════
echo   STEP 4: Verify Server is Running v8.0.0
echo ═══════════════════════════════════════════════════════════
echo.
timeout /t 5 /nobreak >nul
echo Checking server version...
curl -s http://localhost:8000/test-setup | findstr "8.0.0" >nul
if %errorlevel% equ 0 (
    color 0A
    echo.
    echo ✅✅✅ SUCCESS! Server is running v8.0.0! ✅✅✅
    echo.
) else (
    color 0C
    echo.
    echo ❌❌❌ PROBLEM! Server is NOT running v8.0.0! ❌❌❌
    echo.
    echo This means the server didn't start properly.
    echo Check the server window for error messages.
    echo.
)
echo.
timeout /t 2 /nobreak >nul

color 0E
echo ═══════════════════════════════════════════════════════════
echo   STEP 5: Test Manager Endpoints
echo ═══════════════════════════════════════════════════════════
echo.
timeout /t 5 /nobreak >nul

echo Testing /team-performance...
curl -s -o nul -w "HTTP %%{http_code}" http://localhost:8000/team-performance > temp.txt
set /p STATUS=<temp.txt
del temp.txt
if "%STATUS%"=="HTTP 404" (
    color 0C
    echo %STATUS% ❌ STILL 404!
) else if "%STATUS%"=="HTTP 200" (
    color 0A
    echo %STATUS% ✅ WORKING!
) else if "%STATUS%"=="HTTP 503" (
    color 0E
    echo %STATUS% ⏳ MongoDB initializing (normal)
) else (
    echo %STATUS%
)
echo.

echo Testing /agent-monitoring/overview...
curl -s -o nul -w "HTTP %%{http_code}" http://localhost:8000/agent-monitoring/overview > temp.txt
set /p STATUS=<temp.txt
del temp.txt
if "%STATUS%"=="HTTP 404" (
    color 0C
    echo %STATUS% ❌ STILL 404!
) else if "%STATUS%"=="HTTP 200" (
    color 0A
    echo %STATUS% ✅ WORKING!
) else if "%STATUS%"=="HTTP 503" (
    color 0E
    echo %STATUS% ⏳ MongoDB initializing (normal)
) else (
    echo %STATUS%
)
echo.

echo Testing /database/customers...
curl -s -o nul -w "HTTP %%{http_code}" http://localhost:8000/database/customers > temp.txt
set /p STATUS=<temp.txt
del temp.txt
if "%STATUS%"=="HTTP 404" (
    color 0C
    echo %STATUS% ❌ STILL 404!
) else if "%STATUS%"=="HTTP 200" (
    color 0A
    echo %STATUS% ✅ WORKING!
) else if "%STATUS%"=="HTTP 503" (
    color 0E
    echo %STATUS% ⏳ MongoDB initializing (normal)
) else (
    echo %STATUS%
)
echo.

color 0A
echo ═══════════════════════════════════════════════════════════
echo   FINAL RESULTS
echo ═══════════════════════════════════════════════════════════
echo.
echo If you see:
echo   ✅ HTTP 200 = Perfect! Endpoint working!
echo   ⏳ HTTP 503 = MongoDB still initializing (wait 30 sec)
echo   ❌ HTTP 404 = Still broken (see troubleshooting below)
echo.
echo ═══════════════════════════════════════════════════════════
echo   NEXT STEPS
echo ═══════════════════════════════════════════════════════════
echo.
echo 1. Wait 30 seconds for MongoDB to fully initialize
echo 2. Go to your browser
echo 3. Press F5 to refresh the Manager Portal
echo 4. The 404 errors should be GONE!
echo.
echo Server is running in the other window.
echo Don't close that window!
echo.
echo ═══════════════════════════════════════════════════════════
echo.
pause
