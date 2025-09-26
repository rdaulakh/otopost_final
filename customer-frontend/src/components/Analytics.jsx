import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Heart, 
  MessageCircle, 
  Share2,
  Eye,
  Target,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Award,
  Percent,
  AlertCircle,
  Loader2
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { useAnalyticsOverview, usePerformanceMetrics, useContentStats, usePlatformAnalytics } from '../hooks/useApi.js'

const Analytics = ({ data = {}, user = {}, onDataUpdate = () => {} }) => {
  const { isDarkMode } = useTheme()
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Real API integration using existing backend routes
  const { 
    data: analyticsOverview, 
    isLoading: overviewLoading, 
    error: overviewError,
    refetch: refetchOverview 
  } = useAnalyticsOverview({ timeRange })

  const { 
    data: performanceMetrics, 
    isLoading: metricsLoading, 
    error: metricsError,
    refetch: refetchMetrics 
  } = usePerformanceMetrics({ timeRange, platform: selectedPlatform })

  const { 
    data: contentStats, 
    isLoading: contentLoading, 
    error: contentError,
    refetch: refetchContent 
  } = useContentStats({ timeRange })

  const { 
    data: platformAnalytics, 
    isLoading: platformLoading, 
    error: platformError,
    refetch: refetchPlatform 
  } = usePlatformAnalytics({ timeRange })

  // Combined loading state
  const isLoading = overviewLoading || metricsLoading || contentLoading || platformLoading

  // Combined error state
  const hasError = overviewError || metricsError || contentError || platformError

  // Refresh all data
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchOverview(),
        refetchMetrics(),
        refetchContent(),
        refetchPlatform()
      ])
      onDataUpdate()
    } catch (error) {
      console.error('Failed to refresh analytics data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Auto-refresh disabled to prevent constant refreshing
  // useEffect(() => {
  //   const interval = setInterval(handleRefresh, 5 * 60 * 1000)
  //   return () => clearInterval(interval)
  // }, [])

  // Handle time range change
  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange)
  }

  // Handle platform change
  const handlePlatformChange = (newPlatform) => {
    setSelectedPlatform(newPlatform)
  }

  // Error state
  if (hasError && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Failed to load analytics data
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          We're having trouble loading your analytics data. Please try refreshing or check your connection.
        </p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  // Loading state
  if (isLoading && !analyticsOverview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Loading Analytics
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Fetching your latest performance data...
        </p>
      </div>
    )
  }

  // Get platform icon
  const getPlatformIcon = (platform) => {
    const icons = {
      instagram: Instagram,
      facebook: Facebook,
      linkedin: Linkedin,
      twitter: Twitter,
      youtube: Youtube
    }
    return icons[platform?.toLowerCase()] || Globe
  }

  // Format numbers
  const formatNumber = (num) => {
    if (!num || num === 0) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Format percentage
  const formatPercentage = (num) => {
    if (!num) return '0%'
    return `${num.toFixed(1)}%`
  }

  // Get trend indicator
  const getTrendIndicator = (value, isPositive = true) => {
    if (!value) return null
    const Icon = (isPositive && value > 0) || (!isPositive && value < 0) ? TrendingUp : TrendingDown
    const color = (isPositive && value > 0) || (!isPositive && value < 0) ? 'text-green-500' : 'text-red-500'
    
    return (
      <div className={`flex items-center ${color}`}>
        <Icon className="h-4 w-4 mr-1" />
        <span className="text-sm font-medium">{Math.abs(value).toFixed(1)}%</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your social media performance and insights
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedPlatform} onValueChange={handlePlatformChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
            </SelectContent>
          </Select>
          
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
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(analyticsOverview?.totalReach || 0)}
            </div>
            {getTrendIndicator(analyticsOverview?.reachGrowth)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(analyticsOverview?.totalEngagement || 0)}
            </div>
            {getTrendIndicator(analyticsOverview?.engagementGrowth)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(analyticsOverview?.totalFollowers || 0)}
            </div>
            {getTrendIndicator(analyticsOverview?.followerGrowth)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(analyticsOverview?.engagementRate || 0)}
            </div>
            {getTrendIndicator(analyticsOverview?.engagementRateChange)}
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceMetrics?.metrics?.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        metric.trend === 'up' ? 'bg-green-500' : 
                        metric.trend === 'down' ? 'bg-red-500' : 'bg-gray-400'
                      }`} />
                      <span className="text-sm font-medium">{metric.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{formatNumber(metric.value)}</div>
                      <div className="text-xs text-gray-500">
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Performing Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Top Performing Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contentStats?.topPosts?.slice(0, 5).map((post, index) => (
                  <div key={post.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {post.content}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        {React.createElement(getPlatformIcon(post.platform), { className: "h-3 w-3" })}
                        <span>{post.platform}</span>
                        <span>•</span>
                        <span>{formatNumber(post.engagement)} engagements</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformAnalytics?.platforms?.map((platform) => {
              const Icon = getPlatformIcon(platform.name)
              return (
                <Card key={platform.name}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium capitalize">
                      {platform.name}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Followers</span>
                        <span className="font-medium">{formatNumber(platform.followers)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Engagement Rate</span>
                        <span className="font-medium">{formatPercentage(platform.engagementRate)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Posts</span>
                        <span className="font-medium">{platform.posts}</span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Growth</span>
                        <span>{platform.growth > 0 ? '+' : ''}{platform.growth}%</span>
                      </div>
                      <Progress 
                        value={Math.abs(platform.growth)} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
              <CardDescription>
                Analyze your content performance across all platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentStats?.contentTypes?.map((type) => (
                  <div key={type.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded ${type.color}`} />
                      <div>
                        <p className="font-medium">{type.name}</p>
                        <p className="text-sm text-gray-500">{type.count} posts</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatNumber(type.avgEngagement)}</p>
                      <p className="text-sm text-gray-500">avg. engagement</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Audience Demographics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsOverview?.demographics?.map((demo) => (
                  <div key={demo.category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{demo.category}</span>
                      <span className="font-medium">{demo.percentage}%</span>
                    </div>
                    <Progress value={demo.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best Posting Times</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsOverview?.bestTimes?.map((time) => (
                  <div key={time.platform} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {React.createElement(getPlatformIcon(time.platform), { className: "h-4 w-4" })}
                      <span className="text-sm font-medium capitalize">{time.platform}</span>
                    </div>
                    <Badge variant="outline">{time.time}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Analytics
