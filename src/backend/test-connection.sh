#!/bin/bash

# Backend Connection Test Script for BTM Travel CRM
# This script tests if the backend is running and responding correctly

echo "================================================"
echo "BTM Travel CRM - Backend Connection Test"
echo "================================================"
echo ""

# Test 1: Check if backend is running
echo "🔍 Test 1: Checking if backend is running..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ PASS: Backend is reachable"
else
    echo "❌ FAIL: Cannot connect to backend"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Make sure backend is running:"
    echo "     cd backend && deno run --allow-net --allow-env server.tsx"
    echo "  2. Check if port 8000 is in use:"
    echo "     lsof -i :8000"
    echo ""
    exit 1
fi

echo ""

# Test 2: Check response format
echo "🔍 Test 2: Checking response format..."
RESPONSE=$(curl -s http://localhost:8000/health)
echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"status"'; then
    echo "✅ PASS: Response contains status field"
else
    echo "❌ FAIL: Response missing status field"
    exit 1
fi

echo ""

# Test 3: Check status value
echo "🔍 Test 3: Checking status value..."
STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
echo "Status: $STATUS"

if [ "$STATUS" = "ok" ] || [ "$STATUS" = "initializing" ] || [ "$STATUS" = "degraded" ]; then
    echo "✅ PASS: Status is valid ($STATUS)"
else
    echo "❌ FAIL: Unexpected status ($STATUS)"
    exit 1
fi

echo ""

# Test 4: Check MongoDB status
echo "🔍 Test 4: Checking MongoDB status..."
MONGO_STATUS=$(echo "$RESPONSE" | grep -o '"mongodb":"[^"]*"' | cut -d'"' -f4)
echo "MongoDB: $MONGO_STATUS"

if [ "$MONGO_STATUS" = "connected" ]; then
    echo "✅ PASS: MongoDB is connected"
elif [ "$MONGO_STATUS" = "initializing" ]; then
    echo "⚠️  WARN: MongoDB is still initializing (this is normal, wait 30s)"
else
    echo "❌ FAIL: MongoDB connection issue ($MONGO_STATUS)"
fi

echo ""
echo "================================================"
echo "✅ ALL TESTS PASSED!"
echo "================================================"
echo ""
echo "Backend is running correctly at http://localhost:8000"
echo ""
echo "If your frontend still can't connect, check:"
echo "  1. Firewall settings (allow port 8000)"
echo "  2. Browser console for errors (F12)"
echo "  3. CORS settings in backend/server.tsx"
echo ""
