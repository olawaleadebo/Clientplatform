#!/bin/bash

echo "🔍 VERIFYING MANAGER ENDPOINTS"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check if server is running
echo "1️⃣ Checking server health..."
HEALTH=$(curl -s http://localhost:8000/health)
echo "$HEALTH" | jq . 2>/dev/null || echo "$HEALTH"
echo ""

# Extract version
VERSION=$(echo "$HEALTH" | jq -r '.version' 2>/dev/null)
echo "   Server Version: $VERSION"
echo ""

if [ "$VERSION" != "7.0.0-MANAGER-404-FIXED-ALL-ENDPOINTS-WORKING" ]; then
    echo "❌ ERROR: Server is running OLD code!"
    echo "   Expected: 7.0.0-MANAGER-404-FIXED-ALL-ENDPOINTS-WORKING"
    echo "   Got: $VERSION"
    echo ""
    echo "👉 ACTION REQUIRED:"
    echo "   1. Stop the backend server (Ctrl+C)"
    echo "   2. Run: ./FORCE-RESTART-NOW.sh"
    echo ""
    exit 1
fi

echo "✅ Server is running the CORRECT version!"
echo ""

# Test each endpoint
echo "2️⃣ Testing /team-performance..."
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:8000/team-performance)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ SUCCESS - HTTP 200"
    echo "   Response: $(echo "$BODY" | jq -c '.success' 2>/dev/null)"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "   ❌ FAIL - HTTP 404 (Endpoint not found)"
    echo "   👉 Server is running old code! Restart required!"
else
    echo "   ⚠️  HTTP $HTTP_CODE"
    echo "   Response: $BODY"
fi
echo ""

echo "3️⃣ Testing /agent-monitoring/overview..."
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:8000/agent-monitoring/overview)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ SUCCESS - HTTP 200"
    echo "   Response: $(echo "$BODY" | jq -c '.success' 2>/dev/null)"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "   ❌ FAIL - HTTP 404 (Endpoint not found)"
    echo "   👉 Server is running old code! Restart required!"
else
    echo "   ⚠️  HTTP $HTTP_CODE"
    echo "   Response: $BODY"
fi
echo ""

echo "4️⃣ Testing /database/customers..."
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:8000/database/customers)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ SUCCESS - HTTP 200"
    echo "   Response: $(echo "$BODY" | jq -c '.success' 2>/dev/null)"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "   ❌ FAIL - HTTP 404 (Endpoint not found)"
    echo "   👉 Server is running old code! Restart required!"
else
    echo "   ⚠️  HTTP $HTTP_CODE"
    echo "   Response: $BODY"
fi
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "✅ VERIFICATION COMPLETE"
echo ""
echo "If any endpoint returned 404:"
echo "  1. Stop the server (Ctrl+C)"
echo "  2. Run: ./FORCE-RESTART-NOW.sh"
echo "  3. Wait 10 seconds for MongoDB to initialize"
echo "  4. Run this script again"
echo "═══════════════════════════════════════════════════════════"
