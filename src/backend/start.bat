@echo off
REM BTM Travel CRM - Backend Server Startup Script (Windows)
REM This script starts the Deno backend server with all required permissions

echo.
echo ═══════════════════════════════════════════════════════════
echo 🚀 Starting BTM Travel CRM Backend Server v6.0.0
echo ═══════════════════════════════════════════════════════════
echo.
echo ✅ CORRECT SERVER: /backend/server.tsx
echo ❌ Do NOT use: /supabase/functions/server/index.tsx
echo.
echo 📍 Directory: %CD%
echo 📄 Running: server.tsx
echo 🔑 Permissions: --allow-all
echo 🌐 Port: 8000
echo.
echo ⚠️  IMPORTANT: Make sure NO other backend is running!
echo    Kill old servers: taskkill /F /IM deno.exe
echo.
echo Press Ctrl+C to stop the server
echo.
echo ═══════════════════════════════════════════════════════════
echo.

REM Start the server
deno run --allow-all server.tsx
