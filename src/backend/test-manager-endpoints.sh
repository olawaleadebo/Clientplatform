#!/bin/bash
# Test Manager Portal Endpoints

echo ""
echo "════════════════════════════════════════════════════════════"
echo "Testing Manager Portal Endpoints"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "Testing /team-performance..."
curl -s http://localhost:8000/team-performance | jq .
echo ""
echo ""

echo "Testing /agent-monitoring/overview..."
curl -s http://localhost:8000/agent-monitoring/overview | jq .
echo ""
echo ""

echo "Testing /database/customers..."
curl -s http://localhost:8000/database/customers | jq .
echo ""
echo ""

echo "════════════════════════════════════════════════════════════"
echo "Test Complete"
echo "════════════════════════════════════════════════════════════"
