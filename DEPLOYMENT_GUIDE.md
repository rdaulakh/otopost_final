# 🚀 **DEPLOYMENT GUIDE**
## AI Social Media Platform - Production Deployment

**Version:** 1.0.0  
**Last Updated:** September 19, 2025  
**Status:** Production Ready ✅

---

## 📋 **QUICK START (3 Steps)**

### **Step 1: Clone & Setup**
```bash
git clone https://github.com/rdaulakh/ai-social-media-platform.git
cd ai-social-media-platform
```

### **Step 2: Configure Environment**
```bash
# Backend API
cd api
cp .env.example .env
# Edit .env with your API keys (see Configuration section below)

# Frontend
cd ../customer-frontend
cp .env.example .env
# Edit .env with your backend URL
```

### **Step 3: Deploy with Docker**
```bash
# From project root
docker-compose up -d
```

**🎉 Your platform is now running!**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Documentation:** http://localhost:5000/docs

---

## 🔧 **DETAILED CONFIGURATION**

### **Backend API Configuration (.env)**

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/ai-social-media
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRE=7d

# AI Services (Required for full functionality)
OPENAI_API_KEY=your-openai-api-key-here

# Social Media APIs (Required for integrations)
FACEBOOK_APP_ID=your-facebook-app-id
INSTAGRAM_APP_ID=your-instagram-app-id
TWITTER_API_KEY=your-twitter-api-key
LINKEDIN_CLIENT_ID=your-linkedin-client-id
TIKTOK_CLIENT_KEY=your-tiktok-client-key
YOUTUBE_API_KEY=your-youtube-api-key

# File Storage (Required for media)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket-name

# Email Service (Optional)
SENDGRID_API_KEY=your-sendgrid-api-key

# Server Configuration
PORT=5000
NODE_ENV=production
CORS_ORIGIN=http://localhost:3000
```

### **Frontend Configuration (.env)**

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=http://localhost:5000

# Environment
REACT_APP_ENV=production
```

---

## 🐳 **DOCKER DEPLOYMENT**

### **Prerequisites:**
- Docker 20.0+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB disk space

### **Production Docker Compose:**

```yaml
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:6.0
    container_name: ai-social-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: your-secure-password
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"
    networks:
      - ai-social-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: ai-social-redis
    restart: unless-stopped
    command: redis-server --requirepass your-redis-password
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - ai-social-network

  # Backend API
  backend:
    build: ./api
    container_name: ai-social-backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:your-secure-password@mongodb:27017/ai-social-media?authSource=admin
      - REDIS_URL=redis://:your-redis-password@redis:6379
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
      - redis
    networks:
      - ai-social-network
    volumes:
      - ./api:/app
      - /app/node_modules

  # Frontend
  frontend:
    build: ./customer-frontend
    container_name: ai-social-frontend
    restart: unless-stopped
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - ai-social-network

volumes:
  mongodb_data:
  redis_data:

networks:
  ai-social-network:
    driver: bridge
```

### **Deployment Commands:**

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale backend=3

# Update services
docker-compose pull
docker-compose up -d --force-recreate
```

---

## ☁️ **CLOUD DEPLOYMENT**

### **AWS Deployment**

#### **1. EC2 Instance Setup:**
```bash
# Launch EC2 instance (t3.medium or larger)
# Install Docker and Docker Compose
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### **2. Application Deployment:**
```bash
# Clone repository
git clone https://github.com/rdaulakh/ai-social-media-platform.git
cd ai-social-media-platform

# Configure environment
cp api/.env.example api/.env
cp customer-frontend/.env.example customer-frontend/.env

# Deploy
docker-compose up -d
```

#### **3. Load Balancer & SSL:**
```bash
# Install Nginx
sudo yum install -y nginx

# Configure SSL with Let's Encrypt
sudo yum install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### **Vercel Deployment (Frontend Only)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd customer-frontend
vercel --prod
```

### **Railway Deployment**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

---

## 🔒 **SECURITY CONFIGURATION**

### **Production Security Checklist:**

#### **Environment Variables:**
- [x] Use strong JWT secrets (32+ characters)
- [x] Secure database passwords
- [x] API keys in environment variables only
- [x] No secrets in code repository

#### **Network Security:**
- [x] Configure firewall rules
- [x] Use HTTPS/SSL certificates
- [x] Restrict database access
- [x] Enable CORS properly

#### **Application Security:**
- [x] Rate limiting enabled
- [x] Input validation active
- [x] Error handling secure
- [x] Audit logging enabled

### **Security Headers (Nginx):**

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";

    # Proxy to application
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 📊 **MONITORING & MAINTENANCE**

### **Health Checks:**

```bash
# Backend health
curl http://localhost:5000/health

# Database connection
curl http://localhost:5000/health/db

# Redis connection
curl http://localhost:5000/health/redis
```

### **Log Management:**

```bash
# View application logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Log rotation setup
sudo logrotate -d /etc/logrotate.d/docker-containers
```

### **Backup Strategy:**

```bash
# MongoDB backup
docker exec ai-social-mongodb mongodump --out /backup/$(date +%Y%m%d)

# Redis backup
docker exec ai-social-redis redis-cli BGSAVE
```

### **Performance Monitoring:**

```bash
# System resources
docker stats

# Application metrics
curl http://localhost:5000/metrics

# Database performance
docker exec ai-social-mongodb mongostat
```

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues:**

#### **1. Database Connection Failed**
```bash
# Check MongoDB status
docker-compose logs mongodb

# Verify connection string
echo $MONGODB_URI

# Test connection
docker exec -it ai-social-mongodb mongo --eval "db.adminCommand('ismaster')"
```

#### **2. API Not Responding**
```bash
# Check backend logs
docker-compose logs backend

# Verify environment variables
docker exec ai-social-backend env | grep -E "(MONGODB|REDIS|JWT)"

# Test API endpoint
curl http://localhost:5000/health
```

#### **3. Frontend Build Errors**
```bash
# Check build logs
docker-compose logs frontend

# Rebuild frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

#### **4. WebSocket Connection Issues**
```bash
# Check WebSocket endpoint
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost:5000/socket.io/

# Verify CORS settings
grep CORS_ORIGIN api/.env
```

### **Performance Optimization:**

#### **Database Optimization:**
```javascript
// MongoDB indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.content.createIndex({ userId: 1, createdAt: -1 })
db.analytics.createIndex({ userId: 1, date: -1 })
```

#### **Redis Optimization:**
```bash
# Redis memory optimization
redis-cli CONFIG SET maxmemory 256mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

#### **Application Optimization:**
```bash
# Node.js optimization
export NODE_OPTIONS="--max-old-space-size=4096"
export UV_THREADPOOL_SIZE=128
```

---

## 📈 **SCALING GUIDE**

### **Horizontal Scaling:**

```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  backend:
    deploy:
      replicas: 3
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
```

### **Load Balancer Configuration:**

```nginx
upstream backend {
    server backend_1:5000;
    server backend_2:5000;
    server backend_3:5000;
}

server {
    listen 80;
    location /api {
        proxy_pass http://backend;
    }
}
```

### **Database Scaling:**

```bash
# MongoDB replica set
docker-compose -f docker-compose.replica.yml up -d

# Redis cluster
docker-compose -f docker-compose.redis-cluster.yml up -d
```

---

## 🎯 **PRODUCTION CHECKLIST**

### **Pre-Deployment:**
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backups scheduled
- [ ] Monitoring tools setup
- [ ] Load testing completed
- [ ] Security audit passed

### **Post-Deployment:**
- [ ] Health checks passing
- [ ] Logs monitoring active
- [ ] Performance metrics tracked
- [ ] Backup verification
- [ ] User acceptance testing
- [ ] Documentation updated

---

## 📞 **SUPPORT**

### **Technical Support:**
- **Documentation:** Available in `/docs` directory
- **API Reference:** http://localhost:5000/docs
- **Health Checks:** http://localhost:5000/health

### **Emergency Procedures:**
```bash
# Quick restart
docker-compose restart

# Full reset (WARNING: Data loss)
docker-compose down -v
docker-compose up -d

# Backup before reset
./scripts/backup.sh
```

---

**🚀 Your AI Social Media Platform is now ready for production deployment!**

**For additional support or custom deployment assistance, refer to the comprehensive documentation provided in the repository.**

---

*Deployment Guide by Manus AI - September 19, 2025*
