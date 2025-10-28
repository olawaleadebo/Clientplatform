#!/bin/bash
# Kill all Deno processes to stop old backend servers

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🔴 Killing All Deno Backend Servers"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "Stopping all Deno processes..."
pkill -f deno

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All Deno servers stopped successfully!"
    echo ""
    echo "Now run: ./start.sh"
    echo ""
else
    echo ""
    echo "ℹ️  No Deno processes were running."
    echo ""
fi

echo "═══════════════════════════════════════════════════════════"
echo ""
