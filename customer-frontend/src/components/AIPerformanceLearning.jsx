import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain,
  TrendingUp,
  Target,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Zap,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  Calendar,
  Users,
  Sparkles,
  RefreshCw,
  BookOpen,
  Award,
  Activity
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'


const AIPerformanceLearning = ({ data, user, onDataUpdate }) => {
  const { isDarkMode } = useTheme()

  const [learningInsights, setLearningInsights] = useState([
    {
      id: 1,
      agent: 'Content Direction Generator',
      insight: 'Productivity-focused content performs 34% better than general business tips',
      confidence: 92,
      impact: 'high',
      dataPoints: 156,
      recommendation: 'Increase productivity content from 20% to 35% of content mix',
      status: 'implemented',
      performanceGain: '+34%'
    },
    {
      id: 2,
      agent: 'Post Type Selector',
      insight: 'Carousel posts on Instagram generate 67% more engagement than single images',
      confidence: 88,
      impact: 'high',
      dataPoints: 89,
      recommendation: 'Switch 60% of Instagram image posts to carousel format',
      status: 'testing',
      performanceGain: '+67%'
    },
    {
      id: 3,
      agent: 'Complete Post Creator',
      insight: 'Posts with questions in captions increase comments by 45%',
      confidence: 85,
      impact: 'medium',
      dataPoints: 234,
      recommendation: 'Include engagement questions in 70% of posts',
      status: 'implemented',
      performanceGain: '+45%'
    },
    {
      id: 4,
      agent: 'Strategy Planning Agent',
      insight: 'Tuesday and Wednesday posts reach 23% more professionals on LinkedIn',
      confidence: 91,
      impact: 'medium',
      dataPoints: 67,
      recommendation: 'Schedule 50% of LinkedIn content on Tue/Wed',
      status: 'implemented',
      performanceGain: '+23%'
    },
    {
      id: 5,
      agent: 'Learning & Optimization Agent',
      insight: 'Hashtag sets with 8-12 tags perform better than 15+ tags',
      confidence: 79,
      impact: 'low',
      dataPoints: 145,
      recommendation: 'Optimize hashtag count to 8-12 per post',
      status: 'pending',
      performanceGain: '+12%'
    }
  ])

  const [agentPerformance, setAgentPerformance] = useState([
    {
      agent: 'Intelligence Gathering Agent',
      accuracy: 94,
      learningRate: 12,
      insights: 23,
      status: 'excellent',
      recentLearning: 'Identified trending AI tools topic with 89% engagement prediction accuracy'
    },
    {
      agent: 'Strategy Planning Agent',
      accuracy: 91,
      learningRate: 8,
      insights: 18,
      status: 'excellent',
      recentLearning: 'Optimized posting schedule based on audience activity patterns'
    },
    {
      agent: 'Content Direction Generator',
      accuracy: 88,
      learningRate: 15,
      insights: 31,
      status: 'good',
      recentLearning: 'Learned that case study content drives 40% more LinkedIn engagement'
    },
    {
      agent: 'Post Type Selector Agent',
      accuracy: 86,
      learningRate: 18,
      insights: 27,
      status: 'good',
      recentLearning: 'Discovered video content performs 3x better on Instagram during 6-8 PM'
    },
    {
      agent: 'Complete Post Creator Agent',
      accuracy: 89,
      learningRate: 11,
      insights: 22,
      status: 'excellent',
      recentLearning: 'Refined visual design patterns that increase click-through rates by 28%'
    },
    {
      agent: 'Execution Monitoring Agent',
      accuracy: 93,
      learningRate: 7,
      insights: 16,
      status: 'excellent',
      recentLearning: 'Improved posting time optimization with 95% accuracy in engagement prediction'
    },
    {
      agent: 'Learning & Optimization Agent',
      accuracy: 96,
      learningRate: 22,
      insights: 45,
      status: 'excellent',
      recentLearning: 'Developed new performance correlation model with 96% accuracy'
    }
  ])

  const [performanceImprovements, setPerformanceImprovements] = useState([
    {
      metric: 'Engagement Rate',
      before: 5.2,
      after: 7.8,
      improvement: 50,
      timeframe: '30 days'
    },
    {
      metric: 'Reach Growth',
      before: 12500,
      after: 18750,
      improvement: 50,
      timeframe: '30 days'
    },
    {
      metric: 'Content Relevance Score',
      before: 72,
      after: 94,
      improvement: 31,
      timeframe: '30 days'
    },
    {
      metric: 'Posting Time Accuracy',
      before: 68,
      after: 95,
      improvement: 40,
      timeframe: '30 days'
    }
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return isDarkMode ? 'text-green-400 bg-green-900/30 border-green-500/30' : 'text-green-600 bg-green-100'
      case 'good': return isDarkMode ? 'text-blue-400 bg-blue-900/30 border-blue-500/30' : 'text-blue-600 bg-blue-100'
      case 'needs-improvement': return 'text-orange-600 bg-orange-100'
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-100'
    }
  }

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-orange-600 bg-orange-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-100'
    }
  }

  const getImplementationStatus = (status) => {
    switch (status) {
      case 'implemented': return { icon: CheckCircle, color: 'text-green-600', label: 'Implemented' }
      case 'testing': return { icon: RefreshCw, color: 'text-blue-600', label: 'Testing' }
      case 'pending': return { icon: Clock, color: 'text-orange-600', label: 'Pending' }
      default: return { icon: AlertCircle, color: 'text-slate-600 dark:text-slate-400', label: 'Unknown' }
    }
  }

  const InsightCard = ({ insight }) => {
    const statusInfo = getImplementationStatus(insight.status)
    const StatusIcon = statusInfo.icon

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <Badge variant="secondary" className="text-xs">
                {insight.agent}
              </Badge>
            </div>
            <Badge className={`text-xs ${getImpactColor(insight.impact)}`}>
              {insight.impact} impact
            </Badge>
          </div>
          <CardTitle className="text-sm font-medium leading-tight">
            {insight.insight}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Confidence</span>
              <div className="flex items-center space-x-2">
                <Progress value={insight.confidence} className="w-16 h-2" />
                <span className="font-medium">{insight.confidence}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Data Points</span>
              <span className="font-medium">{insight.dataPoints}</span>
            </div>
            
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-700 mb-2">
                <strong>Recommendation:</strong> {insight.recommendation}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                  <span className={`text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {insight.performanceGain}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const AgentCard = ({ agent }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-slate-900 text-sm">{agent.agent}</h3>
          <Badge className={`text-xs ${getStatusColor(agent.status)}`}>
            {agent.status}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Accuracy</span>
            <span className="font-medium">{agent.accuracy}%</span>
          </div>
          <Progress value={agent.accuracy} className="h-2" />
          
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Learning Rate</span>
            <span className="font-medium">+{agent.learningRate}%</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Insights Generated</span>
            <span className="font-medium">{agent.insights}</span>
          </div>
        </div>
        
        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-slate-700">
          <strong>Recent Learning:</strong> {agent.recentLearning}
        </div>
      </CardContent>
    </Card>
  )

  const ImprovementCard = ({ improvement }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-slate-900">{improvement.metric}</h3>
          <Badge className="text-green-600 bg-green-100">
            +{improvement.improvement}%
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Before</span>
            <span className="font-medium">
              {typeof improvement.before === 'number' && improvement.before > 1000 
                ? (improvement.before / 1000).toFixed(1) + 'K'
                : improvement.before + (improvement.metric.includes('Rate') || improvement.metric.includes('Score') || improvement.metric.includes('Accuracy') ? '%' : '')
              }
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">After</span>
            <span className="font-medium text-green-600">
              {typeof improvement.after === 'number' && improvement.after > 1000 
                ? (improvement.after / 1000).toFixed(1) + 'K'
                : improvement.after + (improvement.metric.includes('Rate') || improvement.metric.includes('Score') || improvement.metric.includes('Accuracy') ? '%' : '')
              }
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Over {improvement.timeframe}
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
            AI Performance Learning
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            How AI agents learn from your performance data to optimize content strategy
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <BookOpen className="h-4 w-4 mr-2" />
            Learning Report
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retrain Models
          </Button>
        </div>
      </div>

      {/* Learning Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Insights</p>
                <p className="text-2xl font-bold text-slate-900">{learningInsights.length}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Confidence</p>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.round(learningInsights.reduce((sum, insight) => sum + insight.confidence, 0) / learningInsights.length)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Implemented</p>
                <p className="text-2xl font-bold text-slate-900">
                  {learningInsights.filter(i => i.status === 'implemented').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Performance Gain</p>
                <p className="text-2xl font-bold text-green-600">+36%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Learning Insights</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="improvements">Improvements</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Learning Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {learningInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </TabsContent>

        {/* Agent Performance Tab */}
        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentPerformance.map((agent, index) => (
              <AgentCard key={index} agent={agent} />
            ))}
          </div>
        </TabsContent>

        {/* Improvements Tab */}
        <TabsContent value="improvements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceImprovements.map((improvement, index) => (
              <ImprovementCard key={index} improvement={improvement} />
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Performance Impact Timeline</CardTitle>
              <CardDescription>
                How AI learning has improved your social media performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-slate-900">Content Direction Optimization</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">AI learned productivity content performs 34% better</p>
                    </div>
                  </div>
                  <Badge className="text-green-600 bg-green-100">+34% engagement</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-slate-900">Post Type Selection</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Switched to carousel format for better engagement</p>
                    </div>
                  </div>
                  <Badge className="text-blue-600 bg-blue-100">+67% engagement</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-slate-900">Posting Time Optimization</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Optimized schedule based on audience activity</p>
                    </div>
                  </div>
                  <Badge className="text-purple-600 bg-purple-100">+23% reach</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  <span>AI Recommendations</span>
                </CardTitle>
                <CardDescription>
                  Based on performance analysis and learning insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border-l-4 border-green-500 bg-green-50">
                    <h4 className="font-medium text-green-900">High Priority</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Increase carousel posts to 60% of Instagram content mix for +67% engagement boost
                    </p>
                  </div>
                  
                  <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                    <h4 className="font-medium text-blue-900">Medium Priority</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Schedule more LinkedIn content on Tuesday/Wednesday for +23% professional reach
                    </p>
                  </div>
                  
                  <div className="p-3 border-l-4 border-orange-500 bg-orange-50">
                    <h4 className="font-medium text-orange-900">Low Priority</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      Optimize hashtag count to 8-12 tags per post for +12% discoverability
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <span>Learning Progress</span>
                </CardTitle>
                <CardDescription>
                  AI agent learning and adaptation status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Content Pattern Recognition</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Audience Behavior Analysis</span>
                      <span>87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Platform Algorithm Adaptation</span>
                      <span>91%</span>
                    </div>
                    <Progress value={91} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Performance Prediction</span>
                      <span>89%</span>
                    </div>
                    <Progress value={89} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AIPerformanceLearning

