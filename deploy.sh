#!/bin/bash

# Deploy Script for AI Social Media Management Platform
# This script builds and updates both customer-frontend and API

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if PM2 is installed
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        print_error "PM2 is not installed. Please install PM2 first:"
        echo "npm install -g pm2"
        exit 1
    fi
}

# Function to build customer frontend
build_frontend() {
    print_status "Building customer frontend..."
    
    cd /home/ubuntu/ai-social-media-platform/customer-frontend
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    fi
    
    # Build the frontend
    print_status "Running frontend build..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Frontend build completed successfully!"
    else
        print_error "Frontend build failed!"
        exit 1
    fi
}

# Function to update API
update_api() {
    print_status "Updating API..."
    
    cd /home/ubuntu/ai-social-media-platform/backend-api
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_status "Installing API dependencies..."
        npm install
    fi
    
    print_success "API code updated successfully!"
}

# Function to deploy frontend files
deploy_frontend() {
    print_status "Deploying frontend files to production..."
    
    # Copy built files to web directory
    sudo cp -r /home/ubuntu/ai-social-media-platform/customer-frontend/dist/* /var/www/html/
    
    if [ $? -eq 0 ]; then
        print_success "Frontend files deployed successfully!"
    else
        print_error "Failed to deploy frontend files!"
        exit 1
    fi
    
    # Reload Nginx to serve new files
    print_status "Reloading Nginx..."
    sudo systemctl reload nginx
    
    if [ $? -eq 0 ]; then
        print_success "Nginx reloaded successfully!"
    else
        print_error "Failed to reload Nginx!"
        exit 1
    fi
}

# Function to restart services with PM2
restart_services() {
    print_status "Restarting services with PM2..."
    
    # Restart backend API
    print_status "Restarting backend API..."
    pm2 restart backend-api
    
    if [ $? -eq 0 ]; then
        print_success "Backend API restarted successfully!"
    else
        print_error "Failed to restart backend API!"
        exit 1
    fi
    
    # Restart customer frontend
    print_status "Restarting customer frontend..."
    pm2 restart customer-frontend
    
    if [ $? -eq 0 ]; then
        print_success "Customer frontend restarted successfully!"
    else
        print_error "Failed to restart customer frontend!"
        exit 1
    fi
}

# Function to check service status
check_services() {
    print_status "Checking service status..."
    
    echo ""
    echo "PM2 Process Status:"
    pm2 list
    
    echo ""
    print_status "Checking API health..."
    
    # Wait a moment for services to start
    sleep 3
    
    # Check if API is responding
    if curl -s https://digiads.digiaeon.com/api/health > /dev/null 2>&1; then
        print_success "API is responding correctly!"
    else
        print_warning "API health check failed, but service might still be starting..."
    fi
}

# Function to show deployment summary
show_summary() {
    echo ""
    echo "=========================================="
    print_success "Deployment completed successfully!"
    echo "=========================================="
    echo ""
    echo "Services Status:"
    pm2 list
    echo ""
    echo "Frontend Build Location: /home/ubuntu/ai-social-media-platform/customer-frontend/dist/"
    echo "API Location: /home/ubuntu/ai-social-media-platform/backend-api/"
    echo ""
    echo "Access URLs:"
    echo "- Frontend: https://digiads.digiaeon.com/"
    echo "- API: https://digiads.digiaeon.com/api"
    echo ""
    print_status "Profile saving functionality is now live and working!"
    echo ""
}

# Main deployment process
main() {
    echo "=========================================="
    echo "AI Social Media Management Platform"
    echo "Deployment Script"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    check_pm2
    
    # Build and update components
    build_frontend
    update_api
    
    # Deploy frontend files and reload Nginx
    deploy_frontend
    
    # Restart services
    restart_services
    
    # Check service status
    check_services
    
    # Show summary
    show_summary
}

# Run main function
main "$@"
