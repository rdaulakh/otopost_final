import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'

// Import components
import AdminSidebar from './components/AdminSidebar.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import UserManagement from './components/UserManagement.jsx'
import SubscriptionManagement from './components/SubscriptionManagement.jsx'
import RevenueDashboard from './components/RevenueDashboard.jsx'
import SystemHealth from './components/SystemHealth.jsx'
import SupportCenter from './components/SupportCenter.jsx'
import ComplianceSecurity from './components/ComplianceSecurity.jsx'
import AdvancedAnalytics from './components/AdvancedAnalytics.jsx'
import PlatformConfiguration from './components/PlatformConfiguration.jsx'
import CustomerSuccess from './components/CustomerSuccess.jsx';
import NotificationCenter from './components/NotificationCenter.jsx'
import MultiTenantManagement from './components/MultiTenantManagement.jsx'
import { NotificationProvider, useNotifications } from './components/NotificationSystem.jsx'

// Import UI components
import { Card, CardContent } from '@/components/ui/card.jsx'

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

// Loading Component
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
)

// Notification Display Component
const NotificationDisplay = ({ isDarkMode }) => {
  const { notifications, removeNotification } = useNotifications()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`p-4 rounded-lg shadow-lg border backdrop-blur-sm ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : notification.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : notification.type === 'warning'
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          } ${isDarkMode ? 'bg-opacity-90' : ''}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      ))}
    </div>
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
          <h2 className="text-lg font-semibold text-red-800 mb-2">Component Error</h2>
          <p className="text-red-600 mb-4">This component failed to load. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Refresh Page
          </button>
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

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  
  // Admin user data
  const [adminUser, setAdminUser] = useState({
    name: 'Admin User',
    email: 'admin@aisocialmedia.com',
    role: 'Super Administrator',
    permissions: ['all'],
    avatar: '/api/placeholder/40/40'
  })

  // Platform statistics for sidebar
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 2847,
    activeUsers: 1923,
    activeSubscriptions: 2157,
    monthlyRevenue: 12340,
    systemAlerts: 2,
    openTickets: 23,
    uptime: '99.97%'
  })

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('admin-theme')
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  // Simulated admin data
  const [adminData, setAdminData] = useState({
    platform: {
      totalUsers: 2847,
      activeUsers: 1923,
      newUsersToday: 47,
      totalRevenue: 89420,
      monthlyRevenue: 12340,
      revenueGrowth: 23.5,
      systemUptime: 99.97,
      apiCalls: 1247893,
      aiAgentTasks: 45672,
      storageUsed: 78.3
    },
    users: {
      total: 2847,
      active: 1923,
      trial: 234,
      premium: 892,
      pro: 567,
      starter: 464,
      churnRate: 2.3,
      avgSessionTime: '24m 32s'
    },
    revenue: {
      total: 89420,
      monthly: 12340,
      growth: 23.5,
      mrr: 12340,
      arr: 148080,
      ltv: 2450,
      churn: 2.3
    },
    system: {
      uptime: 99.97,
      apiHealth: 'operational',
      dbHealth: 'operational',
      aiAgentsStatus: 'active',
      alerts: 2,
      criticalIssues: 0,
      avgResponseTime: '145ms'
    }
  })

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem('admin-theme', newTheme ? 'dark' : 'light')
  }

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const savedAuth = localStorage.getItem('adminAuthenticated')
        const savedUser = localStorage.getItem('adminUser')
        
        if (savedAuth === 'true' && savedUser) {
          setIsAuthenticated(true)
          setAdminUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Update data periodically to simulate real-time updates
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      setAdminData(prev => ({
        ...prev,
        platform: {
          ...prev.platform,
          activeUsers: Math.max(0, prev.platform.activeUsers + Math.floor((Math.random() - 0.5) * 10)),
          apiCalls: prev.platform.apiCalls + Math.floor(Math.random() * 100),
          aiAgentTasks: prev.platform.aiAgentTasks + Math.floor(Math.random() * 50)
        }
      }))
      
      setPlatformStats(prev => ({
        ...prev,
        activeUsers: Math.max(0, prev.activeUsers + Math.floor((Math.random() - 0.5) * 5))
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [isAuthenticated])

  const handleAdminSignIn = async (credentials) => {
    setIsAuthenticating(true)
    try {
      // Try to authenticate with the backend API first
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/auth/admin/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials)
        })
        
        if (response.ok) {
          const data = await response.json()
          const adminUserData = {
            name: data.data.admin.firstName + ' ' + data.data.admin.lastName,
            email: data.data.admin.email,
            role: data.data.admin.role,
            permissions: data.data.admin.permissions || ['all']
          }
          
          setAdminUser(adminUserData)
          setIsAuthenticated(true)
          localStorage.setItem('adminAuthenticated', 'true')
          localStorage.setItem('adminUser', JSON.stringify(adminUserData))
          localStorage.setItem('admin_token', data.data.tokens.accessToken)
          return
        }
      } catch (apiError) {
        console.error('API authentication failed:', apiError)
        throw new Error('Failed to connect to authentication server. Please check if the backend is running.')
      }
    } catch (error) {
      console.error('Admin sign in error:', error)
      alert(`Authentication failed: ${error.message}`)
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleSignOut = () => {
    setIsAuthenticated(false)
    setAdminUser({})
    localStorage.removeItem('adminAuthenticated')
    localStorage.removeItem('adminUser')
    setCurrentView('dashboard')
  }

  // Show loading spinner during initial load
  if (isLoading) {
    return <LoadingSpinner message="Initializing Super Admin Dashboard..." />
  }

  // Show authentication loading
  if (isAuthenticating) {
    return <LoadingSpinner message="Authenticating admin access..." />
  }

  // If not authenticated, show admin login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-white font-bold">SA</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Super Admin Access</h1>
              <p className="text-gray-600 mt-2">Sign in to manage the AI Social Media platform</p>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              handleAdminSignIn({
                email: formData.get('email'),
                password: formData.get('password')
              })
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="admin@aisocialmedia.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Enter admin password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all font-medium"
                >
                  Sign In to Admin Panel
                </button>
              </div>
            </form>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                Demo Credentials:<br />
                Email: admin@aisocialmedia.com<br />
                Password: admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderCurrentView = () => {
    const viewProps = {
      data: adminData,
      onDataUpdate: setAdminData,
      isDarkMode: isDarkMode
    }

    switch (currentView) {
      case 'users':
        return (
          <ErrorBoundary>
            <UserManagement {...viewProps} />
          </ErrorBoundary>
        )
      case 'subscriptions':
        return (
          <ErrorBoundary>
            <SubscriptionManagement {...viewProps} />
          </ErrorBoundary>
        )
      case 'analytics':
        return (
          <ErrorBoundary>
            <AdvancedAnalytics {...viewProps} />
          </ErrorBoundary>
        )
      case 'revenue':
        return (
          <ErrorBoundary>
            <RevenueDashboard {...viewProps} />
          </ErrorBoundary>
        )
      case 'system':
        return (
          <ErrorBoundary>
            <SystemHealth {...viewProps} />
          </ErrorBoundary>
        )
      case 'support':
        return (
          <ErrorBoundary>
            <SupportCenter {...viewProps} />
          </ErrorBoundary>
        )
      case 'compliance':
        return (
          <ErrorBoundary>
            <ComplianceSecurity {...viewProps} />
          </ErrorBoundary>
        )
      case 'configuration':
        return (
          <ErrorBoundary>
            <PlatformConfiguration {...viewProps} />
          </ErrorBoundary>
        )
      case 'customer-success':
        return (
          <ErrorBoundary>
            <CustomerSuccess {...viewProps} />
          </ErrorBoundary>
        )
        
      case 'notifications':
        return (
          <ErrorBoundary>
            <NotificationCenter {...viewProps} />
          </ErrorBoundary>
        )
      case 'multi-tenant':
        return (
          <ErrorBoundary>
            <MultiTenantManagement {...viewProps} />
          </ErrorBoundary>
        )
      case 'settings':
        return (
          <ErrorBoundary>
            <div className="p-6">
              <h1 className="text-2xl font-bold">Admin Settings</h1>
              <p className="text-gray-600">Coming soon...</p>
            </div>
          </ErrorBoundary>
        )
      default:
        return (
          <ErrorBoundary>
            <AdminDashboard {...viewProps} />
          </ErrorBoundary>
        )
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <div className={`min-h-screen transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
            : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
        }`}>
          <div className="flex h-screen">
            {/* Admin Sidebar */}
            <ErrorBoundary>
              <AdminSidebar 
                currentView={currentView}
                onViewChange={setCurrentView}
                adminUser={adminUser}
                onSignOut={handleSignOut}
                platformStats={platformStats}
                isDarkMode={isDarkMode}
                onToggleTheme={toggleTheme}
              />
            </ErrorBoundary>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative">
              <div className={`h-full overflow-y-auto scrollbar-thin ${
                isDarkMode 
                  ? 'scrollbar-thumb-slate-600 scrollbar-track-slate-800 hover:scrollbar-thumb-slate-500' 
                  : 'scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400'
              }`}>
                <div className="min-h-full pb-20">
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

          {/* Notification Display */}
          <NotificationDisplay isDarkMode={isDarkMode} />

          {/* Admin Status Indicator */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="fixed bottom-6 right-6 z-50 pointer-events-none"
          >
            <Card className="bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600 text-white border-0 shadow-xl backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-600">SA</span>
                    </div>
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold">Super Admin Active</p>
                    <p className="text-xs opacity-90">Platform monitoring</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </NotificationProvider>
    </QueryClientProvider>
  )
}

export default App
