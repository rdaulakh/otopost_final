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
import CompetitorAnalysis from './components/CompetitorAnalysis.jsx'

// Import UI components
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'

// Import authentication components
import SignIn from './components/auth/SignIn.jsx'
import SignUp from './components/auth/SignUp.jsx'

// Import enhanced profile component
import UserProfile from './components/UserProfileSimple.jsx'
import AuthTest from './components/AuthTest.jsx'

// Import API hooks
import { useSystemHealth } from './hooks/useApi.js'

import './App.css'

// Loading Component
const LoadingSpinner = ({ message = "" }) => {
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


// Error Boundary Component


// Authentication Wrapper Component
const AuthWrapper = ({ children }) => {
  const { isAuthenticated, isLoading, user, token } = useAuth()
  const [authView, setAuthView] = useState('signin')

  // Debug logging to see what's happening
  console.log('AuthWrapper state:', { 
    isAuthenticated, 
    isLoading, 
    hasUser: !!user, 
    hasToken: !!token,
    user: user ? { id: user.id, email: user.email } : null,
    localStorageToken: !!localStorage.getItem('authToken'),
    localStorageUser: !!localStorage.getItem('user')
  })

  if (isLoading) {
    return <LoadingSpinner message="Initializing AI Social Media Manager..." />
  }

  // Temporarily disable redirect to debug the issue
  // if (!isAuthenticated) {
  //   if (authView === 'signin') {
  //     return (
  //       <ErrorBoundary>
  //         <SignIn 
  //           onSwitchToSignUp={() => setAuthView('signup')}
  //         />
  //       </ErrorBoundary>
  //     )
  //   } else {
  //     return (
  //       <ErrorBoundary>
  //         <SignUp 
  //           onSwitchToSignIn={() => setAuthView('signin')}
  //         />
  //       </ErrorBoundary>
  //     )
  //   }
  // }

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
  
  // Connection status logic
  const { data: healthData, isError, isLoading } = useSystemHealth({ enabled: !!user })
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const isConnected = isOnline && !isError && healthData?.success === true

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

  // Handle URL parameters to set the current view
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const view = urlParams.get('view') || urlParams.get('tab')
    
    console.log('App.jsx URL Debug:', {
      pathname: window.location.pathname,
      search: window.location.search,
      tab: urlParams.get('tab'),
      oauthSuccess: urlParams.get('oauth_success'),
      platform: urlParams.get('platform'),
      currentView: currentView
    });
    
    // If the URL contains settings-related parameters, set view to settings
    if (window.location.pathname.includes('/settings') || 
        urlParams.get('tab') === 'platforms' || 
        urlParams.get('tab') === 'business' ||
        urlParams.get('tab') === 'branding' ||
        urlParams.get('tab') === 'billing' ||
        urlParams.get('oauth_success') === 'true') {
      console.log('Setting currentView to settings');
      setCurrentView('settings')
    } else if (view && ['dashboard', 'strategy', 'calendar', 'campaigns', 'boost', 'history', 'analytics', 'testing', 'optimizer', 'profile', 'competitor-analysis', 'settings'].includes(view)) {
      console.log('Setting currentView to:', view);
      setCurrentView(view)
    }
  }, [])

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
          engagement_rate: Math.max(0, (prev.performance?.engagement_rate || 4.2) + (Math.random() - 0.5) * 0.2),
          reach: Math.max(0, (prev.performance?.reach || 12500) + Math.floor((Math.random() - 0.5) * 100)),
          followers_growth: Math.max(0, (prev.performance?.followers_growth || 156) + Math.floor(Math.random() * 3)),
          posts_published: prev.performance?.posts_published || 24
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
    { id: 'competitor-analysis', label: 'Competitor Analysis', icon: Target },
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
            <UserProfile />
          </ErrorBoundary>
        )
      case 'competitor-analysis':
        return (
          <ErrorBoundary>
            <CompetitorAnalysis {...viewProps} />
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

      {/* AI Status Indicator with Connection Status */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="fixed bottom-6 right-6 z-50 pointer-events-none"
      >
        <Card className={`bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white border-0 shadow-xl backdrop-blur-sm `}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: isConnected ? 360 : 0 }}
                transition={{ duration: 3, repeat: isConnected ? Infinity : 0, ease: "linear" }}
              >
                {isConnected ? (
                  <Sparkles className="h-5 w-5" />
                ) : (
                  <WifiOff className="h-5 w-5" />
                )}
              </motion.div>
              <div>
                <p className="text-sm font-semibold">
                  {isLoading ? 'Connecting...' : isConnected ? 'AI Active' : 'AI Disconnected'}
                </p>
                <p className="text-xs opacity-90">
                  {isLoading ? 'Establishing connection...' : isConnected ? 'Optimizing performance' : 'Connection lost'}
                </p>
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
