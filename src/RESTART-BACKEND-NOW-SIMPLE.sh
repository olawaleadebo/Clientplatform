#!/bin/bash
clear
echo ""
echo "========================================"
echo "  RESTARTING BACKEND SERVER NOW"
echo "========================================"
echo ""
echo "Killing old server..."
pkill -9 deno 2>/dev/null
sleep 2
echo "Done!"
echo ""
echo "Starting new server..."
cd backend
deno run --allow-net --allow-env --allow-read server.tsx &
echo ""
echo "========================================"
echo "  Server restarted!"
echo "  Wait 30 seconds, then refresh browser"
echo "========================================"
echo ""
