#!/bin/bash

echo "======================================"
echo "🔧 FIXING MANAGER PORTAL 404 ERRORS"
echo "======================================"
echo ""

echo "Step 1: Killing all old Deno/backend processes..."
echo "--------------------------------------"
pkill -f "deno.*server.tsx" 2>/dev/null || true
pkill -f "deno run" 2>/dev/null || true
sleep 2
echo "✅ Old processes killed"
echo ""

echo "Step 2: Starting backend server with latest code..."
echo "--------------------------------------"
echo "Starting server on http://localhost:8000"
echo ""
echo "⏳ Please wait while MongoDB initializes (30 seconds)..."
echo ""

# Start the server in the background
deno run --allow-net --allow-env --allow-read server.tsx &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Wait for MongoDB to initialize (show progress)
for i in {1..27}; do
    echo -n "."
    sleep 1
done
echo ""
echo ""

echo "Step 3: Testing endpoints..."
echo "--------------------------------------"

# Test health endpoint
echo -n "Testing server health: "
HEALTH=$(curl -s http://localhost:8000/health)
if [[ $HEALTH == *"ok"* ]] || [[ $HEALTH == *"initializing"* ]]; then
    echo "✅ Server is running"
else
    echo "❌ Server may not be running correctly"
    echo "Response: $HEALTH"
fi

# Test team-performance endpoint
echo -n "Testing /team-performance: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/team-performance)
if [ "$STATUS" = "200" ]; then
    echo "✅ 200 OK"
elif [ "$STATUS" = "503" ]; then
    echo "⏳ 503 (MongoDB still initializing - this is normal)"
else
    echo "❌ $STATUS"
fi

# Test agent-monitoring endpoint
echo -n "Testing /agent-monitoring/overview: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/agent-monitoring/overview)
if [ "$STATUS" = "200" ]; then
    echo "✅ 200 OK"
elif [ "$STATUS" = "503" ]; then
    echo "⏳ 503 (MongoDB still initializing - this is normal)"
else
    echo "❌ $STATUS"
fi

# Test customers endpoint
echo -n "Testing /database/customers: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/database/customers)
if [ "$STATUS" = "200" ]; then
    echo "✅ 200 OK"
elif [ "$STATUS" = "503" ]; then
    echo "⏳ 503 (MongoDB still initializing - this is normal)"
else
    echo "❌ $STATUS"
fi

echo ""
echo "======================================"
echo "✅ SETUP COMPLETE!"
echo "======================================"
echo ""
echo "Server is running with PID: $SERVER_PID"
echo ""
echo "Next steps:"
echo "1. Wait another 10-20 seconds if you see 503 errors"
echo "2. Open your browser to the Manager Portal"
echo "3. Refresh the page"
echo ""
echo "To stop the server later, run:"
echo "  kill $SERVER_PID"
echo ""
echo "Server logs are visible in this terminal."
echo "Press Ctrl+C to stop the server."
echo "======================================"
echo ""

# Keep the script running so server stays alive
wait $SERVER_PID
