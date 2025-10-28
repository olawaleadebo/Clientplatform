@echo off
cls
color 0A
echo.
echo ========================================
echo  FIXING MANAGER PORTAL 404 ERRORS
echo ========================================
echo.
echo Current server version: 3.0.0 (OLD)
echo New server version: 8.0.0 (FIXED)
echo.
echo The manager endpoints were MISSING from server.tsx
echo I just added them. Now restarting the server...
echo.
echo ========================================
echo.

echo [1/4] Stopping old server...
taskkill /F /IM deno.exe 2>nul
if %errorlevel% equ 0 (
    echo       ✅ Old server stopped
) else (
    echo       ℹ️  No server was running
)
timeout /t 2 /nobreak >nul
echo.

echo [2/4] Clearing cache...
cd backend
deno cache --reload server.tsx 2>nul
echo       ✅ Cache cleared
echo.

echo [3/4] Starting new server (version 8.0.0)...
echo       Server will open in a new window
start "BTM CRM Server v8.0" cmd /k "deno run --allow-net --allow-env --allow-read server.tsx"
timeout /t 8 /nobreak >nul
echo       ✅ Server started
echo.

echo [4/4] Testing endpoints...
timeout /t 5 /nobreak >nul

curl -s http://localhost:8000/test-setup
echo.
echo.

echo Testing /team-performance...
curl -s -o nul -w "       Status: %%{http_code}\n" http://localhost:8000/team-performance

echo Testing /agent-monitoring/overview...
curl -s -o nul -w "       Status: %%{http_code}\n" http://localhost:8000/agent-monitoring/overview

echo Testing /database/customers...
curl -s -o nul -w "       Status: %%{http_code}\n" http://localhost:8000/database/customers

echo.
echo ========================================
echo  DONE!
echo ========================================
echo.
echo Status codes:
echo   200 = Working perfectly! ✅
echo   503 = MongoDB initializing (wait 30 sec)
echo   404 = Still broken (contact support)
echo.
echo Next steps:
echo   1. Wait 30 seconds for MongoDB
echo   2. Refresh your browser
echo   3. 404 errors should be GONE!
echo.
echo Server is running in the other window.
echo Close that window to stop the server.
echo ========================================
echo.
pause
