# AI Social Media Management Platform - Backend API

A comprehensive Node.js backend API for the AI Social Media Management Platform with MongoDB, Redis, and WebSocket support.

## 🚀 Features

### Core Features
- **Dual Authentication System** - Separate JWT authentication for customers and admins
- **Multi-tenant Architecture** - Organization-based data isolation
- **Real-time Updates** - WebSocket support for live notifications
- **AI Agent Integration** - Complete 7-agent workflow system
- **Advanced Analytics** - Performance tracking and business intelligence
- **Subscription Management** - Usage limits and billing integration

### Security Features
- **JWT Authentication** with refresh tokens
- **Role-based Access Control (RBAC)**
- **Permission-based Authorization**
- **Rate Limiting** and DDoS protection
- **Data Sanitization** against XSS and NoSQL injection
- **Comprehensive Audit Logging**
- **GDPR Compliance** features

### Performance Features
- **Redis Caching** for improved response times
- **Database Optimization** with proper indexing
- **Connection Pooling** for MongoDB
- **Compression** middleware
- **Request/Response Logging**

## 🏗️ Architecture

### Technology Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **Logging**: Winston

### Project Structure
```
backend/
├── src/
│   ├── config/          # Database and Redis configuration
│   ├── controllers/     # Request handlers
│   │   ├── admin/       # Admin panel controllers
│   │   ├── auth.js      # Authentication controllers
│   │   ├── users.js     # User management
│   │   ├── content.js   # Content management
│   │   └── analytics.js # Analytics and reporting
│   ├── middleware/      # Custom middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── websocket/       # WebSocket server
├── server.js            # Main server file
├── package.json         # Dependencies
└── README.md           # This file
```

## 📊 Database Models

### Core Models
1. **User** - Customer authentication and profiles
2. **Organization** - Multi-tenant organization management
3. **AdminUser** - Super admin panel users
4. **Content** - Social media posts and campaigns
5. **AIAgent** - AI workflow management
6. **Analytics** - Performance tracking data
7. **Subscription** - Billing and usage management

## 🔌 API Endpoints

### Authentication Endpoints
```
POST /api/v1/auth/customer/register     # Customer registration
POST /api/v1/auth/customer/login        # Customer login
POST /api/v1/auth/customer/logout       # Customer logout
POST /api/v1/auth/customer/refresh-token # Refresh access token
POST /api/v1/auth/customer/forgot-password # Password reset request
POST /api/v1/auth/customer/reset-password  # Password reset

POST /api/v1/auth/admin/login           # Admin login
POST /api/v1/auth/admin/logout          # Admin logout
POST /api/v1/auth/admin/refresh-token   # Admin token refresh
```

### Customer Endpoints
```
# User Management
GET    /api/v1/users/profile            # Get user profile
PUT    /api/v1/users/profile            # Update profile
PUT    /api/v1/users/change-password    # Change password
PUT    /api/v1/users/notifications      # Update notification preferences
GET    /api/v1/users/social-accounts    # Get connected social accounts
POST   /api/v1/users/social-accounts    # Connect social account
DELETE /api/v1/users/social-accounts/:platform # Disconnect social account
GET    /api/v1/users/activity           # Get activity log
GET    /api/v1/users/dashboard-stats    # Get dashboard statistics
DELETE /api/v1/users/account            # Delete account

# Content Management
GET    /api/v1/content                  # Get content list
POST   /api/v1/content                  # Create content
GET    /api/v1/content/calendar         # Get content calendar
GET    /api/v1/content/:id              # Get content by ID
PUT    /api/v1/content/:id              # Update content
DELETE /api/v1/content/:id              # Delete content
POST   /api/v1/content/:id/schedule     # Schedule content
POST   /api/v1/content/:id/approve      # Approve/reject content
POST   /api/v1/content/:id/comments     # Add comment
POST   /api/v1/content/generate         # AI content generation

# Analytics
GET    /api/v1/analytics/dashboard      # Dashboard analytics
GET    /api/v1/analytics/content-performance # Content performance
GET    /api/v1/analytics/platform       # Platform analytics
GET    /api/v1/analytics/audience       # Audience insights
GET    /api/v1/analytics/ai-performance # AI agent performance
GET    /api/v1/analytics/roi            # ROI metrics
GET    /api/v1/analytics/export         # Export analytics data
```

### Admin Endpoints
```
# User Management
GET    /api/v1/admin/users              # Get all users
GET    /api/v1/admin/users/stats        # User statistics
GET    /api/v1/admin/users/export       # Export users
GET    /api/v1/admin/users/:id          # Get user details
GET    /api/v1/admin/users/:id/activity # User activity log
PUT    /api/v1/admin/users/:id/status   # Update user status
PUT    /api/v1/admin/users/:id/permissions # Update permissions
POST   /api/v1/admin/users/:id/impersonate # Impersonate user

# Organization Management
GET    /api/v1/admin/organizations      # Get all organizations
GET    /api/v1/admin/organizations/stats # Organization statistics
GET    /api/v1/admin/organizations/:id  # Get organization details
GET    /api/v1/admin/organizations/:id/analytics # Organization analytics
PUT    /api/v1/admin/organizations/:id/status # Update organization status
PUT    /api/v1/admin/organizations/:id/subscription # Update subscription
POST   /api/v1/admin/organizations/:id/reset-usage # Reset usage limits

# System Analytics
GET    /api/v1/admin/analytics/dashboard # System dashboard
GET    /api/v1/admin/analytics/platform-usage # Platform usage
GET    /api/v1/admin/analytics/revenue   # Revenue analytics
GET    /api/v1/admin/analytics/ai-performance # AI system performance
POST   /api/v1/admin/analytics/custom-report # Generate custom report
```

## 🔄 WebSocket Events

### Admin Namespace (`/admin`)
```javascript
// Connection
socket.emit('connected', { adminId, role, timestamp })

// Subscriptions
socket.on('subscribe-user-activity', userId)
socket.on('subscribe-organization-activity', organizationId)
socket.on('subscribe-system-metrics')

// Events
socket.emit('user-activity', { userId, activity, timestamp })
socket.emit('organization-activity', { organizationId, activity, timestamp })
socket.emit('system-metrics', { metrics, timestamp })
```

### Customer Namespace (`/customer`)
```javascript
// Connection
socket.emit('connected', { userId, organizationId, timestamp })

// Subscriptions
socket.on('subscribe-content-updates')
socket.on('subscribe-analytics-updates')
socket.on('subscribe-ai-agent-updates')

// Events
socket.emit('content-update', { content, timestamp })
socket.emit('analytics-update', { analytics, timestamp })
socket.emit('ai-agent-update', { agent, timestamp })
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ 
- MongoDB 5.0+
- Redis 6.0+

### Environment Variables
Create a `.env` file in the backend directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/social-media-ai-platform
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_CUSTOMER_SECRET=your-customer-jwt-secret-key
JWT_ADMIN_SECRET=your-admin-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-jwt-secret-key

# Frontend URLs (for CORS)
FRONTEND_URL=http://localhost:3000
ADMIN_PANEL_URL=http://localhost:3001

# AI API Configuration
OPENAI_API_KEY=your-openai-api-key
OPENAI_API_BASE=https://api.openai.com/v1

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Installation Steps

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Start MongoDB and Redis**
```bash
# MongoDB
mongod

# Redis
redis-server
```

3. **Run Database Migrations** (if any)
```bash
npm run migrate
```

4. **Start Development Server**
```bash
npm run dev
```

5. **Start Production Server**
```bash
npm start
```

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run test       # Run tests
npm run lint       # Run ESLint
npm run migrate    # Run database migrations
npm run seed       # Seed database with sample data
```

## 🔧 Configuration

### MongoDB Configuration
The application uses MongoDB with Mongoose ODM. Connection settings are in `src/config/database.js`.

### Redis Configuration
Redis is used for caching and session management. Configuration is in `src/config/redis.js`.

### Logging Configuration
Winston logger is configured in `src/utils/logger.js` with multiple transports:
- Console logging for development
- File logging for production
- Error logging with stack traces
- Request/response logging
- Security event logging
- Admin activity logging

## 🛡️ Security

### Authentication & Authorization
- **JWT Tokens**: Separate secrets for customers and admins
- **Refresh Tokens**: Stored in Redis with expiration
- **Token Blacklisting**: Immediate token invalidation on logout
- **Role-based Access Control**: Granular permissions system

### Data Protection
- **Input Validation**: Comprehensive validation using express-validator
- **Data Sanitization**: Protection against XSS and NoSQL injection
- **Rate Limiting**: Per-IP request limiting
- **CORS Configuration**: Strict origin validation
- **Helmet Security**: Security headers and CSP

### Audit Logging
- **User Activities**: All user actions logged
- **Admin Activities**: Enhanced logging for admin actions
- **Security Events**: Failed logins, suspicious activities
- **System Events**: Server starts, errors, performance metrics

## 📈 Performance

### Caching Strategy
- **Redis Caching**: Frequently accessed data cached
- **Query Optimization**: Proper MongoDB indexing
- **Connection Pooling**: Efficient database connections
- **Response Compression**: Gzip compression enabled

### Monitoring
- **Health Check Endpoint**: `/health`
- **Performance Logging**: Request duration tracking
- **Error Tracking**: Comprehensive error logging
- **WebSocket Monitoring**: Connection statistics

## 🧪 Testing

### Test Structure
```bash
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data
```

### Running Tests
```bash
npm test              # Run all tests
npm run test:unit     # Run unit tests
npm run test:integration # Run integration tests
npm run test:e2e      # Run e2e tests
npm run test:coverage # Run tests with coverage
```

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database URLs
- [ ] Set secure JWT secrets
- [ ] Configure CORS for production domains
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies

### Docker Deployment
```dockerfile
# Dockerfile included for containerized deployment
docker build -t social-media-api .
docker run -p 5000:5000 social-media-api
```

### AWS Deployment
- **EC2**: Traditional server deployment
- **ECS**: Container orchestration
- **Lambda**: Serverless functions (with modifications)
- **RDS**: Managed MongoDB Atlas
- **ElastiCache**: Managed Redis

## 📚 API Documentation

### Swagger Documentation
API documentation is auto-generated and available at:
- Development: `http://localhost:5000/api/v1/docs`
- Production: `https://your-domain.com/api/v1/docs`

### Postman Collection
Import the Postman collection for easy API testing:
```bash
# Collection file location
./docs/postman/AI-Social-Media-API.postman_collection.json
```

## 🤝 Contributing

### Development Guidelines
1. Follow ESLint configuration
2. Write comprehensive tests
3. Update documentation
4. Use conventional commit messages
5. Create feature branches

### Code Style
- Use ES6+ features
- Follow async/await pattern
- Implement proper error handling
- Add JSDoc comments for functions
- Use meaningful variable names

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Complete API implementation
- WebSocket real-time features
- Admin panel integration
- AI agent system
- Comprehensive security features

---

**Built with ❤️ for the AI Social Media Management Platform**

