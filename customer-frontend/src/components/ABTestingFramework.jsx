import React, { useState, useEffect } from 'react'
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
  MoreHorizontal,
  Loader2,
  RefreshCw
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { useABTests, useABTestResults, useABTestMetrics, useCreateABTest } from '../hooks/useApi.js'

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
  const [activeTab, setActiveTab] = useState('experiments')
  const [selectedExperiment, setSelectedExperiment] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Real API integration
  const { 
    data: abTests, 
    isLoading: testsLoading, 
    error: testsError,
    refetch: refetchTests 
  } = useABTests()

  const { 
    data: testResults, 
    isLoading: resultsLoading, 
    error: resultsError,
    refetch: refetchResults 
  } = useABTestResults(selectedExperiment?.id)

  const { 
    data: testMetrics, 
    isLoading: metricsLoading, 
    error: metricsError,
    refetch: refetchMetrics 
  } = useABTestMetrics(selectedExperiment?.id)

  const createABTestMutation = useCreateABTest()

  // Combined loading state
  const isLoading = testsLoading || resultsLoading || metricsLoading

  // Combined error state
  const hasError = testsError || resultsError || metricsError

  // Refresh all data
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchTests(),
        refetchResults(),
        refetchMetrics()
      ])
      onDataUpdate?.()
    } catch (error) {
      console.error('Failed to refresh A/B testing data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Auto-refresh disabled to prevent constant refreshing
  // useEffect(() => {
  //   const interval = setInterval(handleRefresh, 2 * 60 * 1000)
  //   return () => clearInterval(interval)
  // }, [])

  // Handle experiment selection
  const handleExperimentSelect = (experiment) => {
    setSelectedExperiment(experiment)
  }

  // Handle experiment action (start, pause, stop)
  const handleExperimentAction = async (experimentId, action) => {
    try {
      // API call to update experiment status
      console.log(`${action} experiment ${experimentId}`)
      await handleRefresh()
    } catch (error) {
      console.error(`Failed to ${action} experiment:`, error)
    }
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'running':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'running':
        return Play
      case 'paused':
        return Pause
      case 'completed':
        return CheckCircle
      case 'draft':
        return Clock
      default:
        return AlertCircle
    }
  }

  // Format percentage
  const formatPercentage = (num) => {
    if (!num) return '0%'
    return `${num.toFixed(1)}%`
  }

  // Format number
  const formatNumber = (num) => {
    if (!num || num === 0) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Calculate statistical significance
  const calculateSignificance = (variantA, variantB) => {
    if (!variantA || !variantB) return 0
    // Simplified significance calculation
    const diff = Math.abs(variantA.conversionRate - variantB.conversionRate)
    const pooled = (variantA.conversions + variantB.conversions) / (variantA.visitors + variantB.visitors)
    const se = Math.sqrt(pooled * (1 - pooled) * (1/variantA.visitors + 1/variantB.visitors))
    const zScore = diff / se
    return Math.min(99.9, (1 - 2 * (1 - 0.5 * (1 + Math.erf(zScore / Math.sqrt(2))))) * 100)
  }

  // Error state
  if (hasError && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Failed to load A/B testing data
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          We're having trouble loading your A/B testing experiments. Please try refreshing.
        </p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  // Loading state
  if (isLoading && !abTests) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Loading A/B Testing Framework
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Fetching your experiments and results...
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <TestTube className="h-8 w-8 mr-3 text-blue-500" />
            A/B Testing Framework
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Design, run, and analyze experiments to optimize your content performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Experiment
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Experiments</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testMetrics?.activeExperiments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {testMetrics?.totalExperiments || 0} total experiments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Lift</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(testMetrics?.averageLift)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all completed tests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Significant Results</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testMetrics?.significantResults || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {testMetrics?.completedExperiments || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(testMetrics?.totalVisitors)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all experiments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Experiments Tab */}
        <TabsContent value="experiments" className="space-y-6">
          <div className="grid gap-6">
            {abTests?.map((experiment) => {
              const StatusIcon = getStatusIcon(experiment.status)
              return (
                <motion.div
                  key={experiment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="cursor-pointer"
                  onClick={() => handleExperimentSelect(experiment)}
                >
                  <Card className={`transition-all duration-200 hover:shadow-lg ${
                    selectedExperiment?.id === experiment.id ? 'ring-2 ring-blue-500' : ''
                  }`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <StatusIcon className="h-5 w-5 text-gray-500" />
                          <div>
                            <CardTitle className="text-lg">{experiment.name}</CardTitle>
                            <CardDescription>{experiment.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(experiment.status)}>
                            {experiment.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Platform</p>
                          <p className="font-medium capitalize">{experiment.platform}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Objective</p>
                          <p className="font-medium capitalize">{experiment.objective}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="font-medium">
                            {new Date(experiment.startDate).toLocaleDateString()} - 
                            {new Date(experiment.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Progress</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={experiment.progress || 0} className="flex-1" />
                            <span className="text-sm font-medium">{experiment.progress || 0}%</span>
                          </div>
                        </div>
                      </div>
                      
                      {experiment.variants && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(experiment.variants || []).map((variant, index) => (
                            <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{variant.name}</h4>
                                <Badge variant="outline">{formatPercentage(variant.traffic)}</Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                  <p className="text-gray-500">Visitors</p>
                                  <p className="font-medium">{formatNumber(variant.visitors)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Conversions</p>
                                  <p className="font-medium">{variant.conversions}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Rate</p>
                                  <p className="font-medium">{formatPercentage(variant.conversionRate)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {experiment.status === 'running' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleExperimentAction(experiment.id, 'pause')
                              }}
                            >
                              <Pause className="h-4 w-4 mr-1" />
                              Pause
                            </Button>
                          )}
                          {experiment.status === 'paused' && (
                            <Button 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleExperimentAction(experiment.id, 'resume')
                              }}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Resume
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                        
                        {experiment.significance && (
                          <div className="text-sm">
                            <span className="text-gray-500">Significance: </span>
                            <span className={`font-medium ${
                              experiment.significance >= 95 ? 'text-green-600' : 
                              experiment.significance >= 80 ? 'text-yellow-600' : 'text-gray-600'
                            }`}>
                              {formatPercentage(experiment.significance)}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
            
            {(!abTests || abTests.length === 0) && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <TestTube className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No experiments yet
                  </h3>
                  <p className="text-gray-500 text-center mb-4">
                    Create your first A/B test to start optimizing your content performance.
                  </p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Experiment
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          {selectedExperiment ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  {selectedExperiment.name} - Results
                </CardTitle>
                <CardDescription>
                  Detailed performance analysis and statistical significance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testResults?.chartData && (
                  <div className="h-80 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={testResults.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {testResults.variants?.map((variant, index) => (
                          <Line 
                            key={variant.name}
                            type="monotone" 
                            dataKey={variant.name.toLowerCase().replace(' ', '_')}
                            stroke={variant.color || `hsl(${index * 120}, 70%, 50%)`}
                            strokeWidth={2}
                            name={variant.name}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {testResults?.variants?.map((variant, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h4 className="font-medium mb-3">{variant.name}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Visitors</span>
                          <span className="font-medium">{formatNumber(variant.visitors)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Conversions</span>
                          <span className="font-medium">{variant.conversions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Conversion Rate</span>
                          <span className="font-medium">{formatPercentage(variant.conversionRate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Confidence</span>
                          <span className={`font-medium ${
                            variant.confidence >= 95 ? 'text-green-600' : 
                            variant.confidence >= 80 ? 'text-yellow-600' : 'text-gray-600'
                          }`}>
                            {formatPercentage(variant.confidence)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select an experiment
                </h3>
                <p className="text-gray-500 text-center">
                  Choose an experiment from the list to view detailed results and analysis.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {testMetrics?.insights?.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <Zap className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {insight.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {insight.description}
                      </p>
                      <Badge variant="outline" className="mt-2">
                        {insight.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {testMetrics?.recommendations?.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <Award className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {rec.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {rec.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                          {rec.priority} priority
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Expected lift: {formatPercentage(rec.expectedLift)}
                        </span>
                      </div>
                    </div>
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

export default ABTestingFramework
