@echo off
echo ======================================
echo 🔍 BTM TRAVEL CRM - 404 ERROR DIAGNOSIS
echo ======================================
echo.

echo Step 1: Checking if server is running...
echo --------------------------------------
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Server is running on port 8000
    echo.
    
    echo Step 2: Checking server version...
    echo --------------------------------------
    curl -s http://localhost:8000/test-setup
    echo.
    
    echo Step 3: Testing Manager Portal endpoints...
    echo --------------------------------------
    
    echo Testing /team-performance:
    curl -s -o nul -w "Status: %%{http_code}" http://localhost:8000/team-performance
    echo.
    
    echo Testing /agent-monitoring/overview:
    curl -s -o nul -w "Status: %%{http_code}" http://localhost:8000/agent-monitoring/overview
    echo.
    
    echo Testing /database/customers:
    curl -s -o nul -w "Status: %%{http_code}" http://localhost:8000/database/customers
    echo.
    echo.
    
    echo Diagnosis:
    echo --------------------------------------
    echo If endpoints show 404: Server is running OLD code
    echo    Solution: Run FORCE-RESTART-NOW.bat
    echo.
    echo If endpoints show 503: MongoDB is initializing
    echo    Solution: Wait 30 seconds and try again
    echo.
    echo If endpoints show 200: Everything is working!
    echo    Solution: Just refresh your browser
    
) else (
    echo ❌ Server is NOT running on port 8000
    echo.
    echo Solution:
    echo --------------------------------------
    echo 1. Kill any old server processes:
    echo    kill-old-servers.bat
    echo.
    echo 2. Start the server:
    echo    start.bat
    echo.
    echo 3. Wait 30 seconds for MongoDB to initialize
    echo.
    echo 4. Run this diagnostic again:
    echo    diagnose-404.bat
)

echo.
echo ======================================
pause
