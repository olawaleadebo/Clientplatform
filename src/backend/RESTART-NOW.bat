@echo off
cls
echo ========================================
echo 🚨 RESTARTING BACKEND SERVER NOW
echo ========================================
echo.
echo Current Running Version: 3.0.0 (OLD)
echo Target Version: 7.0.0 (NEW - with Manager Portal)
echo.
echo Step 1: Killing ALL Deno processes...
echo ----------------------------------------

taskkill /F /IM deno.exe 2>nul
if %errorlevel% equ 0 (
    echo ✅ Killed running Deno processes
) else (
    echo ℹ️  No Deno processes were running
)

timeout /t 3 /nobreak >nul
echo.

echo Step 2: Clearing Deno cache...
echo ----------------------------------------
deno cache --reload server.tsx
echo ✅ Cache cleared
echo.

echo Step 3: Starting server with NEW code...
echo ----------------------------------------
echo Server will start in a new window
echo.

start "BTM Travel CRM Server v7.0.0" cmd /k "deno run --allow-net --allow-env --allow-read server.tsx"

echo ⏳ Waiting for server to initialize...
timeout /t 5 /nobreak >nul
echo.

echo Step 4: Verifying server version...
echo ----------------------------------------
timeout /t 3 /nobreak >nul

curl -s http://localhost:8000/test-setup
echo.
echo.

echo Step 5: Testing Manager Portal endpoints...
echo ----------------------------------------

echo Testing /team-performance...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:8000/team-performance

echo Testing /agent-monitoring/overview...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:8000/agent-monitoring/overview

echo Testing /database/customers...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:8000/database/customers

echo.
echo ========================================
echo ✅ SERVER RESTARTED!
echo ========================================
echo.
echo What you should see:
echo   - Version: 7.0.0-MANAGER-404-FIXED-ALL-ENDPOINTS-WORKING
echo   - Endpoints returning 200 or 503 (NOT 404!)
echo.
echo Next steps:
echo   1. Wait 30 seconds for MongoDB to initialize
echo   2. Go back to your browser
echo   3. Refresh the Manager Portal page
echo   4. The 404 errors should be GONE!
echo.
echo Server is running in the other window.
echo To stop it, close that window or run: taskkill /F /IM deno.exe
echo ========================================
pause
