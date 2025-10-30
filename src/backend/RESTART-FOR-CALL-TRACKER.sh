#!/bin/bash

echo ""
echo "========================================================"
echo " BTM Travel CRM - Backend Server Restart"
echo " Version 9.2.0 - CALL TRACKER UPDATE"
echo "========================================================"
echo ""

echo "Killing old server processes..."
# Kill any existing Deno processes running on port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
pkill -f "deno.*server.tsx" 2>/dev/null || true

sleep 2

echo ""
echo "Starting backend server with Call Progress endpoints..."
echo ""

cd "$(dirname "$0")"
deno run --allow-all server.tsx
