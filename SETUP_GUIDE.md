# 🚀 AI Social Media Platform - Setup Guide

## 📋 **Prerequisites**

- Node.js 18+ and npm
- MongoDB (local or cloud)
- Redis (local or cloud)
- Docker & Docker Compose (recommended)

## 🔑 **Required API Keys**

### **1. OpenAI API Key (Required for AI features)**
1. Go to [OpenAI API](https://platform.openai.com/api-keys)
2. Create an account and generate an API key
3. Add to `.env`: `OPENAI_API_KEY=sk-proj-...`

### **2. SendGrid API Key (Required for emails)**
1. Go to [SendGrid](https://sendgrid.com/)
2. Create account and verify your sender identity
3. Generate API key in Settings > API Keys
4. Add to `.env`: `SENDGRID_API_KEY=SG.xxx...`

### **3. Social Media API Keys (Optional but recommended)**

#### **Facebook & Instagram:**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create an app and get App ID & App Secret
3. Add to `.env`:
   ```
   FACEBOOK_APP_ID=your-app-id
   FACEBOOK_APP_SECRET=your-app-secret
   INSTAGRAM_APP_ID=your-app-id
   INSTAGRAM_APP_SECRET=your-app-secret
   ```

#### **Twitter:**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create an app and get API keys
3. Add to `.env`:
   ```
   TWITTER_API_KEY=your-api-key
   TWITTER_API_SECRET=your-api-secret
   TWITTER_BEARER_TOKEN=your-bearer-token
   ```

#### **LinkedIn:**
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create an app and get Client ID & Secret
3. Add to `.env`:
   ```
   LINKEDIN_CLIENT_ID=your-client-id
   LINKEDIN_CLIENT_SECRET=your-client-secret
   ```

#### **YouTube:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable YouTube Data API v3
3. Create credentials and get API key
4. Add to `.env`: `YOUTUBE_API_KEY=your-api-key`

### **4. AWS S3 (Optional - for file storage)**
1. Go to [AWS Console](https://aws.amazon.com/console/)
2. Create S3 bucket and IAM user with S3 permissions
3. Add to `.env`:
   ```
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_S3_BUCKET=your-bucket-name
   AWS_REGION=us-east-1
   ```

## 🛠️ **Installation Steps**

### **Option 1: Docker Compose (Recommended)**

```bash
# 1. Clone the repository
git clone https://github.com/rdaulakh/ai-social-media-platform.git
cd ai-social-media-platform

# 2. Create environment file
cp api/.env.example api/.env

# 3. Edit .env file with your API keys
nano api/.env  # or use your preferred editor

# 4. Start all services
docker-compose up -d

# 5. Check if services are running
docker-compose ps

# 6. View logs
docker-compose logs -f api
```

### **Option 2: Manual Installation**

```bash
# 1. Clone the repository
git clone https://github.com/rdaulakh/ai-social-media-platform.git
cd ai-social-media-platform

# 2. Install backend dependencies
cd api
npm install

# 3. Create environment file
cp .env.example .env

# 4. Edit .env file with your API keys
nano .env

# 5. Start MongoDB and Redis
# (Install and start these services on your system)

# 6. Start the backend API
npm start

# 7. In a new terminal, start the frontend
cd ../customer-frontend
npm install
npm run dev
```

## 🔧 **Configuration**

### **Environment Variables (.env file)**

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/ai-social-media
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# AI Services
OPENAI_API_KEY=sk-proj-your-actual-openai-key-here

# Email Service
SENDGRID_API_KEY=SG.your-actual-sendgrid-key-here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Social Media APIs (add your actual keys)
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
INSTAGRAM_APP_ID=your-instagram-app-id
INSTAGRAM_APP_SECRET=your-instagram-app-secret
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
TWITTER_BEARER_TOKEN=your-twitter-bearer-token
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
YOUTUBE_API_KEY=your-youtube-api-key

# File Storage (optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket-name
AWS_REGION=us-east-1

# Security
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=50mb
MAX_FILES_PER_UPLOAD=10
WEBHOOK_BASE_URL=http://localhost:5000/api/webhooks
```

## 🧪 **Testing the Installation**

### **1. Health Check**
```bash
curl http://localhost:5000/health
```
Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-12-18T...",
  "uptime": 123.456,
  "environment": "development"
}
```

### **2. Test AI Content Generation**
```bash
# First, register a user and get JWT token
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "password123"}'

# Then test AI generation (replace YOUR_JWT_TOKEN)
curl -X POST http://localhost:5000/api/ai/generate-content \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a post about AI", "platform": "instagram"}'
```

### **3. Test File Upload**
```bash
curl -X POST http://localhost:5000/api/media/upload/single \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/image.jpg"
```

## 🌐 **Access URLs**

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Documentation:** http://localhost:5000/docs
- **Health Check:** http://localhost:5000/health

## 📊 **Available Features**

### **✅ AI-Powered Features**
- Content generation for all platforms
- Hashtag generation with trending analysis
- Caption writing with engagement optimization
- Trend analysis and market insights
- Audience behavior analysis
- Competitor analysis
- Performance optimization recommendations

### **✅ Social Media Integration**
- Multi-platform publishing (Facebook, Instagram, Twitter, LinkedIn, YouTube)
- OAuth authentication for secure connections
- Media upload and processing
- Analytics retrieval from platforms
- Scheduled posting

### **✅ File Management**
- Image processing and optimization
- Video processing and thumbnail generation
- File validation and security
- Streaming support for large files

### **✅ Real-time Features**
- Live notifications
- Real-time analytics updates
- User presence tracking
- Collaborative editing

### **✅ Security Features**
- JWT authentication
- Rate limiting with subscription tiers
- Comprehensive audit logging
- Real-time threat detection
- Input validation and sanitization

### **✅ Email System**
- Welcome emails
- Password reset notifications
- Content published confirmations
- Analytics reports
- Security alerts

## 🚨 **Security Notes**

1. **Never commit .env files** to version control
2. **Use strong JWT secrets** (32+ characters)
3. **Enable HTTPS** in production
4. **Regularly rotate API keys**
5. **Monitor audit logs** for suspicious activity
6. **Use environment-specific configurations**

## 🐛 **Troubleshooting**

### **Common Issues:**

#### **MongoDB Connection Error**
```bash
# Make sure MongoDB is running
sudo systemctl start mongod
# Or use Docker
docker run -d -p 27017:27017 mongo:latest
```

#### **Redis Connection Error**
```bash
# Make sure Redis is running
sudo systemctl start redis
# Or use Docker
docker run -d -p 6379:6379 redis:latest
```

#### **OpenAI API Errors**
- Check your API key is valid
- Ensure you have sufficient credits
- Verify the API key has proper permissions

#### **Social Media API Errors**
- Verify your app is approved for production use
- Check OAuth redirect URLs are configured correctly
- Ensure you have the required permissions/scopes

## 📞 **Support**

If you encounter any issues:

1. Check the logs: `docker-compose logs -f api`
2. Verify all environment variables are set correctly
3. Ensure all required services (MongoDB, Redis) are running
4. Check API key permissions and quotas

## 🎉 **You're Ready!**

Once everything is set up, you'll have a fully functional AI Social Media Management Platform with:

- 7 AI agents for content creation and analysis
- Multi-platform social media publishing
- Real-time notifications and analytics
- Enterprise-grade security
- Professional email communications
- Complete file management system

**Start creating amazing social media content with AI! 🚀**
