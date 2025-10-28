#!/bin/bash
# BTM Travel CRM - Endpoint Verification Script
# Tests all critical endpoints to ensure they're working

echo "=================================================="
echo "BTM Travel CRM - Endpoint Verification"
echo "=================================================="
echo ""

BASE_URL="http://localhost:8000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local name=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s -X $method "$BASE_URL$endpoint" -H "Content-Type: application/json")
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ PASS${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "   Response: $response"
        return 1
    fi
}

# Start testing
echo "🔍 Testing Core Endpoints..."
test_endpoint "GET" "/health" "Health Check"
test_endpoint "GET" "/test" "Test Endpoint"
test_endpoint "GET" "/debug/endpoints" "Debug Endpoints"
echo ""

echo "🔍 Testing Manager Endpoints..."
test_endpoint "GET" "/team-performance" "Team Performance"
test_endpoint "GET" "/agent-monitoring/overview" "Agent Monitoring Overview"
echo ""

echo "🔍 Testing Database Endpoints..."
test_endpoint "GET" "/database/clients" "Get Clients"
test_endpoint "GET" "/database/customers" "Get Customers"
echo ""

echo "🔍 Testing Call Management..."
test_endpoint "GET" "/call-logs" "Call Logs"
test_endpoint "GET" "/call-scripts" "Call Scripts"
echo ""

echo "🔍 Testing Progress & Settings..."
test_endpoint "GET" "/daily-progress" "Daily Progress"
test_endpoint "GET" "/promotions" "Promotions"
test_endpoint "GET" "/smtp-settings" "SMTP Settings"
test_endpoint "GET" "/threecx-settings" "3CX Settings"
echo ""

echo "🔍 Testing Archive..."
test_endpoint "GET" "/archive" "Archive"
test_endpoint "GET" "/number-claims" "Number Claims"
echo ""

echo "=================================================="
echo "Verification Complete!"
echo "=================================================="
echo ""
echo "📚 For full endpoint documentation, see:"
echo "   backend/ENDPOINTS.md"
echo ""
echo "🔧 To view all endpoints in browser:"
echo "   http://localhost:8000/debug/endpoints"
echo ""
