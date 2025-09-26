#!/bin/bash

# AI Social Media Platform - Development Start Script
# Starts all services in development mode with hot reload

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting AI Social Media Platform in Development Mode${NC}"

# Check if .env exists
if [ ! -f "../.env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Copying from template...${NC}"
    cp ../.env.example ../.env
    echo -e "${YELLOW}⚠️  Please edit .env file with your configuration${NC}"
fi

# Start databases
echo -e "${BLUE}📊 Starting databases...${NC}"
cd ..
docker-compose up -d mongodb redis chroma

# Wait for databases
echo -e "${BLUE}⏳ Waiting for databases to start...${NC}"
sleep 10

# Start backend in development mode
echo -e "${BLUE}🔧 Starting backend API in development mode...${NC}"
cd backend-api
npm run dev &
BACKEND_PID=$!

# Start AI agents in development mode
echo -e "${BLUE}🤖 Starting AI agents in development mode...${NC}"
cd ../ai-agents
source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
python main.py --dev &
AI_AGENTS_PID=$!

# Start customer frontend in development mode
echo -e "${BLUE}🎨 Starting customer frontend in development mode...${NC}"
cd ../customer-frontend
npm run dev &
CUSTOMER_PID=$!

# Start admin panel in development mode
echo -e "${BLUE}🔧 Starting admin panel in development mode...${NC}"
cd ../admin-panel
npm run dev &
ADMIN_PID=$!

# Wait a bit for services to start
sleep 5

echo -e "${GREEN}✅ Development environment started successfully!${NC}"
echo ""
echo -e "${BLUE}📱 Development URLs:${NC}"
echo -e "  Customer Platform: http://localhost:3000"
echo -e "  Admin Panel:       http://localhost:5173"
echo -e "  Backend API:       http://localhost:8000"
echo -e "  API Docs:          http://localhost:8000/docs"
echo ""
echo -e "${BLUE}🔐 Default Credentials:${NC}"
echo -e "  Customer: demo@example.com / password123"
echo -e "  Admin:    admin@aisocialmedia.com / admin123"
echo ""
echo -e "${YELLOW}💡 Development Features:${NC}"
echo -e "  - Hot reload enabled for all services"
echo -e "  - Detailed logging and debugging"
echo -e "  - Auto-restart on file changes"
echo ""
echo -e "${BLUE}🛑 To stop all services, run: ./scripts/stop-all.sh${NC}"

# Create PID file for cleanup
echo "$BACKEND_PID $AI_AGENTS_PID $CUSTOMER_PID $ADMIN_PID" > ../dev-pids.txt

# Keep script running
wait

