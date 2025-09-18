#!/bin/bash

# AI Social Media Management Platform - Production Deployment Script
# This script handles the complete deployment of the platform to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="ai-social-media-platform"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
BACKUP_DIR="/backups"
LOG_FILE="/var/log/deployment.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root for security reasons"
    fi
}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js first."
    fi
    
    # Check if Python is installed
    if ! command -v python3 &> /dev/null; then
        error "Python 3 is not installed. Please install Python 3 first."
    fi
    
    # Check available disk space (at least 10GB)
    available_space=$(df / | awk 'NR==2 {print $4}')
    if [ $available_space -lt 10485760 ]; then
        error "Insufficient disk space. At least 10GB required."
    fi
    
    success "System requirements check passed"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    sudo mkdir -p $BACKUP_DIR
    sudo mkdir -p /var/log
    sudo mkdir -p /opt/$PROJECT_NAME
    sudo mkdir -p /etc/nginx/sites-available
    sudo mkdir -p /etc/nginx/sites-enabled
    
    success "Directories created successfully"
}

# Setup environment variables
setup_environment() {
    log "Setting up environment variables..."
    
    if [ ! -f $ENV_FILE ]; then
        error "Environment file $ENV_FILE not found. Please create it first."
    fi
    
    # Copy environment file
    cp $ENV_FILE .env
    
    # Validate required environment variables
    required_vars=(
        "NODE_ENV"
        "PORT"
        "MONGO_URI"
        "REDIS_URL"
        "JWT_SECRET"
        "OPENAI_API_KEY"
        "CLAUDE_API_KEY"
        "GEMINI_API_KEY"
        "STRIPE_SECRET_KEY"
        "PAYPAL_CLIENT_ID"
        "PAYPAL_CLIENT_SECRET"
        "SENDGRID_API_KEY"
        "AWS_ACCESS_KEY_ID"
        "AWS_SECRET_ACCESS_KEY"
        "AWS_REGION"
        "CLOUDINARY_CLOUD_NAME"
        "CLOUDINARY_API_KEY"
        "CLOUDINARY_API_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" .env; then
            warning "Environment variable $var is not set"
        fi
    done
    
    success "Environment variables configured"
}

# Create production Docker Compose file
create_docker_compose() {
    log "Creating production Docker Compose configuration..."
    
    cat > $DOCKER_COMPOSE_FILE << EOF
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:6.0
    container_name: ${PROJECT_NAME}-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: \${MONGO_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: \${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: \${MONGO_DATABASE}
    volumes:
      - mongodb_data:/data/db
      - ./database/init:/docker-entrypoint-initdb.d
    ports:
      - "27017:27017"
    networks:
      - ${PROJECT_NAME}-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: ${PROJECT_NAME}-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass \${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - ${PROJECT_NAME}-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API
  backend:
    build:
      context: ./backend-api
      dockerfile: Dockerfile.prod
    container_name: ${PROJECT_NAME}-backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGO_URI=mongodb://mongodb:27017/\${MONGO_DATABASE}
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
    env_file:
      - .env
    ports:
      - "3000:3000"
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - ${PROJECT_NAME}-network
    volumes:
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Customer Frontend
  customer-frontend:
    build:
      context: ./customer-frontend
      dockerfile: Dockerfile.prod
    container_name: ${PROJECT_NAME}-customer-frontend
    restart: unless-stopped
    environment:
      - REACT_APP_API_URL=http://backend:3000
      - REACT_APP_ENV=production
    ports:
      - "3001:80"
    depends_on:
      - backend
    networks:
      - ${PROJECT_NAME}-network

  # Admin Panel
  admin-panel:
    build:
      context: ./admin-panel
      dockerfile: Dockerfile.prod
    container_name: ${PROJECT_NAME}-admin-panel
    restart: unless-stopped
    environment:
      - REACT_APP_API_URL=http://backend:3000
      - REACT_APP_ENV=production
    ports:
      - "3002:80"
    depends_on:
      - backend
    networks:
      - ${PROJECT_NAME}-network

  # AI Agents
  ai-agents:
    build:
      context: ./ai-agents
      dockerfile: Dockerfile.prod
    container_name: ${PROJECT_NAME}-ai-agents
    restart: unless-stopped
    environment:
      - PYTHONPATH=/app
      - MONGO_URI=mongodb://mongodb:27017/\${MONGO_DATABASE}
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
    env_file:
      - .env
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - ${PROJECT_NAME}-network
    volumes:
      - ./ai-agents/logs:/app/logs

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: ${PROJECT_NAME}-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - backend
      - customer-frontend
      - admin-panel
    networks:
      - ${PROJECT_NAME}-network

volumes:
  mongodb_data:
    driver: local
  redis_data:
    driver: local

networks:
  ${PROJECT_NAME}-network:
    driver: bridge
EOF

    success "Docker Compose configuration created"
}

# Create Nginx configuration
create_nginx_config() {
    log "Creating Nginx configuration..."
    
    mkdir -p nginx
    
    cat > nginx/nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Logging
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;
    
    # Upstream servers
    upstream backend {
        server backend:3000;
    }
    
    upstream customer-frontend {
        server customer-frontend:80;
    }
    
    upstream admin-panel {
        server admin-panel:80;
    }
    
    # Main server block
    server {
        listen 80;
        server_name _;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        
        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }
        
        # Auth routes with stricter rate limiting
        location /api/auth/ {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        # Admin panel
        location /admin {
            proxy_pass http://admin-panel;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        # Customer frontend
        location / {
            proxy_pass http://customer-frontend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        # Health check
        location /health {
            proxy_pass http://backend/health;
            access_log off;
        }
    }
}
EOF

    success "Nginx configuration created"
}

# Create production Dockerfiles
create_dockerfiles() {
    log "Creating production Dockerfiles..."
    
    # Backend Dockerfile
    cat > backend-api/Dockerfile.prod << EOF
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
EOF

    # Customer Frontend Dockerfile
    cat > customer-frontend/Dockerfile.prod << EOF
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
EOF

    # Admin Panel Dockerfile
    cat > admin-panel/Dockerfile.prod << EOF
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
EOF

    # AI Agents Dockerfile
    cat > ai-agents/Dockerfile.prod << EOF
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create non-root user
RUN useradd -m -u 1001 pythonuser
RUN chown -R pythonuser:pythonuser /app
USER pythonuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# Start application
CMD ["python", "main.py"]
EOF

    success "Production Dockerfiles created"
}

# Build and start services
deploy_services() {
    log "Building and starting services..."
    
    # Stop existing services
    docker-compose -f $DOCKER_COMPOSE_FILE down --remove-orphans || true
    
    # Build images
    docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache
    
    # Start services
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    check_service_health
    
    success "Services deployed successfully"
}

# Check service health
check_service_health() {
    log "Checking service health..."
    
    # Check MongoDB
    if ! docker exec ${PROJECT_NAME}-mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        error "MongoDB is not healthy"
    fi
    
    # Check Redis
    if ! docker exec ${PROJECT_NAME}-redis redis-cli ping > /dev/null 2>&1; then
        error "Redis is not healthy"
    fi
    
    # Check Backend
    if ! curl -f http://localhost:3000/health > /dev/null 2>&1; then
        error "Backend API is not healthy"
    fi
    
    # Check Frontend
    if ! curl -f http://localhost:3001 > /dev/null 2>&1; then
        error "Customer Frontend is not healthy"
    fi
    
    # Check Admin Panel
    if ! curl -f http://localhost:3002 > /dev/null 2>&1; then
        error "Admin Panel is not healthy"
    fi
    
    success "All services are healthy"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create monitoring script
    cat > /opt/$PROJECT_NAME/monitor.sh << 'EOF'
#!/bin/bash

# Service monitoring script
SERVICES=("mongodb" "redis" "backend" "customer-frontend" "admin-panel" "ai-agents" "nginx")
PROJECT_NAME="ai-social-media-platform"

for service in "${SERVICES[@]}"; do
    container_name="${PROJECT_NAME}-${service}"
    
    if ! docker ps | grep -q "$container_name"; then
        echo "$(date): $container_name is not running" >> /var/log/service-monitor.log
        # Restart service
        docker-compose -f /opt/$PROJECT_NAME/docker-compose.prod.yml restart $service
    fi
done
EOF

    chmod +x /opt/$PROJECT_NAME/monitor.sh
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * /opt/$PROJECT_NAME/monitor.sh") | crontab -
    
    success "Monitoring setup completed"
}

# Setup backup
setup_backup() {
    log "Setting up backup system..."
    
    # Create backup script
    cat > /opt/$PROJECT_NAME/backup.sh << 'EOF'
#!/bin/bash

# Backup script
BACKUP_DIR="/backups"
PROJECT_NAME="ai-social-media-platform"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR/$DATE

# Backup MongoDB
docker exec ${PROJECT_NAME}-mongodb mongodump --out /backup
docker cp ${PROJECT_NAME}-mongodb:/backup $BACKUP_DIR/$DATE/mongodb

# Backup Redis
docker exec ${PROJECT_NAME}-redis redis-cli BGSAVE
docker cp ${PROJECT_NAME}-redis:/data/dump.rdb $BACKUP_DIR/$DATE/redis/

# Backup application data
cp -r /opt/$PROJECT_NAME $BACKUP_DIR/$DATE/app

# Compress backup
tar -czf $BACKUP_DIR/${PROJECT_NAME}_backup_$DATE.tar.gz -C $BACKUP_DIR $DATE

# Remove uncompressed backup
rm -rf $BACKUP_DIR/$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "${PROJECT_NAME}_backup_*.tar.gz" -mtime +7 -delete

echo "$(date): Backup completed" >> /var/log/backup.log
EOF

    chmod +x /opt/$PROJECT_NAME/backup.sh
    
    # Add to crontab (daily at 2 AM)
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/$PROJECT_NAME/backup.sh") | crontab -
    
    success "Backup system setup completed"
}

# Setup SSL (Let's Encrypt)
setup_ssl() {
    log "Setting up SSL certificates..."
    
    # Install certbot
    if ! command -v certbot &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y certbot python3-certbot-nginx
    fi
    
    # Get domain from environment
    if [ -z "$DOMAIN" ]; then
        warning "DOMAIN environment variable not set. Skipping SSL setup."
        return
    fi
    
    # Obtain SSL certificate
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    success "SSL setup completed"
}

# Main deployment function
main() {
    log "Starting production deployment..."
    
    # Check if running as root
    check_root
    
    # Check system requirements
    check_requirements
    
    # Create directories
    create_directories
    
    # Setup environment
    setup_environment
    
    # Create configurations
    create_docker_compose
    create_nginx_config
    create_dockerfiles
    
    # Deploy services
    deploy_services
    
    # Setup monitoring
    setup_monitoring
    
    # Setup backup
    setup_backup
    
    # Setup SSL (optional)
    if [ ! -z "$DOMAIN" ]; then
        setup_ssl
    fi
    
    success "Production deployment completed successfully!"
    log "Services are running on:"
    log "  - Customer Frontend: http://localhost:3001"
    log "  - Admin Panel: http://localhost:3002"
    log "  - Backend API: http://localhost:3000"
    log "  - Nginx Proxy: http://localhost"
    
    if [ ! -z "$DOMAIN" ]; then
        log "  - Production URL: https://$DOMAIN"
    fi
}

# Run main function
main "$@"

