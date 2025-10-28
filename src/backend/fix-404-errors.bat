@echo off
echo ======================================
echo 🔧 FIXING MANAGER PORTAL 404 ERRORS
echo ======================================
echo.

echo Step 1: Killing all old Deno/backend processes...
echo --------------------------------------
taskkill /F /IM deno.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo ✅ Old processes killed
echo.

echo Step 2: Starting backend server with latest code...
echo --------------------------------------
echo Starting server on http://localhost:8000
echo.
echo ⏳ Server will start in a new window
echo ⏳ Please wait 30 seconds for MongoDB to initialize
echo.

start "BTM Travel CRM Server" deno run --allow-net --allow-env --allow-read server.tsx

echo Waiting for server to initialize...
timeout /t 10 /nobreak >nul
echo.

echo Step 3: Testing endpoints (after initial startup)...
echo --------------------------------------

timeout /t 5 /nobreak >nul

echo Testing server health:
curl -s http://localhost:8000/health
echo.
echo.

echo Testing /team-performance:
curl -s -o nul -w "Status: %%{http_code}" http://localhost:8000/team-performance
echo.
echo.

echo Testing /agent-monitoring/overview:
curl -s -o nul -w "Status: %%{http_code}" http://localhost:8000/agent-monitoring/overview
echo.
echo.

echo Testing /database/customers:
curl -s -o nul -w "Status: %%{http_code}" http://localhost:8000/database/customers
echo.
echo.

echo ======================================
echo ✅ SETUP COMPLETE!
echo ======================================
echo.
echo Server is running in a separate window
echo.
echo Next steps:
echo 1. Wait 20-30 seconds for MongoDB to fully initialize
echo 2. Open your browser to the Manager Portal
echo 3. Refresh the page
echo.
echo If you see 503 errors, wait a bit longer
echo If you see 200 OK, you're all set!
echo.
echo To stop the server, close the server window
echo or run: taskkill /F /IM deno.exe
echo ======================================
echo.
pause
