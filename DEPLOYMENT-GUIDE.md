# 🚀 AI Social Media Platform - Complete Deployment Guide

## 📋 Table of Contents
1. [System Requirements](#system-requirements)
2. [Quick Start (3 Steps)](#quick-start-3-steps)
3. [Development Setup](#development-setup)
4. [Production Deployment](#production-deployment)
5. [AWS Deployment](#aws-deployment)
6. [Docker Deployment](#docker-deployment)
7. [Manual Installation](#manual-installation)
8. [Configuration Guide](#configuration-guide)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance](#maintenance)

## 🖥️ System Requirements

### Minimum Requirements
- **OS:** Ubuntu 20.04+, CentOS 8+, or macOS 10.15+
- **CPU:** 2 cores, 2.4 GHz
- **RAM:** 4 GB
- **Storage:** 20 GB free space
- **Network:** Stable internet connection

### Recommended Requirements
- **OS:** Ubuntu 22.04 LTS
- **CPU:** 4 cores, 3.0 GHz
- **RAM:** 8 GB
- **Storage:** 50 GB SSD
- **Network:** High-speed internet (100+ Mbps)

### Software Dependencies
- **Node.js:** 18.0+ (LTS recommended)
- **Python:** 3.8+ (3.11 recommended)
- **MongoDB:** 6.0+ (7.0 recommended)
- **Redis:** 6.0+ (7.0 recommended)
- **Docker:** 20.0+ (optional but recommended)
- **Docker Compose:** 2.0+ (optional but recommended)

## ⚡ Quick Start (3 Steps)

### Step 1: Extract and Configure
```bash
# Extract the deployment package
unzip ai-social-media-platform-complete.zip
cd ai-social-media-platform-complete

# Copy environment template
cp .env.example .env

# Edit environment variables (REQUIRED)
nano .env
```

### Step 2: Run Setup Script
```bash
# Make setup script executable
chmod +x scripts/setup-all.sh

# Run complete setup
./scripts/setup-all.sh
```

### Step 3: Access Your Platform
- **Customer Platform:** http://localhost:3000
- **Admin Panel:** http://localhost:5173
- **API Documentation:** http://localhost:8000/docs

**Default Credentials:**
- Customer: `demo@example.com` / `password123`
- Admin: `admin@aisocialmedia.com` / `admin123`

## 🛠️ Development Setup

### Using Docker (Recommended)
```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop environment
docker-compose down
```

### Manual Development Setup
```bash
# Start development mode with hot reload
./scripts/start-dev.sh

# Stop all development services
./scripts/stop-all.sh
```

### Individual Service Development
```bash
# Backend API (Port 8000)
cd backend-api
npm install
npm run dev

# Customer Frontend (Port 3000)
cd customer-frontend
npm install
npm run dev

# Admin Panel (Port 5173)
cd admin-panel
npm install
npm run dev

# AI Agents
cd ai-agents
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py --dev
```

## 🏭 Production Deployment

### Option 1: Docker Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Monitor services
docker-compose -f docker-compose.prod.yml ps
```

### Option 2: Manual Production Deployment
```bash
# Build all components
./scripts/build-production.sh

# Deploy to production server
./scripts/deploy-production.sh your-server-ip

# Configure SSL and domain
./scripts/setup-ssl.sh your-domain.com
```

### Option 3: Automated Production Script
```bash
# Run complete production deployment
./scripts/deploy-production.sh

# Follow the interactive prompts for:
# - Server configuration
# - SSL certificate setup
# - Domain configuration
# - Database optimization
# - Security hardening
```

## ☁️ AWS Deployment

### Prerequisites
- AWS CLI configured with appropriate permissions
- Domain name (optional but recommended)
- SSL certificate (can be generated automatically)

### Automated AWS Deployment
```bash
cd aws-deployment

# Configure AWS credentials
aws configure

# Deploy infrastructure
./scripts/deploy.sh

# Monitor deployment
aws cloudformation describe-stacks --stack-name ai-social-media-platform
```

### Manual AWS Setup
```bash
# 1. Create VPC and networking
aws cloudformation create-stack \
  --stack-name ai-social-vpc \
  --template-body file://cloudformation/vpc.yaml

# 2. Deploy application infrastructure
aws cloudformation create-stack \
  --stack-name ai-social-media-platform \
  --template-body file://cloudformation/main-infrastructure.yaml \
  --parameters file://cloudformation/parameters.json

# 3. Deploy application code
./scripts/deploy-code.sh
```

### AWS Services Used
- **EC2:** Application servers with auto-scaling
- **ALB:** Application Load Balancer
- **RDS:** MongoDB-compatible DocumentDB (optional)
- **ElastiCache:** Redis cluster
- **S3:** File storage and static assets
- **SES:** Email service
- **CloudWatch:** Monitoring and logging
- **Route 53:** DNS management (optional)
- **Certificate Manager:** SSL certificates

## 🐳 Docker Deployment

### Development Environment
```bash
# Start development stack
docker-compose up -d

# View service status
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Stop stack
docker-compose down
```

### Production Environment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production stack
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

### Custom Docker Configuration
```bash
# Build individual images
docker build -t ai-social-backend ./backend-api
docker build -t ai-social-frontend ./customer-frontend
docker build -t ai-social-admin ./admin-panel
docker build -t ai-social-agents ./ai-agents

# Run with custom configuration
docker run -d --name backend \
  -p 8000:8000 \
  --env-file .env \
  ai-social-backend
```

## 🔧 Manual Installation

### 1. Database Setup
```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Redis
sudo apt-get install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Initialize database
mongosh ai-social-media database/init/01-init-database.js
```

### 2. Backend API Setup
```bash
cd backend-api

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Frontend Setup
```bash
# Customer Frontend
cd customer-frontend
npm install
npm run build

# Admin Panel
cd ../admin-panel
npm install
npm run build

# Serve with nginx
sudo cp nginx/nginx.conf /etc/nginx/sites-available/ai-social-media
sudo ln -s /etc/nginx/sites-available/ai-social-media /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. AI Agents Setup
```bash
cd ai-agents

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start with systemd
sudo cp systemd/ai-agents.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start ai-agents
sudo systemctl enable ai-agents
```

## ⚙️ Configuration Guide

### Environment Variables
```bash
# Copy and edit environment file
cp .env.example .env
nano .env
```

**Critical Variables to Configure:**
```bash
# Database URLs
MONGODB_URI=mongodb://localhost:27017/ai-social-media
REDIS_URL=redis://localhost:6379

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your-super-secret-jwt-key
JWT_ADMIN_SECRET=your-admin-jwt-secret

# AI API Keys (at least one required)
OPENAI_API_KEY=sk-your-openai-key
CLAUDE_API_KEY=your-claude-key

# AWS Configuration
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=your-bucket-name

# Social Media APIs
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-secret
# ... (configure other platforms as needed)
```

### SSL Configuration
```bash
# Generate SSL certificate with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com

# Or use custom certificates
sudo cp your-cert.pem /etc/ssl/certs/
sudo cp your-key.pem /etc/ssl/private/
```

### Database Optimization
```bash
# MongoDB optimization
sudo nano /etc/mongod.conf

# Add these settings:
# storage.wiredTiger.engineConfig.cacheSizeGB: 2
# net.maxIncomingConnections: 1000
# operationProfiling.slowOpThresholdMs: 100

# Restart MongoDB
sudo systemctl restart mongod
```

### Security Hardening
```bash
# Configure firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# Set up fail2ban
sudo apt-get install fail2ban
sudo cp security/jail.local /etc/fail2ban/
sudo systemctl restart fail2ban

# Configure log rotation
sudo cp security/logrotate.conf /etc/logrotate.d/ai-social-media
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test connection
mongosh --eval "db.adminCommand('ping')"

# Restart MongoDB
sudo systemctl restart mongod
```

#### 2. Redis Connection Failed
```bash
# Check Redis status
sudo systemctl status redis-server

# Test Redis connection
redis-cli ping

# Check Redis logs
sudo tail -f /var/log/redis/redis-server.log
```

#### 3. API Not Responding
```bash
# Check backend logs
pm2 logs backend

# Check process status
pm2 status

# Restart backend
pm2 restart backend

# Check port availability
sudo netstat -tlnp | grep :8000
```

#### 4. Frontend Not Loading
```bash
# Check nginx status
sudo systemctl status nginx

# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

#### 5. AI Agents Not Working
```bash
# Check AI agents status
sudo systemctl status ai-agents

# Check AI agents logs
sudo journalctl -u ai-agents -f

# Test API keys
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# Restart AI agents
sudo systemctl restart ai-agents
```

### Performance Issues

#### High CPU Usage
```bash
# Check process usage
top -p $(pgrep -d',' node)

# Monitor with htop
htop

# Check MongoDB performance
mongosh --eval "db.runCommand({serverStatus: 1}).metrics"
```

#### High Memory Usage
```bash
# Check memory usage
free -h

# Check swap usage
swapon --show

# Monitor specific processes
ps aux --sort=-%mem | head
```

#### Slow Database Queries
```bash
# Enable MongoDB profiling
mongosh ai-social-media --eval "db.setProfilingLevel(2)"

# Check slow queries
mongosh ai-social-media --eval "db.system.profile.find().sort({ts: -1}).limit(5)"

# Create missing indexes
mongosh ai-social-media database/indexes/performance.js
```

## 🔧 Maintenance

### Regular Maintenance Tasks

#### Daily
```bash
# Check service status
./scripts/health-check.sh

# Monitor disk space
df -h

# Check logs for errors
./scripts/check-logs.sh
```

#### Weekly
```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade

# Backup database
./scripts/backup.sh

# Clean up old logs
./scripts/cleanup-logs.sh

# Check security updates
sudo unattended-upgrades --dry-run
```

#### Monthly
```bash
# Full system backup
./scripts/full-backup.sh

# Performance optimization
./scripts/optimize-database.sh

# Security audit
./scripts/security-audit.sh

# Update dependencies
./scripts/update-dependencies.sh
```

### Backup Procedures
```bash
# Database backup
mongodump --uri="mongodb://localhost:27017/ai-social-media" --out=backup/$(date +%Y%m%d)

# Redis backup
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb backup/redis-$(date +%Y%m%d).rdb

# File backup
tar -czf backup/files-$(date +%Y%m%d).tar.gz uploads/ logs/

# Automated backup
crontab -e
# Add: 0 2 * * * /path/to/scripts/backup.sh
```

### Monitoring Setup
```bash
# Install monitoring tools
./scripts/setup-monitoring.sh

# Configure alerts
./scripts/setup-alerts.sh your-email@domain.com

# Access monitoring dashboard
# Grafana: http://your-server:3001
# Prometheus: http://your-server:9090
```

### Scaling Guidelines

#### Horizontal Scaling
```bash
# Add more backend instances
docker-compose up -d --scale backend=3

# Load balancer configuration
# Update nginx upstream configuration
```

#### Vertical Scaling
```bash
# Increase server resources
# Update docker-compose resource limits
# Optimize database configuration
```

#### Database Scaling
```bash
# MongoDB replica set
# Configure in production for high availability
# Update connection string for replica set
```

## 📞 Support

### Getting Help
1. **Documentation:** Check `/documentation/` folder
2. **API Reference:** Visit http://localhost:8000/docs
3. **Logs:** Check application logs for error details
4. **Health Checks:** Monitor `/health` endpoints

### Reporting Issues
When reporting issues, please include:
- Operating system and version
- Node.js and Python versions
- Error messages and logs
- Steps to reproduce the issue
- Environment configuration (without sensitive data)

---

**🎉 Congratulations! Your AI Social Media Management Platform is now deployed and ready to scale to 10,000+ users with enterprise-grade features and AI-powered automation.**

