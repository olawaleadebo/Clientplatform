@echo off
echo.
echo ════════════════════════════════════════════════════════════
echo BTM Travel CRM - FORCE RESTART BACKEND SERVER
echo ════════════════════════════════════════════════════════════
echo.

echo Step 1: Killing ALL Deno processes...
taskkill /F /IM deno.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Killed existing Deno processes
) else (
    echo ⚠️  No Deno processes found ^(this is OK^)
)
echo.

echo Step 2: Waiting 2 seconds for ports to release...
timeout /t 2 /nobreak >nul
echo ✅ Ready
echo.

echo Step 3: Starting FRESH server with current code...
echo 📂 Location: %CD%\server.tsx
echo 🔧 Version: Will show Manager Portal endpoints
echo 🌐 Port: 8000
echo.
echo ════════════════════════════════════════════════════════════
echo.

REM Start the server
deno run --allow-all server.tsx
