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
  Sparkles
} from 'lucide-react'

// Import components
import Dashboard from './components/Dashboard.jsx'
import StrategyPlanner from './components/StrategyPlanner.jsx'
import EnhancedContentCalendar from './components/EnhancedContentCalendar.jsx'
import CampaignManager from './components/CampaignManager.jsx'
import BoostManager from './components/BoostManager.jsx'
import PostHistory from './components/PostHistory.jsx'
import Analytics from './components/Analytics.jsx'
import ABTestingFramework from './components/ABTestingFramework.jsx'
import EnhancedCostOptimizer from './components/EnhancedCostOptimizer.jsx'
import Settings from './components/Settings.jsx'
import Sidebar from './components/Sidebar.jsx'

// Import UI components
import { Card, CardContent } from '@/components/ui/card.jsx'

// Import authentication components
import SignIn from './components/auth/SignIn.jsx'
import SignUp from './components/auth/SignUp.jsx'

// Import enhanced profile component
import ProfileDemo from './ProfileDemo.jsx'

import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authView, setAuthView] = useState('signin') // 'signin' or 'signup'
  const [user, setUser] = useState({
    name: 'Sarah Johnson',
    email: 'sarah@techstart.com',
    company: 'TechStart Solutions',
    industry: 'SaaS',
    subscription: 'Premium',
    avatar: '/api/placeholder/40/40'
  })

  // Simulated real-time data
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

  // Check for existing authentication on app load
  useEffect(() => {
    const savedAuth = localStorage.getItem('isAuthenticated')
    const savedUser = localStorage.getItem('user')
    
    if (savedAuth === 'true' && savedUser) {
      setIsAuthenticated(true)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  // Update data periodically to simulate real-time updates
  useEffect(() => {
    if (!isAuthenticated) return // Only run when authenticated

    const interval = setInterval(() => {
      setDashboardData(prev => ({
        ...prev,
        performance: {
          ...prev.performance,
          engagement_rate: prev.performance.engagement_rate + (Math.random() - 0.5) * 0.2,
          reach: prev.performance.reach + Math.floor((Math.random() - 0.5) * 100),
          followers_growth: prev.performance.followers_growth + Math.floor(Math.random() * 3)
        }
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [isAuthenticated])

  const handleSignIn = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleSignUp = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleSignOut = () => {
    setIsAuthenticated(false)
    setUser({})
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
    setCurrentView('dashboard')
  }

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  // If not authenticated, show auth screens
  if (!isAuthenticated) {
    if (authView === 'signin') {
      return (
        <SignIn 
          onSignIn={handleSignIn}
          onSwitchToSignUp={() => setAuthView('signup')}
        />
      )
    } else {
      return (
        <SignUp 
          onSignUp={handleSignUp}
          onSwitchToSignIn={() => setAuthView('signin')}
        />
      )
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
        return <StrategyPlanner {...viewProps} />
      case 'calendar':
        return <EnhancedContentCalendar {...viewProps} />
      case 'campaigns':
        return <CampaignManager {...viewProps} />
      case 'boost':
        return <BoostManager {...viewProps} />
      case 'history':
        return <PostHistory {...viewProps} />
      case 'analytics':
        return <Analytics {...viewProps} />
      case 'testing':
        return <ABTestingFramework {...viewProps} />
      case 'optimizer':
        return <EnhancedCostOptimizer {...viewProps} />
      case 'profile':
        return <ProfileDemo />
      case 'settings':
        return <Settings {...viewProps} />
      default:
        return <Dashboard {...viewProps} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar 
          navigation={navigation}
          currentView={currentView}
          onViewChange={setCurrentView}
          user={user}
          onSignOut={handleSignOut}
        />

        {/* Enhanced Main Content Area */}
        <main className="flex-1 overflow-hidden relative">
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
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

export default App

