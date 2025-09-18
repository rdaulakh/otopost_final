import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Users,
  Target,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Youtube,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'

// Import API hooks and UX components
import { 
  useAnalyticsOverview,
  useAnalyticsPerformance,
  useAnalyticsEngagement,
  useAnalyticsAudience,
  useContentAnalytics,
  usePerformanceAnalytics
} from '../hooks/useCustomerApi.js'
import { useNotifications } from './NotificationSystem.jsx'
import { AnalyticsSkeleton } from './LoadingSkeletons.jsx'

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts'

const PerformanceAnalytics = ({ data, user, onDataUpdate }) => {
  const { isDarkMode } = useTheme()

  const [timeRange, setTimeRange] = useState('30d') // 7d, 30d, 90d, 1y
  const [selectedMetric, setSelectedMetric] = useState('engagement')
  const [selectedPlatform, setSelectedPlatform] = useState('all')

  // UX hooks
  const { success, error, info } = useNotifications()

  // Real API calls for analytics data
  const { 
    data: overviewData, 
    isLoading: overviewLoading,
    error: overviewError,
    refetch: refetchOverview 
  } = useAnalyticsOverview({ timeRange, platform: selectedPlatform })
  
  const { 
    data: performanceData, 
    isLoading: performanceLoading,
    error: performanceError 
  } = useAnalyticsPerformance({ timeRange, metric: selectedMetric, platform: selectedPlatform })
  
  const { 
    data: engagementData, 
    isLoading: engagementLoading 
  } = useAnalyticsEngagement({ timeRange, platform: selectedPlatform })
  
  const { 
    data: audienceData, 
    isLoading: audienceLoading 
  } = useAnalyticsAudience({ timeRange })
  
  const { 
    data: contentAnalytics, 
    isLoading: contentLoading 
  } = useContentAnalytics({ timeRange, platform: selectedPlatform })

  // Loading state
  const isLoading = overviewLoading || performanceLoading || engagementLoading || audienceLoading || contentLoading

  // Error handling
  const hasError = overviewError || performanceError

  const fallbackAnalyticsData = {
    overview: {
      totalReach: 125000,
      totalEngagement: 8750,
      totalFollowers: 12500,
      engagementRate: 7.2,
      reachGrowth: 15.3,
      engagementGrowth: 8.7,
      followerGrowth: 12.1,
      avgPostPerformance: 94.2
    },
    platformBreakdown: [
      { platform: 'Instagram', reach: 45000, engagement: 3200, followers: 5200, color: '#E4405F' },
      { platform: 'LinkedIn', reach: 32000, engagement: 2100, followers: 3800, color: '#0077B5' },
      { platform: 'Twitter', reach: 28000, engagement: 1800, followers: 2100, color: '#1DA1F2' },
      { platform: 'Facebook', reach: 15000, engagement: 1200, followers: 1200, color: '#1877F2' },
      { platform: 'YouTube', reach: 5000, engagement: 450, followers: 200, color: '#FF0000' }
    ],
    timeSeriesData: [
      { date: '2024-01-01', reach: 8500, engagement: 612, followers: 11800, posts: 3 },
      { date: '2024-01-02', reach: 9200, engagement: 658, followers: 11820, posts: 2 },
      { date: '2024-01-03', reach: 7800, engagement: 546, followers: 11835, posts: 1 },
      { date: '2024-01-04', reach: 10500, engagement: 735, followers: 11850, posts: 4 },
      { date: '2024-01-05', reach: 12000, engagement: 840, followers: 11890, posts: 3 },
      { date: '2024-01-06', reach: 8900, engagement: 623, followers: 11905, posts: 2 },
      { date: '2024-01-07', reach: 11200, engagement: 784, followers: 11925, posts: 3 },
      { date: '2024-01-08', reach: 13500, engagement: 945, followers: 11960, posts: 4 },
      { date: '2024-01-09', reach: 9800, engagement: 686, followers: 11980, posts: 2 },
      { date: '2024-01-10', reach: 14200, engagement: 994, followers: 12020, posts: 5 },
      { date: '2024-01-11', reach: 10800, engagement: 756, followers: 12045, posts: 3 },
      { date: '2024-01-12', reach: 12800, engagement: 896, followers: 12080, posts: 4 },
      { date: '2024-01-13', reach: 11500, engagement: 805, followers: 12110, posts: 3 },
      { date: '2024-01-14', reach: 15200, engagement: 1064, followers: 12150, posts: 5 },
      { date: '2024-01-15', reach: 13800, engagement: 966, followers: 12200, posts: 4 },
      { date: '2024-01-16', reach: 16500, engagement: 1155, followers: 12250, posts: 6 },
      { date: '2024-01-17', reach: 14200, engagement: 994, followers: 12300, posts: 4 },
      { date: '2024-01-18', reach: 12900, engagement: 903, followers: 12340, posts: 3 },
      { date: '2024-01-19', reach: 17800, engagement: 1246, followers: 12390, posts: 7 },
      { date: '2024-01-20', reach: 15600, engagement: 1092, followers: 12450, posts: 5 }
    ],
    contentTypePerformance: [
      { type: 'Carousel', posts: 12, avgReach: 15200, avgEngagement: 1064, engagementRate: 7.8 },
      { type: 'Video', posts: 8, avgReach: 18500, avgEngagement: 1295, engagementRate: 8.2 },
      { type: 'Image', posts: 15, avgReach: 12800, avgEngagement: 896, engagementRate: 6.9 },
      { type: 'Reel', posts: 6, avgReach: 22000, avgEngagement: 1540, engagementRate: 9.1 },
      { type: 'Text', posts: 4, avgReach: 8500, avgEngagement: 595, engagementRate: 5.2 }
    ],
    bestPostingTimes: [
      { hour: 6, engagement: 45 },
      { hour: 7, engagement: 62 },
      { hour: 8, engagement: 78 },
      { hour: 9, engagement: 95 },
      { hour: 10, engagement: 88 },
      { hour: 11, engagement: 92 },
      { hour: 12, engagement: 85 },
      { hour: 13, engagement: 78 },
      { hour: 14, engagement: 82 },
      { hour: 15, engagement: 89 },
      { hour: 16, engagement: 94 },
      { hour: 17, engagement: 98 },
      { hour: 18, engagement: 100 },
      { hour: 19, engagement: 96 },
      { hour: 20, engagement: 88 },
      { hour: 21, engagement: 75 },
      { hour: 22, engagement: 58 },
      { hour: 23, engagement: 42 }
    ],
    audienceInsights: {
      demographics: [
        { age: '18-24', percentage: 15, color: '#8884d8' },
        { age: '25-34', percentage: 35, color: '#82ca9d' },
        { age: '35-44', percentage: 28, color: '#ffc658' },
        { age: '45-54', percentage: 15, color: '#ff7300' },
        { age: '55+', percentage: 7, color: '#00ff00' }
      ],
      topLocations: [
        { location: 'United States', percentage: 45 },
        { location: 'United Kingdom', percentage: 18 },
        { location: 'Canada', percentage: 12 },
        { location: 'Australia', percentage: 8 },
        { location: 'Germany', percentage: 7 },
        { location: 'Other', percentage: 10 }
      ]
    }
  }

  const analyticsData = {
    overview: overviewData || fallbackAnalyticsData.overview,
    platformBreakdown: performanceData?.platformBreakdown || fallbackAnalyticsData.platformBreakdown,
    timeSeriesData: performanceData?.timeSeriesData || fallbackAnalyticsData.timeSeriesData,
    contentTypePerformance: contentAnalytics?.contentTypePerformance || fallbackAnalyticsData.contentTypePerformance,
    bestPostingTimes: engagementData?.bestPostingTimes || fallbackAnalyticsData.bestPostingTimes,
    audienceInsights: audienceData || fallbackAnalyticsData.audienceInsights
  }

  // Handle data refresh
  const handleRefresh = async () => {
    try {
      await refetchOverview()
      success('Analytics data refreshed successfully')
      if (onDataUpdate) {
        onDataUpdate({ lastRefresh: new Date() })
      }
    } catch (err) {
      error('Failed to refresh analytics data')
    }
  }

  // Handle time range change
  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange)
    info(`Analytics updated for ${newTimeRange} period`)
  }

  // Handle platform filter change
  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform)
    info(`Filtered analytics for ${platform === 'all' ? 'all platforms' : platform}`)
  }

  // Show loading skeleton
  if (isLoading && !fallbackAnalyticsData) {
    return <AnalyticsSkeleton />
  }

  // Show error state
  if (hasError && !fallbackAnalyticsData) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <Activity className="h-5 w-5" />
              <span>Error loading analytics data. Please try refreshing.</span>
            </div>
            <Button 
              onClick={handleRefresh} 
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

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatPercentage = (num) => {
    return num > 0 ? `+${num.toFixed(1)}%` : `${num.toFixed(1)}%`
  }

  const MetricCard = ({ title, value, change, icon: Icon, color = "blue" }) => {
    const isPositive = change > 0
    const colorClasses = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600'
    }

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <div className="flex items-center mt-1">
                {isPositive ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(change)}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">vs last period</span>
              </div>
            </div>
            <Icon className={`h-8 w-8 ${colorClasses[color]}`} />
          </div>
        </CardContent>
      </Card>
    )
  }

  const PlatformCard = ({ platform, reach, engagement, followers, color }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
            <span className="font-medium text-slate-900">{platform}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {((engagement / reach) * 100).toFixed(1)}%
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Reach</span>
            <span className="font-medium">{formatNumber(reach)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Engagement</span>
            <span className="font-medium">{formatNumber(engagement)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Followers</span>
            <span className="font-medium">{formatNumber(followers)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Performance Analytics
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Comprehensive insights into your social media performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-slate-700">Time Range:</span>
        {['7d', '30d', '90d', '1y'].map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTimeRangeChange(range)}
          >
            {range === '7d' ? 'Last 7 days' : 
             range === '30d' ? 'Last 30 days' :
             range === '90d' ? 'Last 90 days' : 'Last year'}
          </Button>
        ))}
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Reach"
          value={formatNumber(analyticsData.overview.totalReach)}
          change={analyticsData.overview.reachGrowth}
          icon={Eye}
          color="blue"
        />
        <MetricCard
          title="Total Engagement"
          value={formatNumber(analyticsData.overview.totalEngagement)}
          change={analyticsData.overview.engagementGrowth}
          icon={Heart}
          color="green"
        />
        <MetricCard
          title="Total Followers"
          value={formatNumber(analyticsData.overview.totalFollowers)}
          change={analyticsData.overview.followerGrowth}
          icon={Users}
          color="purple"
        />
        <MetricCard
          title="Engagement Rate"
          value={`${analyticsData.overview.engagementRate}%`}
          change={2.3}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="content">Content Types</TabsTrigger>
          <TabsTrigger value="timing">Best Times</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Track your reach, engagement, and follower growth over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={analyticsData.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="reach"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Reach"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="engagement"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Engagement"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="posts"
                      fill="#8B5CF6"
                      name="Posts Published"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.platformBreakdown.map((platform) => (
              <PlatformCard key={platform.platform} {...platform} />
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance Comparison</CardTitle>
              <CardDescription>
                Compare reach and engagement across all platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.platformBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="reach" fill="#3B82F6" name="Reach" />
                    <Bar dataKey="engagement" fill="#10B981" name="Engagement" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Types Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Type Performance</CardTitle>
              <CardDescription>
                Analyze which content types perform best for your audience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.contentTypePerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgReach" fill="#3B82F6" name="Avg Reach" />
                    <Bar dataKey="avgEngagement" fill="#10B981" name="Avg Engagement" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {analyticsData.contentTypePerformance.map((content) => (
              <Card key={content.type}>
                <CardContent className="p-4">
                  <div className="text-center">
                    <h3 className="font-medium text-slate-900 mb-2">{content.type}</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">{content.posts} posts</p>
                      <p className="text-lg font-bold text-slate-900">{content.engagementRate}%</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">avg engagement rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Best Times Tab */}
        <TabsContent value="timing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Optimal Posting Times</CardTitle>
              <CardDescription>
                Discover when your audience is most active and engaged
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.bestPostingTimes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hour" 
                      tickFormatter={(value) => `${value}:00`}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => `${value}:00`}
                      formatter={(value) => [`${value}%`, 'Engagement Rate']}
                    />
                    <Area
                      type="monotone"
                      dataKey="engagement"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-medium text-slate-900">Best Time</h3>
                <p className="text-2xl font-bold text-green-600">6:00 PM</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Peak engagement</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-medium text-slate-900">Best Day</h3>
                <p className="text-2xl font-bold text-blue-600">Wednesday</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Highest reach</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-medium text-slate-900">Optimal Frequency</h3>
                <p className="text-2xl font-bold text-purple-600">3-4</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Posts per day</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Age Demographics</CardTitle>
                <CardDescription>
                  Age distribution of your audience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={analyticsData.audienceInsights.demographics}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="percentage"
                        label={({ age, percentage }) => `${age}: ${percentage}%`}
                      >
                        {analyticsData.audienceInsights.demographics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
                <CardDescription>
                  Geographic distribution of your audience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.audienceInsights.topLocations.map((location, index) => (
                    <div key={location.location} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900">{location.location}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${location.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400 w-8">{location.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PerformanceAnalytics

