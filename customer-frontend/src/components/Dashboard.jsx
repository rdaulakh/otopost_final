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
  TrendingUpIcon
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { getBadgeClasses } from '../constants/colors.js'

const Dashboard = ({ data: _data = {}, user = {}, onDataUpdate: _onDataUpdate = () => {} }) => {
  const { isDarkMode } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
  const [_selectedMetric, setSelectedMetric] = useState('engagement')
  const [activeAgentView, setActiveAgentView] = useState('overview')

  // Enhanced performance metrics with trends
  const performanceMetrics = {
    engagement_rate: { value: 4.2, trend: 12.5, target: 5.0, status: 'good' },
    reach: { value: 12500, trend: 8.2, target: 15000, status: 'good' },
    followers_growth: { value: 156, trend: 15.3, target: 200, status: 'warning' },
    posts_published: { value: 24, trend: 5.1, target: 30, status: 'warning' },
    revenue: { value: 8450, trend: 22.3, target: 10000, status: 'excellent' },
    conversion_rate: { value: 3.8, trend: 18.7, target: 4.5, status: 'good' },
    click_through_rate: { value: 2.4, trend: -3.2, target: 3.0, status: 'poor' },
    cost_per_click: { value: 0.85, trend: -15.4, target: 0.75, status: 'good' }
  }

  // Enhanced 7 AI Agents with detailed metrics
  const aiAgents = [
    {
      id: 'intelligence',
      name: 'Intelligence Agent',
      icon: Brain,
      color: 'bg-purple-500',
      status: 'active',
      efficiency: 94,
      currentTask: 'Analyzing competitor strategies',
      tasksCompleted: 127,
      tasksInProgress: 3,
      avgTaskTime: '12m',
      successRate: 96.8,
      insights: 'Found 3 trending hashtags',
      nextAction: 'Competitor analysis report',
      priority: 'high'
    },
    {
      id: 'strategy',
      name: 'Strategy Agent',
      icon: Target,
      color: 'bg-blue-500',
      status: 'active',
      efficiency: 91,
      currentTask: 'Planning Q1 content strategy',
      tasksCompleted: 89,
      tasksInProgress: 2,
      avgTaskTime: '25m',
      successRate: 94.2,
      insights: 'Optimal posting time: 3-5 PM',
      nextAction: 'Content calendar optimization',
      priority: 'high'
    },
    {
      id: 'content',
      name: 'Content Agent',
      icon: Sparkles,
      color: 'bg-green-500',
      status: 'active',
      efficiency: 96,
      currentTask: 'Creating Instagram carousel',
      tasksCompleted: 234,
      tasksInProgress: 5,
      avgTaskTime: '8m',
      successRate: 98.1,
      insights: 'Generated 12 high-quality posts',
      nextAction: 'Video content creation',
      priority: 'medium'
    },
    {
      id: 'execution',
      name: 'Execution Agent',
      icon: Play,
      color: 'bg-orange-500',
      status: 'active',
      efficiency: 88,
      currentTask: 'Scheduling 14 posts',
      tasksCompleted: 156,
      tasksInProgress: 4,
      avgTaskTime: '5m',
      successRate: 99.3,
      insights: 'Posted to 4 platforms successfully',
      nextAction: 'Cross-platform scheduling',
      priority: 'high'
    },
    {
      id: 'learning',
      name: 'Learning Agent',
      icon: Lightbulb,
      color: 'bg-indigo-500',
      status: 'active',
      efficiency: 92,
      currentTask: 'Optimizing posting times',
      tasksCompleted: 78,
      tasksInProgress: 2,
      avgTaskTime: '18m',
      successRate: 95.7,
      insights: 'Improved engagement by 15%',
      nextAction: 'A/B testing analysis',
      priority: 'medium'
    },
    {
      id: 'engagement',
      name: 'Engagement Agent',
      icon: MessageCircle,
      color: 'bg-pink-500',
      status: 'active',
      efficiency: 89,
      currentTask: 'Responding to 23 comments',
      tasksCompleted: 312,
      tasksInProgress: 8,
      avgTaskTime: '3m',
      successRate: 97.4,
      insights: 'Response rate: 98.5%',
      nextAction: 'Community management',
      priority: 'high'
    },
    {
      id: 'analytics',
      name: 'Analytics Agent',
      icon: BarChart3,
      color: 'bg-teal-500',
      status: 'active',
      efficiency: 95,
      currentTask: 'Generating weekly report',
      tasksCompleted: 45,
      tasksInProgress: 1,
      avgTaskTime: '15m',
      successRate: 99.1,
      insights: 'ROI increased by 28%',
      nextAction: 'Performance optimization',
      priority: 'medium'
    }
  ]

  // Real-time activity feed
  const recentActivities = [
    { agent: 'Content Agent', action: 'Created new Instagram post', time: '2 minutes ago', type: 'success' },
    { agent: 'Engagement Agent', action: 'Responded to 15 comments', time: '5 minutes ago', type: 'info' },
    { agent: 'Analytics Agent', action: 'Generated performance report', time: '12 minutes ago', type: 'success' },
    { agent: 'Strategy Agent', action: 'Updated content calendar', time: '18 minutes ago', type: 'info' },
    { agent: 'Intelligence Agent', action: 'Analyzed competitor trends', time: '25 minutes ago', type: 'warning' },
    { agent: 'Execution Agent', action: 'Scheduled 8 posts across platforms', time: '32 minutes ago', type: 'success' },
    { agent: 'Learning Agent', action: 'Optimized posting schedule', time: '45 minutes ago', type: 'info' }
  ]

  // Platform performance data
  const platformData = [
    { platform: 'Instagram', followers: 12500, engagement: 4.8, posts: 8, revenue: 3200, color: 'bg-pink-500' },
    { platform: 'Facebook', followers: 8200, engagement: 3.2, posts: 6, revenue: 2100, color: 'bg-blue-600' },
    { platform: 'LinkedIn', followers: 5100, engagement: 6.1, posts: 5, revenue: 1800, color: 'bg-blue-700' },
    { platform: 'Twitter', followers: 3400, engagement: 2.9, posts: 12, revenue: 950, color: 'bg-sky-500' },
    { platform: 'TikTok', followers: 2800, engagement: 8.2, posts: 4, revenue: 400, color: 'bg-black' }
  ]

  // Campaign performance
  const campaignData = {
    active: 3,
    pending: 2,
    completed: 8,
    total_spend: 2450,
    total_revenue: 8450,
    roi: 245,
    conversion_rate: 3.8,
    click_through_rate: 2.4
  }

  // Refresh data function
  const refreshData = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setLastUpdated(new Date())
    setIsLoading(false)
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return isDarkMode ? 'text-green-400 bg-green-900/30 border-green-500/30' : 'text-green-600 bg-green-100'
      case 'good': return isDarkMode ? 'text-blue-400 bg-blue-900/30 border-blue-500/30' : 'text-blue-600 bg-blue-100'
      case 'warning': return isDarkMode ? 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30' : 'text-yellow-600 bg-yellow-100'
      case 'poor': return isDarkMode ? 'text-red-400 bg-red-900/30 border-red-500/30' : 'text-red-600 bg-red-100'
      default: return isDarkMode ? 'text-gray-400 bg-gray-800/50 border-gray-600/30' : 'text-gray-600 bg-gray-100'
    }
  }

  // Get trend icon
  const getTrendIcon = (trend) => {
    return trend > 0 ? (
      <ArrowUpRight className={`h-4 w-4 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
    ) : (
      <ArrowDownRight className={`h-4 w-4 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
    )
  }

  // Calculate overall efficiency
  const overallEfficiency = Math.round(
    aiAgents.reduce((sum, agent) => sum + agent.efficiency, 0) / aiAgents.length
  )

  return (
    <div className={`p-6 space-y-6 bg-white  min-h-screen ${isDarkMode ?'dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900':''}`}>
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Welcome back, {user.name || 'test'}! Here's your social media performance overview.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <Clock className="h-4 w-4" />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white dark:bg-slate-800 cursor-pointer"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            
            <Button
              onClick={refreshData}
              disabled={isLoading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(performanceMetrics).map(([key, metric]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 hover:shadow-xl transition-all duration-300  group"
                  onClick={() => setSelectedMetric(key)}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {key === 'engagement_rate' && <Heart className="h-5 w-5 text-pink-500" />}
                    {key === 'reach' && <Eye className="h-5 w-5 text-blue-500" />}
                    {key === 'followers_growth' && <Users className="h-5 w-5 text-green-500" />}
                    {key === 'posts_published' && <Calendar className="h-5 w-5 text-purple-500" />}
                    {key === 'revenue' && <DollarSign className="h-5 w-5 text-emerald-500" />}
                    {key === 'conversion_rate' && <Target className="h-5 w-5 text-orange-500" />}
                    {key === 'click_through_rate' && <Activity className="h-5 w-5 text-indigo-500" />}
                    {key === 'cost_per_click' && <BarChart3 className="h-5 w-5 text-teal-500" />}
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 capitalize">
                      {key.replace('_', ' ')}
                    </span>
                  </div>
                  <Badge className={getStatusColor(metric.status)}>
                    {metric.status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {key.includes('rate') ? `${metric.value}%` : 
                       key === 'revenue' || key === 'cost_per_click' ? `$${metric.value.toLocaleString()}` :
                       metric.value.toLocaleString()}
                    </span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(metric.trend)}
                      <span className={`text-sm font-medium ${metric.trend > 0 ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}`}>
                        {Math.abs(metric.trend)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Progress to target</span>
                      <span>{Math.round((metric.value / metric.target) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(metric.value / metric.target) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Enhanced AI Agent Workflow */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/95">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900 dark:text-slate-100">AI Agent Workflow</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  7 specialized AI agents working on your social media strategy
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge className={`px-3 py-1 ${isDarkMode ? 'bg-purple-600 text-white' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                <Activity className="h-4 w-4 mr-1" />
                {overallEfficiency}% Efficiency
              </Badge>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={activeAgentView === 'overview' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveAgentView('overview')}
                  className={activeAgentView === 'overview' ? '' : (isDarkMode ? 'bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500' : '')}
                >
                  Overview
                </Button>
                <Button
                  variant={activeAgentView === 'detailed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveAgentView('detailed')}
                  className={activeAgentView === 'detailed' ? '' : (isDarkMode ? 'bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500' : '')}
                >
                  Detailed
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {aiAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <Card className="border border-slate-200 dark:border-slate-600 dark:bg-slate-800/90 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-10 h-10 ${agent.color} rounded-lg flex items-center justify-center text-white`}>
                        <agent.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                          {agent.name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${isDarkMode ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                            <div className={`w-2 h-2 rounded-full mr-1 ${
                              isDarkMode ? 'bg-white' : 'bg-green-500'
                            }`}></div>
                            {agent.status}
                          </Badge>
                          <Badge className={`text-xs ${
                            agent.priority === 'high' 
                              ? isDarkMode 
                                ? 'bg-red-500 text-white' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                              : agent.priority === 'medium' 
                                ? isDarkMode 
                                  ? 'bg-yellow-500 text-white' 
                                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                : isDarkMode 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-green-100 text-green-800 border border-green-200'
                          }`}>
                            {agent.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                          {agent.currentTask}
                        </p>
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                          <span>Efficiency</span>
                          <span>{agent.efficiency}%</span>
                        </div>
                        <Progress value={agent.efficiency} className="h-2" />
                      </div>
                      
                      {activeAgentView === 'detailed' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700"
                        >
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">Completed:</span>
                              <span className="font-medium ml-1 text-slate-900 dark:text-slate-100">{agent.tasksCompleted}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">In Progress:</span>
                              <span className="font-medium ml-1 text-slate-900 dark:text-slate-100">{agent.tasksInProgress}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">Avg Time:</span>
                              <span className="font-medium ml-1 text-slate-900 dark:text-slate-100">{agent.avgTaskTime}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">Success Rate:</span>
                              <span className="font-medium ml-1 text-slate-900 dark:text-slate-100">{agent.successRate}%</span>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Latest Insight:</p>
                            <p className="text-xs font-medium text-slate-900 dark:text-slate-100">{agent.insights}</p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Next Action:</span>
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-300">{agent.nextAction}</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Platform Performance & Campaign Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Performance */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-blue-600" />
              Platform Performance
            </CardTitle>
            <CardDescription>
              Performance across all connected social media platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platformData.map((platform, index) => (
                <motion.div
                  key={platform.platform}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors "
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center`}>
                      <Share2 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">{platform.platform}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{platform.followers.toLocaleString()} followers</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {platform.engagement}%
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {platform.posts} posts
                      </Badge>
                    </div>
                    <p className="text-xs text-green-600 font-medium">
                      ${platform.revenue.toLocaleString()} revenue
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Campaign Overview */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-purple-600" />
              Campaign Overview
            </CardTitle>
            <CardDescription>
              Current status of your marketing campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{campaignData.active}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Active Campaigns</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{campaignData.pending}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Pending Approval</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{campaignData.completed}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Completed</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Total ROI</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Return on Investment</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{campaignData.roi}%</p>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +22.3%
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Spend</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    ${campaignData.total_spend.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Revenue</p>
                  <p className="text-lg font-bold text-green-600">
                    ${campaignData.total_revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest actions from your AI agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm text-slate-900 dark:text-slate-100">
                        {activity.agent}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{activity.action}</p>
                  </div>
                  
                  <span className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Quick Actions */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Frequently used actions and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className={`h-20 flex flex-col items-center justify-center space-y-2 ${isDarkMode ? 'hover:bg-blue-900/20 hover:border-blue-400' : 'hover:bg-blue-50 hover:border-blue-300'}`}
                onClick={() => alert('Create Post functionality')}
              >
                <Plus className="h-5 w-5" />
                <span className="text-xs">Create Post</span>
              </Button>
              
              <Button 
                variant="outline" 
                className={`h-20 flex flex-col items-center justify-center space-y-2 ${isDarkMode ? 'hover:bg-green-900/20 hover:border-green-400' : 'hover:bg-green-50 hover:border-green-300'}`}
                onClick={() => alert('View Analytics functionality')}
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs">View Analytics</span>
              </Button>
              
              <Button 
                variant="outline" 
                className={`h-20 flex flex-col items-center justify-center space-y-2 ${isDarkMode ? 'hover:bg-purple-900/20 hover:border-purple-400' : 'hover:bg-purple-50 hover:border-purple-300'}`}
                onClick={() => alert('Schedule Content functionality')}
              >
                <Calendar className="h-5 w-5" />
                <span className="text-xs">Schedule Content</span>
              </Button>
              
              <Button 
                variant="outline" 
                className={`h-20 flex flex-col items-center justify-center space-y-2 ${isDarkMode ? 'hover:bg-orange-900/20 hover:border-orange-400' : 'hover:bg-orange-50 hover:border-orange-300'}`}
                onClick={() => alert('Export Report functionality')}
              >
                <Download className="h-5 w-5" />
                <span className="text-xs">Export Report</span>
              </Button>
            </div>
            
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Cpu className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">AI Active</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Optimizing performance across all platforms
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard

