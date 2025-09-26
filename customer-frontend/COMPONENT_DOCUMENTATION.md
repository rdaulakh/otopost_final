# Component Documentation - AI Social Media Management Platform

This document provides detailed information about all React components in the application, their props, usage, and integration points.

## 🏗 Architecture Overview

The application follows a component-based architecture with clear separation of concerns:

```
App.jsx (Main Container)
├── Sidebar.jsx (Navigation)
├── Dashboard.jsx (Main Dashboard)
├── Analytics.jsx (Performance Analytics)
├── Settings.jsx (Business Settings)
├── ProfileDemo.jsx (User Profile)
├── PostHistory.jsx (Content Archive)
├── EnhancedContentCalendar.jsx (Content Management)
├── CampaignManager.jsx (Campaign Management)
└── ui/ (Reusable Components)
```

## 📱 Main Components

### App.jsx
**Purpose:** Main application container with routing and layout management

**Key Features:**
- Authentication state management
- Route handling and navigation
- Layout structure with sidebar
- User session management

**State Management:**
```javascript
const [isAuthenticated, setIsAuthenticated] = useState(false)
const [currentView, setCurrentView] = useState('dashboard')
const [user, setUser] = useState(null)
const [loading, setLoading] = useState(true)
```

**Props:** None (Root component)

**Usage:**
```jsx
// Main application entry point
<App />
```

**Integration Points:**
- Authentication service
- Local storage for session persistence
- All child components receive navigation props

---

### Dashboard.jsx
**Purpose:** Interactive dashboard with 7 AI agent workflow and performance metrics

**Key Features:**
- Real-time performance metrics (8 key indicators)
- 7 specialized AI agents monitoring
- Campaign overview and status
- Quick action buttons
- Auto-refresh functionality

**State Management:**
```javascript
const [metrics, setMetrics] = useState({
  engagementRate: 4.2,
  totalReach: 12500,
  followersGrowth: 156,
  postsPublished: 24,
  revenue: 8420,
  conversionRate: 3.8,
  clickThroughRate: 2.1,
  costPerClick: 0.45
})

const [agents, setAgents] = useState([
  { name: 'Intelligence', efficiency: 94, status: 'Analyzing competitor strategies' },
  { name: 'Strategy', efficiency: 91, status: 'Planning Q1 content strategy' },
  // ... 5 more agents
])

const [viewMode, setViewMode] = useState('overview') // 'overview' | 'detailed'
```

**Props:**
```javascript
{
  onNavigate: PropTypes.func.isRequired, // Navigation handler
  refreshInterval: PropTypes.number      // Auto-refresh interval (default: 30000ms)
}
```

**Usage:**
```jsx
<Dashboard 
  onNavigate={handleNavigation}
  refreshInterval={30000}
/>
```

**API Integration:**
- `GET /api/dashboard/metrics` - Performance metrics
- `GET /api/dashboard/agents` - AI agent status
- `GET /api/dashboard/campaigns` - Campaign overview

---

### Analytics.jsx (PerformanceAnalytics)
**Purpose:** Comprehensive performance analytics with interactive charts

**Key Features:**
- 5-tab analytics system (Trends, Platforms, Content Types, Best Times, Audience)
- Interactive charts using Recharts
- Time range filtering
- Export functionality
- Platform-specific insights

**State Management:**
```javascript
const [activeTab, setActiveTab] = useState('trends')
const [timeRange, setTimeRange] = useState('30days')
const [analyticsData, setAnalyticsData] = useState({
  overview: { reach: 125000, engagement: 8800, followers: 12500 },
  trends: [], // Chart data
  platforms: [], // Platform breakdown
  content: [], // Content performance
  audience: {} // Demographics
})
```

**Props:**
```javascript
{
  timeRange: PropTypes.oneOf(['7days', '30days', '90days', '1year']),
  onExport: PropTypes.func,
  onRefresh: PropTypes.func
}
```

**Usage:**
```jsx
<PerformanceAnalytics 
  timeRange="30days"
  onExport={handleExport}
  onRefresh={handleRefresh}
/>
```

**API Integration:**
- `GET /api/analytics/overview` - Key metrics
- `GET /api/analytics/trends` - Performance trends
- `GET /api/analytics/platforms` - Platform breakdown
- `GET /api/analytics/content` - Content performance
- `GET /api/analytics/audience` - Audience demographics

---

### Settings.jsx
**Purpose:** Business profile and AI preferences management

**Key Features:**
- 4-tab settings system (Business Profile, Platform Connections, Brand Assets, AI Preferences)
- Company information management
- Social media account connections
- Brand asset management (colors, logos, guidelines)
- AI agent configuration

**State Management:**
```javascript
const [activeTab, setActiveTab] = useState('business')
const [businessProfile, setBusinessProfile] = useState({
  companyName: '',
  industry: '',
  businessType: '',
  website: '',
  description: ''
})

const [brandAssets, setBrandAssets] = useState({
  colors: { primary: '#3B82F6', secondary: '#8B5CF6' },
  assets: { logo: null, favicon: null },
  guidelines: { voice: 'professional', style: 'educational' }
})

const [aiPreferences, setAiPreferences] = useState({
  contentGeneration: { creativity: 7, tone: 'professional' },
  scheduling: { autoPost: false, optimalTiming: true },
  analytics: { reportFrequency: 'weekly' }
})
```

**Props:**
```javascript
{
  onSave: PropTypes.func.isRequired,
  initialData: PropTypes.object
}
```

**Usage:**
```jsx
<Settings 
  onSave={handleSettingsSave}
  initialData={userSettings}
/>
```

**API Integration:**
- `GET /api/settings/business` - Business profile
- `PUT /api/settings/business` - Update business profile
- `GET /api/settings/brand` - Brand assets
- `PUT /api/settings/brand` - Update brand assets
- `GET /api/settings/ai` - AI preferences
- `PUT /api/settings/ai` - Update AI preferences

---

### ProfileDemo.jsx
**Purpose:** User profile management with billing and security

**Key Features:**
- 4-tab profile system (Profile, Notifications, Billing, Security)
- Personal information management
- Notification preferences
- Subscription and billing management
- Security settings and password management

**State Management:**
```javascript
const [activeTab, setActiveTab] = useState('profile')
const [profile, setProfile] = useState({
  name: '', email: '', avatar: '', bio: '', timezone: ''
})

const [notifications, setNotifications] = useState({
  email: true, push: false, sms: false
})

const [subscription, setSubscription] = useState({
  plan: 'pro', status: 'active', nextBilling: '2024-10-15'
})
```

**Props:**
```javascript
{
  userId: PropTypes.string.isRequired,
  onProfileUpdate: PropTypes.func,
  onSubscriptionChange: PropTypes.func
}
```

**Usage:**
```jsx
<ProfileDemo 
  userId={currentUser.id}
  onProfileUpdate={handleProfileUpdate}
  onSubscriptionChange={handleSubscriptionChange}
/>
```

**API Integration:**
- `GET /api/user/profile` - User profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/subscription` - Subscription details
- `POST /api/user/subscription/change` - Change subscription

---

### PostHistory.jsx
**Purpose:** Content archive with grid/table views and management

**Key Features:**
- Dual view modes (table and grid)
- Search and filtering functionality
- Post status management
- Performance metrics display
- Bulk operations

**State Management:**
```javascript
const [viewMode, setViewMode] = useState('table') // 'table' | 'grid'
const [posts, setPosts] = useState([])
const [filters, setFilters] = useState({
  platform: 'all',
  status: 'all',
  dateRange: '30days'
})
const [searchQuery, setSearchQuery] = useState('')
const [selectedPosts, setSelectedPosts] = useState([])
```

**Props:**
```javascript
{
  posts: PropTypes.array.isRequired,
  onPostEdit: PropTypes.func,
  onPostDelete: PropTypes.func,
  onBulkAction: PropTypes.func
}
```

**Usage:**
```jsx
<PostHistory 
  posts={userPosts}
  onPostEdit={handlePostEdit}
  onPostDelete={handlePostDelete}
  onBulkAction={handleBulkAction}
/>
```

**API Integration:**
- `GET /api/posts` - User posts with pagination
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/bulk` - Bulk operations

---

### EnhancedContentCalendar.jsx
**Purpose:** Content scheduling and calendar management

**Key Features:**
- Calendar view with drag-and-drop
- Post scheduling interface
- Performance tracking tab
- AI content suggestions
- Multi-platform publishing

**State Management:**
```javascript
const [activeTab, setActiveTab] = useState('calendar')
const [selectedDate, setSelectedDate] = useState(new Date())
const [scheduledPosts, setScheduledPosts] = useState([])
const [calendarView, setCalendarView] = useState('month') // 'month' | 'week' | 'day'
```

**Props:**
```javascript
{
  onPostSchedule: PropTypes.func.isRequired,
  onPostEdit: PropTypes.func,
  initialDate: PropTypes.instanceOf(Date)
}
```

**Usage:**
```jsx
<EnhancedContentCalendar 
  onPostSchedule={handlePostSchedule}
  onPostEdit={handlePostEdit}
  initialDate={new Date()}
/>
```

**API Integration:**
- `GET /api/calendar/posts` - Scheduled posts
- `POST /api/calendar/schedule` - Schedule new post
- `PUT /api/calendar/reschedule` - Reschedule post

---

### CampaignManager.jsx
**Purpose:** Paid campaign management across platforms

**Key Features:**
- Multi-platform campaign overview
- Budget management and optimization
- Performance tracking
- AI recommendations
- Campaign creation and editing

**State Management:**
```javascript
const [campaigns, setCampaigns] = useState([])
const [selectedPlatform, setSelectedPlatform] = useState('all')
const [budgetOptimization, setBudgetOptimization] = useState(true)
const [aiRecommendations, setAiRecommendations] = useState([])
```

**Props:**
```javascript
{
  onCampaignCreate: PropTypes.func.isRequired,
  onCampaignEdit: PropTypes.func,
  onBudgetOptimize: PropTypes.func
}
```

**Usage:**
```jsx
<CampaignManager 
  onCampaignCreate={handleCampaignCreate}
  onCampaignEdit={handleCampaignEdit}
  onBudgetOptimize={handleBudgetOptimize}
/>
```

**API Integration:**
- `GET /api/campaigns` - User campaigns
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/:id` - Update campaign
- `GET /api/campaigns/recommendations` - AI recommendations

---

## 🎨 UI Components

### Sidebar.jsx
**Purpose:** Main navigation sidebar

**Features:**
- Responsive navigation menu
- User profile display
- AI status indicator
- Sign out functionality

**Props:**
```javascript
{
  currentView: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  user: PropTypes.object,
  onSignOut: PropTypes.func.isRequired
}
```

### PostEditor.jsx
**Purpose:** Content creation and editing modal

**Features:**
- 4-tab editing interface (Post Type, AI Content, Upload Media, Hybrid Mode)
- Real-time preview
- Multi-platform optimization
- AI content generation

**Props:**
```javascript
{
  post: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
}
```

## 🔧 Utility Components

### ui/ Directory Components

#### Button Component
```javascript
// Usage
<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>

// Props
{
  variant: 'primary' | 'secondary' | 'outline' | 'ghost',
  size: 'sm' | 'md' | 'lg',
  disabled: boolean,
  loading: boolean,
  onClick: function
}
```

#### Card Component
```javascript
// Usage
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

#### Modal Component
```javascript
// Usage
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalHeader>Title</ModalHeader>
  <ModalBody>Content</ModalBody>
  <ModalFooter>Actions</ModalFooter>
</Modal>
```

## 🔄 State Management Patterns

### Local State
Components use React hooks for local state management:
- `useState` for component state
- `useEffect` for side effects
- `useCallback` for memoized functions
- `useMemo` for expensive calculations

### Global State
Application-level state is managed through:
- Context API for user authentication
- Props drilling for component communication
- Local storage for persistence

### Data Fetching
```javascript
// Standard pattern for API calls
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/endpoint')
      setData(response.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  fetchData()
}, [dependency])
```

## 🎯 Integration Guidelines

### Adding New Components
1. Create component in appropriate directory
2. Follow naming conventions (PascalCase)
3. Add PropTypes for type checking
4. Include JSDoc documentation
5. Add to this documentation

### API Integration
1. Use consistent error handling
2. Implement loading states
3. Add proper TypeScript types
4. Handle edge cases and errors

### Styling Guidelines
1. Use Tailwind CSS classes
2. Follow responsive design patterns
3. Maintain consistent spacing
4. Use design system colors

## 📚 Best Practices

### Component Design
- Keep components focused and single-purpose
- Use composition over inheritance
- Implement proper error boundaries
- Add loading and error states

### Performance
- Use React.memo for expensive components
- Implement proper key props for lists
- Lazy load heavy components
- Optimize re-renders with useCallback/useMemo

### Accessibility
- Add proper ARIA labels
- Ensure keyboard navigation
- Maintain color contrast ratios
- Test with screen readers

---

**Component documentation updated: 2024-09-15**

