import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TestTube,
  Plus,
  Play,
  Pause,
  BarChart3,
  TrendingUp,
  Target,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  Settings,
  Download,
  Copy,
  Edit,
  Trash2,
  Award,
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  MoreHorizontal
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const ABTestingFramework = ({ data, user, onDataUpdate }) => {
  const { isDarkMode } = useTheme()

  console.log('ABTestingFramework component loaded')
  const [activeTab, setActiveTab] = useState('experiments')
  const [selectedExperiment, setSelectedExperiment] = useState(null)

  // A/B Testing data
  const [testingData] = useState({
    experiments: [
      {
        id: 1,
        name: 'Instagram Carousel vs Single Image',
        description: 'Testing carousel posts vs single image posts for SaaS product features',
        status: 'running',
        startDate: '2024-01-08',
        endDate: '2024-01-15',
        platform: 'instagram',
        objective: 'engagement',
        variants: [
          {
            id: 'A',
            name: 'Carousel Post',
            type: 'carousel',
            description: '5-slide carousel showcasing product features',
            traffic: 50,
            metrics: {
              impressions: 12500,
              likes: 890,
              comments: 67,
              shares: 34,
              saves: 156,
              engagementRate: 9.2,
              clickThroughRate: 2.8,
              conversionRate: 1.4
            }
          },
          {
            id: 'B',
            name: 'Single Image',
            type: 'image',
            description: 'Single hero image with key product benefit',
            traffic: 50,
            metrics: {
              impressions: 12300,
              likes: 745,
              comments: 43,
              shares: 21,
              saves: 98,
              engagementRate: 7.4,
              clickThroughRate: 2.1,
              conversionRate: 0.9
            }
          }
        ],
        confidence: 94.2,
        winner: 'A',
        significance: 'high',
        daysRemaining: 2
      },
      {
        id: 2,
        name: 'LinkedIn Post Timing Test',
        description: 'Testing optimal posting times for B2B SaaS content',
        status: 'completed',
        startDate: '2024-01-01',
        endDate: '2024-01-07',
        platform: 'linkedin',
        objective: 'reach',
        variants: [
          {
            id: 'A',
            name: '9:00 AM EST',
            type: 'timing',
            description: 'Morning business hours posting',
            traffic: 33.3,
            metrics: {
              impressions: 8900,
              likes: 234,
              comments: 45,
              shares: 67,
              engagementRate: 3.9,
              clickThroughRate: 4.2,
              conversionRate: 2.1
            }
          },
          {
            id: 'B',
            name: '1:00 PM EST',
            type: 'timing',
            description: 'Lunch break posting',
            traffic: 33.3,
            metrics: {
              impressions: 9200,
              likes: 298,
              comments: 52,
              shares: 89,
              engagementRate: 4.8,
              clickThroughRate: 5.1,
              conversionRate: 2.7
            }
          },
          {
            id: 'C',
            name: '6:00 PM EST',
            type: 'timing',
            description: 'Evening after-work posting',
            traffic: 33.3,
            metrics: {
              impressions: 8700,
              likes: 187,
              comments: 31,
              shares: 43,
              engagementRate: 3.0,
              clickThroughRate: 3.1,
              conversionRate: 1.5
            }
          }
        ],
        confidence: 98.7,
        winner: 'B',
        significance: 'very_high',
        daysRemaining: 0
      },
      {
        id: 3,
        name: 'Twitter Thread vs Single Tweet',
        description: 'Testing thread format vs single tweet for thought leadership',
        status: 'draft',
        startDate: '2024-01-16',
        endDate: '2024-01-23',
        platform: 'twitter',
        objective: 'engagement',
        variants: [
          {
            id: 'A',
            name: 'Twitter Thread',
            type: 'thread',
            description: '8-tweet thread on AI trends',
            traffic: 50,
            metrics: null
          },
          {
            id: 'B',
            name: 'Single Tweet',
            type: 'tweet',
            description: 'Single comprehensive tweet',
            traffic: 50,
            metrics: null
          }
        ],
        confidence: null,
        winner: null,
        significance: null,
        daysRemaining: null
      },
      {
        id: 4,
        name: 'Facebook Video vs Image Post',
        description: 'Testing video content vs static image for product demos',
        status: 'paused',
        startDate: '2024-01-05',
        endDate: '2024-01-12',
        platform: 'facebook',
        objective: 'conversions',
        variants: [
          {
            id: 'A',
            name: 'Product Demo Video',
            type: 'video',
            description: '60-second product demonstration',
            traffic: 50,
            metrics: {
              impressions: 15600,
              likes: 432,
              comments: 89,
              shares: 156,
              engagementRate: 4.3,
              clickThroughRate: 3.8,
              conversionRate: 2.2
            }
          },
          {
            id: 'B',
            name: 'Static Image',
            type: 'image',
            description: 'High-quality product screenshot',
            traffic: 50,
            metrics: {
              impressions: 15200,
              likes: 298,
              comments: 45,
              shares: 87,
              engagementRate: 2.8,
              clickThroughRate: 2.1,
              conversionRate: 1.1
            }
          }
        ],
        confidence: 89.3,
        winner: 'A',
        significance: 'high',
        daysRemaining: null
      }
    ],
    templates: [
      {
        id: 1,
        name: 'Content Format Test',
        description: 'Compare different content formats (carousel, video, image)',
        category: 'content',
        platforms: ['instagram', 'facebook', 'linkedin'],
        objectives: ['engagement', 'reach', 'conversions']
      },
      {
        id: 2,
        name: 'Posting Time Optimization',
        description: 'Find optimal posting times for your audience',
        category: 'timing',
        platforms: ['all'],
        objectives: ['reach', 'engagement']
      },
      {
        id: 3,
        name: 'Caption Length Test',
        description: 'Test short vs long captions for engagement',
        category: 'copy',
        platforms: ['instagram', 'facebook'],
        objectives: ['engagement', 'saves']
      },
      {
        id: 4,
        name: 'CTA Optimization',
        description: 'Test different call-to-action phrases',
        category: 'copy',
        platforms: ['all'],
        objectives: ['conversions', 'clicks']
      },
      {
        id: 5,
        name: 'Hashtag Strategy Test',
        description: 'Compare hashtag strategies and quantities',
        category: 'hashtags',
        platforms: ['instagram', 'twitter'],
        objectives: ['reach', 'discovery']
      }
    ],
    insights: [
      {
        id: 1,
        title: 'Carousel Posts Drive 24% Higher Engagement',
        description: 'Multi-slide carousel posts consistently outperform single images across all platforms',
        impact: 'high',
        confidence: 94.2,
        recommendation: 'Increase carousel post frequency to 60% of content mix'
      },
      {
        id: 2,
        title: 'Lunch Time Posts Perform Best on LinkedIn',
        description: '1:00 PM EST shows 23% higher engagement than morning or evening posts',
        impact: 'medium',
        confidence: 98.7,
        recommendation: 'Schedule LinkedIn posts between 12:00-2:00 PM EST'
      },
      {
        id: 3,
        title: 'Video Content Doubles Conversion Rates',
        description: 'Product demo videos achieve 2x higher conversion rates than static images',
        impact: 'very_high',
        confidence: 89.3,
        recommendation: 'Prioritize video content for product-focused posts'
      }
    ]
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-100'
      case 'completed': return 'text-blue-600 bg-blue-100'
      case 'paused': return 'text-orange-600 bg-orange-100'
      case 'draft': return 'text-slate-600 dark:text-slate-400 bg-slate-100'
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-100'
    }
  }

  const getSignificanceColor = (significance) => {
    switch (significance) {
      case 'very_high': return 'text-green-600'
      case 'high': return 'text-blue-600'
      case 'medium': return 'text-orange-600'
      case 'low': return 'text-red-600'
      default: return 'text-slate-600 dark:text-slate-400'
    }
  }

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'very_high': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-blue-600 bg-blue-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-100'
    }
  }

  const formatMetric = (value, type) => {
    if (!value) return 'N/A'
    switch (type) {
      case 'percentage': return `${value}%`
      case 'number': return value.toLocaleString()
      case 'currency': return `$${value.toFixed(2)}`
      default: return value
    }
  }

  const ExperimentCard = ({ experiment }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedExperiment(experiment)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{experiment.name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{experiment.description}</p>
          </div>
          <Badge className={`text-xs ${getStatusColor(experiment.status)}`}>
            {experiment.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Platform</p>
            <p className="font-medium capitalize">{experiment.platform}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Objective</p>
            <p className="font-medium capitalize">{experiment.objective}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Variants</p>
            <p className="font-medium">{experiment.variants.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Duration</p>
            <p className="font-medium">
              {experiment.daysRemaining !== null 
                ? experiment.daysRemaining > 0 
                  ? `${experiment.daysRemaining} days left`
                  : 'Completed'
                : 'Not started'
              }
            </p>
          </div>
        </div>

        {experiment.status === 'running' || experiment.status === 'completed' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Test Progress</span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {experiment.confidence ? `${experiment.confidence}% confidence` : 'Collecting data...'}
              </span>
            </div>
            
            {experiment.confidence && (
              <Progress value={experiment.confidence} className="h-2" />
            )}

            {experiment.winner && (
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">
                  Winner: Variant {experiment.winner}
                </span>
                {experiment.significance && (
                  <Badge className={`text-xs ${getSignificanceColor(experiment.significance)}`}>
                    {experiment.significance.replace('_', ' ')} significance
                  </Badge>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {experiment.variants.slice(0, 2).map((variant) => (
                <div key={variant.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Variant {variant.id}</span>
                    {experiment.winner === variant.id && (
                      <Award className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  {variant.metrics && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Engagement:</span>
                        <span className="font-medium">{variant.metrics.engagementRate}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>CTR:</span>
                        <span className="font-medium">{variant.metrics.clickThroughRate}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {experiment.status === 'draft' ? 'Ready to launch' : 'Test paused'}
            </span>
            <Button size="sm" variant="outline">
              {experiment.status === 'draft' ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Test
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const TemplateCard = ({ template }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{template.name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{template.description}</p>
          </div>
          <Badge className="text-xs text-blue-600 bg-blue-100">
            {template.category}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Platforms</p>
            <div className="flex flex-wrap gap-1">
              {template.platforms.map((platform, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {platform}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Objectives</p>
            <div className="flex flex-wrap gap-1">
              {template.objectives.map((objective, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {objective}
                </Badge>
              ))}
            </div>
          </div>

          <Button className="w-full mt-4" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Test
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const InsightCard = ({ insight }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-slate-900">{insight.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{insight.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`text-xs ${getImpactColor(insight.impact)}`}>
              {insight.impact} impact
            </Badge>
            <span className="text-sm font-medium text-green-600">
              {insight.confidence}% confidence
            </span>
          </div>
        </div>
        
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900">Recommendation:</p>
          <p className="text-sm text-blue-700 mt-1">{insight.recommendation}</p>
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
            A/B Testing Framework
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Test, optimize, and improve your social media performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Experiment
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Tests</p>
                <p className="text-2xl font-bold text-slate-900">
                  {testingData.experiments.filter(exp => exp.status === 'running').length}
                </p>
              </div>
              <TestTube className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Completed Tests</p>
                <p className="text-2xl font-bold text-slate-900">
                  {testingData.experiments.filter(exp => exp.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg. Improvement</p>
                <p className="text-2xl font-bold text-slate-900">+24%</p>
                <p className="text-sm text-green-600">engagement rate</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Success Rate</p>
                <p className="text-2xl font-bold text-slate-900">87%</p>
                <p className="text-sm text-blue-600">significant results</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Experiments Tab */}
        <TabsContent value="experiments" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search experiments..."
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {testingData.experiments.map((experiment) => (
              <ExperimentCard key={experiment.id} experiment={experiment} />
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="text-center py-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Pre-built Test Templates
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Start with proven test frameworks to optimize your social media performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testingData.templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="text-center py-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              AI-Powered Insights
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Actionable recommendations based on your A/B test results
            </p>
          </div>

          <div className="space-y-4">
            {testingData.insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Performance Over Time</CardTitle>
                <CardDescription>Engagement improvements from A/B tests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { month: 'Oct', baseline: 5.2, optimized: 5.2 },
                      { month: 'Nov', baseline: 5.4, optimized: 6.1 },
                      { month: 'Dec', baseline: 5.1, optimized: 6.8 },
                      { month: 'Jan', baseline: 5.3, optimized: 7.4 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, '']} />
                      <Legend />
                      <Line type="monotone" dataKey="baseline" stroke="#94A3B8" name="Baseline" />
                      <Line type="monotone" dataKey="optimized" stroke="#3B82F6" name="Optimized" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Categories</CardTitle>
                <CardDescription>Distribution of test types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Content Format', value: 35, color: '#3B82F6' },
                          { name: 'Timing', value: 25, color: '#10B981' },
                          { name: 'Copy', value: 20, color: '#8B5CF6' },
                          { name: 'Hashtags', value: 12, color: '#F59E0B' },
                          { name: 'CTA', value: 8, color: '#EF4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {[
                          { name: 'Content Format', value: 35, color: '#3B82F6' },
                          { name: 'Timing', value: 25, color: '#10B981' },
                          { name: 'Copy', value: 20, color: '#8B5CF6' },
                          { name: 'Hashtags', value: 12, color: '#F59E0B' },
                          { name: 'CTA', value: 8, color: '#EF4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Platform Performance Comparison</CardTitle>
              <CardDescription>A/B test success rates by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { platform: 'Instagram', tests: 12, successful: 10, successRate: 83.3 },
                    { platform: 'LinkedIn', tests: 8, successful: 7, successRate: 87.5 },
                    { platform: 'Twitter', tests: 6, successful: 5, successRate: 83.3 },
                    { platform: 'Facebook', tests: 4, successful: 4, successRate: 100 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'successRate' ? `${value}%` : value,
                      name === 'tests' ? 'Total Tests' : 
                      name === 'successful' ? 'Successful Tests' : 'Success Rate'
                    ]} />
                    <Legend />
                    <Bar dataKey="tests" fill="#94A3B8" name="Total Tests" />
                    <Bar dataKey="successful" fill="#3B82F6" name="Successful Tests" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ABTestingFramework

