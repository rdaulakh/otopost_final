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
  Percent
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'


const Analytics = ({ data = {}, user = {}, onDataUpdate = () => {
  const { isDarkMode } = useTheme()
} }) => {
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Comprehensive analytics data
  const analyticsData = {
    overview: {
      totalReach: 125000,
      totalEngagement: 8500,
      totalFollowers: 15600,
      totalPosts: 156,
      engagementRate: 4.2,
      reachGrowth: 12.5,
      followerGrowth: 8.3,
      postPerformance: 23.1,
      impressions: 245000,
      clicks: 12400,
      saves: 2100,
      shares: 890
    },
    platforms: {
      instagram: { 
        posts: 45, 
        reach: 45000, 
        engagement: 3200, 
        followers: 5200,
        engagementRate: 7.1,
        growth: 15.2,
        topPostType: 'Carousel',
        bestTime: '2:00 PM'
      },
      facebook: { 
        posts: 38, 
        reach: 32000, 
        engagement: 2100, 
        followers: 4100,
        engagementRate: 6.6,
        growth: 8.7,
        topPostType: 'Video',
        bestTime: '7:00 PM'
      },
      linkedin: { 
        posts: 42, 
        reach: 28000, 
        engagement: 1800, 
        followers: 3800,
        engagementRate: 6.4,
        growth: 12.1,
        topPostType: 'Article',
        bestTime: '9:00 AM'
      },
      twitter: { 
        posts: 31, 
        reach: 20000, 
        engagement: 1400, 
        followers: 2500,
        engagementRate: 7.0,
        growth: 5.3,
        topPostType: 'Thread',
        bestTime: '11:00 AM'
      }
    },
    topPosts: [
      {
        id: 1,
        platform: 'Instagram',
        content: 'AI-powered productivity tips for entrepreneurs',
        reach: 12500,
        engagement: 890,
        likes: 654,
        comments: 123,
        shares: 113,
        date: '2024-01-15',
        type: 'Carousel'
      },
      {
        id: 2,
        platform: 'LinkedIn',
        content: 'The future of social media marketing with AI',
        reach: 8900,
        engagement: 567,
        likes: 423,
        comments: 89,
        shares: 55,
        date: '2024-01-12',
        type: 'Article'
      },
      {
        id: 3,
        platform: 'Facebook',
        content: 'Behind the scenes: Building our AI platform',
        reach: 7800,
        engagement: 445,
        likes: 334,
        comments: 67,
        shares: 44,
        date: '2024-01-10',
        type: 'Video'
      },
      {
        id: 4,
        platform: 'Twitter',
        content: 'Quick thread on AI automation trends 🧵',
        reach: 5600,
        engagement: 378,
        likes: 289,
        comments: 45,
        shares: 44,
        date: '2024-01-08',
        type: 'Thread'
      }
    ],
    audience: {
      demographics: {
        age: {
          '18-24': 15,
          '25-34': 35,
          '35-44': 28,
          '45-54': 15,
          '55+': 7
        },
        gender: {
          male: 58,
          female: 40,
          other: 2
        }
      },
      locations: [
        { country: 'United States', percentage: 45, followers: 7020 },
        { country: 'United Kingdom', percentage: 12, followers: 1872 },
        { country: 'Canada', percentage: 8, followers: 1248 },
        { country: 'Australia', percentage: 6, followers: 936 },
        { country: 'Germany', percentage: 5, followers: 780 },
        { country: 'Other', percentage: 24, followers: 3744 }
      ],
      devices: {
        mobile: 68,
        desktop: 25,
        tablet: 7
      },
      activeHours: [
        { hour: '6 AM', activity: 12 },
        { hour: '9 AM', activity: 45 },
        { hour: '12 PM', activity: 78 },
        { hour: '3 PM', activity: 92 },
        { hour: '6 PM', activity: 85 },
        { hour: '9 PM', activity: 67 },
        { hour: '12 AM', activity: 23 }
      ]
    },
    weeklyTrends: [
      { week: 'Week 1', reach: 28000, engagement: 1890, followers: 156 },
      { week: 'Week 2', reach: 31000, engagement: 2100, followers: 189 },
      { week: 'Week 3', reach: 29500, engagement: 1950, followers: 167 },
      { week: 'Week 4', reach: 36500, engagement: 2560, followers: 234 }
    ]
  }

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ]

  const platforms = [
    { value: 'all', label: 'All Platforms', icon: Globe },
    { value: 'instagram', label: 'Instagram', icon: Instagram },
    { value: 'facebook', label: 'Facebook', icon: Facebook },
    { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
    { value: 'twitter', label: 'Twitter', icon: Twitter }
  ]

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false)
      setLastUpdated(new Date())
    }, 1500)
  }

  const handleExport = () => {
    // Simulate export functionality
    const exportData = {
      timeRange,
      platform: selectedPlatform,
      data: analyticsData,
      exportedAt: new Date().toISOString()
    }
    console.log('Exporting analytics data:', exportData)
    // In real implementation, this would trigger a download
  }

  const getPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return Instagram
      case 'facebook': return Facebook
      case 'linkedin': return Linkedin
      case 'twitter': return Twitter
      case 'youtube': return Youtube
      default: return Globe
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Analytics
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Comprehensive insights into your social media performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button 
            onClick={handleRefresh}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map(range => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {platforms.map(platform => {
              const Icon = platform.icon
              return (
                <SelectItem key={platform.value} value={platform.value}>
                  <div className="flex items-center">
                    <Icon className="h-4 w-4 mr-2" />
                    {platform.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="content">Top Content</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Total Reach',
                value: formatNumber(analyticsData.overview.totalReach),
                change: `+${analyticsData.overview.reachGrowth}%`,
                trend: 'up',
                icon: Eye,
                color: 'text-blue-600',
                bgColor: 'bg-blue-50 dark:bg-blue-900/20'
              },
              {
                title: 'Engagement',
                value: formatNumber(analyticsData.overview.totalEngagement),
                change: `+${analyticsData.overview.postPerformance}%`,
                trend: 'up',
                icon: Heart,
                color: 'text-pink-600',
                bgColor: 'bg-pink-50 dark:bg-pink-900/20'
              },
              {
                title: 'Followers',
                value: formatNumber(analyticsData.overview.totalFollowers),
                change: `+${analyticsData.overview.followerGrowth}%`,
                trend: 'up',
                icon: Users,
                color: 'text-green-600',
                bgColor: 'bg-green-50 dark:bg-green-900/20'
              },
              {
                title: 'Posts Published',
                value: analyticsData.overview.totalPosts,
                change: '+12 this month',
                trend: 'up',
                icon: Calendar,
                color: 'text-purple-600',
                bgColor: 'bg-purple-50 dark:bg-purple-900/20'
              }
            ].map((metric, index) => {
              const Icon = metric.icon
              const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown
              
              return (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                          <Icon className={`h-6 w-6 ${metric.color}`} />
                        </div>
                        <TrendIcon className={`h-4 w-4 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {metric.title}
                        </h3>
                        <div className="flex items-baseline space-x-2">
                          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {metric.value}
                          </p>
                        </div>
                        <p className={`text-xs mt-1 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {metric.change}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Weekly Performance Trends */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Weekly Performance Trends
              </CardTitle>
              <CardDescription>
                Track your performance over the last 4 weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.weeklyTrends.map((week, index) => (
                  <div key={week.week} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {week.week}
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-blue-600" />
                        <span className="text-slate-600 dark:text-slate-400">
                          {formatNumber(week.reach)} reach
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-pink-600" />
                        <span className="text-slate-600 dark:text-slate-400">
                          {formatNumber(week.engagement)} engagement
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <span className="text-slate-600 dark:text-slate-400">
                          +{week.followers} followers
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(analyticsData.platforms).map(([platform, data]) => {
              const Icon = getPlatformIcon(platform)
              
              return (
                <motion.div
                  key={platform}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
                    <CardHeader>
                      <CardTitle className="flex items-center capitalize">
                        <Icon className="h-5 w-5 mr-2 text-blue-600" />
                        {platform}
                      </CardTitle>
                      <CardDescription>
                        Performance metrics for {platform}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {data.posts}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Posts</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {formatNumber(data.reach)}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Reach</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {formatNumber(data.engagement)}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Engagement</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {formatNumber(data.followers)}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Followers</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Engagement Rate</span>
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {data.engagementRate}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Growth Rate</span>
                          <span className="text-sm font-medium text-green-600">
                            +{data.growth}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Top Content Type</span>
                          <Badge variant="secondary">{data.topPostType}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Best Posting Time</span>
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {data.bestTime}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>

        {/* Top Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-600" />
                Top Performing Content
              </CardTitle>
              <CardDescription>
                Your best performing posts across all platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topPosts.map((post, index) => {
                  const Icon = getPlatformIcon(post.platform)
                  
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-5 w-5 text-blue-600" />
                          <Badge variant="outline" className="text-xs">
                            {post.type}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {post.content}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {post.platform} • {post.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {formatNumber(post.reach)}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Reach</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {post.engagement}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Engagement</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {((post.engagement / post.reach) * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Rate</div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demographics */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Demographics
                </CardTitle>
                <CardDescription>
                  Age and gender distribution of your audience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">Age Groups</h4>
                  <div className="space-y-2">
                    {Object.entries(analyticsData.audience.demographics.age).map(([age, percentage]) => (
                      <div key={age} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{age}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={percentage} className="w-20 h-2" />
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100 w-8">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">Gender</h4>
                  <div className="space-y-2">
                    {Object.entries(analyticsData.audience.demographics.gender).map(([gender, percentage]) => (
                      <div key={gender} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">{gender}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={percentage} className="w-20 h-2" />
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100 w-8">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Locations */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-red-600" />
                  Top Locations
                </CardTitle>
                <CardDescription>
                  Geographic distribution of your followers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.audience.locations.map((location, index) => (
                    <div key={location.country} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {location.country}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {formatNumber(location.followers)} followers
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={location.percentage} className="w-16 h-2" />
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100 w-8">
                          {location.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Device Usage */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="h-5 w-5 mr-2 text-purple-600" />
                  Device Usage
                </CardTitle>
                <CardDescription>
                  How your audience accesses your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { device: 'Mobile', percentage: analyticsData.audience.devices.mobile, icon: Smartphone },
                    { device: 'Desktop', percentage: analyticsData.audience.devices.desktop, icon: Monitor },
                    { device: 'Tablet', percentage: analyticsData.audience.devices.tablet, icon: Tablet }
                  ].map(({ device, percentage, icon: DeviceIcon }) => (
                    <div key={device} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <DeviceIcon className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {device}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={percentage} className="w-20 h-2" />
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100 w-8">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Hours */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-orange-600" />
                  Active Hours
                </CardTitle>
                <CardDescription>
                  When your audience is most active
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.audience.activeHours.map((hour) => (
                    <div key={hour.hour} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {hour.hour}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Progress value={hour.activity} className="w-24 h-2" />
                        <span className="text-sm text-slate-600 dark:text-slate-400 w-8">
                          {hour.activity}%
                        </span>
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

export default Analytics

