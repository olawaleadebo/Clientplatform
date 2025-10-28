#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

clear
echo ""
echo "███████████████████████████████████████████████████████████"
echo "█                                                         █"
echo "█   ABSOLUTE FINAL FIX FOR 404 ERRORS                    █"
echo "█                                                         █"
echo "███████████████████████████████████████████████████████████"
echo ""
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  STEP 1: Verify File Has Correct Version"
echo "═══════════════════════════════════════════════════════════"
echo ""

if grep -q "SERVER_VERSION = '8.0.0" backend/server.tsx; then
    echo -e "${GREEN}✅ File has v8.0.0 - CORRECT!${NC}"
else
    echo -e "${RED}❌ ERROR: File does NOT have v8.0.0!${NC}"
    echo "   Something went wrong with the file update."
    echo "   Please contact support."
    exit 1
fi
echo ""
sleep 2

echo "═══════════════════════════════════════════════════════════"
echo "  STEP 2: Kill ALL Deno Processes"
echo "═══════════════════════════════════════════════════════════"
echo ""
pkill -9 deno 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Killed running server(s)${NC}"
else
    echo -e "${YELLOW}ℹ️  No server was running${NC}"
fi
sleep 3
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "  STEP 3: Start Server with v8.0.0 Code"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Starting server..."
cd backend
deno run --allow-net --allow-env --allow-read server.tsx &
SERVER_PID=$!
echo ""
echo -e "${GREEN}✅ Server started! (PID: $SERVER_PID)${NC}"
echo ""
sleep 10

echo "═══════════════════════════════════════════════════════════"
echo "  STEP 4: Verify Server is Running v8.0.0"
echo "═══════════════════════════════════════════════════════════"
echo ""
sleep 5
echo "Checking server version..."
if curl -s http://localhost:8000/test-setup | grep -q "8.0.0"; then
    echo ""
    echo -e "${GREEN}✅✅✅ SUCCESS! Server is running v8.0.0! ✅✅✅${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}❌❌❌ PROBLEM! Server is NOT running v8.0.0! ❌❌❌${NC}"
    echo ""
    echo "This means the server didn't start properly."
    echo "Check above for error messages."
    echo ""
fi
echo ""
sleep 2

echo "═══════════════════════════════════════════════════════════"
echo "  STEP 5: Test Manager Endpoints"
echo "═══════════════════════════════════════════════════════════"
echo ""
sleep 5

echo "Testing /team-performance..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/team-performance)
if [ "$STATUS" == "404" ]; then
    echo -e "HTTP ${STATUS} ${RED}❌ STILL 404!${NC}"
elif [ "$STATUS" == "200" ]; then
    echo -e "HTTP ${STATUS} ${GREEN}✅ WORKING!${NC}"
elif [ "$STATUS" == "503" ]; then
    echo -e "HTTP ${STATUS} ${YELLOW}⏳ MongoDB initializing (normal)${NC}"
else
    echo "HTTP ${STATUS}"
fi
echo ""

echo "Testing /agent-monitoring/overview..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/agent-monitoring/overview)
if [ "$STATUS" == "404" ]; then
    echo -e "HTTP ${STATUS} ${RED}❌ STILL 404!${NC}"
elif [ "$STATUS" == "200" ]; then
    echo -e "HTTP ${STATUS} ${GREEN}✅ WORKING!${NC}"
elif [ "$STATUS" == "503" ]; then
    echo -e "HTTP ${STATUS} ${YELLOW}⏳ MongoDB initializing (normal)${NC}"
else
    echo "HTTP ${STATUS}"
fi
echo ""

echo "Testing /database/customers..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/database/customers)
if [ "$STATUS" == "404" ]; then
    echo -e "HTTP ${STATUS} ${RED}❌ STILL 404!${NC}"
elif [ "$STATUS" == "200" ]; then
    echo -e "HTTP ${STATUS} ${GREEN}✅ WORKING!${NC}"
elif [ "$STATUS" == "503" ]; then
    echo -e "HTTP ${STATUS} ${YELLOW}⏳ MongoDB initializing (normal)${NC}"
else
    echo "HTTP ${STATUS}"
fi
echo ""

echo -e "${GREEN}"
echo "═══════════════════════════════════════════════════════════"
echo "  FINAL RESULTS"
echo "═══════════════════════════════════════════════════════════"
echo -e "${NC}"
echo "If you see:"
echo -e "  ${GREEN}✅ HTTP 200 = Perfect! Endpoint working!${NC}"
echo -e "  ${YELLOW}⏳ HTTP 503 = MongoDB still initializing (wait 30 sec)${NC}"
echo -e "  ${RED}❌ HTTP 404 = Still broken (see troubleshooting below)${NC}"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  NEXT STEPS"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Wait 30 seconds for MongoDB to fully initialize"
echo "2. Go to your browser"
echo "3. Press F5 to refresh the Manager Portal"
echo "4. The 404 errors should be GONE!"
echo ""
echo "Server is running with PID: $SERVER_PID"
echo "To stop it: kill $SERVER_PID"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

# Keep server running
wait $SERVER_PID
