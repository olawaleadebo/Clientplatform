#!/bin/bash

echo "========================================"
echo "Starting BTMTravel Backend Server"
echo "========================================"
echo ""

cd backend

echo "Checking for existing server processes..."
echo ""

# Kill any existing Deno processes on port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
sleep 2

echo "Starting server on http://localhost:8000..."
echo ""
echo "Backend is starting... Keep this terminal open!"
echo "Press Ctrl+C to stop the server"
echo ""

deno run --allow-net --allow-env --allow-read --allow-write server.tsx
