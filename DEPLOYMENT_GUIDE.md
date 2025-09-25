# AI Social Media Platform - Deployment Guide

## Overview
This guide explains how to deploy the AI Social Media Platform backend API on different systems and environments.

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0.0 or higher
- **MongoDB**: Version 4.4 or higher
- **Redis**: Version 6.0 or higher (optional but recommended)
- **Docker**: Version 20.10 or higher (for containerized deployment)
- **PM2**: For process management (optional)

### Network Requirements
- **Port 8000**: Backend API server
- **Port 27017**: MongoDB (if running locally)
- **Port 6379**: Redis (if running locally)

## Deployment Methods

### Method 1: Direct Node.js Deployment

#### Step 1: Clone and Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd ai-social-media-platform/backend-api

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

#### Step 2: Configure Environment
Edit `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=production
PORT=8000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ai-social-media-platform
# For external MongoDB:
# MONGODB_URI=mongodb://username:password@your-mongodb-host:27017/ai-social-media-platform

# Redis Configuration
REDIS_URL=redis://localhost:6379
# For external Redis:
# REDIS_URL=redis://username:password@your-redis-host:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
ADMIN_JWT_SECRET=admin-super-secret-jwt-key-change-this-in-production
ADMIN_JWT_REFRESH_SECRET=admin-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Frontend URLs (Update for your domain)
FRONTEND_URL=https://yourdomain.com
ADMIN_PANEL_URL=https://admin.yourdomain.com
CUSTOMER_URL=https://app.yourdomain.com
ADMIN_URL=https://admin.yourdomain.com

# External Access URLs
EXTERNAL_FRONTEND_URL=https://yourdomain.com
EXTERNAL_ADMIN_URL=https://admin.yourdomain.com
EXTERNAL_API_URL=https://api.yourdomain.com

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key

# Email Configuration (Optional)
EMAIL_FROM=noreply@yourdomain.com
SENDGRID_API_KEY=your-sendgrid-api-key

# AWS Configuration (Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name

# OpenAI Configuration (Optional)
OPENAI_API_KEY=sk-your-openai-api-key-here
```

#### Step 3: Start Services
```bash
# Start MongoDB (if running locally)
sudo systemctl start mongod

# Start Redis (if running locally)
sudo systemctl start redis

# Start the API server
npm start
```

#### Step 4: Verify Deployment
```bash
# Check if the server is running
curl http://localhost:8000/health

# Check API endpoints
curl http://localhost:8000/api/v1/health
```

### Method 2: Docker Deployment

#### Step 1: Using Docker Compose
```bash
# Navigate to project root
cd ai-social-media-platform

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

#### Step 2: Using Individual Docker Containers
```bash
# Build the backend image
cd backend-api
docker build -t ai-social-backend .

# Run with external services
docker run -d \
  --name ai-social-backend \
  -p 8000:8000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/ai-social-media-platform \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  -e NODE_ENV=production \
  ai-social-backend
```

### Method 3: PM2 Process Management

#### Step 1: Install PM2
```bash
npm install -g pm2
```

#### Step 2: Configure PM2
```bash
# Use the provided ecosystem.config.js
pm2 start ecosystem.config.js

# Or create a custom PM2 configuration
pm2 start server.js --name "ai-social-backend" --env production
```

#### Step 3: Setup PM2 Startup
```bash
# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Environment-Specific Configurations

### Development Environment
```env
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://localhost:27017/ai-social-media-dev
REDIS_URL=redis://localhost:6379
```

### Production Environment
```env
NODE_ENV=production
PORT=8000
MONGODB_URI=mongodb://username:password@your-mongodb-host:27017/ai-social-media-platform
REDIS_URL=redis://username:password@your-redis-host:6379
```

### Staging Environment
```env
NODE_ENV=staging
PORT=8000
MONGODB_URI=mongodb://username:password@your-staging-mongodb:27017/ai-social-media-staging
REDIS_URL=redis://username:password@your-staging-redis:6379
```

## Common Issues and Solutions

### Issue 1: CORS Errors
**Problem**: Frontend can't access the API due to CORS restrictions.

**Solution**: Update the CORS configuration in `server.js`:
```javascript
// Add your frontend domain to allowedOrigins
const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  'https://admin.yourdomain.com'
];
```

### Issue 2: Database Connection Failed
**Problem**: API can't connect to MongoDB.

**Solutions**:
1. Check MongoDB is running: `sudo systemctl status mongod`
2. Verify connection string in `.env`
3. Check firewall settings
4. Ensure MongoDB accepts external connections

### Issue 3: Port Already in Use
**Problem**: Port 8000 is already occupied.

**Solutions**:
1. Change port in `.env`: `PORT=8001`
2. Kill existing process: `sudo lsof -ti:8000 | xargs kill -9`
3. Use different port: `PORT=8001 npm start`

### Issue 4: Environment Variables Not Loading
**Problem**: Environment variables are not being loaded.

**Solutions**:
1. Ensure `.env` file exists in `backend-api` directory
2. Check file permissions: `chmod 644 .env`
3. Verify `.env` file format (no spaces around `=`)
4. Restart the server after changes

### Issue 5: External Access Not Working
**Problem**: API works locally but not accessible from other systems.

**Solutions**:
1. Check firewall settings: `sudo ufw status`
2. Open port 8000: `sudo ufw allow 8000`
3. Verify server binding: Check `server.js` uses `0.0.0.0:8000`
4. Check network configuration

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use strong, unique secrets for JWT keys
- Rotate secrets regularly in production

### 2. Database Security
- Use authentication for MongoDB
- Enable SSL/TLS for database connections
- Restrict database access by IP

### 3. Network Security
- Use HTTPS in production
- Configure proper CORS policies
- Implement rate limiting
- Use a reverse proxy (Nginx)

### 4. Process Security
- Run as non-root user
- Use PM2 or similar process manager
- Monitor logs for suspicious activity

## Monitoring and Maintenance

### Health Checks
```bash
# API Health
curl http://localhost:8000/health

# API Version
curl http://localhost:8000/api/v1/health

# Database Status
curl http://localhost:8000/api/v1/status
```

### Logs
```bash
# PM2 Logs
pm2 logs ai-social-backend

# Docker Logs
docker logs ai-social-backend

# System Logs
tail -f logs/combined.log
```

### Performance Monitoring
```bash
# Check memory usage
pm2 monit

# Check Docker stats
docker stats ai-social-backend

# Check system resources
htop
```

## Troubleshooting Commands

```bash
# Check if port is in use
sudo lsof -i :8000

# Check running processes
ps aux | grep node

# Check network connections
netstat -tlnp | grep 8000

# Check system resources
free -h
df -h

# Check logs
tail -f logs/error.log
tail -f logs/combined.log
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Database connections working
- [ ] CORS properly configured
- [ ] SSL/HTTPS enabled
- [ ] Firewall configured
- [ ] Process manager setup (PM2)
- [ ] Logging configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Security measures in place

## Support

For additional support:
1. Check the logs for error messages
2. Verify all environment variables are set
3. Test database connectivity
4. Check network configuration
5. Review this deployment guide

## Quick Start Commands

```bash
# Quick deployment
git clone <repo-url>
cd ai-social-media-platform/backend-api
npm install
cp .env.example .env
# Edit .env file
npm start

# Docker deployment
docker-compose up -d

# PM2 deployment
pm2 start ecosystem.config.js
```