#!/bin/bash

# AI Social Media Management Platform - Setup Script
# This script sets up the complete project environment

set -e  # Exit on any error

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js is required but not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    # Check Python
    if command_exists python3; then
        PYTHON_VERSION=$(python3 --version)
        print_success "Python found: $PYTHON_VERSION"
    else
        print_error "Python 3.8+ is required but not installed. Please install Python from https://python.org/"
        exit 1
    fi
    
    # Check MongoDB
    if command_exists mongod; then
        print_success "MongoDB found"
    else
        print_warning "MongoDB not found. Please install MongoDB from https://mongodb.com/"
    fi
    
    # Check Redis
    if command_exists redis-server; then
        print_success "Redis found"
    else
        print_warning "Redis not found. Please install Redis from https://redis.io/"
    fi
    
    # Check Docker
    if command_exists docker; then
        print_success "Docker found"
    else
        print_warning "Docker not found. Please install Docker from https://docker.com/"
    fi
}

# Function to create environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Copy environment template
    if [ ! -f .env ]; then
        cp env.example .env
        print_success "Created .env file from template"
    else
        print_warning ".env file already exists, skipping..."
    fi
    
    # Create development environment
    if [ ! -f .env.development ]; then
        cp env.example .env.development
        print_success "Created .env.development file"
    fi
    
    # Create production environment
    if [ ! -f .env.production ]; then
        cp env.example .env.production
        print_success "Created .env.production file"
    fi
    
    print_warning "Please update the .env files with your actual API keys and configuration"
}

# Function to install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."
    
    cd backend-api
    
    if [ -f package.json ]; then
        npm install
        print_success "Backend dependencies installed"
    else
        print_error "package.json not found in backend-api directory"
        exit 1
    fi
    
    cd ..
}

# Function to install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    
    # Customer Frontend
    if [ -d "customer-frontend" ]; then
        cd customer-frontend
        if [ -f package.json ]; then
            npm install
            print_success "Customer frontend dependencies installed"
        fi
        cd ..
    fi
    
    # Admin Panel
    if [ -d "admin-panel" ]; then
        cd admin-panel
        if [ -f package.json ]; then
            npm install
            print_success "Admin panel dependencies installed"
        fi
        cd ..
    fi
}

# Function to install AI agents dependencies
install_ai_deps() {
    print_status "Installing AI agents dependencies..."
    
    cd ai-agents
    
    if [ -f requirements.txt ]; then
        python3 -m pip install -r requirements.txt
        print_success "AI agents dependencies installed"
    else
        print_warning "requirements.txt not found in ai-agents directory"
    fi
    
    cd ..
}

# Function to setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if MongoDB is running
    if command_exists mongod; then
        if pgrep -x "mongod" > /dev/null; then
            print_success "MongoDB is running"
        else
            print_warning "MongoDB is not running. Please start MongoDB before running the application"
        fi
    fi
    
    # Check if Redis is running
    if command_exists redis-server; then
        if pgrep -x "redis-server" > /dev/null; then
            print_success "Redis is running"
        else
            print_warning "Redis is not running. Please start Redis before running the application"
        fi
    fi
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    # Create logs directory
    mkdir -p logs
    print_success "Created logs directory"
    
    # Create uploads directory
    mkdir -p uploads
    print_success "Created uploads directory"
    
    # Create temp directory
    mkdir -p temp
    print_success "Created temp directory"
    
    # Create AI agents logs directory
    mkdir -p ai-agents/logs
    print_success "Created AI agents logs directory"
}

# Function to setup Docker
setup_docker() {
    print_status "Setting up Docker..."
    
    if [ -f docker-compose.yml ]; then
        print_success "Docker Compose file found"
        
        # Check if Docker is running
        if docker info >/dev/null 2>&1; then
            print_success "Docker is running"
        else
            print_warning "Docker is not running. Please start Docker before using docker-compose"
        fi
    else
        print_warning "docker-compose.yml not found"
    fi
}

# Function to run database initialization
init_database() {
    print_status "Initializing database..."
    
    cd backend-api
    
    if [ -f "src/models/User.js" ]; then
        # Run database initialization
        node -e "
        const { initDatabase } = require('./database/init/init-db');
        initDatabase().then(() => {
            console.log('Database initialized successfully');
            process.exit(0);
        }).catch(err => {
            console.error('Database initialization failed:', err);
            process.exit(1);
        });
        "
        print_success "Database initialized"
    else
        print_warning "Database models not found, skipping initialization"
    fi
    
    cd ..
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Backend tests
    if [ -d "backend-api" ]; then
        cd backend-api
        if [ -f package.json ] && grep -q '"test"' package.json; then
            npm test
            print_success "Backend tests completed"
        else
            print_warning "No test script found in backend"
        fi
        cd ..
    fi
    
    # Frontend tests
    for frontend in customer-frontend admin-panel; do
        if [ -d "$frontend" ]; then
            cd "$frontend"
            if [ -f package.json ] && grep -q '"test"' package.json; then
                npm test
                print_success "$frontend tests completed"
            else
                print_warning "No test script found in $frontend"
            fi
            cd ..
        fi
    done
}

# Function to display next steps
show_next_steps() {
    print_success "Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update your .env files with actual API keys and configuration"
    echo "2. Start MongoDB and Redis services"
    echo "3. Start the backend API: cd backend-api && npm run dev"
    echo "4. Start the customer frontend: cd customer-frontend && npm run dev"
    echo "5. Start the admin panel: cd admin-panel && npm run dev"
    echo "6. Start the AI agents: cd ai-agents && python3 main.py"
    echo ""
    echo "Or use Docker Compose to start everything:"
    echo "docker-compose up -d"
    echo ""
    echo "For more information, see IMPLEMENTATION_GUIDE.md"
}

# Main setup function
main() {
    echo "🚀 AI Social Media Management Platform - Setup Script"
    echo "=================================================="
    echo ""
    
    # Check requirements
    check_requirements
    echo ""
    
    # Setup environment
    setup_environment
    echo ""
    
    # Create directories
    create_directories
    echo ""
    
    # Install dependencies
    install_backend_deps
    echo ""
    
    install_frontend_deps
    echo ""
    
    install_ai_deps
    echo ""
    
    # Setup database
    setup_database
    echo ""
    
    # Setup Docker
    setup_docker
    echo ""
    
    # Initialize database
    init_database
    echo ""
    
    # Run tests
    run_tests
    echo ""
    
    # Show next steps
    show_next_steps
}

# Run main function
main "$@"

