@echo off
REM Kill all Deno processes to stop old backend servers

echo.
echo ═══════════════════════════════════════════════════════════
echo 🔴 Killing All Deno Backend Servers
echo ═══════════════════════════════════════════════════════════
echo.

echo Stopping all Deno processes...
taskkill /F /IM deno.exe 2>nul

if %errorlevel% equ 0 (
    echo.
    echo ✅ All Deno servers stopped successfully!
    echo.
    echo Now run: start.bat
    echo.
) else (
    echo.
    echo ℹ️  No Deno processes were running.
    echo.
)

echo ═══════════════════════════════════════════════════════════
echo.

pause
