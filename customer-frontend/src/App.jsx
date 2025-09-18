import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  Brain, 
  Calendar, 
  Target, 
  Zap, 
  History, 
  TrendingUp, 
  TestTube, 
  DollarSign,
  User,
  Settings as SettingsIcon,
  Sparkles,
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react'

// Import providers
import { ThemeProvider, useTheme } from './contexts/ThemeContext.jsx'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { QueryProvider } from './providers/QueryProvider.jsx'

// Import UX infrastructure
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { NotificationProvider } from './components/NotificationSystem.jsx'

// Import components
import Dashboard from './components/Dashboard.jsx'
import { DashboardSkeleton } from './components/LoadingSkeletons.jsx'
import StrategyPlanner from './components/StrategyPlanner.jsx'
import EnhancedContentCalendar from './components/EnhancedContentCalendar.jsx'
import CampaignManager from './components/CampaignManager.jsx'
import BoostManager from './components/BoostManager.jsx'
import PostHistory from './components/PostHistory.jsx'
import Analytics from './components/PerformanceAnalytics.jsx'
import ABTestingFramework from './components/ABTestingFramework.jsx'
import EnhancedCostOptimizer from './components/EnhancedCostOptimizer.jsx'
import Settings from './components/Settings.jsx'
import Sidebar from './components/Sidebar.jsx'

// Import UI components
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'

// Import authentication components
import SignIn from './components/auth/SignIn.jsx'
import SignUp from './components/auth/SignUp.jsx'

// Import enhanced profile component
import ProfileDemo from './ProfileDemo.jsx'

// Import API hooks
import { useSystemHealth } from './hooks/useApi.js'

import './App.css'

// Loading Component
const LoadingSpinner = ({ message = "Loading..." }) => {
  const { isDarkMode } = useTheme()
  
  return (
    <div className={`flex items-center justify-center min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-white'
    }`}>
      <div className="text-center">
        <Loader2 className={`h-8 w-8 animate-spin mx-auto mb-4 ${
          isDarkMode ? 'text-blue-400' : 'text-blue-600'
        }`} />
        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{message}</p>
      </div>
    </div>
  )
}

// Connection Status Component
const ConnectionStatus = () => {
  const { isDarkMode } = useTheme()
  const { data: healthData, isError, isLoading } = useSystemHealth()
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const isConnected = isOnline && !isError && healthData?.status === 'OK'

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed top-4 right-4 z-50"
    >
      <Card className={`border-0 shadow-lg ${
        isConnected 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
      }`}>
        <CardContent className="p-2">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4" />
            )}
            <span className="text-xs font-medium">
              {isLoading ? 'Connecting...' : isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg m-4">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-800">Component Error</h2>
          </div>
          <p className="text-red-600 mb-4">This component failed to load. Please try refreshing the page.</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Refresh Page
          </Button>
          <details className="mt-4">
            <summary className="text-sm text-red-500 cursor-pointer">Error Details</summary>
            <pre className="text-xs text-red-400 mt-1 p-2 bg-red-100 rounded overflow-auto">
              {this.state.error?.toString()}
            </pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}

// Authentication Wrapper Component
const AuthWrapper = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const [authView, setAuthView] = useState('signin')

  if (isLoading) {
    return <LoadingSpinner message="Initializing AI Social Media Manager..." />
  }

  if (!isAuthenticated) {
    if (authView === 'signin') {
      return (
        <ErrorBoundary>
          <SignIn 
            onSwitchToSignUp={() => setAuthView('signup')}
          />
        </ErrorBoundary>
      )
    } else {
      return (
        <ErrorBoundary>
          <SignUp 
            onSwitchToSignIn={() => setAuthView('signin')}
          />
        </ErrorBoundary>
      )
    }
  }

  return children
}

// Main App Content Component
function AppContent() {
  const { isDarkMode } = useTheme()
  const { user, logout } = useAuth()
  const [currentView, setCurrentView] = useState('dashboard')

  // Simulated real-time data (will be replaced with real API data)
  const [dashboardData, setDashboardData] = useState({
    performance: {
      engagement_rate: 4.2,
      reach: 12500,
      followers_growth: 156,
      posts_published: 24
    },
    campaigns: {
      active: 3,
      pending: 2,
      completed: 8,
      total_spend: 2450
    },
    content: {
      scheduled: 12,
      drafts: 8,
      published: 156,
      archived: 23
    },
    ai_insights: {
      optimization_score: 87,
      content_suggestions: 15,
      best_posting_times: ['9:00 AM', '1:00 PM', '6:00 PM'],
      trending_hashtags: ['#AI', '#SocialMedia', '#Marketing', '#Growth']
    },
    cost_analysis: {
      monthly_budget: 5000,
      spent: 2450,
      remaining: 2550,
      cost_per_engagement: 0.45,
      roi: 3.2
    },
    ab_tests: {
      active: 2,
      completed: 5,
      winning_variants: 3,
      improvement_rate: 23.5
    },
    boost_campaigns: {
      active: 4,
      total_boosted: 18,
      avg_performance_lift: 34,
      total_reach_increase: 45000
    },
    tokens: {
      tokensUsed: 2100,
      tokensTotal: 3000
    }
  })

  // Update data periodically to simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDashboardData(prev => ({
        ...prev,
        performance: {
          ...prev.performance,
          engagement_rate: Math.max(0, prev.performance.engagement_rate + (Math.random() - 0.5) * 0.2),
          reach: Math.max(0, prev.performance.reach + Math.floor((Math.random() - 0.5) * 100)),
          followers_growth: Math.max(0, prev.performance.followers_growth + Math.floor(Math.random() * 3))
        }
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleSignOut = async () => {
    try {
      await logout()
      setCurrentView('dashboard')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'strategy', label: 'AI Strategy', icon: Brain },
    { id: 'calendar', label: 'Content Calendar', icon: Calendar },
    { id: 'campaigns', label: 'Campaign Manager', icon: Target },
    { id: 'boost', label: 'Boost Manager', icon: Zap },
    { id: 'history', label: 'Post History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'testing', label: 'A/B Testing', icon: TestTube },
    { id: 'optimizer', label: 'Cost Optimizer', icon: DollarSign },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ]

  const renderCurrentView = () => {
    const viewProps = {
      data: dashboardData,
      user: user,
      onDataUpdate: setDashboardData
    }

    switch (currentView) {
      case 'strategy':
        return (
          <ErrorBoundary>
            <StrategyPlanner {...viewProps} />
          </ErrorBoundary>
        )
      case 'calendar':
        return (
          <ErrorBoundary>
            <EnhancedContentCalendar {...viewProps} />
          </ErrorBoundary>
        )
      case 'campaigns':
        return (
          <ErrorBoundary>
            <CampaignManager {...viewProps} />
          </ErrorBoundary>
        )
      case 'boost':
        return (
          <ErrorBoundary>
            <BoostManager {...viewProps} />
          </ErrorBoundary>
        )
      case 'history':
        return (
          <ErrorBoundary>
            <PostHistory {...viewProps} />
          </ErrorBoundary>
        )
      case 'analytics':
        return (
          <ErrorBoundary>
            <Analytics {...viewProps} />
          </ErrorBoundary>
        )
      case 'testing':
        return (
          <ErrorBoundary>
            <ABTestingFramework {...viewProps} />
          </ErrorBoundary>
        )
      case 'optimizer':
        return (
          <ErrorBoundary>
            <EnhancedCostOptimizer {...viewProps} />
          </ErrorBoundary>
        )
      case 'profile':
        return (
          <ErrorBoundary>
            <ProfileDemo />
          </ErrorBoundary>
        )
      case 'settings':
        return (
          <ErrorBoundary>
            <Settings {...viewProps} />
          </ErrorBoundary>
        )
      default:
        return (
          <ErrorBoundary>
            <Dashboard {...viewProps} />
          </ErrorBoundary>
        )
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-white'
    }`}>
      {/* Connection Status Indicator */}
      <ConnectionStatus />

      <div className="flex h-screen">
        {/* Sidebar */}
        <ErrorBoundary>
          <Sidebar 
            navigation={navigation}
            currentView={currentView}
            onViewChange={setCurrentView}
            user={user}
            onSignOut={handleSignOut}
            isDarkMode={isDarkMode}
          />
        </ErrorBoundary>

        {/* Enhanced Main Content Area */}
        <main className="flex-1 overflow-hidden relative">
          <div className={`h-full overflow-y-auto scrollbar-thin transition-colors duration-300 ${
            isDarkMode 
              ? 'scrollbar-thumb-slate-600 scrollbar-track-slate-800 hover:scrollbar-thumb-slate-500' 
              : 'scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400'
          }`}>
            <div className="min-h-full pb-20"> {/* Bottom padding to prevent content hiding behind bottom widget */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="h-full"
                >
                  {renderCurrentView()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      {/* Enhanced AI Status Indicator - Moved to bottom right for better UX */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="fixed bottom-6 right-6 z-50 pointer-events-none"
      >
        <Card className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white border-0 shadow-xl backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-5 w-5" />
              </motion.div>
              <div>
                <p className="text-sm font-semibold">AI Active</p>
                <p className="text-xs opacity-90">Optimizing performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// Main App Component with all providers
function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <AuthWrapper>
                <AppContent />
              </AuthWrapper>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  )
}

export default App
