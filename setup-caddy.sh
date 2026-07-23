#!/bin/bash

# Caddy Configuration Script for KeuanganKu
# Run this on your VPS after deploying the app

set -e

echo "🔧 Configuring Caddy..."

# Backup existing Caddyfile
if [ -f /etc/caddy/Caddyfile ]; then
    cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup
    echo "📋 Backed up existing Caddyfile"
fi

# Create new Caddyfile
cat > /etc/caddy/Caddyfile << 'EOF'
# Landing page (root)
:80 {
    handle / {
        root * /var/www/html
        file_server
    }

    # KeuanganKu App
    handle /app/* {
        reverse_proxy localhost:3000
    }

    # API endpoints
    handle /api/* {
        reverse_proxy localhost:3000
    }
}
EOF

echo "✅ Caddyfile configured"

# Reload Caddy
echo "🔄 Reloading Caddy..."
systemctl reload caddy

echo ""
echo "=========================================="
echo "✅ Caddy configured successfully!"
echo "=========================================="
echo ""
echo "🌐 Landing Page: http://$(hostname -I | awk '{print $1}')/"
echo "🌐 App URL: http://$(hostname -I | awk '{print $1}')/app"
echo "=========================================="
