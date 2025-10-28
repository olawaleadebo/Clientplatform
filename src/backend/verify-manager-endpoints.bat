@echo off
setlocal enabledelayedexpansion

echo 🔍 VERIFYING MANAGER ENDPOINTS
echo ═══════════════════════════════════════════════════════════
echo.

REM Check if server is running
echo 1️⃣ Checking server health...
curl -s http://localhost:8000/health > temp_health.json
type temp_health.json
echo.
echo.

REM Test team-performance endpoint
echo 2️⃣ Testing /team-performance...
curl -s -w "%%{http_code}" -o temp_response.json http://localhost:8000/team-performance > temp_code.txt
set /p HTTP_CODE=<temp_code.txt

if "!HTTP_CODE!"=="200" (
    echo    ✅ SUCCESS - HTTP 200
    type temp_response.json
) else if "!HTTP_CODE!"=="404" (
    echo    ❌ FAIL - HTTP 404 ^(Endpoint not found^)
    echo    👉 Server is running old code! Restart required!
    type temp_response.json
) else (
    echo    ⚠️  HTTP !HTTP_CODE!
    type temp_response.json
)
echo.
echo.

REM Test agent-monitoring endpoint
echo 3️⃣ Testing /agent-monitoring/overview...
curl -s -w "%%{http_code}" -o temp_response.json http://localhost:8000/agent-monitoring/overview > temp_code.txt
set /p HTTP_CODE=<temp_code.txt

if "!HTTP_CODE!"=="200" (
    echo    ✅ SUCCESS - HTTP 200
    type temp_response.json
) else if "!HTTP_CODE!"=="404" (
    echo    ❌ FAIL - HTTP 404 ^(Endpoint not found^)
    echo    👉 Server is running old code! Restart required!
    type temp_response.json
) else (
    echo    ⚠️  HTTP !HTTP_CODE!
    type temp_response.json
)
echo.
echo.

REM Test database/customers endpoint
echo 4️⃣ Testing /database/customers...
curl -s -w "%%{http_code}" -o temp_response.json http://localhost:8000/database/customers > temp_code.txt
set /p HTTP_CODE=<temp_code.txt

if "!HTTP_CODE!"=="200" (
    echo    ✅ SUCCESS - HTTP 200
    type temp_response.json
) else if "!HTTP_CODE!"=="404" (
    echo    ❌ FAIL - HTTP 404 ^(Endpoint not found^)
    echo    👉 Server is running old code! Restart required!
    type temp_response.json
) else (
    echo    ⚠️  HTTP !HTTP_CODE!
    type temp_response.json
)
echo.
echo.

REM Cleanup
del temp_health.json temp_response.json temp_code.txt 2>nul

echo ═══════════════════════════════════════════════════════════
echo ✅ VERIFICATION COMPLETE
echo.
echo If any endpoint returned 404:
echo   1. Stop the server ^(Ctrl+C^)
echo   2. Run: FORCE-RESTART-NOW.bat
echo   3. Wait 10 seconds for MongoDB to initialize
echo   4. Run this script again
echo ═══════════════════════════════════════════════════════════

pause
