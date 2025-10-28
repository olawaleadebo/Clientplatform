#!/bin/bash

echo "Making all scripts executable..."

chmod +x FORCE-RESTART-NOW.sh
chmod +x verify-manager-endpoints.sh
chmod +x force-restart.sh
chmod +x test-manager-endpoints.sh
chmod +x verify-endpoints.sh
chmod +x check-server-version.sh
chmod +x test-connection.sh
chmod +x kill-old-servers.sh
chmod +x start.sh

echo "✅ All scripts are now executable!"
echo ""
echo "You can now run:"
echo "  ./FORCE-RESTART-NOW.sh"
echo "  ./verify-manager-endpoints.sh"
echo ""
