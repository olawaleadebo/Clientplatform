@echo off
REM Backend Connection Test Script for BTM Travel CRM (Windows)
REM This script tests if the backend is running and responding correctly

echo ================================================
echo BTM Travel CRM - Backend Connection Test
echo ================================================
echo.

REM Test 1: Check if backend is running
echo [1/4] Checking if backend is running...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [PASS] Backend is reachable
) else (
    echo [FAIL] Cannot connect to backend
    echo.
    echo Troubleshooting:
    echo   1. Make sure backend is running:
    echo      cd backend
    echo      deno run --allow-net --allow-env server.tsx
    echo   2. Check if port 8000 is in use:
    echo      netstat -ano ^| findstr :8000
    echo.
    exit /b 1
)

echo.

REM Test 2: Get and display response
echo [2/4] Checking response format...
curl -s http://localhost:8000/health > temp_response.json
type temp_response.json
echo.

findstr /C:"\"status\"" temp_response.json >nul
if %errorlevel% equ 0 (
    echo [PASS] Response contains status field
) else (
    echo [FAIL] Response missing status field
    del temp_response.json
    exit /b 1
)

echo.

REM Test 3: Check if response is valid JSON
echo [3/4] Checking JSON validity...
findstr /C:"{" temp_response.json >nul
if %errorlevel% equ 0 (
    echo [PASS] Response is valid JSON
) else (
    echo [FAIL] Response is not valid JSON
    del temp_response.json
    exit /b 1
)

echo.

REM Test 4: Check MongoDB status
echo [4/4] Checking MongoDB status...
findstr /C:"\"mongodb\"" temp_response.json >nul
if %errorlevel% equ 0 (
    findstr /C:"\"connected\"" temp_response.json >nul
    if %errorlevel% equ 0 (
        echo [PASS] MongoDB is connected
    ) else (
        findstr /C:"\"initializing\"" temp_response.json >nul
        if %errorlevel% equ 0 (
            echo [WARN] MongoDB is still initializing (wait 30 seconds)
        ) else (
            echo [FAIL] MongoDB connection issue
        )
    )
) else (
    echo [WARN] MongoDB status not found in response
)

del temp_response.json

echo.
echo ================================================
echo ALL TESTS COMPLETED!
echo ================================================
echo.
echo Backend is running at http://localhost:8000
echo.
echo If your frontend still can't connect, check:
echo   1. Firewall settings (allow port 8000)
echo   2. Browser console for errors (F12)
echo   3. Try opening http://localhost:8000/health in your browser
echo.
pause
