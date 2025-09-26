# 🚀 Quick Start Guide - AI Social Media Platform

## ⚡ 3-Step Setup (5 Minutes)

### Step 1: Environment Configuration
```bash
# Navigate to project directory
cd ai-social-media-platform-complete

# Copy environment template
cp .env.example .env

# Edit environment variables (REQUIRED)
nano .env
```

**Minimum Required Variables:**
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/ai-social-media
REDIS_URL=redis://localhost:6379

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-here
JWT_ADMIN_SECRET=your-admin-jwt-secret-here

# AI APIs (At least one required)
OPENAI_API_KEY=your-openai-api-key
# OR
CLAUDE_API_KEY=your-claude-api-key

# Basic AWS (for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket-name
```

### Step 2: Start the Platform
```bash
# Option A: Docker Compose (Recommended)
docker-compose up -d

# Option B: Manual Setup
./scripts/setup-all.sh
```

### Step 3: Access Your Platform
- **🎯 Customer Platform:** http://localhost:3000
- **🔧 Admin Panel:** http://localhost:5173  
- **📚 API Docs:** http://localhost:8000/docs
- **❤️ Health Check:** http://localhost:8000/health

## 🎯 Default Login Credentials

### Customer Platform
- **Email:** demo@example.com
- **Password:** password123

### Admin Panel
- **Email:** admin@aisocialmedia.com
- **Password:** admin123

## 🔧 Verify Installation

### 1. Check All Services
```bash
# Check Docker containers
docker-compose ps

# Check individual services
curl http://localhost:8000/health
curl http://localhost:3000
curl http://localhost:5173
```

### 2. Test API Endpoints
```bash
# Test customer registration
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Test admin login
curl -X POST http://localhost:8000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aisocialmedia.com","password":"admin123"}'
```

### 3. Verify AI Agents
```bash
# Check AI agents status
curl http://localhost:8000/api/ai-agents/status

# Test AI agent task
curl -X POST http://localhost:8000/api/ai-agents/intelligence/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"organizationId":"your-org-id","type":"comprehensive_insights"}'
```

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. Database Connection Failed
```bash
# Check MongoDB is running
docker ps | grep mongo

# Restart MongoDB
docker-compose restart mongodb

# Check connection
mongo mongodb://localhost:27017/ai-social-media
```

#### 2. Redis Connection Failed
```bash
# Check Redis is running
docker ps | grep redis

# Restart Redis
docker-compose restart redis

# Test connection
redis-cli ping
```

#### 3. AI Agents Not Working
```bash
# Check OpenAI API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check AI agents logs
docker-compose logs ai-agents

# Restart AI agents
docker-compose restart ai-agents
```

#### 4. Frontend Not Loading
```bash
# Check frontend containers
docker-compose ps | grep frontend

# Rebuild frontend
cd customer-frontend
npm run build

cd ../admin-panel
npm run build
```

#### 5. API Endpoints Not Working
```bash
# Check backend logs
docker-compose logs backend

# Verify environment variables
docker-compose exec backend env | grep -E "(MONGODB|JWT|OPENAI)"

# Restart backend
docker-compose restart backend
```

## 🔄 Development Mode

### Start in Development Mode
```bash
# Backend API (with hot reload)
cd backend-api
npm run dev

# Customer Frontend (with hot reload)
cd customer-frontend
npm run dev

# Admin Panel (with hot reload)
cd admin-panel
npm run dev

# AI Agents (with auto-restart)
cd ai-agents
python main.py --dev
```

### Development URLs
- **Customer Frontend:** http://localhost:3000
- **Admin Panel:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **AI Agents:** http://localhost:8001

## 📊 Production Deployment

### AWS Deployment (Automated)
```bash
# Deploy to AWS
cd aws-deployment
./scripts/deploy.sh production

# Monitor deployment
aws cloudformation describe-stacks --stack-name ai-social-media-platform
```

### Manual Production Setup
```bash
# Build for production
./scripts/build-production.sh

# Deploy to your server
./scripts/deploy-production.sh your-server-ip
```

## 🔐 Security Setup

### 1. Change Default Credentials
```bash
# Update admin password
curl -X PUT http://localhost:8000/api/admin/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{"currentPassword":"admin123","newPassword":"your-secure-password"}'
```

### 2. Configure SSL/HTTPS
```bash
# Generate SSL certificates
./scripts/generate-ssl.sh your-domain.com

# Update nginx configuration
./scripts/setup-ssl.sh
```

### 3. Set Up Firewall
```bash
# Configure UFW (Ubuntu)
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## 📈 Monitoring Setup

### 1. Enable Monitoring
```bash
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access monitoring dashboards
# Grafana: http://localhost:3001
# Prometheus: http://localhost:9090
```

### 2. Set Up Alerts
```bash
# Configure email alerts
./scripts/setup-alerts.sh your-email@domain.com

# Test alert system
./scripts/test-alerts.sh
```

## 🎉 Success!

If you can access all the URLs above and see the platforms working, congratulations! 

Your AI Social Media Management Platform is now running with:
- ✅ Customer platform with 7 AI agents
- ✅ Super admin panel with full management
- ✅ 80+ API endpoints
- ✅ 7 social media platform integrations
- ✅ Payment processing with Stripe
- ✅ File storage with AWS S3
- ✅ Email service with AWS SES
- ✅ Real-time features with WebSocket
- ✅ Comprehensive analytics and reporting

## 📞 Need Help?

1. **Check Logs:** `docker-compose logs [service-name]`
2. **Health Checks:** Visit http://localhost:8000/health
3. **API Documentation:** Visit http://localhost:8000/docs
4. **Review Documentation:** Check `/documentation/` folder

**🚀 Ready to scale to 10,000+ users!**

