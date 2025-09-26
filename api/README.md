# AI Social Media Platform API

A comprehensive Node.js/Express API for the AI-powered social media management platform.

## 🚀 Quick Start

Get the API running in 3 simple steps:

1. **Clone and navigate to the API directory**
   ```bash
   git clone <repository-url>
   cd ai-social-media-platform/api
   ```

2. **Copy environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Run with Docker**
   ```bash
   cd .. # Go back to project root
   docker-compose up -d
   ```

4. **Open API Documentation**
   - API Docs: http://localhost:5000/docs
   - Health Check: http://localhost:5000/health

## 📋 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Complete user profiles with business information
- **Content Management**: Create, schedule, and manage social media content
- **Social Media Integration**: Connect and manage multiple social platforms
- **AI-Powered Features**: Content generation, optimization, and insights
- **Analytics**: Comprehensive performance tracking and reporting
- **Real-time Features**: WebSocket support for live updates

## 🛠 Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis for session management and real-time features
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Express Validator
- **Documentation**: Swagger/OpenAPI 3.0

## 📁 Project Structure

```
api/
├── models/           # Database schemas and models
├── routes/           # API route handlers
├── middleware/       # Custom middleware (auth, validation, etc.)
├── services/         # Business logic and external integrations
├── utils/            # Helper functions and utilities
├── docs/             # API documentation and specs
├── tests/            # Test files
├── server.js         # Main application entry point
├── Dockerfile        # Container configuration
└── package.json      # Dependencies and scripts
```

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ai-social-media

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# AI Services
OPENAI_API_KEY=your-openai-api-key-here

# Social Media APIs
FACEBOOK_APP_ID=your-facebook-app-id
INSTAGRAM_APP_ID=your-instagram-app-id
TWITTER_API_KEY=your-twitter-api-key
LINKEDIN_CLIENT_ID=your-linkedin-client-id
```

## 🚀 Development

### Local Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Run tests**
   ```bash
   npm test
   ```

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get user profile |
| PUT | `/api/users/me` | Update user profile |
| PUT | `/api/users/password` | Change password |
| PUT | `/api/users/business-profile` | Update business profile |

### Content Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/content` | Get user's content |
| POST | `/api/content` | Create new content |
| GET | `/api/content/:id` | Get specific content |
| PUT | `/api/content/:id` | Update content |
| DELETE | `/api/content/:id` | Delete content |

### Social Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/social-profiles` | Get connected accounts |
| POST | `/api/social-profiles` | Connect new account |
| PUT | `/api/social-profiles/:id` | Update account settings |
| DELETE | `/api/social-profiles/:id` | Disconnect account |

### AI Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/generate-content` | Generate AI content |
| POST | `/api/ai/generate-strategy` | Generate content strategy |
| POST | `/api/ai/optimize-content` | Optimize existing content |
| GET | `/api/ai/insights` | Get AI insights |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard overview |
| GET | `/api/analytics/performance` | Performance metrics |
| GET | `/api/analytics/engagement` | Engagement analytics |
| GET | `/api/analytics/audience` | Audience insights |

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Configurable cross-origin requests
- **Input Validation**: Comprehensive request validation
- **Helmet.js**: Security headers and protection

## 🧪 Testing

The API includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- auth.test.js
```

Test structure:
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Authentication Tests**: Security and auth flow testing

## 📊 Monitoring & Health Checks

### Health Endpoints

- `GET /health` - Detailed health status
- `GET /live` - Simple liveness check

### Monitoring Features

- Request logging with timestamps
- Error tracking and reporting
- Performance metrics collection
- Database connection monitoring

## 🐳 Docker Support

### Development with Docker

```bash
# Build and run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Production Deployment

```bash
# Build production image
docker build -t ai-social-api .

# Run production container
docker run -p 5000:5000 --env-file .env ai-social-api
```

## 🚀 Deployment

### AWS Deployment

1. **EC2 Instance Setup**
   - Launch Ubuntu 22.04 LTS instance
   - Install Docker and Docker Compose
   - Configure security groups (ports 80, 443, 5000)

2. **Environment Configuration**
   ```bash
   # Copy environment file
   cp .env.example .env
   # Edit with production values
   nano .env
   ```

3. **Deploy with Docker Compose**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Environment-Specific Configurations

- **Development**: Hot reload, detailed logging
- **Staging**: Production-like with debug enabled
- **Production**: Optimized, minimal logging, security hardened

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation at `/docs`
- Review the health check endpoint at `/health`

---

**Built with ❤️ by the AI Social Media Team**
