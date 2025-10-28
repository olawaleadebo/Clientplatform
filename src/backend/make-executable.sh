#!/bin/bash
# Make all shell scripts executable

echo "Making all .sh scripts executable..."

chmod +x start.sh
chmod +x force-restart.sh
chmod +x kill-old-servers.sh
chmod +x check-server-version.sh
chmod +x test-manager-endpoints.sh
chmod +x test-connection.sh
chmod +x verify-endpoints.sh

echo "✅ All scripts are now executable!"
echo ""
echo "You can now run:"
echo "  ./start.sh"
echo "  ./force-restart.sh"
echo "  ./check-server-version.sh"
echo "  etc."
