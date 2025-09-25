# AI Social Media Platform

A comprehensive AI-powered social media management platform with advanced analytics, content creation, and automation capabilities.

## 🚀 Features

### Core Platform
- **Multi-Platform Management**: Support for Instagram, Facebook, Twitter, LinkedIn, TikTok, YouTube
- **AI Content Generation**: Automated content creation using advanced AI models
- **Smart Scheduling**: Intelligent posting schedules based on audience engagement
- **Analytics Dashboard**: Comprehensive analytics and performance tracking
- **Team Collaboration**: Multi-user workspace with role-based permissions

### Admin Panel
- **User Management**: Complete user lifecycle management
- **Content Moderation**: Advanced content review and approval workflows
- **Subscription Management**: Flexible subscription plans and billing
- **System Monitoring**: Real-time system health and performance monitoring
- **Analytics & Reporting**: Detailed insights and custom reports

### Customer Frontend
- **Intuitive Dashboard**: User-friendly interface for content management
- **AI Assistant**: Smart content suggestions and optimization
- **Social Media Integration**: Seamless connection to social platforms
- **Performance Tracking**: Real-time engagement metrics

## 🏗️ Architecture

### Backend (Node.js + Express)
- **RESTful API**: Comprehensive API endpoints for all platform features
- **Authentication**: JWT-based authentication with refresh tokens
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis for improved performance
- **File Storage**: Local file system with cloud storage support
- **WebSocket**: Real-time communication for live updates

### Frontend (React + Vite)
- **Admin Panel**: React-based admin interface with modern UI components
- **Customer Frontend**: User-facing application with responsive design
- **State Management**: Context API and custom hooks
- **UI Framework**: Tailwind CSS with custom components
- **Charts & Analytics**: Interactive data visualization

### AI Services
- **Content Generation**: AI-powered content creation
- **Sentiment Analysis**: Automated content sentiment detection
- **Trend Analysis**: Social media trend identification
- **Optimization**: Content performance optimization suggestions

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Redis** - Caching
- **JWT** - Authentication
- **WebSocket** - Real-time communication
- **Multer** - File uploads
- **Bcrypt** - Password hashing

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Axios** - HTTP client
- **React Router** - Navigation

### AI & ML
- **OpenAI API** - Content generation
- **Custom ML Models** - Analytics and optimization
- **Natural Language Processing** - Content analysis

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Redis (v6 or higher)
- Docker (optional)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-social-media-platform.git
   cd ai-social-media-platform
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend-api
   npm install

   # Admin Panel
   cd ../admin-panel
   npm install --legacy-peer-deps

   # Customer Frontend
   cd ../customer-frontend
   npm install --legacy-peer-deps
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp backend-api/.env.example backend-api/.env
   cp admin-panel/.env.example admin-panel/.env
   cp customer-frontend/.env.example customer-frontend/.env
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB and Redis
   # Using Docker (recommended)
   docker-compose up -d

   # Or start services manually
   # MongoDB: mongod
   # Redis: redis-server
   ```

5. **Initialize Database**
   ```bash
   cd backend-api
   node create-admin-user.js
   node create-sample-data.js
   ```

6. **Start Services**
   ```bash
   # Backend API
   cd backend-api
   npm run dev

   # Admin Panel (new terminal)
   cd admin-panel
   npm run dev

   # Customer Frontend (new terminal)
   cd customer-frontend
   npm run dev
   ```

## 🌐 Access Points

- **Admin Panel**: http://localhost:5174
- **Customer Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/v1/docs
- **Health Check**: http://localhost:8000/health

## 🔐 Default Credentials

### Admin Panel
- **Email**: admin@aisocialmedia.com
- **Password**: admin123

### API Testing
- **Admin Token**: Use the login endpoint to get admin tokens
- **Customer Token**: Use the customer registration/login endpoints

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/customer/register` - Customer registration
- `POST /api/auth/customer/login` - Customer login
- `POST /api/auth/refresh` - Refresh token

### Admin Endpoints
- `GET /api/v1/admin/users` - Get all users
- `GET /api/v1/admin/organizations` - Get all organizations
- `GET /api/v1/admin/analytics` - Get analytics data
- `GET /api/v1/admin/content` - Get all content
- `GET /api/v1/admin/notifications` - Get all notifications

### Customer Endpoints
- `GET /api/v1/customer/profile` - Get user profile
- `POST /api/v1/customer/content` - Create content
- `GET /api/v1/customer/analytics` - Get user analytics

## 🗂️ Project Structure

```
ai-social-media-platform/
├── backend-api/                 # Backend API server
│   ├── src/
│   │   ├── controllers/         # Route controllers
│   │   ├── middleware/          # Custom middleware
│   │   ├── models/             # Database models
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   └── utils/              # Utility functions
│   ├── server.js               # Main server file
│   └── package.json
├── admin-panel/                # Admin panel frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── services/           # API services
│   │   ├── config/             # Configuration
│   │   └── utils/              # Utility functions
│   └── package.json
├── customer-frontend/          # Customer frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── services/           # API services
│   │   └── utils/              # Utility functions
│   └── package.json
├── docker-compose.yml          # Docker configuration
├── .env.example               # Environment variables template
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables

#### Backend API (.env)
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/ai-social-media
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
ADMIN_JWT_SECRET=your-admin-jwt-secret
ADMIN_JWT_REFRESH_SECRET=your-admin-refresh-secret
ENCRYPTION_KEY=your-encryption-key
```

#### Admin Panel (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WEBSOCKET_URL=ws://localhost:8000/ws
```

#### Customer Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WEBSOCKET_URL=ws://localhost:8000/ws
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment
1. Set up production environment variables
2. Build frontend applications
3. Start backend API server
4. Configure reverse proxy (nginx)
5. Set up SSL certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@aisocialmedia.com or create an issue in the repository.

## 🎯 Roadmap

- [ ] Mobile applications (iOS/Android)
- [ ] Advanced AI features
- [ ] White-label solutions
- [ ] Enterprise features
- [ ] API marketplace
- [ ] Third-party integrations

## 📊 Status

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-blue)

---

**Built with ❤️ by the AI Social Media Platform Team**