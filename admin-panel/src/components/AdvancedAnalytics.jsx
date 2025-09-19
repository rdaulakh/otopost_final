import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  Filter,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Clock,
  Mail,
  FileText,
  PieChart,
  LineChart,
  AreaChart,
  Zap,
  Target,
  Users,
  DollarSign,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Share2,
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  ExternalLink,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LineChart as RechartsLineChart, Line, AreaChart as RechartsAreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts'
import { format, subDays, startOfDay } from 'date-fns'
import { useAdvancedAnalytics, usePlatformPerformance, useRevenueAnalytics, useCustomReports } from '../hooks/useAdminApi'

const AdvancedAnalytics = ({ data = {}, onDataUpdate = () => {}, isDarkMode = false }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'users', 'engagement'])
  const [selectedPlatforms, setSelectedPlatforms] = useState(['all'])
  const [reportBuilder, setReportBuilder] = useState({
    isOpen: false,
    selectedWidgets: [],
    reportName: '',
    schedule: 'none'
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Real API integration
  const { 
    data: advancedAnalytics, 
    isLoading: analyticsLoading, 
    error: analyticsError,
    refetch: refetchAnalytics 
  } = useAdvancedAnalytics({ 
    timeRange: selectedTimeRange,
    metrics: selectedMetrics,
    platforms: selectedPlatforms 
  })

  const { 
    data: platformPerformance, 
    isLoading: platformLoading, 
    error: platformError,
    refetch: refetchPlatform 
  } = usePlatformPerformance({ timeRange: selectedTimeRange })

  const { 
    data: revenueAnalytics, 
    isLoading: revenueLoading, 
    error: revenueError,
    refetch: refetchRevenue 
  } = useRevenueAnalytics({ timeRange: selectedTimeRange })

  const { 
    data: customReports, 
    isLoading: reportsLoading, 
    error: reportsError,
    refetch: refetchReports 
  } = useCustomReports()

  // Combined loading state
  const isLoading = analyticsLoading || platformLoading || revenueLoading || reportsLoading

  // Combined error state
  const hasError = analyticsError || platformError || revenueError || reportsError

  // Refresh all data
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchAnalytics(),
        refetchPlatform(),
        refetchRevenue(),
        refetchReports()
      ])
      onDataUpdate()
    } catch (error) {
      console.error('Failed to refresh advanced analytics data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const interval = setInterval(handleRefresh, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Handle metric selection
  const handleMetricToggle = (metric) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    )
  }

  // Handle platform selection
  const handlePlatformToggle = (platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Format number
  const formatNumber = (num) => {
    if (!num) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Format percentage
  const formatPercentage = (num) => {
    if (!num) return '0%'
    return `${num.toFixed(1)}%`
  }

  // Get platform color
  const getPlatformColor = (platform) => {
    const colors = {
      instagram: '#E4405F',
      facebook: '#1877F2',
      linkedin: '#0A66C2',
      twitter: '#1DA1F2',
      youtube: '#FF0000',
      tiktok: '#000000'
    }
    return colors[platform?.toLowerCase()] || '#6B7280'
  }

  // Error state
  if (hasError && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Failed to load advanced analytics
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          We're having trouble loading your advanced analytics data. Please try refreshing.
        </p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  // Loading state
  if (isLoading && !advancedAnalytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Loading Advanced Analytics
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Fetching comprehensive analytics data...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Deep insights and comprehensive performance analysis
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={selectedTimeRange} 
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(advancedAnalytics?.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {advancedAnalytics?.revenueChange > 0 ? '+' : ''}{advancedAnalytics?.revenueChange}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(advancedAnalytics?.activeUsers)}
            </div>
            <p className="text-xs text-muted-foreground">
              {advancedAnalytics?.userGrowth > 0 ? '+' : ''}{advancedAnalytics?.userGrowth}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(advancedAnalytics?.engagementRate)}
            </div>
            <p className="text-xs text-muted-foreground">
              {advancedAnalytics?.engagementChange > 0 ? '+' : ''}{advancedAnalytics?.engagementChange}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(advancedAnalytics?.conversionRate)}
            </div>
            <p className="text-xs text-muted-foreground">
              {advancedAnalytics?.conversionChange > 0 ? '+' : ''}{advancedAnalytics?.conversionChange}% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Platform Performance
          </CardTitle>
          <CardDescription>
            Detailed performance metrics across all platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {platformPerformance?.platforms?.map((platform, index) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getPlatformColor(platform.name) }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                      {platform.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatNumber(platform.followers)} followers
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-8 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{formatPercentage(platform.engagement)}</div>
                    <div className="text-gray-500">Engagement</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{formatNumber(platform.reach)}</div>
                    <div className="text-gray-500">Reach</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{formatCurrency(platform.revenue)}</div>
                    <div className="text-gray-500">Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{platform.posts}</div>
                    <div className="text-gray-500">Posts</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="h-5 w-5 mr-2" />
              Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={revenueAnalytics?.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="subscriptions" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Subscriptions"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Revenue Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={revenueAnalytics?.sources}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueAnalytics?.sources?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Custom Reports
              </CardTitle>
              <CardDescription>
                Manage and schedule custom analytics reports
              </CardDescription>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customReports?.reports?.length > 0 ? (
              customReports.reports.map((report, index) => (
                <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {report.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={report.status === 'active' ? 'default' : 'secondary'}>
                      {report.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No custom reports yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Create your first custom report to get started with advanced analytics.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Report
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metric Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Metric Filters
          </CardTitle>
          <CardDescription>
            Customize which metrics to display in your analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Metrics</h4>
              <div className="flex flex-wrap gap-2">
                {['revenue', 'users', 'engagement', 'reach', 'conversions', 'retention'].map((metric) => (
                  <Button
                    key={metric}
                    variant={selectedMetrics.includes(metric) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleMetricToggle(metric)}
                  >
                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Platforms</h4>
              <div className="flex flex-wrap gap-2">
                {['all', 'instagram', 'facebook', 'linkedin', 'twitter', 'youtube'].map((platform) => (
                  <Button
                    key={platform}
                    variant={selectedPlatforms.includes(platform) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePlatformToggle(platform)}
                  >
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdvancedAnalytics
