#!/bin/bash

# KeuanganKu Deployment Script
# Run this on your VPS

set -e

echo "🚀 Starting KeuanganKu deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "📦 Installing Docker Compose plugin..."
    apt install docker-compose-plugin -y
fi

# Create app directory
echo "📁 Setting up directory..."
mkdir -p /opt/keuangan-ku
cd /opt/keuangan-ku

# Generate JWT_SECRET if not exists
if [ ! -f .env ]; then
    echo "🔐 Generating JWT_SECRET..."
    echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
    echo "PORT=3000" >> .env
    echo "NODE_ENV=production" >> .env
fi

# Copy files (assuming we're in the project directory)
echo "📋 Copying files..."
CURRENT_DIR=$(pwd)
if [ -f "$CURRENT_DIR/docker-compose.yml" ]; then
    cp "$CURRENT_DIR/docker-compose.yml" /opt/keuangan-ku/
    cp "$CURRENT_DIR/Dockerfile" /opt/keuangan-ku/
    cp -r "$CURRENT_DIR/client" /opt/keuangan-ku/
    cp -r "$CURRENT_DIR/server" /opt/keuangan-ku/
    cp "$CURRENT_DIR/.dockerignore" /opt/keuangan-ku/
fi

# Build and run
echo "🐳 Building Docker image..."
docker compose build

echo "🚀 Starting container..."
docker compose up -d

# Check status
echo "✅ Checking container status..."
docker compose ps

echo ""
echo "=========================================="
echo "✅ Deployment complete!"
echo "=========================================="
echo ""
echo "🌐 App URL: http://$(hostname -I | awk '{print $1}'):3000/app"
echo ""
echo "📝 Next steps:"
echo "   1. Configure Caddy reverse proxy"
echo "   2. Access the app and register"
echo ""
echo "To view logs: docker compose logs -f"
echo "To stop: docker compose down"
echo "=========================================="
