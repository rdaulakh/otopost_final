# AI Social Media Platform - Testing Guide

**Version:** Current Implementation (85% Complete)  
**Date:** December 18, 2024

## 🚀 Quick Start Testing

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for development testing)
- Git access to the repository

### 1. Environment Setup

```bash
# Clone and navigate to the project
git clone https://github.com/rdaulakh/ai-social-media-platform.git
cd ai-social-media-platform

# Copy environment template
cp .env.example .env

# Edit environment variables (minimal required)
nano .env
```

**Minimal .env Configuration:**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/ai-social-media
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-for-testing-12345
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 2. Start the System

```bash
# Start all services with Docker Compose
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f api
```

**Expected Services:**
- ✅ MongoDB (port 27017)
- ✅ Redis (port 6379)
- ✅ API Server (port 5000)
- ✅ Frontend (port 3000)

### 3. Verify System Health

```bash
# Test health endpoint
curl http://localhost:5000/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2024-12-18T...",
  "uptime": 123.456,
  "environment": "development"
}
```

## 🧪 API Testing

### Authentication Tests

#### 1. User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "businessName": "Test Business"
  }'
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

#### 2. User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

#### 3. Protected Route Test
```bash
# Save the token from login response
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Content Management Tests

#### 1. Create Content
```bash
curl -X POST http://localhost:5000/api/content \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Post",
    "content": "This is a test social media post",
    "platforms": ["facebook", "twitter"],
    "tags": ["test", "demo"]
  }'
```

#### 2. Get User Content
```bash
curl -X GET http://localhost:5000/api/content \
  -H "Authorization: Bearer $TOKEN"
```

### File Upload Tests

#### 1. Single File Upload
```bash
# Create a test image file
echo "Test image content" > test-image.txt

curl -X POST http://localhost:5000/api/media/upload/single \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-image.txt"
```

#### 2. Multiple File Upload
```bash
curl -X POST http://localhost:5000/api/media/upload/multiple \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@test-image.txt" \
  -F "files=@test-image.txt"
```

### Real-time Features Tests

#### 1. WebSocket Connection Test
Create a simple HTML file to test WebSocket:

```html
<!DOCTYPE html>
<html>
<head>
    <title>WebSocket Test</title>
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
</head>
<body>
    <div id="status">Connecting...</div>
    <div id="messages"></div>
    
    <script>
        const socket = io('http://localhost:5000', {
            auth: {
                token: 'YOUR_JWT_TOKEN_HERE'
            }
        });
        
        socket.on('connect', () => {
            document.getElementById('status').innerHTML = 'Connected!';
        });
        
        socket.on('connected', (data) => {
            console.log('Connected:', data);
        });
        
        socket.on('notification:new', (notification) => {
            const messages = document.getElementById('messages');
            messages.innerHTML += '<p>Notification: ' + notification.title + '</p>';
        });
    </script>
</body>
</html>
```

#### 2. Real-time Notifications Test
```bash
curl -X POST http://localhost:5000/api/realtime/test-notification \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "content_published"
  }'
```

### Security Tests

#### 1. Rate Limiting Test
```bash
# Send multiple requests quickly to test rate limiting
for i in {1..20}; do
  curl -X GET http://localhost:5000/api/users/profile \
    -H "Authorization: Bearer $TOKEN" &
done
wait
```

#### 2. Input Validation Test
```bash
# Test XSS protection
curl -X POST http://localhost:5000/api/content \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "<script>alert(\"xss\")</script>",
    "content": "Test content",
    "platforms": ["facebook"]
  }'
```

#### 3. SQL Injection Test
```bash
# Test SQL injection protection
curl -X GET "http://localhost:5000/api/content?search='; DROP TABLE users; --" \
  -H "Authorization: Bearer $TOKEN"
```

## 🔍 System Monitoring Tests

### 1. Check Logs
```bash
# API logs
docker-compose logs api

# Database logs
docker-compose logs mongodb

# Redis logs
docker-compose logs redis
```

### 2. Security Dashboard (Admin)
```bash
# First, update user role to admin in database
# Then test security endpoints
curl -X GET http://localhost:5000/api/security/status \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 3. Real-time Analytics
```bash
# Subscribe to analytics updates
curl -X POST http://localhost:5000/api/realtime/analytics/subscribe \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "overview",
    "updateInterval": 30000
  }'
```

## 🐛 Common Issues & Solutions

### Issue 1: MongoDB Connection Failed
**Symptoms:** `Database connection error` in logs
**Solution:**
```bash
# Check MongoDB status
docker-compose ps mongodb

# Restart MongoDB
docker-compose restart mongodb

# Check logs
docker-compose logs mongodb
```

### Issue 2: Redis Connection Failed
**Symptoms:** Rate limiting not working, WebSocket issues
**Solution:**
```bash
# Check Redis status
docker-compose ps redis

# Test Redis connection
docker-compose exec redis redis-cli ping
```

### Issue 3: File Upload Fails
**Symptoms:** `ENOENT: no such file or directory` errors
**Solution:**
```bash
# Create upload directories
mkdir -p api/uploads/{images,videos,documents,thumbnails}
mkdir -p api/temp

# Check permissions
chmod 755 api/uploads api/temp
```

### Issue 4: WebSocket Connection Fails
**Symptoms:** `Authentication failed` in WebSocket
**Solution:**
- Ensure JWT token is valid and not expired
- Check CORS settings in environment variables
- Verify frontend URL in .env matches client origin

### Issue 5: Rate Limiting Too Strict
**Symptoms:** `429 Too Many Requests` errors
**Solution:**
```bash
# Reset rate limits for a user (admin only)
curl -X POST http://localhost:5000/api/security/reset-rate-limits/USER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## 📊 Performance Testing

### 1. Load Testing with curl
```bash
# Test concurrent requests
for i in {1..100}; do
  curl -X GET http://localhost:5000/health &
done
wait
```

### 2. Memory Usage Monitoring
```bash
# Check Docker container stats
docker stats

# Check Node.js memory usage
curl -X GET http://localhost:5000/health
```

### 3. Database Performance
```bash
# Connect to MongoDB and check performance
docker-compose exec mongodb mongosh ai-social-media

# In MongoDB shell:
db.users.find().explain("executionStats")
db.contents.find().explain("executionStats")
```

## ✅ Test Checklist

### Basic Functionality
- [ ] Server starts without errors
- [ ] Health endpoint responds
- [ ] Database connection established
- [ ] Redis connection established

### Authentication
- [ ] User registration works
- [ ] User login works
- [ ] JWT token validation works
- [ ] Protected routes require authentication

### Content Management
- [ ] Create content works
- [ ] Retrieve content works
- [ ] Update content works
- [ ] Delete content works

### File Management
- [ ] Single file upload works
- [ ] Multiple file upload works
- [ ] File serving works
- [ ] File deletion works

### Real-time Features
- [ ] WebSocket connection works
- [ ] Real-time notifications work
- [ ] Analytics subscriptions work
- [ ] User presence tracking works

### Security
- [ ] Rate limiting works
- [ ] Input validation works
- [ ] XSS protection works
- [ ] SQL injection protection works
- [ ] Audit logging works

### Error Handling
- [ ] Invalid requests return proper errors
- [ ] Server errors are logged
- [ ] Rate limit errors are handled
- [ ] Validation errors are clear

## 🚀 Next Steps After Testing

1. **If all tests pass:** Ready for Phase 2 implementation
2. **If issues found:** Debug and fix before proceeding
3. **Performance concerns:** Optimize before adding more features
4. **Security concerns:** Review and strengthen security measures

## 📞 Support

If you encounter issues during testing:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables in `.env`
3. Ensure all required ports are available
4. Check Docker and Docker Compose versions

---

**Testing completed successfully?** You're ready for Phase 2: Advanced Features!
