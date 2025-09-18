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
  ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LineChart as RechartsLineChart, Line, AreaChart as RechartsAreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts'
import { format, subDays, startOfDay } from 'date-fns'

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
  const [customReports, setCustomReports] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Advanced analytics data
  const platformPerformance = [
    {
      platform: 'Instagram',
      followers: 45672,
      engagement: 4.8,
      reach: 234567,
      impressions: 567890,
      clicks: 12345,
      revenue: 4250,
      posts: 156,
      stories: 89,
      reels: 67,
      color: '#E4405F'
    },
    {
      platform: 'Facebook',
      followers: 32145,
      engagement: 3.2,
      reach: 189234,
      impressions: 445678,
      clicks: 8976,
      revenue: 3180,
      posts: 134,
      stories: 45,
      reels: 23,
      color: '#1877F2'
    },
    {
      platform: 'LinkedIn',
      followers: 18934,
      engagement: 6.1,
      reach: 98765,
      impressions: 234567,
      clicks: 15678,
      revenue: 2890,
      posts: 89,
      stories: 0,
      reels: 0,
      color: '#0A66C2'
    },
    {
      platform: 'Twitter',
      followers: 28456,
      engagement: 2.9,
      reach: 156789,
      impressions: 389456,
      clicks: 7834,
      revenue: 1950,
      posts: 245,
      stories: 0,
      reels: 0,
      color: '#1DA1F2'
    },
    {
      platform: 'TikTok',
      followers: 67890,
      engagement: 8.4,
      reach: 345678,
      impressions: 789012,
      clicks: 23456,
      revenue: 3670,
      posts: 78,
      stories: 0,
      reels: 78,
      color: '#000000'
    },
    {
      platform: 'YouTube',
      followers: 12345,
      engagement: 5.7,
      reach: 87654,
      impressions: 198765,
      clicks: 9876,
      revenue: 2340,
      posts: 34,
      stories: 0,
      reels: 34,
      color: '#FF0000'
    }
  ]

  // Cross-platform analytics data
  const crossPlatformData = [
    { date: '2024-09-09', instagram: 4250, facebook: 3180, linkedin: 2890, twitter: 1950, tiktok: 3670, youtube: 2340 },
    { date: '2024-09-10', instagram: 4380, facebook: 3250, linkedin: 2950, twitter: 2100, tiktok: 3890, youtube: 2450 },
    { date: '2024-09-11', instagram: 4150, facebook: 3100, linkedin: 2780, twitter: 1890, tiktok: 3540, youtube: 2280 },
    { date: '2024-09-12', instagram: 4520, facebook: 3420, linkedin: 3100, twitter: 2250, tiktok: 4100, youtube: 2680 },
    { date: '2024-09-13', instagram: 4680, facebook: 3380, linkedin: 3050, twitter: 2180, tiktok: 3980, youtube: 2590 },
    { date: '2024-09-14', instagram: 4420, facebook: 3290, linkedin: 2920, twitter: 2050, tiktok: 3750, youtube: 2410 },
    { date: '2024-09-15', instagram: 4750, facebook: 3480, linkedin: 3180, twitter: 2320, tiktok: 4250, youtube: 2720 }
  ]

  // Engagement metrics over time
  const engagementData = [
    { date: '2024-09-09', likes: 12450, comments: 3240, shares: 1890, saves: 2340 },
    { date: '2024-09-10', likes: 13200, comments: 3450, shares: 2100, saves: 2580 },
    { date: '2024-09-11', likes: 11890, comments: 3180, shares: 1750, saves: 2190 },
    { date: '2024-09-12', likes: 14560, comments: 3890, shares: 2450, saves: 2890 },
    { date: '2024-09-13', likes: 13780, comments: 3670, shares: 2280, saves: 2670 },
    { date: '2024-09-14', likes: 12980, comments: 3420, shares: 2050, saves: 2450 },
    { date: '2024-09-15', likes: 15240, comments: 4120, shares: 2680, saves: 3120 }
  ]

  // Content performance by type
  const contentTypeData = [
    { type: 'Carousel', posts: 145, engagement: 6.8, reach: 234567, revenue: 3450 },
    { type: 'Single Image', posts: 234, engagement: 4.2, reach: 189234, revenue: 2890 },
    { type: 'Video', posts: 89, engagement: 8.9, reach: 345678, revenue: 4250 },
    { type: 'Story', posts: 156, engagement: 3.1, reach: 123456, revenue: 1890 },
    { type: 'Reel', posts: 78, engagement: 9.4, reach: 456789, revenue: 5670 },
    { type: 'Article', posts: 45, engagement: 5.6, reach: 98765, revenue: 2340 }
  ]

  // AI Agent performance analytics
  const aiAgentPerformance = [
    {
      agent: 'Intelligence Agent',
      tasksCompleted: 1247,
      successRate: 94.8,
      avgTime: '2.3 min',
      efficiency: 92.5,
      insights: 156,
      color: '#3B82F6'
    },
    {
      agent: 'Strategy Agent',
      tasksCompleted: 892,
      successRate: 96.2,
      avgTime: '4.7 min',
      efficiency: 89.3,
      insights: 89,
      color: '#10B981'
    },
    {
      agent: 'Content Agent',
      tasksCompleted: 2156,
      successRate: 91.7,
      avgTime: '6.2 min',
      efficiency: 87.8,
      insights: 234,
      color: '#8B5CF6'
    },
    {
      agent: 'Execution Agent',
      tasksCompleted: 1789,
      successRate: 98.4,
      avgTime: '1.8 min',
      efficiency: 95.2,
      insights: 67,
      color: '#F59E0B'
    },
    {
      agent: 'Learning Agent',
      tasksCompleted: 567,
      successRate: 93.6,
      avgTime: '8.4 min',
      efficiency: 85.7,
      insights: 178,
      color: '#EF4444'
    },
    {
      agent: 'Engagement Agent',
      tasksCompleted: 3456,
      successRate: 89.3,
      avgTime: '3.1 min',
      efficiency: 91.4,
      insights: 345,
      color: '#06B6D4'
    },
    {
      agent: 'Analytics Agent',
      tasksCompleted: 789,
      successRate: 97.1,
      avgTime: '5.6 min',
      efficiency: 93.8,
      insights: 123,
      color: '#84CC16'
    }
  ]

  // Saved reports
  const savedReports = [
    {
      id: 1,
      name: 'Weekly Performance Summary',
      description: 'Comprehensive weekly analytics across all platforms',
      schedule: 'weekly',
      lastRun: '2024-09-15T09:00:00Z',
      recipients: ['admin@aisocialmedia.com', 'team@aisocialmedia.com'],
      status: 'active'
    },
    {
      id: 2,
      name: 'Monthly Revenue Report',
      description: 'Detailed revenue analysis and forecasting',
      schedule: 'monthly',
      lastRun: '2024-09-01T08:00:00Z',
      recipients: ['finance@aisocialmedia.com'],
      status: 'active'
    },
    {
      id: 3,
      name: 'AI Agent Efficiency Report',
      description: 'Performance metrics for all 7 AI agents',
      schedule: 'daily',
      lastRun: '2024-09-15T06:00:00Z',
      recipients: ['tech@aisocialmedia.com'],
      status: 'active'
    }
  ]

  // Available widgets for report builder
  const availableWidgets = [
    { id: 'revenue_chart', name: 'Revenue Chart', type: 'chart', icon: DollarSign },
    { id: 'user_growth', name: 'User Growth', type: 'chart', icon: Users },
    { id: 'platform_performance', name: 'Platform Performance', type: 'table', icon: Globe },
    { id: 'engagement_metrics', name: 'Engagement Metrics', type: 'chart', icon: Heart },
    { id: 'ai_agent_performance', name: 'AI Agent Performance', type: 'chart', icon: Zap },
    { id: 'content_analysis', name: 'Content Analysis', type: 'table', icon: FileText },
    { id: 'conversion_funnel', name: 'Conversion Funnel', type: 'chart', icon: Target },
    { id: 'geographic_data', name: 'Geographic Data', type: 'map', icon: Globe }
  ]

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ]

  const metricOptions = [
    { id: 'revenue', name: 'Revenue', icon: DollarSign },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'engagement', name: 'Engagement', icon: Heart },
    { id: 'reach', name: 'Reach', icon: Eye },
    { id: 'conversions', name: 'Conversions', icon: Target }
  ]

  const handleExportReport = (format) => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      // Simulate download
      console.log(`Exporting report in ${format} format`)
    }, 2000)
  }

  const handleCreateReport = () => {
    const newReport = {
      id: Date.now(),
      name: reportBuilder.reportName,
      description: `Custom report with ${reportBuilder.selectedWidgets.length} widgets`,
      schedule: reportBuilder.schedule,
      lastRun: new Date().toISOString(),
      recipients: ['admin@aisocialmedia.com'],
      status: 'active'
    }
    setCustomReports([...customReports, newReport])
    setReportBuilder({ isOpen: false, selectedWidgets: [], reportName: '', schedule: 'none' })
  }

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
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Advanced Analytics</h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Comprehensive reporting, custom dashboards, and advanced insights
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                isDarkMode 
                  ? 'border-slate-600 bg-slate-800 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
              style={{
                color: isDarkMode ? '#ffffff' : '#374151'
              }}
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <Button
              onClick={() => setReportBuilder({ ...reportBuilder, isOpen: true })}
              size="sm"
              className={isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
            <Button variant="outline" size="sm" className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Revenue</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$18,320</p>
                  </div>
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                    <DollarSign className={`h-5 w-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className={`h-4 w-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'} ml-1`}>+24.5%</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-2`}>vs last period</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Reach</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>1.2M</p>
                  </div>
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                    <Eye className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} ml-1`}>+18.3%</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-2`}>vs last period</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Avg Engagement</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>5.8%</p>
                  </div>
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                    <Heart className={`h-5 w-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className={`h-4 w-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} ml-1`}>+12.7%</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-2`}>vs last period</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>AI Efficiency</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>91.2%</p>
                  </div>
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
                    <Zap className={`h-5 w-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className={`h-4 w-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-orange-400' : 'text-orange-600'} ml-1`}>+8.9%</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-2`}>vs last period</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Cross-Platform Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Cross-Platform Revenue</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Revenue comparison across all social media platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsAreaChart data={crossPlatformData}>
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
                  <Area type="monotone" dataKey="instagram" stackId="1" stroke="#E4405F" fill="#E4405F" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="facebook" stackId="1" stroke="#1877F2" fill="#1877F2" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="linkedin" stackId="1" stroke="#0A66C2" fill="#0A66C2" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="tiktok" stackId="1" stroke="#000000" fill="#000000" fillOpacity={0.6} />
                </RechartsAreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Engagement Breakdown</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Detailed engagement metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={engagementData}>
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
                  <Bar dataKey="likes" fill="#3B82F6" name="Likes" />
                  <Bar dataKey="comments" fill="#10B981" name="Comments" />
                  <Bar dataKey="shares" fill="#8B5CF6" name="Shares" />
                  <Line type="monotone" dataKey="saves" stroke="#F59E0B" strokeWidth={3} name="Saves" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Platform Performance Table */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Platform Performance Overview</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Comprehensive metrics for each social media platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Platform</th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Followers</th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Engagement</th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Reach</th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Revenue</th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Posts</th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {platformPerformance.map((platform, index) => (
                    <tr key={index} className={`border-b transition-colors ${
                      isDarkMode 
                        ? 'border-slate-700 hover:bg-slate-700/50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: platform.color }}
                          />
                          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{platform.platform}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{platform.followers.toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{platform.engagement}%</span>
                          <div className={`w-16 rounded-full h-2 ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                          }`}>
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(platform.engagement / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{platform.reach.toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>${platform.revenue.toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{platform.posts}</span>
                      </td>
                      <td className="p-4">
                        <Badge className={
                          platform.engagement > 6 ? (isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800') :
                          platform.engagement > 4 ? (isDarkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800') :
                          (isDarkMode ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800')
                        }>
                          {platform.engagement > 6 ? 'Excellent' :
                           platform.engagement > 4 ? 'Good' : 'Needs Improvement'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* AI Agent Performance */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>AI Agent Performance Analytics</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Detailed performance metrics for all 7 AI agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiAgentPerformance.map((agent, index) => (
                <div key={index} className={`p-4 border rounded-lg ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{agent.agent}</h3>
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: agent.color }}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tasks Completed</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{agent.tasksCompleted.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Success Rate</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{agent.successRate}%</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Avg Time</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{agent.avgTime}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Efficiency</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{agent.efficiency}%</span>
                    </div>
                    
                    <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${agent.efficiency}%`,
                          backgroundColor: agent.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Saved Reports */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Saved Reports & Automation</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Manage automated reports and scheduled analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedReports.map((report) => (
                <div key={report.id} className={`flex items-center justify-between p-4 border rounded-lg ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                      <FileText className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{report.name}</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{report.description}</p>
                      <div className={`flex items-center space-x-4 mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span>Schedule: {report.schedule}</span>
                        <span>Last run: {format(new Date(report.lastRun), 'MMM dd, HH:mm')}</span>
                        <span>{report.recipients.length} recipients</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={report.status === 'active' ? (isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800') : (isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800')}>
                      {report.status}
                    </Badge>
                    <Button variant='ghost' size='sm' className={isDarkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : ''}>
                      <Eye className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='sm' className={isDarkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : ''}>
                      <Edit className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='sm' className={isDarkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : ''}>
                      <Download className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Report Builder Modal */}
        {reportBuilder.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto ${
              isDarkMode ? 'bg-slate-800' : 'bg-white'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create Custom Report</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setReportBuilder({ ...reportBuilder, isOpen: false })}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Report Name
                  </label>
                  <input
                    type="text"
                    value={reportBuilder.reportName}
                    onChange={(e) => setReportBuilder({ ...reportBuilder, reportName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter report name..."
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Select Widgets
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {availableWidgets.map((widget) => {
                      const Icon = widget.icon
                      const isSelected = reportBuilder.selectedWidgets.includes(widget.id)
                      
                      return (
                        <div
                          key={widget.id}
                          onClick={() => {
                            const newSelected = isSelected
                              ? reportBuilder.selectedWidgets.filter(id => id !== widget.id)
                              : [...reportBuilder.selectedWidgets, widget.id]
                            setReportBuilder({ ...reportBuilder, selectedWidgets: newSelected })
                          }}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSelected 
                              ? (isDarkMode ? 'border-blue-500 bg-blue-900/30' : 'border-blue-500 bg-blue-50')
                              : (isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-300 hover:bg-gray-50')
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4" />
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{widget.name}</span>
                          </div>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{widget.type}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Schedule
                  </label>
                  <select
                    value={reportBuilder.schedule}
                    onChange={(e) => setReportBuilder({ ...reportBuilder, schedule: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                      isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    style={{
                      color: isDarkMode ? '#ffffff' : '#374151'
                    }}
                  >
                    <option value="none">No Schedule</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button 
                    variant="outline"
                    onClick={() => setReportBuilder({ ...reportBuilder, isOpen: false })}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateReport}
                    disabled={!reportBuilder.reportName || reportBuilder.selectedWidgets.length === 0}
                  >
                    Create Report
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdvancedAnalytics

