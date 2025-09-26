#!/bin/bash

# AI Social Media Platform - Quick Deployment Script
# This script helps deploy the backend API on any system

set -e

echo "🚀 AI Social Media Platform - Quick Deployment"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. Consider using a non-root user for security."
fi

# Check Node.js version
print_status "Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js version: $NODE_VERSION"
    
    # Check if version is 18 or higher
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $NODE_VERSION"
        exit 1
    fi
else
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

# Navigate to backend directory
print_status "Navigating to backend directory..."
cd "$(dirname "$0")/backend-api"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the correct directory?"
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

# Check for .env file
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_status "Created .env file from .env.example"
        print_warning "Please edit .env file with your configuration before starting the server."
    else
        print_error ".env.example not found. Please create .env file manually."
        exit 1
    fi
fi

# Check if MongoDB is running
print_status "Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
        print_status "MongoDB is running and accessible"
    else
        print_warning "MongoDB is not running or not accessible. Please start MongoDB."
    fi
elif command -v mongo &> /dev/null; then
    if mongo --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
        print_status "MongoDB is running and accessible"
    else
        print_warning "MongoDB is not running or not accessible. Please start MongoDB."
    fi
else
    print_warning "MongoDB client not found. Please ensure MongoDB is installed and running."
fi

# Check if Redis is running (optional)
print_status "Checking Redis connection..."
if command -v redis-cli &> /dev/null; then
    if redis-cli ping > /dev/null 2>&1; then
        print_status "Redis is running and accessible"
    else
        print_warning "Redis is not running. The app will work without Redis but with limited functionality."
    fi
else
    print_warning "Redis client not found. Redis is optional but recommended."
fi

# Check if port 8000 is available
print_status "Checking port 8000 availability..."
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Port 8000 is already in use. The server might already be running."
    print_status "Current processes using port 8000:"
    lsof -Pi :8000 -sTCP:LISTEN
else
    print_status "Port 8000 is available"
fi

# Start the server
print_status "Starting the server..."
print_status "Server will be available at: http://localhost:8000"
print_status "Health check: http://localhost:8000/health"
print_status "API docs: http://localhost:8000/api/v1/docs"
print_status ""
print_status "Press Ctrl+C to stop the server"
print_status ""

# Start the server
npm start





