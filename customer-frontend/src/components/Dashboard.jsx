import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Eye, 
  Heart, 
  DollarSign,
  Brain,
  Target,
  Sparkles,
  Play,
  BarChart3,
  MessageCircle,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Calendar,
  Settings,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Filter,
  Download,
  Globe,
  Share2,
  Bookmark,
  Star,
  Award,
  Lightbulb,
  Cpu,
  Database,
  Wifi,
  Signal,
  Layers,
  PieChart,
  LineChart,
  BarChart,
  TrendingUpIcon,
  Loader2
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Progress } from '@/components/ui/progress.jsx'

// Import UX infrastructure
import { useNotifications } from './NotificationSystem.jsx'
import { useWebSocket } from '../services/websocketService.js'
import { DashboardSkeleton } from './LoadingSkeletons.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { getBadgeClasses } from '../constants/colors.js'

// Import API hooks
import { 
  useUserUsageStats,
  useSocialProfiles,
  useUserSubscription
} from '../hooks/useApi.js'

import {
  useAnalyticsOverview,
  useContentList,
  useAIAgents
} from '../hooks/useCustomerApi.js'

const Dashboard = ({ data: fallbackData = {}, user = {}, onDataUpdate = () => {} }) => {
  const { isDarkMode } = useTheme()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('engagement')
  const [activeAgentView, setActiveAgentView] = useState('overview')

  // API hooks for real data
  const { 
    data: analyticsData, 
    isLoading: analyticsLoading, 
    error: analyticsError,
    refetch: refetchAnalytics 
  } = useAnalyticsOverview(selectedTimeRange)
  
  const { 
    data: contentData, 
    isLoading: contentLoading,
    error: contentError 
  } = useContentList({ limit: 10, status: 'published' })
  
  const { 
    data: aiAgentsData, 
    isLoading: aiLoading,
    error: aiError 
  } = useAIAgents()
  
  const { 
    data: usageStats, 
    isLoading: usageLoading 
  } = useUserUsageStats()
  
  const { 
    data: socialProfiles, 
    isLoading: socialLoading 
  } = useSocialProfiles()
  
  const { 
    data: subscription, 
    isLoading: subscriptionLoading 
  } = useUserSubscription()

  // UX infrastructure hooks
  const { success, error, info, warning } = useNotifications()
  const { isConnected, subscribe } = useWebSocket()

  // Loading state
  const isLoading = analyticsLoading || contentLoading || aiLoading || usageLoading || socialLoading || subscriptionLoading

  // Error handling
  const hasError = analyticsError || contentError || aiError

  // WebSocket real-time updates
  useEffect(() => {
    if (!isConnected) return

    // Subscribe to real-time analytics updates
    const unsubscribeAnalytics = subscribe('analyticsUpdate', (data) => {
      info('Analytics updated with latest data')
      refetchAnalytics()
    })

    // Subscribe to AI agent status updates
    const unsubscribeAgents = subscribe('agentStatus', (data) => {
      info(`AI Agent ${data.agentName} status: ${data.status}`)
    })

    // Subscribe to content updates
    const unsubscribeContent = subscribe('contentPublished', (data) => {
      success(`New content published: ${data.title}`)
    })

    // Subscribe to system notifications
    const unsubscribeNotifications = subscribe('newNotification', (notification) => {
      switch (notification.type) {
        case 'success':
          success(notification.message)
          break
        case 'error':
          error(notification.message)
          break
        case 'warning':
          warning(notification.message)
          break
        default:
          info(notification.message)
      }
    })

    return () => {
      unsubscribeAnalytics()
      unsubscribeAgents()
      unsubscribeContent()
      unsubscribeNotifications()
    }
  }, [isConnected, subscribe, success, error, info, warning, refetchAnalytics])

  // Use real API data only - no mock fallbacks
  const performanceMetrics = analyticsData?.performance || {}

  // AI Agents data with real API integration
  const aiAgents = aiAgentsData?.agents || []
  const aiAgentsSummary = aiAgentsData?.summary || {
    totalAgents: 0,
    activeAgents: 0,
    avgEfficiency: 0,
    totalTasksCompleted: 0,
    totalTasksInProgress: 0,
    systemStatus: 'unknown'
  }

  // Content data with real API integration - no fallback to mock data
  const recentContent = contentData?.content || []

  // Usage statistics - no fallback to mock data
  const tokenUsage = usageStats?.tokens || {
    tokensUsed: 0,
    tokensTotal: 0
  }

  // Social profiles count
  const connectedProfiles = socialProfiles?.length || 0

  // Subscription info
  const userSubscription = subscription || { plan: 'Premium', status: 'active' }

  // Refresh data function
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetchAnalytics()
      setLastUpdated(new Date())
      onDataUpdate({ lastRefresh: new Date() })
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && !isRefreshing) {
        handleRefresh()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isLoading, isRefreshing])

  // Format numbers for display
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num?.toString() || '0'
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  // Get trend icon and color
  const getTrendIcon = (trend) => {
    if (trend > 0) return { icon: TrendingUp, color: 'text-green-500' }
    if (trend < 0) return { icon: TrendingDown, color: 'text-red-500' }
    return { icon: Activity, color: 'text-gray-500' }
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-500'
      case 'good': return 'text-blue-500'
      case 'warning': return 'text-yellow-500'
      case 'poor': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  // Error state
  if (hasError && !fallbackData) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Error loading dashboard data. Please try refreshing the page.</span>
            </div>
            <Button 
              onClick={handleRefresh} 
              className="mt-4 bg-red-600 hover:bg-red-700"
              disabled={isRefreshing}
            >
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading skeleton while data is loading
  if (isLoading && !fallbackData) {
    return <DashboardSkeleton />
  }

  return (
    <div className={`p-6 space-y-6 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome back, {user?.name || user?.firstName || 'User'}! 👋
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Here's what's happening with your social media presence
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500' : hasError ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {isLoading ? 'Loading...' : hasError ? 'Error' : 'Live'}
            </span>
          </div>
          
          {/* Last Updated */}
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
          
          {/* Refresh Button */}
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Engagement Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} hover:shadow-lg transition-shadow`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Engagement Rate
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {performanceMetrics.engagement_rate?.value?.toFixed(1) || '0.0'}%
                    </span>
                    {performanceMetrics.engagement_rate?.trend && (
                      <div className={`flex items-center space-x-1 ${getTrendIcon(performanceMetrics.engagement_rate.trend).color}`}>
                        {React.createElement(getTrendIcon(performanceMetrics.engagement_rate.trend).icon, { className: 'h-4 w-4' })}
                        <span className="text-sm font-medium">
                          {Math.abs(performanceMetrics.engagement_rate.trend).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-full ${getStatusColor(performanceMetrics.engagement_rate?.status)} bg-opacity-10`}>
                  <Heart className={`h-6 w-6 ${getStatusColor(performanceMetrics.engagement_rate?.status)}`} />
                </div>
              </div>
              {performanceMetrics.engagement_rate?.target && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                      Target: {performanceMetrics.engagement_rate.target}%
                    </span>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                      {((performanceMetrics.engagement_rate.value / performanceMetrics.engagement_rate.target) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={(performanceMetrics.engagement_rate.value / performanceMetrics.engagement_rate.target) * 100} 
                    className="h-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Reach */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} hover:shadow-lg transition-shadow`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Total Reach
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(performanceMetrics.reach?.value || 0)}
                    </span>
                    {performanceMetrics.reach?.trend && (
                      <div className={`flex items-center space-x-1 ${getTrendIcon(performanceMetrics.reach.trend).color}`}>
                        {React.createElement(getTrendIcon(performanceMetrics.reach.trend).icon, { className: 'h-4 w-4' })}
                        <span className="text-sm font-medium">
                          {Math.abs(performanceMetrics.reach.trend).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-full ${getStatusColor(performanceMetrics.reach?.status)} bg-opacity-10`}>
                  <Eye className={`h-6 w-6 ${getStatusColor(performanceMetrics.reach?.status)}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Followers Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} hover:shadow-lg transition-shadow`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    New Followers
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      +{formatNumber(performanceMetrics.followers_growth?.value || 0)}
                    </span>
                    {performanceMetrics.followers_growth?.trend && (
                      <div className={`flex items-center space-x-1 ${getTrendIcon(performanceMetrics.followers_growth.trend).color}`}>
                        {React.createElement(getTrendIcon(performanceMetrics.followers_growth.trend).icon, { className: 'h-4 w-4' })}
                        <span className="text-sm font-medium">
                          {Math.abs(performanceMetrics.followers_growth.trend).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-full ${getStatusColor(performanceMetrics.followers_growth?.status)} bg-opacity-10`}>
                  <Users className={`h-6 w-6 ${getStatusColor(performanceMetrics.followers_growth?.status)}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} hover:shadow-lg transition-shadow`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Revenue
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(performanceMetrics.revenue?.value || 0)}
                    </span>
                    {performanceMetrics.revenue?.trend && (
                      <div className={`flex items-center space-x-1 ${getTrendIcon(performanceMetrics.revenue.trend).color}`}>
                        {React.createElement(getTrendIcon(performanceMetrics.revenue.trend).icon, { className: 'h-4 w-4' })}
                        <span className="text-sm font-medium">
                          {Math.abs(performanceMetrics.revenue.trend).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-full ${getStatusColor(performanceMetrics.revenue?.status)} bg-opacity-10`}>
                  <DollarSign className={`h-6 w-6 ${getStatusColor(performanceMetrics.revenue?.status)}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Agents Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Brain className="h-5 w-5" />
                  <span>AI Agents Status</span>
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                </CardTitle>
                <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Your AI workforce is actively optimizing your social media presence
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {aiAgents.filter(agent => agent.status === 'active').length} Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {aiAgents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  } transition-colors cursor-pointer`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${agent.color}`}>
                      <agent.icon className="h-4 w-4 text-white" />
                    </div>
                    <Badge 
                      variant={agent.status === 'active' ? 'default' : 'secondary'}
                      className={agent.status === 'active' ? 'bg-green-500' : ''}
                    >
                      {agent.status}
                    </Badge>
                  </div>
                  
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {agent.name}
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Efficiency
                      </span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {agent.efficiency}%
                      </span>
                    </div>
                    <Progress value={agent.efficiency} className="h-2" />
                    
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {agent.currentTask}
                    </p>
                    
                    <div className="flex justify-between text-xs">
                      <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                        {agent.tasksCompleted} completed
                      </span>
                      <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                        {agent.tasksInProgress} in progress
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Usage & Subscription Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Cpu className="h-5 w-5" />
                <span>AI Token Usage</span>
              </CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Your current AI usage this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatNumber(tokenUsage.tokensUsed)}
                  </span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    of {formatNumber(tokenUsage.tokensTotal)} tokens
                  </span>
                </div>
                <Progress 
                  value={(tokenUsage.tokensUsed / tokenUsage.tokensTotal) * 100} 
                  className="h-3"
                />
                <div className="flex justify-between text-sm">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {((tokenUsage.tokensUsed / tokenUsage.tokensTotal) * 100).toFixed(1)}% used
                  </span>
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {formatNumber(tokenUsage.tokensTotal - tokenUsage.tokensUsed)} remaining
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Connected Accounts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Globe className="h-5 w-5" />
                <span>Connected Accounts</span>
              </CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Social media platforms you're managing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {connectedProfiles}
                  </span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    platforms connected
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Subscription: {userSubscription.plan}
                  </span>
                  <Badge 
                    variant={userSubscription.status === 'active' ? 'default' : 'secondary'}
                    className={userSubscription.status === 'active' ? 'bg-green-500' : ''}
                  >
                    {userSubscription.status}
                  </Badge>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {/* Navigate to social profiles */}}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Connect More Accounts
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <CardHeader>
            <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Quick Actions
            </CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Common tasks to boost your social media performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Sparkles className="h-6 w-6" />
                <span>Generate Content</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Calendar className="h-6 w-6" />
                <span>Schedule Posts</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <BarChart3 className="h-6 w-6" />
                <span>View Analytics</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Settings className="h-6 w-6" />
                <span>Manage Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default Dashboard
