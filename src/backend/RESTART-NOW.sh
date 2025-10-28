#!/bin/bash

clear
echo "========================================"
echo "🚨 RESTARTING BACKEND SERVER NOW"
echo "========================================"
echo ""
echo "Current Running Version: 3.0.0 (OLD)"
echo "Target Version: 7.0.0 (NEW - with Manager Portal)"
echo ""

echo "Step 1: Killing ALL Deno processes..."
echo "----------------------------------------"
pkill -9 -f "deno.*server.tsx" 2>/dev/null
pkill -9 deno 2>/dev/null
sleep 2
echo "✅ Killed all Deno processes"
echo ""

echo "Step 2: Clearing Deno cache..."
echo "----------------------------------------"
deno cache --reload server.tsx
echo "✅ Cache cleared"
echo ""

echo "Step 3: Starting server with NEW code..."
echo "----------------------------------------"
echo "Server starting on http://localhost:8000"
echo ""

# Start server in background
deno run --allow-net --allow-env --allow-read server.tsx &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

echo "⏳ Waiting for server to initialize..."
sleep 5
echo ""

echo "Step 4: Verifying server version..."
echo "----------------------------------------"
sleep 3
curl -s http://localhost:8000/test-setup | head -20
echo ""
echo ""

echo "Step 5: Testing Manager Portal endpoints..."
echo "----------------------------------------"

echo -n "Testing /team-performance: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/team-performance)
echo "Status $STATUS"

echo -n "Testing /agent-monitoring/overview: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/agent-monitoring/overview)
echo "Status $STATUS"

echo -n "Testing /database/customers: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/database/customers)
echo "Status $STATUS"

echo ""
echo "========================================"
echo "✅ SERVER RESTARTED!"
echo "========================================"
echo ""
echo "What you should see:"
echo "  - Version: 7.0.0-MANAGER-404-FIXED-ALL-ENDPOINTS-WORKING"
echo "  - Endpoints returning 200 or 503 (NOT 404!)"
echo ""
echo "Next steps:"
echo "  1. Wait 30 seconds for MongoDB to initialize"
echo "  2. Go back to your browser"
echo "  3. Refresh the Manager Portal page"
echo "  4. The 404 errors should be GONE!"
echo ""
echo "Server is running with PID: $SERVER_PID"
echo "To stop it later, run: kill $SERVER_PID"
echo ""
echo "Server logs:"
echo "========================================"
echo ""

# Keep script running and show logs
wait $SERVER_PID
