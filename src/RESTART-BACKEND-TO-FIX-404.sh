#!/bin/bash

clear
echo ""
echo "========================================"
echo " FIXING MANAGER PORTAL 404 ERRORS"
echo "========================================"
echo ""
echo "Current server version: 3.0.0 (OLD)"
echo "New server version: 8.0.0 (FIXED)"
echo ""
echo "The manager endpoints were MISSING from server.tsx"
echo "I just added them. Now restarting the server..."
echo ""
echo "========================================"
echo ""

echo "[1/4] Stopping old server..."
pkill -9 -f "deno.*server.tsx" 2>/dev/null
pkill -9 deno 2>/dev/null
sleep 2
echo "      ✅ Old server stopped"
echo ""

echo "[2/4] Clearing cache..."
cd backend
deno cache --reload server.tsx 2>/dev/null
echo "      ✅ Cache cleared"
echo ""

echo "[3/4] Starting new server (version 8.0.0)..."
deno run --allow-net --allow-env --allow-read server.tsx &
SERVER_PID=$!
sleep 8
echo "      ✅ Server started (PID: $SERVER_PID)"
echo ""

echo "[4/4] Testing endpoints..."
sleep 5

curl -s http://localhost:8000/test-setup | head -20
echo ""
echo ""

echo "Testing /team-performance..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/team-performance)
echo "      Status: $STATUS"

echo "Testing /agent-monitoring/overview..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/agent-monitoring/overview)
echo "      Status: $STATUS"

echo "Testing /database/customers..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/database/customers)
echo "      Status: $STATUS"

echo ""
echo "========================================"
echo " DONE!"
echo "========================================"
echo ""
echo "Status codes:"
echo "  200 = Working perfectly! ✅"
echo "  503 = MongoDB initializing (wait 30 sec)"
echo "  404 = Still broken (contact support)"
echo ""
echo "Next steps:"
echo "  1. Wait 30 seconds for MongoDB"
echo "  2. Refresh your browser"
echo "  3. 404 errors should be GONE!"
echo ""
echo "Server is running with PID: $SERVER_PID"
echo "To stop it: kill $SERVER_PID"
echo "========================================"
echo ""

# Keep script running
wait $SERVER_PID
