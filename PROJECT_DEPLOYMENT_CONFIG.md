# 🚀 AI Social Media Platform - Project Deployment Configuration

## 📋 **Project Overview**
This document contains all project-specific deployment settings for the AI Social Media Management Platform using the subdomain `digiads.digiaeon.com`.

---

## 🌐 **Domain Configuration**

### **Primary Domain**
- **Main Domain**: `digiads.digiaeon.com`
- **Customer Frontend**: `https://digiads.digiaeon.com`
- **Admin Panel**: `https://digiads.digiaeon.com/admin`
- **API Endpoints**: `https://digiads.digiaeon.com/api`
- **AI Agents**: `https://digiads.digiaeon.com/ai-agents`
- **WebSocket**: `wss://digiads.digiaeon.com/ws`

---

## ⚙️ **PM2 Process Management**

### **ecosystem.config.js Configuration**
```javascript
module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: './backend-api',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
        FRONTEND_URL: 'https://digiads.digiaeon.com',
        ADMIN_URL: 'https://digiads.digiaeon.com/admin',
        API_BASE_URL: 'https://digiads.digiaeon.com/api',
        CORS_ORIGIN: 'https://digiads.digiaeon.com',
        AI_AGENTS_URL: 'https://digiads.digiaeon.com/ai-agents'
      }
    },
    {
      name: 'customer-frontend',
      cwd: './customer-frontend',
      script: 'npx',
      args: 'serve -s dist -p 3000',
      env: {
        VITE_API_BASE_URL: 'https://digiads.digiaeon.com/api/v1',
        VITE_WS_URL: 'wss://digiads.digiaeon.com/ws',
        VITE_APP_URL: 'https://digiads.digiaeon.com'
      }
    },
    {
      name: 'admin-panel',
      cwd: './admin-panel',
      script: 'npx',
      args: 'serve -s dist -p 5173',
      env: {
        VITE_API_BASE_URL: 'https://digiads.digiaeon.com/api/v1',
        VITE_WS_URL: 'wss://digiads.digiaeon.com/ws',
        VITE_APP_URL: 'https://digiads.digiaeon.com/admin'
      }
    }
  ]
};
```

---

## 🔧 **Environment Variables**

### **Backend API (.env)**
```bash
# Application Settings
NODE_ENV=production
PORT=8000
FRONTEND_URL=https://digiads.digiaeon.com
ADMIN_URL=https://digiads.digiaeon.com/admin
API_BASE_URL=https://digiads.digiaeon.com/api

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/digital_marketing

# CORS
CORS_ORIGIN=https://digiads.digiaeon.com

# AI Agents
AI_AGENTS_URL=https://digiads.digiaeon.com/ai-agents

# Payment URLs
STRIPE_SUCCESS_URL=https://digiads.digiaeon.com/payment/success
STRIPE_CANCEL_URL=https://digiads.digiaeon.com/payment/cancel

# Email
FROM_EMAIL=noreply@digiads.digiaeon.com
```

### **Customer Frontend (.env)**
```bash
# API Configuration
VITE_API_BASE_URL=https://digiads.digiaeon.com/api
VITE_WS_URL=wss://digiads.digiaeon.com/ws
VITE_CORS_ORIGINS=https://digiads.digiaeon.com

# App URLs
VITE_APP_URL=https://digiads.digiaeon.com
VITE_ADMIN_URL=https://digiads.digiaeon.com/admin
```

### **Admin Panel (.env)**
```bash
# API Configuration
VITE_API_BASE_URL=https://digiads.digiaeon.com/api
VITE_WS_URL=wss://digiads.digiaeon.com/ws

# App URLs
VITE_APP_URL=https://digiads.digiaeon.com/admin
```

---

## 🗄️ **Database Configuration**

### **MongoDB**
- **Database Name**: `digital_marketing`
- **Connection**: `mongodb://127.0.0.1:27017/digital_marketing`
- **Collections**: Users, Organizations, Content, Analytics, etc.

### **Redis**
- **URL**: `redis://localhost:6379`
- **Purpose**: Caching and session storage

---

## 🚀 **Deployment Commands**

### **1. Start All Services**
```bash
cd /home/ubuntu/ai-social-media-platform
pm2 start ecosystem.config.js
```

### **2. Restart All Services**
```bash
pm2 restart all
```

### **3. Stop All Services**
```bash
pm2 stop all
```

### **4. View Service Status**
```bash
pm2 status
pm2 logs
```

### **5. Rebuild Frontend Applications**
```bash
# Customer Frontend
cd customer-frontend
npm run build

# Admin Panel
cd admin-panel
npm run build
```

---

## 🔄 **Service Ports**

| **Service** | **Port** | **URL** |
|-------------|----------|---------|
| Backend API | 8000 | Internal |
| Customer Frontend | 3000 | Internal |
| Admin Panel | 5173 | Internal |
| MongoDB | 27017 | Internal |
| Redis | 6379 | Internal |

---

## 🌐 **Nginx Configuration (Reference)**

### **Server Block**
```nginx
server {
    listen 80;
    server_name digiads.digiaeon.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name digiads.digiaeon.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/digiads.digiaeon.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/digiads.digiaeon.com/privkey.pem;
    
    # API Routes
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Admin Panel
    location /admin {
        proxy_pass http://127.0.0.1:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # AI Agents
    location /ai-agents/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Customer Frontend (Default)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🔐 **API Keys Configuration**

### **OpenAI**
```bash
OPENAI_API_KEY=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
```

### **Social Media APIs**
```bash
# YouTube
YOUTUBE_CLIENT_ID=409146080690-ekit81qd6h8g8u5u6r7t8kq79s99s01j.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=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

# Google
GOOGLE_CLIENT_ID=409146080690-2as1ms3jpjhjpealn8ncbes4clga3eo3.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Twitter
TWITTER_API_KEY=empJSUp6UG41ejNSeFBIb1Jrc2U6MTpjaQ
TWITTER_API_SECRET=EOCBKCMbucKsKmIGoHyXtJ4jaqt_IqHkXlGlyTihh7zn30o-bA
```

---

## 🛠️ **Troubleshooting**

### **Common Issues**

1. **CORS Errors**
   - Check `CORS_ORIGIN` in backend .env
   - Verify frontend `VITE_CORS_ORIGINS` setting

2. **API Connection Issues**
   - Verify `VITE_API_BASE_URL` in frontend .env files
   - Check backend is running on port 8000

3. **Service Not Starting**
   - Check PM2 logs: `pm2 logs [service-name]`
   - Verify all environment variables are set

4. **Database Connection**
   - Ensure MongoDB is running: `docker ps | grep mongo`
   - Check MongoDB connection string

### **Health Checks**
```bash
# Backend Health
curl https://digiads.digiaeon.com/api/health

# Frontend Access
curl https://digiads.digiaeon.com

# Admin Panel Access
curl https://digiads.digiaeon.com/admin
```

---

## 📝 **Notes**

- All URLs use HTTPS for production security
- WebSocket connections use WSS protocol
- CORS is configured to allow the main domain only
- All services run on internal ports and are proxied by Nginx
- Environment variables are loaded from PM2 ecosystem configuration

---

## 🔄 **Update Process**

When updating the subdomain configuration:

1. Update `ecosystem.config.js`
2. Update all `.env` files
3. Rebuild frontend applications
4. Restart PM2 services
5. Update Nginx configuration if needed

---

**Last Updated**: September 20, 2025  
**Domain**: digiads.digiaeon.com  
**Status**: Production Ready ✅

