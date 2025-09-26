#!/bin/bash

# AI Social Media Platform - EC2 Deployment Script
# For posts.digiaeon.com domain

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="posts.digiaeon.com"
PROJECT_NAME="ai-social-media-platform"
PROJECT_DIR="/home/ubuntu/ai-social-media-platform"

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

# Function to install Docker
install_docker() {
    print_status "Installing Docker..."
    
    if command_exists docker; then
        print_success "Docker is already installed"
        return
    fi
    
    # Update package index
    sudo apt-get update
    
    # Install required packages
    sudo apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Set up the repository
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Add ubuntu user to docker group
    sudo usermod -aG docker ubuntu
    
    print_success "Docker installed successfully"
}

# Function to install Docker Compose
install_docker_compose() {
    print_status "Installing Docker Compose..."
    
    if command_exists docker-compose; then
        print_success "Docker Compose is already installed"
        return
    fi
    
    # Install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    print_success "Docker Compose installed successfully"
}

# Function to install Nginx
install_nginx() {
    print_status "Installing Nginx..."
    
    if command_exists nginx; then
        print_success "Nginx is already installed"
        return
    fi
    
    sudo apt-get update
    sudo apt-get install -y nginx
    
    # Start and enable Nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    print_success "Nginx installed successfully"
}

# Function to install Certbot for SSL
install_certbot() {
    print_status "Installing Certbot for SSL certificates..."
    
    if command_exists certbot; then
        print_success "Certbot is already installed"
        return
    fi
    
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
    
    print_success "Certbot installed successfully"
}

# Function to create environment file
create_env_file() {
    print_status "Creating environment configuration..."
    
    cat > .env << EOF
# Database Configuration
MONGODB_URI=mongodb://admin:password123@mongodb:27017/ai-social-media?authSource=admin
REDIS_URL=redis://redis:6379

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=$(openssl rand -hex 32)
JWT_ADMIN_SECRET=$(openssl rand -hex 32)

# Application Configuration
NODE_ENV=production
PORT=8000
API_BASE_URL=https://${DOMAIN}/api/v1

# AI Configuration (Add your API keys)
OPENAI_API_KEY=your-openai-api-key-here
CLAUDE_API_KEY=your-claude-api-key-here

# AWS Configuration (if using AWS services)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket-name
AWS_REGION=ap-south-1

# Social Media API Keys (configure as needed)
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# ChromaDB Configuration
CHROMA_HOST=chroma
CHROMA_PORT=8000

# Frontend URLs
CUSTOMER_FRONTEND_URL=https://${DOMAIN}
ADMIN_PANEL_URL=https://${DOMAIN}/admin
EOF

    print_success "Environment file created"
}

# Function to create Nginx configuration
create_nginx_config() {
    print_status "Creating Nginx configuration for ${DOMAIN}..."
    
    sudo tee /etc/nginx/sites-available/${DOMAIN} > /dev/null << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # WebSocket support
    location /ws/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Admin panel
    location /admin {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Customer frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
    
    # Remove default site
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    sudo nginx -t
    
    print_success "Nginx configuration created for ${DOMAIN}"
}

# Function to setup SSL certificate
setup_ssl() {
    print_status "Setting up SSL certificate for ${DOMAIN}..."
    
    # Stop Nginx temporarily
    sudo systemctl stop nginx
    
    # Obtain SSL certificate
    sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN}
    
    # Start Nginx
    sudo systemctl start nginx
    
    print_success "SSL certificate configured for ${DOMAIN}"
}

# Function to setup firewall
setup_firewall() {
    print_status "Configuring firewall..."
    
    # Enable UFW
    sudo ufw --force enable
    
    # Allow SSH
    sudo ufw allow 22
    
    # Allow HTTP and HTTPS
    sudo ufw allow 80
    sudo ufw allow 443
    
    # Allow Docker ports (for development)
    sudo ufw allow 3000
    sudo ufw allow 5173
    sudo ufw allow 8000
    
    print_success "Firewall configured"
}

# Function to start the application
start_application() {
    print_status "Starting AI Social Media Platform..."
    
    # Start with Docker Compose
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to start..."
    sleep 30
    
    # Check service status
    docker-compose ps
    
    print_success "Application started successfully!"
}

# Function to display deployment summary
display_summary() {
    print_success "Deployment completed successfully!"
    echo
    echo "=== DEPLOYMENT SUMMARY ==="
    echo "Domain: https://${DOMAIN}"
    echo "Customer Frontend: https://${DOMAIN}"
    echo "Admin Panel: https://${DOMAIN}/admin"
    echo "API Documentation: https://${DOMAIN}/api/v1/docs"
    echo
    echo "=== DEFAULT CREDENTIALS ==="
    echo "Customer: demo@example.com / password123"
    echo "Admin: admin@aisocialmedia.com / admin123"
    echo
    echo "=== USEFUL COMMANDS ==="
    echo "View logs: docker-compose logs -f"
    echo "Restart services: docker-compose restart"
    echo "Stop services: docker-compose down"
    echo "Update application: git pull && docker-compose up -d --build"
    echo
    echo "=== NEXT STEPS ==="
    echo "1. Update API keys in .env file"
    echo "2. Configure social media integrations"
    echo "3. Set up monitoring and backups"
    echo "4. Test all functionality"
}

# Main deployment function
main() {
    print_status "Starting deployment of AI Social Media Platform to ${DOMAIN}"
    
    # Update system
    print_status "Updating system packages..."
    sudo apt-get update && sudo apt-get upgrade -y
    
    # Install required software
    install_docker
    install_docker_compose
    install_nginx
    install_certbot
    
    # Setup firewall
    setup_firewall
    
    # Create project directory
    mkdir -p ${PROJECT_DIR}
    cd ${PROJECT_DIR}
    
    # Create environment file
    create_env_file
    
    # Create Nginx configuration
    create_nginx_config
    
    # Setup SSL certificate
    setup_ssl
    
    # Start application
    start_application
    
    # Display summary
    display_summary
}

# Run main function
main "$@"