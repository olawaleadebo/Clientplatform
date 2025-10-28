#!/bin/bash

echo ""
echo "════════════════════════════════════════════════════════════"
echo "BTM Travel CRM - FORCE RESTART BACKEND SERVER"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "Step 1: Killing ALL Deno processes..."
pkill -9 -f "deno.*server.tsx" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Killed existing Deno processes"
else
    echo "⚠️  No Deno processes found (this is OK)"
fi
echo ""

echo "Step 2: Waiting 2 seconds for ports to release..."
sleep 2
echo "✅ Ready"
echo ""

echo "Step 3: Starting FRESH server with current code..."
echo "📂 Location: $(pwd)/server.tsx"
echo "🔧 Version: Will show Manager Portal endpoints"
echo "🌐 Port: 8000"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Start the server
deno run --allow-all server.tsx
