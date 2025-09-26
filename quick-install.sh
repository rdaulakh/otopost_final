#!/bin/bash

# Quick Installation Script for AI Social Media Platform
# This script uses minimal package.json files for faster installation

set -e

echo "🚀 Starting Quick Installation..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Navigate to project directory
cd /home/ubuntu/ai-social-media-platform

# 1. Backend API Installation - SKIPPED
print_status "Skipping Backend API installation (already installed)..."

# 2. Customer Frontend Installation
print_status "Installing Customer Frontend dependencies..."
cd customer-frontend
cp package-minimal.json package.json
npm install --no-optional
print_success "Customer Frontend dependencies installed"

# 3. Admin Panel Installation
print_status "Installing Admin Panel dependencies..."
cd admin-panel
cp package-minimal.json package.json
npm install --no-optional
print_success "Admin Panel dependencies installed"

# 4. Build Frontend Applications
print_status "Building Customer Frontend..."
cd customer-frontend
npm run build
print_success "Customer Frontend built"

print_status "Building Admin Panel..."
cd admin-panel
npm run build
print_success "Admin Panel built"

# 5. Start Services with PM2
print_status "Starting services with PM2..."
cd ..
pm2 start ecosystem.config.js
pm2 save
pm2 startup

print_success "All services started successfully!"

# 6. Show Status
echo ""
echo "=== SERVICE STATUS ==="
pm2 status

echo ""
echo "=== TEST ENDPOINTS ==="
echo "Backend API: curl http://localhost:8000/health"
echo "Customer Frontend: curl http://localhost:3000"
echo "Admin Panel: curl http://localhost:5173"
echo "Domain: http://posts.digiaeon.com"

print_success "Installation completed! Your platform is ready."
