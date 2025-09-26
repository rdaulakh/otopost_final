#!/bin/bash

# AI Social Media Platform - Complete Setup Script
# This script sets up the entire platform for development or production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

print_header "🚀 AI Social Media Platform Setup"

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    cp .env.example .env
    print_warning "Please edit .env file with your configuration before continuing"
    print_warning "Press Enter to continue after editing .env file..."
    read -r
fi

# Load environment variables
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

print_header "📋 System Requirements Check"

# Check for required commands
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is required but not installed"
        return 1
    else
        print_success "$1 is installed"
        return 0
    fi
}

# Check system requirements
print_status "Checking system requirements..."

REQUIREMENTS_MET=true

if ! check_command "node"; then
    print_error "Node.js is required. Please install Node.js 18+ from https://nodejs.org/"
    REQUIREMENTS_MET=false
fi

if ! check_command "npm"; then
    print_error "npm is required. Please install npm"
    REQUIREMENTS_MET=false
fi

if ! check_command "python3"; then
    print_error "Python 3.8+ is required. Please install Python"
    REQUIREMENTS_MET=false
fi

if ! check_command "pip3"; then
    print_error "pip3 is required. Please install pip3"
    REQUIREMENTS_MET=false
fi

if ! check_command "docker"; then
    print_warning "Docker is recommended for easy setup. Install from https://docker.com/"
fi

if ! check_command "docker-compose"; then
    print_warning "Docker Compose is recommended for easy setup"
fi

if [ "$REQUIREMENTS_MET" = false ]; then
    print_error "Please install missing requirements and run this script again"
    exit 1
fi

print_success "All system requirements met!"

print_header "🗄️ Database Setup"

# Check if MongoDB is running
print_status "Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
        print_success "MongoDB is running and accessible"
    else
        print_warning "MongoDB is not running. Starting with Docker..."
        docker-compose up -d mongodb
        sleep 10
    fi
else
    print_warning "MongoDB client not found. Starting with Docker..."
    docker-compose up -d mongodb
    sleep 10
fi

# Initialize database
print_status "Initializing database..."
if [ -f "database/init/01-init-database.js" ]; then
    mongosh ai-social-media database/init/01-init-database.js
    print_success "Database initialized successfully"
else
    print_error "Database initialization script not found"
    exit 1
fi

# Check Redis
print_status "Checking Redis connection..."
if command -v redis-cli &> /dev/null; then
    if redis-cli ping > /dev/null 2>&1; then
        print_success "Redis is running and accessible"
    else
        print_warning "Redis is not running. Starting with Docker..."
        docker-compose up -d redis
        sleep 5
    fi
else
    print_warning "Redis client not found. Starting with Docker..."
    docker-compose up -d redis
    sleep 5
fi

print_header "🔧 Backend API Setup"

print_status "Setting up backend API..."
cd backend-api

# Install dependencies
print_status "Installing Node.js dependencies..."
npm install

# Create necessary directories
mkdir -p logs uploads temp

# Run database migrations if they exist
if [ -f "scripts/migrate.js" ]; then
    print_status "Running database migrations..."
    node scripts/migrate.js
fi

# Build the application
print_status "Building backend application..."
npm run build 2>/dev/null || print_warning "No build script found, skipping..."

cd ..
print_success "Backend API setup completed"

print_header "🤖 AI Agents Setup"

print_status "Setting up AI Agents system..."
cd ai-agents

# Create virtual environment
print_status "Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install -r requirements.txt

# Create necessary directories
mkdir -p logs data chroma_db

# Initialize Chroma database
print_status "Initializing Chroma vector database..."
python -c "
import chromadb
client = chromadb.PersistentClient(path='./chroma_db')
print('Chroma database initialized successfully')
"

cd ..
print_success "AI Agents setup completed"

print_header "🎨 Frontend Setup"

# Setup Customer Frontend
print_status "Setting up Customer Frontend..."
cd customer-frontend

print_status "Installing customer frontend dependencies..."
npm install

print_status "Building customer frontend..."
npm run build

cd ..
print_success "Customer Frontend setup completed"

# Setup Admin Panel
print_status "Setting up Admin Panel..."
cd admin-panel

print_status "Installing admin panel dependencies..."
npm install

print_status "Building admin panel..."
npm run build

cd ..
print_success "Admin Panel setup completed"

print_header "🐳 Docker Setup"

print_status "Building Docker images..."

# Build backend image
print_status "Building backend Docker image..."
docker build -t ai-social-backend ./backend-api

# Build AI agents image
print_status "Building AI agents Docker image..."
docker build -t ai-social-ai-agents ./ai-agents

# Build customer frontend image
print_status "Building customer frontend Docker image..."
docker build -t ai-social-customer ./customer-frontend

# Build admin panel image
print_status "Building admin panel Docker image..."
docker build -t ai-social-admin ./admin-panel

print_success "Docker images built successfully"

print_header "🔍 Health Checks"

print_status "Performing health checks..."

# Start all services
print_status "Starting all services..."
docker-compose up -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Check backend health
print_status "Checking backend API health..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    print_success "Backend API is healthy"
else
    print_error "Backend API health check failed"
fi

# Check customer frontend
print_status "Checking customer frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "Customer frontend is accessible"
else
    print_error "Customer frontend health check failed"
fi

# Check admin panel
print_status "Checking admin panel..."
if curl -f http://localhost:5173 > /dev/null 2>&1; then
    print_success "Admin panel is accessible"
else
    print_error "Admin panel health check failed"
fi

print_header "📊 Setup Summary"

print_success "🎉 AI Social Media Platform setup completed successfully!"
echo ""
print_status "📱 Access URLs:"
echo -e "  ${CYAN}Customer Platform:${NC} http://localhost:3000"
echo -e "  ${CYAN}Admin Panel:${NC}       http://localhost:5173"
echo -e "  ${CYAN}API Documentation:${NC} http://localhost:8000/docs"
echo -e "  ${CYAN}API Health Check:${NC}  http://localhost:8000/health"
echo ""
print_status "🔐 Default Credentials:"
echo -e "  ${CYAN}Customer Login:${NC}"
echo -e "    Email: demo@example.com"
echo -e "    Password: password123"
echo -e "  ${CYAN}Admin Login:${NC}"
echo -e "    Email: admin@aisocialmedia.com"
echo -e "    Password: admin123"
echo ""
print_status "🛠️ Management Commands:"
echo -e "  ${CYAN}Start all services:${NC}     docker-compose up -d"
echo -e "  ${CYAN}Stop all services:${NC}      docker-compose down"
echo -e "  ${CYAN}View logs:${NC}              docker-compose logs -f"
echo -e "  ${CYAN}Restart service:${NC}        docker-compose restart [service-name]"
echo ""
print_status "📚 Documentation:"
echo -e "  ${CYAN}Complete docs:${NC}          ./documentation/"
echo -e "  ${CYAN}API Reference:${NC}          http://localhost:8000/docs"
echo -e "  ${CYAN}Quick Start:${NC}            ./QUICK-START.md"
echo ""
print_warning "⚠️  Important Notes:"
echo -e "  - Configure your .env file with real API keys for production"
echo -e "  - Change default passwords before deploying to production"
echo -e "  - Set up SSL certificates for production deployment"
echo -e "  - Configure backup procedures for production data"
echo ""
print_success "🚀 Your AI Social Media Platform is ready to use!"
print_status "Happy social media managing! 🎯"

