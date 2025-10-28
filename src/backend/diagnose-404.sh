#!/bin/bash

echo "======================================"
echo "🔍 BTM TRAVEL CRM - 404 ERROR DIAGNOSIS"
echo "======================================"
echo ""

echo "Step 1: Checking if server is running..."
echo "--------------------------------------"
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Server is running on port 8000"
    echo ""
    
    echo "Step 2: Checking server version..."
    echo "--------------------------------------"
    curl -s http://localhost:8000/test-setup | python3 -m json.tool || curl -s http://localhost:8000/test-setup
    echo ""
    
    echo "Step 3: Testing Manager Portal endpoints..."
    echo "--------------------------------------"
    
    echo -n "Testing /team-performance: "
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/team-performance)
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "503" ]; then
        echo "✅ $STATUS (Working)"
    else
        echo "❌ $STATUS (Not Found)"
    fi
    
    echo -n "Testing /agent-monitoring/overview: "
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/agent-monitoring/overview)
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "503" ]; then
        echo "✅ $STATUS (Working)"
    else
        echo "❌ $STATUS (Not Found)"
    fi
    
    echo -n "Testing /database/customers: "
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/database/customers)
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "503" ]; then
        echo "✅ $STATUS (Working)"
    else
        echo "❌ $STATUS (Not Found)"
    fi
    
    echo ""
    echo "Diagnosis:"
    echo "--------------------------------------"
    echo "If endpoints show 404: Server is running OLD code"
    echo "   → Solution: Stop server and restart with ./start.sh"
    echo ""
    echo "If endpoints show 503: MongoDB is initializing"
    echo "   → Solution: Wait 30 seconds and try again"
    echo ""
    echo "If endpoints show 200: Everything is working!"
    echo "   → Solution: Just refresh your browser"
    
else
    echo "❌ Server is NOT running on port 8000"
    echo ""
    echo "Solution:"
    echo "--------------------------------------"
    echo "1. Kill any old server processes:"
    echo "   ./kill-old-servers.sh"
    echo ""
    echo "2. Start the server:"
    echo "   ./start.sh"
    echo ""
    echo "3. Wait 30 seconds for MongoDB to initialize"
    echo ""
    echo "4. Run this diagnostic again:"
    echo "   ./diagnose-404.sh"
fi

echo ""
echo "======================================"
