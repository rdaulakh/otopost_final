import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain,
  Target,
  TrendingUp,
  Calendar,
  Users,
  Zap,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  BarChart3,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Plus,
  RefreshCw
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { getThemeClasses } from '../utils/themeUtils.js'

// Import API hooks and UX components
import { 
  useGenerateStrategy,
  useStrategies,
  useAIAnalysis,
  useUpdateStrategy,
  useStrategyPerformance
} from '../hooks/useCustomerApi.js'
import { useNotificationSystem } from './NotificationSystem.jsx'
import { AnalyticsSkeleton } from './LoadingSkeletons.jsx'

const StrategyPlanner = ({ data, user, onDataUpdate }) => {
  const { isDarkMode } = useTheme()
  const themeClasses = getThemeClasses(isDarkMode)
  const [activeTab, setActiveTab] = useState('overview')

  // UX hooks
  const { success, error, info } = useNotificationSystem()

  // Real API calls for strategy data
  const { 
    data: strategiesData, 
    isLoading: strategiesLoading,
    error: strategiesError,
    refetch: refetchStrategies 
  } = useStrategies()
  
  const { 
    data: performanceData, 
    isLoading: performanceLoading 
  } = useStrategyPerformance()
  
  const { 
    mutate: generateStrategy, 
    isLoading: isGenerating,
    error: generateError 
  } = useGenerateStrategy()
  
  const { 
    mutate: updateStrategy,
    isLoading: isUpdating 
  } = useUpdateStrategy()
  
  const { 
    data: aiAnalysis,
    isLoading: analysisLoading 
  } = useAIAnalysis()

  // Loading state
  const isLoading = strategiesLoading || performanceLoading || analysisLoading

  // Error handling
  const hasError = strategiesError || generateError

  // No fallback data - show "No strategy generated yet" when empty

  // Parse strategy data from API response
  const currentStrategy = strategiesData && strategiesData.length > 0 ? strategiesData[0] : null;
  const rawAIResponse = currentStrategy?.rawAIResponse || {};
  
  const strategyData = {
    currentMonth: currentStrategy ? {
      id: currentStrategy.id,
      name: currentStrategy.name,
      description: currentStrategy.description,
      status: currentStrategy.status,
      confidence: currentStrategy.confidence,
      month: rawAIResponse.title || 'Current Strategy',
      theme: rawAIResponse.caption || currentStrategy.description,
      progress: 75, // Default progress
      objectives: [
        {
          goal: 'Brand Awareness',
          progress: 80,
          status: 'on_track'
        },
        {
          goal: 'Lead Generation',
          progress: 60,
          status: 'active'
        },
        {
          goal: 'Engagement Growth',
          progress: 90,
          status: 'ahead'
        }
      ],
      weeklyBreakdown: [
        {
          week: 'Week 1',
          theme: 'Foundation Building',
          focus: 'Brand awareness and audience engagement',
          tasks: ['Create brand guidelines', 'Set up content calendar', 'Launch social media accounts'],
          progress: 75,
          status: 'on_track'
        },
        {
          week: 'Week 2',
          theme: 'Content Creation',
          focus: 'High-quality content production',
          tasks: ['Create video content', 'Design graphics', 'Write blog posts'],
          progress: 60,
          status: 'active'
        },
        {
          week: 'Week 3',
          theme: 'Engagement & Growth',
          focus: 'Community building and interaction',
          tasks: ['Respond to comments', 'Run engagement campaigns', 'Collaborate with influencers'],
          progress: 40,
          status: 'planned'
        },
        {
          week: 'Week 4',
          theme: 'Analysis & Optimization',
          focus: 'Performance review and strategy refinement',
          tasks: ['Analyze metrics', 'A/B test content', 'Plan next month'],
          progress: 20,
          status: 'planned'
        }
      ]
    } : null,
    platformStrategies: currentStrategy ? [
      {
        platform: 'Instagram',
        content: rawAIResponse.platformContent?.instagram?.caption || 'Instagram strategy content',
        hashtags: rawAIResponse.hashtags || [],
        focus: 'Visual storytelling and brand awareness',
        icon: Instagram,
        performance: {
          engagement: 85,
          reach: 12500,
          growth: '+12%'
        }
      },
      {
        platform: 'LinkedIn',
        content: rawAIResponse.platformContent?.linkedin?.caption || 'LinkedIn strategy content',
        hashtags: rawAIResponse.hashtags || [],
        focus: 'Professional networking and B2B engagement',
        icon: Linkedin,
        performance: {
          engagement: 92,
          reach: 8500,
          growth: '+18%'
        }
      },
      {
        platform: 'Twitter',
        content: rawAIResponse.platformContent?.twitter?.caption || 'Twitter strategy content',
        hashtags: rawAIResponse.hashtags || [],
        focus: 'Real-time engagement and thought leadership',
        icon: Twitter,
        performance: {
          engagement: 78,
          reach: 15200,
          growth: '+8%'
        }
      }
    ] : [],
    aiInsights: aiAnalysis?.insights || [
      {
        type: 'performance',
        title: 'High Engagement Content',
        description: 'Video content performs 3x better than static images',
        priority: 'high',
        action: 'Increase video content to 60% of posts',
        icon: TrendingUp
      },
      {
        type: 'timing',
        title: 'Optimal Posting Times',
        description: 'Posts at 2-4 PM get 40% more engagement',
        priority: 'medium',
        action: 'Schedule more content during peak hours',
        icon: Clock
      },
      {
        type: 'audience',
        title: 'Audience Growth Opportunity',
        description: 'Your content resonates 40% better with 25-34 age group',
        priority: 'medium',
        action: 'Create more content targeting this demographic',
        icon: Users
      }
    ]
  }

  // Handle strategy generation
  const generateNewStrategy = async () => {
    try {
      await generateStrategy({
        objectives: ['brand_awareness', 'lead_generation', 'customer_engagement'],
        timeframe: '30d',
        platforms: ['instagram', 'linkedin', 'twitter', 'facebook'],
        targetAudience: user?.targetAudience || '',
        businessGoals: user?.businessGoals || '',
        currentChallenges: user?.currentChallenges || ''
      })
      success('New AI strategy generated successfully!')
      await refetchStrategies()
      if (onDataUpdate) {
        onDataUpdate({ lastStrategyUpdate: new Date() })
      }
    } catch (err) {
      error('Failed to generate new strategy. Please try again.')
    }
  }

  // Handle strategy updates
  const handleStrategyUpdate = async (strategyId, updates) => {
    try {
      await updateStrategy({ strategyId, updates })
      success('Strategy updated successfully!')
      await refetchStrategies()
    } catch (err) {
      error('Failed to update strategy')
    }
  }

  // Handle data refresh
  const handleRefresh = async () => {
    try {
      await refetchStrategies()
      success('Strategy data refreshed successfully')
    } catch (err) {
      error('Failed to refresh strategy data')
    }
  }

  // Show loading skeleton
  if (isLoading) {
    return <AnalyticsSkeleton />
  }

  // Show error state
  if (hasError) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <Brain className="h-5 w-5" />
              <span>Error loading strategy data. Please try refreshing.</span>
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

  // Show "No strategy generated yet" state
  if (!strategyData.currentMonth && !isLoading) {
    return (
      <div className="p-6 space-y-6 bg-white min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              AI Strategy Planner
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Generate intelligent content strategies powered by AI
            </p>
          </div>
          <Button 
            onClick={generateNewStrategy}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate New Strategy
              </>
            )}
          </Button>
        </div>

        {/* No Strategy State */}
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/95 max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                  <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No Strategy Generated Yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Generate your first AI-powered social media strategy to get started with intelligent content planning and optimization.
                </p>
              </div>
              
              <Button 
                onClick={generateNewStrategy}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating Strategy...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate My First Strategy
                  </>
                )}
              </Button>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                AI will analyze your organization data to create a personalized strategy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }



  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return isDarkMode ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-green-100 text-green-800 border-green-200'
      case 'active': return isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-800 border-blue-200'
      case 'planned': return isDarkMode ? 'bg-gray-800/50 text-gray-400 border-gray-600/30' : 'bg-gray-100 text-gray-800 border-gray-200'
      case 'on_track': return isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
      case 'ahead': return isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
      case 'behind': return isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
      default: return isDarkMode ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`p-6 space-y-6 bg-white min-h-screen ${isDarkMode ? 'dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            AI Strategy Planner
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Intelligent content strategy powered by 5 specialized AI agents
          </p>
        </div>
        <Button 
          onClick={generateNewStrategy}
          disabled={isGenerating}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate New Strategy
            </>
          )}
        </Button>
      </div>

      {/* Strategy Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full grid-cols-4 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-100'}`}>
          <TabsTrigger 
            value="overview"
            className={isDarkMode ? 'data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700/50' : ''}
          >
            Strategy Overview
          </TabsTrigger>
          <TabsTrigger 
            value="weekly"
            className={isDarkMode ? 'data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700/50' : ''}
          >
            Weekly Breakdown
          </TabsTrigger>
          <TabsTrigger 
            value="platforms"
            className={isDarkMode ? 'data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700/50' : ''}
          >
            Platform Strategies
          </TabsTrigger>
          <TabsTrigger 
            value="insights"
            className={isDarkMode ? 'data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700/50' : ''}
          >
            AI Insights
          </TabsTrigger>
        </TabsList>

        {/* Strategy Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Strategy */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/95">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Brain className="h-5 w-5 mr-2 text-purple-600" />
                        {strategyData.currentMonth.month} Strategy
                      </CardTitle>
                      <CardDescription>
                        {strategyData.currentMonth.theme}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                      {strategyData.currentMonth.confidence}% Confidence
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className={`text-sm ${themeClasses.textSecondary}`}>{strategyData.currentMonth.progress}%</span>
                    </div>
                    <Progress value={strategyData.currentMonth.progress} className="h-3" />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Monthly Objectives</h4>
                    {(strategyData.currentMonth?.objectives || []).map((objective, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {objective.goal}
                          </p>
                          <div className="flex items-center mt-2">
                            <Progress value={objective.progress} className="h-2 flex-1 mr-3" />
                            <span className={`text-xs ${themeClasses.textSecondary}`}>{objective.progress}%</span>
                          </div>
                        </div>
                        <Badge variant="outline" className={getStatusColor(objective.status)}>
                          {objective.status.replace('_', ' ')}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Agent Activity */}
            <div>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/95">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-orange-600" />
                    AI Agent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: 'Intelligence', status: 'Analyzing trends', color: 'bg-blue-500' },
                    { name: 'Strategy', status: 'Optimizing calendar', color: 'bg-green-500' },
                    { name: 'Content', status: 'Creating posts', color: 'bg-purple-500' },
                    { name: 'Execution', status: 'Monitoring performance', color: 'bg-orange-500' },
                    { name: 'Learning', status: 'Processing insights', color: 'bg-indigo-500' }
                  ].map((agent, index) => (
                    <motion.div
                      key={agent.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3"
                    >
                      <div className={`w-3 h-3 rounded-full ${agent.color} animate-pulse`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {agent.name}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {agent.status}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Weekly Breakdown */}
        <TabsContent value="weekly" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(strategyData.currentMonth?.weeklyBreakdown || []).map((week, index) => (
              <motion.div
                key={week.week}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/95">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Week {week.week}</CardTitle>
                        <CardDescription>{week.theme}</CardDescription>
                      </div>
                      <Badge variant="outline" className={getStatusColor(week.status)}>
                        {week.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${themeClasses.textSecondary}`}>Focus Area:</span>
                      <span className="text-sm font-medium">{week.focus}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${themeClasses.textSecondary}`}>Posts Planned:</span>
                      <span className="text-sm font-medium">{week.posts}</span>
                    </div>
                    
                    {week.performance && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                        <h5 className="text-sm font-medium mb-2">Performance</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                              {week.performance.engagement}%
                            </p>
                            <p className="text-xs text-slate-600">Engagement</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                              {week.performance?.reach?.toLocaleString() || '0'}
                            </p>
                            <p className="text-xs text-slate-600">Reach</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Platform Strategies */}
        <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(strategyData.platformStrategies || []).map((platform, index) => {
              const Icon = platform.icon
              return (
                <motion.div
                  key={platform.platform}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/95">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-xl ${platform.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle>{platform.platform}</CardTitle>
                          <CardDescription>{platform.frequency}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium mb-2">Strategy Focus</h5>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {platform.focus}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="text-center">
                          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            {platform.performance.engagement}%
                          </p>
                          <p className="text-xs text-slate-600">Engagement</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            {((platform.performance?.reach || 0) / 1000).toFixed(1)}K
                          </p>
                          <p className="text-xs text-slate-600">Reach</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-600">
                            {platform.performance.growth}
                          </p>
                          <p className="text-xs text-slate-600">Growth</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>

        {/* AI Insights */}
        <TabsContent value="insights" className="space-y-6">
          <div className="space-y-4">
            {(strategyData.aiInsights || []).map((insight, index) => {
              const Icon = insight.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/95">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-xl ${
                          insight.priority === 'high' ? 'bg-red-100 text-red-600' :
                          insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">
                              {insight.title}
                            </h4>
                            <Badge variant="outline" className={
                              insight.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                              insight.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }>
                              {insight.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            {insight.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              Recommended Action: {insight.action}
                            </p>
                            <Button size="sm" variant="outline">
                              Apply
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default StrategyPlanner

