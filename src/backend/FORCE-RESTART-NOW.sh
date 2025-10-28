#!/bin/bash

echo "🔥🔥🔥 FORCING COMPLETE BACKEND RESTART 🔥🔥🔥"
echo ""

# Kill all Deno processes
echo "1️⃣ Killing all Deno processes..."
pkill -9 deno 2>/dev/null || echo "   No Deno processes found"
killall -9 deno 2>/dev/null || echo "   Cleanup complete"

# Wait a moment
sleep 2

# Clear any temp files
echo ""
echo "2️⃣ Clearing temporary files..."
rm -rf /tmp/deno_* 2>/dev/null || echo "   No temp files to clear"

# Show current directory
echo ""
echo "3️⃣ Current directory: $(pwd)"

# Start the server
echo ""
echo "4️⃣ Starting server with FRESH instance..."
echo "═══════════════════════════════════════════════════════════"

deno run --allow-net --allow-env server.tsx
