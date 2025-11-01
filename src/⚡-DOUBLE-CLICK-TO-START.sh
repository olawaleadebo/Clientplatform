#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

clear

echo -e "${GREEN}"
echo "  ╔═══════════════════════════════════════════════════════════╗"
echo "  ║                                                           ║"
echo "  ║        🚀 BTM TRAVEL CRM - BACKEND AUTO-START 🚀          ║"
echo "  ║                                                           ║"
echo "  ║         Starting backend server automatically...          ║"
echo "  ║                                                           ║"
echo "  ╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Check if Deno is installed
if ! command -v deno &> /dev/null; then
    echo -e "${RED}❌ ERROR: Deno is not installed!${NC}"
    echo ""
    echo "Please install Deno first:"
    echo "https://deno.land/"
    echo ""
    echo "Installation command:"
    echo "  curl -fsSL https://deno.land/install.sh | sh"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

echo -e "${GREEN}✅ Deno found!${NC}"
echo ""

# Kill any existing servers
echo -e "${BLUE}🔄 Cleaning up old processes...${NC}"
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
sleep 2
echo -e "${GREEN}✅ Old processes cleared${NC}"
echo ""

# Check if backend folder exists
if [ ! -f "backend/server.tsx" ]; then
    echo -e "${RED}❌ ERROR: Backend files not found!${NC}"
    echo ""
    echo "Make sure you're running this from the project root directory."
    echo "This file should be in the same folder as 'backend' folder."
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

echo -e "${GREEN}✅ Backend files found${NC}"
echo ""

# Open the guide in browser
echo -e "${BLUE}📖 Opening startup guide in browser...${NC}"
if command -v xdg-open &> /dev/null; then
    xdg-open START-BACKEND-GUIDE.html &>/dev/null &
elif command -v open &> /dev/null; then
    open START-BACKEND-GUIDE.html &>/dev/null &
fi
sleep 2

# Start the backend
echo ""
echo -e "${GREEN}"
echo "  ╔═══════════════════════════════════════════════════════════╗"
echo "  ║  🚀 STARTING BACKEND SERVER...                            ║"
echo "  ║                                                           ║"
echo "  ║  ⚠️  KEEP THIS TERMINAL OPEN!                             ║"
echo "  ║                                                           ║"
echo "  ║  Waiting for MongoDB connection...                       ║"
echo "  ║  (This may take 10-45 seconds on first start)            ║"
echo "  ║                                                           ║"
echo "  ║  Press Ctrl+C to stop the server                         ║"
echo "  ╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

cd backend
deno run --allow-net --allow-env --allow-read --allow-write server.tsx

# If server stops
echo ""
echo ""
echo -e "${YELLOW}⚠️  Backend server has stopped!${NC}"
echo ""
echo "If this was unexpected, check the error messages above."
echo ""
read -p "Press Enter to exit..."
