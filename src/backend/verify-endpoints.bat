@echo off
REM BTM Travel CRM - Endpoint Verification Script (Windows)
REM Tests all critical endpoints to ensure they're working

echo ==================================================
echo BTM Travel CRM - Endpoint Verification
echo ==================================================
echo.

set BASE_URL=http://localhost:8000

echo Testing Core Endpoints...
curl -s -X GET "%BASE_URL%/health"
echo.
curl -s -X GET "%BASE_URL%/test"
echo.
curl -s -X GET "%BASE_URL%/debug/endpoints"
echo.

echo.
echo Testing Manager Endpoints...
curl -s -X GET "%BASE_URL%/team-performance"
echo.
curl -s -X GET "%BASE_URL%/agent-monitoring/overview"
echo.

echo.
echo Testing Database Endpoints...
curl -s -X GET "%BASE_URL%/database/clients"
echo.
curl -s -X GET "%BASE_URL%/database/customers"
echo.

echo.
echo ==================================================
echo Verification Complete!
echo ==================================================
echo.
echo For full endpoint documentation, see:
echo    backend\ENDPOINTS.md
echo.
echo To view all endpoints in browser:
echo    http://localhost:8000/debug/endpoints
echo.
pause
