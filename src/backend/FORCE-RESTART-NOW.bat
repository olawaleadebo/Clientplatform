@echo off
echo 🔥🔥🔥 FORCING COMPLETE BACKEND RESTART 🔥🔥🔥
echo.

REM Kill all Deno processes
echo 1️⃣ Killing all Deno processes...
taskkill /F /IM deno.exe 2>nul
if %ERRORLEVEL% neq 0 (
    echo    No Deno processes found
)

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Show current directory
echo.
echo 2️⃣ Current directory: %CD%

REM Start the server
echo.
echo 3️⃣ Starting server with FRESH instance...
echo ═══════════════════════════════════════════════════════════

deno run --allow-net --allow-env server.tsx
