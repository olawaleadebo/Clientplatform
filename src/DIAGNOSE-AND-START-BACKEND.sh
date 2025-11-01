#!/bin/bash

clear
echo "========================================"
echo "BTM Travel Backend Diagnostics"
echo "========================================"
echo ""

echo "[STEP 1] Checking if Deno is installed..."
if ! command -v deno &> /dev/null; then
    echo "❌ ERROR: Deno is not installed!"
    echo ""
    echo "Please install Deno from: https://deno.land/"
    echo ""
    echo "Installation command:"
    echo "  curl -fsSL https://deno.land/install.sh | sh"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi
echo "✅ Deno is installed"
deno --version
echo ""

echo "[STEP 2] Checking if port 8000 is available..."
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️ WARNING: Port 8000 is already in use!"
    echo ""
    echo "Attempting to kill any existing server..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 3
    echo "✅ Old processes killed"
    echo ""
else
    echo "✅ Port 8000 is available"
    echo ""
fi

echo "[STEP 3] Checking backend files..."
if [ ! -f "backend/server.tsx" ]; then
    echo "❌ ERROR: backend/server.tsx not found!"
    echo "Make sure you're running this from the project root directory."
    read -p "Press Enter to exit..."
    exit 1
fi
echo "✅ Backend files found"
echo ""

echo "[STEP 4] Testing internet connection..."
if ! ping -c 1 google.com &> /dev/null; then
    echo "⚠️ WARNING: No internet connection detected"
    echo "MongoDB Atlas requires internet connection!"
    echo ""
else
    echo "✅ Internet connection available"
    echo ""
fi

echo "[STEP 5] Starting backend server..."
echo ""
echo "========================================"
echo "🚀 BACKEND SERVER STARTING"
echo "========================================"
echo ""
echo "Keep this terminal OPEN!"
echo "Press Ctrl+C to stop the server"
echo ""
echo "The server will start on http://localhost:8000"
echo ""
echo "Waiting for MongoDB connection..."
echo "(This may take 10-45 seconds on first start)"
echo ""

cd backend
deno run --allow-net --allow-env --allow-read --allow-write server.tsx
