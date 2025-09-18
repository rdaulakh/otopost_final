import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  UserPlus,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Globe,
  Zap,
  Database,
  Cpu,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  MessageSquare,
  Shield
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
// Import API hooks and UX components
import { 
  useAdminDashboard,
  useSystemHealth,
  useUserAnalytics,
  useRevenueAnalytics,
  usePlatformStats,
  useAdminAlerts
} from '../hooks/useAdminApi.js'
import { useNotifications } from './NotificationSystem.jsx'
import { DashboardSkeleton } from './LoadingSkeletons.jsx'

const AdminDashboard = ({ data = {}, onDataUpdate = () => {}, isDarkMode = false }) => {
  // UX hooks
  const { success, error, info } = useNotifications()

  // Component state
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Real API calls for admin dashboard data
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard 
  } = useAdminDashboard({ timeRange: selectedTimeRange })
  
  const { 
    data: systemHealth, 
    isLoading: systemLoading 
  } = useSystemHealth()
  
  const { 
    data: userAnalytics, 
    isLoading: userLoading 
  } = useUserAnalytics({ timeRange: selectedTimeRange })
  
  const { 
    data: revenueAnalytics, 
    isLoading: revenueLoading 
  } = useRevenueAnalytics({ timeRange: selectedTimeRange })
  
  const { 
    data: platformStats, 
    isLoading: platformLoading 
  } = usePlatformStats()
  
  const { 
    data: adminAlerts, 
    isLoading: alertsLoading 
  } = useAdminAlerts()

  // Loading state
  const isLoading = dashboardLoading || systemLoading || userLoading || revenueLoading || platformLoading || alertsLoading

  // Error handling
  const hasError = dashboardError

  // Fallback mock data for development/demo purposes
  const fallbackAdminData = {
    platform: {
      totalUsers: 0,
      activeUsers: 0,
      newUsersToday: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      revenueGrowth: 0,
      systemUptime: 0,
      apiCalls: 0,
      aiAgentTasks: 0,
      storageUsed: 0
    },
    users: {
      total: 0,
      active: 0,
      trial: 0,
      premium: 0,
      pro: 0,
      starter: 0,
      churnRate: 0,
      avgSessionTime: '0m 0s'
    },
    revenue: {
      total: 0,
      monthly: 0,
      growth: 0,
      mrr: 0,
      arr: 0,
      ltv: 0,
      churn: 0
    },
    system: {
      uptime: 0,
      apiHealth: 'unknown',
      dbHealth: 'unknown',
      aiAgentsStatus: 'unknown',
      alerts: 0,
      criticalIssues: 0,
      avgResponseTime: '0ms'
    },
    support: {
      openTickets: 0,
      resolvedToday: 0,
      avgResolutionTime: '0m',
      satisfaction: 0
    }
  }

  // Use real API data with fallback to mock data
  const adminData = {
    platform: dashboardData?.platform || fallbackAdminData.platform,
    users: userAnalytics?.users || fallbackAdminData.users,
    revenue: revenueAnalytics?.revenue || fallbackAdminData.revenue,
    system: systemHealth?.system || fallbackAdminData.system,
    support: dashboardData?.support || fallbackAdminData.support
  }

  const revenueData = revenueAnalytics?.monthlyTrend || []
  const userGrowthData = userAnalytics?.growthTrend || []
  const subscriptionData = userAnalytics?.subscriptionDistribution || []

  // Handle dashboard operations
  const handleRefreshDashboard = async () => {
    try {
      info('Refreshing dashboard data...')
      await refetchDashboard()
      setLastUpdated(new Date())
      success('Dashboard data refreshed successfully')
      if (onDataUpdate) {
        onDataUpdate({ lastRefresh: new Date() })
      }
    } catch (err) {
      error('Failed to refresh dashboard data')
    }
  }

  const handleTimeRangeChange = (newTimeRange) => {
    setSelectedTimeRange(newTimeRange)
    info(`Updating data for ${newTimeRange} time range`)
  }

  // Show loading skeleton
  if (isLoading && !fallbackAdminData) {
    return <DashboardSkeleton />
  }

  // Show error state
  if (hasError && !fallbackAdminData) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Error loading dashboard data. Please try refreshing.</span>
            </div>
            <Button 
              onClick={handleRefreshDashboard} 
              className="mt-4 bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Retry'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const loadDashboardDataOld = async () => {
    try {
      // This is the old mock implementation - keeping for reference

      // Process system dashboard data
      if (systemDashboard.status === 'fulfilled') {
        const dashboardData = systemDashboard.value
        setAdminData(prev => ({
          ...prev,
          platform: {
            totalUsers: dashboardData.totalUsers || 0,
            activeUsers: dashboardData.activeUsers || 0,
            newUsersToday: dashboardData.newUsersToday || 0,
            totalRevenue: dashboardData.totalRevenue || 0,
            monthlyRevenue: dashboardData.monthlyRevenue || 0,
            revenueGrowth: dashboardData.revenueGrowth || 0,
            systemUptime: dashboardData.systemUptime || 0,
            apiCalls: dashboardData.apiCalls || 0,
            aiAgentTasks: dashboardData.aiAgentTasks || 0,
            storageUsed: dashboardData.storageUsed || 0
          }
        }))
      }

      // Process platform usage data
      if (platformUsage.status === 'fulfilled') {
        const usageData = platformUsage.value
        setUserGrowthData(usageData.userGrowth || [])
        setSubscriptionData(usageData.subscriptionDistribution || [])
      }

      // Process revenue analytics
      if (revenueAnalytics.status === 'fulfilled') {
        const revenueData = revenueAnalytics.value
        setRevenueData(revenueData.monthlyTrend || [])
        setAdminData(prev => ({
          ...prev,
          revenue: {
            total: revenueData.totalRevenue || 0,
            monthly: revenueData.monthlyRevenue || 0,
            growth: revenueData.revenueGrowth || 0,
            mrr: revenueData.mrr || 0,
            arr: revenueData.arr || 0,
            ltv: revenueData.ltv || 0,
            churn: revenueData.churnRate || 0
          }
        }))
      }

      // Process user stats
      if (userStats.status === 'fulfilled') {
        const userData = userStats.value
        setAdminData(prev => ({
          ...prev,
          users: {
            total: userData.total || 0,
            active: userData.active || 0,
            trial: userData.trial || 0,
            premium: userData.premium || 0,
            pro: userData.pro || 0,
            starter: userData.starter || 0,
            churnRate: userData.churnRate || 0,
            avgSessionTime: userData.avgSessionTime || '0m 0s'
          }
        }))
      }

      // Process system health
      if (systemHealth.status === 'fulfilled') {
        const healthData = systemHealth.value
        setAdminData(prev => ({
          ...prev,
          system: {
            uptime: healthData.uptime || 0,
            apiHealth: healthData.apiHealth || 'unknown',
            dbHealth: healthData.dbHealth || 'unknown',
            aiAgentsStatus: healthData.aiAgentsStatus || 'unknown',
            alerts: healthData.alerts || 0,
            criticalIssues: healthData.criticalIssues || 0,
            avgResponseTime: healthData.avgResponseTime || '0ms'
          }
        }))
      }

      // Process system alerts
      if (systemAlerts.status === 'fulfilled') {
        const alertsData = systemAlerts.value
        setAdminData(prev => ({
          ...prev,
          system: {
            ...prev.system,
            alerts: alertsData.alerts?.length || 0,
            criticalIssues: alertsData.alerts?.filter(alert => alert.severity === 'critical').length || 0
          }
        }))
      }

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError(error.message || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on component mount and when time range changes
  useEffect(() => {
    loadDashboardData()
  }, [selectedTimeRange])

  // Refresh data
  const handleRefresh = () => {
    loadDashboardData()
  }

  const platformMetrics = [
    {
      title: 'Total Users',
      value: adminData.platform.totalUsers.toLocaleString(),
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Registered platform users'
    },
    {
      title: 'Monthly Revenue',
      value: `$${adminData.platform.monthlyRevenue.toLocaleString()}`,
      change: '+23.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Current month revenue'
    },
    {
      title: 'Active Users',
      value: adminData.platform.activeUsers.toLocaleString(),
      change: '+8.2%',
      trend: 'up',
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Users active in last 30 days'
    },
    {
      title: 'System Uptime',
      value: `${adminData.platform.systemUptime}%`,
      change: 'Stable',
      trend: 'stable',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Platform availability'
    },
    {
      title: 'API Calls',
      value: adminData.platform.apiCalls.toLocaleString(),
      change: '+15.3%',
      trend: 'up',
      icon: Database,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Total API requests today'
    },
    {
      title: 'AI Tasks',
      value: adminData.platform.aiAgentTasks.toLocaleString(),
      change: '+28.7%',
      trend: 'up',
      icon: Cpu,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'AI agent tasks completed'
    }
  ]

  const recentActivity = [
    {
      type: 'user_signup',
      message: 'New user registered: sarah@techstart.com',
      time: '2 minutes ago',
      icon: UserPlus,
      color: 'text-green-600'
    },
    {
      type: 'subscription',
      message: 'User upgraded to Premium plan',
      time: '5 minutes ago',
      icon: CreditCard,
      color: 'text-blue-600'
    },
    {
      type: 'system',
      message: 'AI Agent performance optimized',
      time: '12 minutes ago',
      icon: Zap,
      color: 'text-purple-600'
    },
    {
      type: 'support',
      message: 'Support ticket #1247 resolved',
      time: '18 minutes ago',
      icon: MessageSquare,
      color: 'text-indigo-600'
    },
    {
      type: 'alert',
      message: 'High API usage detected - monitoring',
      time: '25 minutes ago',
      icon: AlertTriangle,
      color: 'text-yellow-600'
    }
  ]

  // Remove duplicate handleRefresh function - it's already defined above

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Super Admin Dashboard</h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Platform overview and management center
            </p>
            {error && (
              <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button
              onClick={handleRefreshDashboard}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : ''}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Platform Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platformMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${isDarkMode ? metric.bgColor.replace('bg-', 'bg-').replace('-50', '-900/30') : metric.bgColor}`}>
                          <Icon className={`h-5 w-5 ${isDarkMode ? metric.color.replace('text-', 'text-').replace('-600', '-400') : metric.color}`} />
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{metric.title}</p>
                          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{metric.value}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center space-x-1 ${
                          metric.trend === 'up' ? 'text-green-600' : 
                          metric.trend === 'down' ? 'text-red-600' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {metric.trend === 'up' && <ArrowUpRight className="h-4 w-4" />}
                          {metric.trend === 'down' && <ArrowDownRight className="h-4 w-4" />}
                          <span className="text-sm font-medium">{metric.change}</span>
                        </div>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{metric.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Revenue Growth</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Monthly revenue and user growth trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={isDarkMode ? "#374151" : "#e5e7eb"} 
                  />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: isDarkMode ? "#ffffff" : "#374151" }}
                    axisLine={{ stroke: isDarkMode ? "#374151" : "#e5e7eb" }}
                  />
                  <YAxis 
                    tick={{ fill: isDarkMode ? "#ffffff" : "#374151" }}
                    axisLine={{ stroke: isDarkMode ? "#374151" : "#e5e7eb" }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#ffffff" : "#ffffff",
                      border: isDarkMode ? "1px solid #e5e7eb" : "1px solid #e5e7eb",
                      borderRadius: "8px",
                      color: isDarkMode ? "#000000" : "#374151"
                    }}
                    labelStyle={{ color: isDarkMode ? "#000000" : "#374151" }}
                  />
                  <Legend 
                    wrapperStyle={{ color: isDarkMode ? "#ffffff" : "#374151" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.1}
                    name="Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Growth Chart */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>User Growth</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Total and active users over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={isDarkMode ? "#374151" : "#e5e7eb"} 
                  />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: isDarkMode ? "#ffffff" : "#374151" }}
                    axisLine={{ stroke: isDarkMode ? "#374151" : "#e5e7eb" }}
                  />
                  <YAxis 
                    tick={{ fill: isDarkMode ? "#ffffff" : "#374151" }}
                    axisLine={{ stroke: isDarkMode ? "#374151" : "#e5e7eb" }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#ffffff" : "#ffffff",
                      border: isDarkMode ? "1px solid #e5e7eb" : "1px solid #e5e7eb",
                      borderRadius: "8px",
                      color: isDarkMode ? "#000000" : "#374151"
                    }}
                    labelStyle={{ color: isDarkMode ? "#000000" : "#374151" }}
                  />
                  <Legend 
                    wrapperStyle={{ color: isDarkMode ? "#ffffff" : "#374151" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    name="Total Users"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="active" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Active Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subscription Distribution */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Subscription Plans</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Distribution of user subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={subscriptionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {subscriptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#ffffff" : "#ffffff",
                      border: isDarkMode ? "1px solid #e5e7eb" : "1px solid #e5e7eb",
                      borderRadius: "8px",
                      color: isDarkMode ? "#000000" : "#374151"
                    }}
                    labelStyle={{ color: isDarkMode ? "#000000" : "#374151" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {subscriptionData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.name}</span>
                    </div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>System Health</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Platform status and performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>API Health</span>
                <Badge variant='success' className={isDarkMode ? 'bg-green-900/30 text-green-400 border-green-700' : ''}>Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Database</span>
                <Badge variant='success' className={isDarkMode ? 'bg-green-900/30 text-green-400 border-green-700' : ''}>Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>AI Agents</span>
                <Badge variant='success' className={isDarkMode ? 'bg-green-900/30 text-green-400 border-green-700' : ''}>Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Storage</span>
                <Badge variant='outline' className={isDarkMode ? 'border-slate-600 text-slate-300' : ''}>{adminData.platform.storageUsed}% Used</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Response Time</span>
                <Badge variant='outline' className={isDarkMode ? 'border-slate-600 text-slate-300' : ''}>{adminData.system.avgResponseTime}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active Alerts</span>
                <Badge variant={adminData.system.alerts > 0 ? 'destructive' : 'success'} className={isDarkMode ? (adminData.system.alerts > 0 ? 'bg-red-900/30 text-red-400 border-red-700' : 'bg-green-900/30 text-green-400 border-green-700') : ''}>
                  {adminData.system.alerts}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Recent Activity</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Latest platform events and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`p-1 rounded-full ${activity.color}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {activity.message}
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{activity.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <Button variant="outline" className={`w-full mt-4 ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : ''}`} size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

