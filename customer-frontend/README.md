# AI Social Media Management Platform

A comprehensive AI-powered social media management platform built with React, featuring intelligent content creation, campaign management, and performance analytics.

## 🚀 Features

### Core Features
- **Interactive Dashboard** - Real-time performance metrics with 7 AI agent workflow
- **AI Strategy Planner** - Intelligent content strategy with specialized AI agents
- **Content Calendar** - AI-generated posts with visual previews and scheduling
- **Campaign Manager** - Multi-platform paid campaign management
- **Performance Analytics** - Comprehensive analytics with interactive charts
- **Post History** - Complete content archive with grid/table views
- **Brand Assets Management** - Brand colors, assets, and guidelines
- **User Profile Management** - Complete user settings and billing

### AI Workflow (7 Specialized Agents)
1. **Intelligence Agent** - Data analysis and competitor insights
2. **Strategy Agent** - Content strategy planning and optimization
3. **Content Agent** - AI-powered content creation and editing
4. **Execution Agent** - Publishing and scheduling automation
5. **Learning Agent** - Performance analysis and improvement recommendations
6. **Engagement Agent** - Community management and response automation
7. **Analytics Agent** - Advanced reporting and metrics generation

### Platform Integrations
- Instagram, Facebook, LinkedIn, Twitter, TikTok, YouTube
- Multi-platform content scheduling and publishing
- Real-time performance tracking across all platforms

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS v4** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Interactive charts and data visualization
- **Lucide React** - Modern icon library

### UI Components
- Custom component library with consistent design system
- Responsive design for desktop and mobile
- Dark mode support
- Professional enterprise-grade UI/UX

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd social-media-ai-dashboard
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env
# Configure your environment variables
```

4. **Start development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=https://your-api-domain.com
VITE_API_VERSION=v1

# Authentication
VITE_AUTH_DOMAIN=your-auth-domain.com
VITE_AUTH_CLIENT_ID=your-client-id

# Social Media APIs
VITE_FACEBOOK_APP_ID=your-facebook-app-id
VITE_INSTAGRAM_CLIENT_ID=your-instagram-client-id
VITE_LINKEDIN_CLIENT_ID=your-linkedin-client-id
VITE_TWITTER_API_KEY=your-twitter-api-key

# AI Services
VITE_OPENAI_API_KEY=your-openai-api-key

# Analytics
VITE_ANALYTICS_ID=your-analytics-id
```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── ui/              # Reusable UI components
│   ├── Dashboard.jsx    # Main dashboard component
│   ├── Analytics.jsx    # Performance analytics
│   ├── Settings.jsx     # Settings management
│   └── ...
├── assets/              # Static assets
├── styles/              # CSS and styling files
├── utils/               # Utility functions
├── hooks/               # Custom React hooks
├── services/            # API services
├── App.jsx              # Main application component
└── main.jsx             # Application entry point
```

## 🎨 Component Architecture

### Main Components
- **App.jsx** - Main application with routing and layout
- **Dashboard.jsx** - Interactive dashboard with 7 AI agents
- **Analytics.jsx** - Performance analytics with charts
- **Settings.jsx** - Business profile and AI preferences
- **ProfileDemo.jsx** - User profile management
- **PostHistory.jsx** - Content archive with grid/table views
- **EnhancedContentCalendar.jsx** - Content scheduling and management
- **CampaignManager.jsx** - Paid campaign management

### UI Components
- **Sidebar.jsx** - Navigation sidebar
- **PostEditor.jsx** - Content creation and editing
- **ui/** - Reusable UI components (buttons, cards, modals, etc.)

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### AWS S3 + CloudFront Deployment
1. Build the application
2. Upload `dist/` folder to S3 bucket
3. Configure CloudFront distribution
4. Set up custom domain and SSL

### Environment-Specific Builds
- **Development**: `npm run dev`
- **Staging**: `npm run build:staging`
- **Production**: `npm run build`

## 🔐 Authentication Flow

The application uses a token-based authentication system:

1. **Sign In/Sign Up** - User authentication with email/password
2. **JWT Tokens** - Secure token storage in localStorage
3. **Protected Routes** - Route protection for authenticated users
4. **Session Management** - Automatic token refresh and logout

## 📊 Data Models

### User Profile
```javascript
{
  id: string,
  email: string,
  name: string,
  avatar: string,
  subscription: 'starter' | 'pro' | 'premium',
  settings: UserSettings
}
```

### Post Data
```javascript
{
  id: string,
  title: string,
  content: string,
  platform: string,
  status: 'draft' | 'scheduled' | 'published',
  scheduledDate: Date,
  performance: PerformanceMetrics
}
```

### Campaign Data
```javascript
{
  id: string,
  name: string,
  platform: string,
  budget: number,
  status: 'active' | 'paused' | 'completed',
  performance: CampaignMetrics
}
```

## 🔌 API Integration Points

### Required Backend Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout

#### User Management
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- `GET /user/settings` - Get user settings
- `PUT /user/settings` - Update user settings

#### Content Management
- `GET /posts` - Get user posts
- `POST /posts` - Create new post
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post
- `POST /posts/:id/schedule` - Schedule post

#### Analytics
- `GET /analytics/dashboard` - Dashboard metrics
- `GET /analytics/performance` - Performance data
- `GET /analytics/campaigns` - Campaign analytics

#### Social Media Integration
- `POST /social/connect` - Connect social account
- `DELETE /social/disconnect` - Disconnect social account
- `GET /social/accounts` - Get connected accounts

## 🧪 Testing

### Running Tests
```bash
npm run test
```

### Test Coverage
```bash
npm run test:coverage
```

### E2E Testing
```bash
npm run test:e2e
```

## 📈 Performance Optimization

### Build Optimization
- Code splitting with dynamic imports
- Tree shaking for unused code elimination
- Asset optimization and compression
- Bundle size analysis

### Runtime Optimization
- React.memo for component memoization
- useMemo and useCallback for expensive operations
- Lazy loading for routes and components
- Image optimization and lazy loading

## 🔧 Development Guidelines

### Code Style
- ESLint configuration for code quality
- Prettier for code formatting
- Consistent naming conventions
- Component documentation with JSDoc

### Git Workflow
- Feature branch workflow
- Conventional commit messages
- Pull request reviews
- Automated testing on CI/CD

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For technical support and questions:
- Email: support@yourcompany.com
- Documentation: https://docs.yourcompany.com
- Issues: GitHub Issues

---

**Built with ❤️ for modern social media management**

