#!/bin/bash
clear
echo "========================================"
echo "  VERSION CHECK"
echo "========================================"
echo ""

echo "1. Checking file version..."
grep "SERVER_VERSION = " backend/server.tsx
echo ""

echo "2. Checking running server version..."
curl -s http://localhost:8000/test-setup | grep "version"
echo ""

echo "========================================"
echo ""
echo "If they DON'T match, you need to restart!"
echo "Run: ./RESTART-BACKEND-NOW-SIMPLE.sh"
echo ""
