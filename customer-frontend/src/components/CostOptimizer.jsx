import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Settings,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Users,
  Brain,
  Activity,
  Coins,
  CreditCard,
  Wallet,
  Calculator,
  Gauge,
  RefreshCw,
  Download,
  Plus,
  Minus
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { 
  useUserUsageStats, 
  useUserSubscription, 
  useAIUsageStats, 
  useAnalyticsOverview,
  useCostOptimization,
  useUsagePredictions,
  useOptimizationRecommendations
} from '../hooks/useApi.js'

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
  ResponsiveContainer
} from 'recharts'

const CostOptimizer = ({ data, user, onDataUpdate }) => {
  const { isDarkMode } = useTheme()
  const [currentPlan, setCurrentPlan] = useState('premium')
  const [budgetAlert, setBudgetAlert] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Real API calls for cost optimization data
  const { data: usageStats, isLoading: usageLoading, error: usageError, refetch: refetchUsage } = useUserUsageStats()
  const { data: subscription, isLoading: subscriptionLoading, error: subscriptionError } = useUserSubscription()
  const { data: aiUsage, isLoading: aiLoading, error: aiError } = useAIUsageStats()
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useAnalyticsOverview()
  const { data: costOptimization, isLoading: costLoading, error: costError } = useCostOptimization()
  const { data: predictions, isLoading: predictionsLoading, error: predictionsError } = useUsagePredictions()
  const { data: recommendations, isLoading: recommendationsLoading, error: recommendationsError } = useOptimizationRecommendations()

  // Loading state
  const isLoading = usageLoading || subscriptionLoading || aiLoading || analyticsLoading || costLoading || predictionsLoading || recommendationsLoading
  
  // Error state
  const hasError = usageError || subscriptionError || aiError || analyticsError || costError || predictionsError || recommendationsError

  // Refresh all data
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        refetchUsage(),
        // Add other refetch calls when available
      ])
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  // Process real data or use fallback structure
  const processedData = {
    currentUsage: {
      monthlyBudget: subscription?.billing?.monthlyLimit || 150.00,
      currentSpend: usageStats?.currentMonthCost || 0,
      tokensUsed: aiUsage?.tokensUsed || 0,
      tokensLimit: subscription?.features?.aiCredits || 75000,
      apiCalls: usageStats?.apiCalls || 0,
      apiLimit: subscription?.features?.apiCallsLimit || 5000,
      efficiency: costOptimization?.efficiency || 0
    },
    breakdown: costOptimization?.breakdown || [],
    dailyUsage: usageStats?.dailyUsage || [],
    optimizations: recommendations?.optimizations || [],
    predictions: predictions?.monthlyPredictions || [],
    plans: subscription?.availablePlans || []
  }

  // Calculate usage percentages
  const budgetUsed = (processedData.currentUsage.currentSpend / processedData.currentUsage.monthlyBudget) * 100
  const tokensUsed = (processedData.currentUsage.tokensUsed / processedData.currentUsage.tokensLimit) * 100
  const apiCallsUsed = (processedData.currentUsage.apiCalls / processedData.currentUsage.apiLimit) * 100

  // Budget alert logic
  useEffect(() => {
    setBudgetAlert(budgetUsed > 80)
  }, [budgetUsed])

  // Error display
  if (hasError) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Error Loading Cost Data
            </CardTitle>
            <CardDescription className="text-red-600 dark:text-red-400">
              Unable to load cost optimization data. Please try refreshing the page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRefresh} variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading display
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
          Loading cost optimization data...
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cost Optimizer</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and optimize your AI usage costs
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Budget Alert */}
      {budgetAlert && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">Budget Alert</h3>
              <p className="text-amber-700 dark:text-amber-300 text-sm">
                You've used {budgetUsed.toFixed(1)}% of your monthly budget. Consider optimizing your usage.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Usage Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${processedData.currentUsage.currentSpend.toFixed(2)}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                of ${processedData.currentUsage.monthlyBudget.toFixed(2)} budget
              </p>
              <Badge variant={budgetUsed > 80 ? "destructive" : budgetUsed > 60 ? "secondary" : "default"}>
                {budgetUsed.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={budgetUsed} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Tokens Used</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {processedData.currentUsage.tokensUsed.toLocaleString()}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                of {processedData.currentUsage.tokensLimit.toLocaleString()} limit
              </p>
              <Badge variant={tokensUsed > 80 ? "destructive" : tokensUsed > 60 ? "secondary" : "default"}>
                {tokensUsed.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={tokensUsed} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {processedData.currentUsage.apiCalls.toLocaleString()}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                of {processedData.currentUsage.apiLimit.toLocaleString()} limit
              </p>
              <Badge variant={apiCallsUsed > 80 ? "destructive" : apiCallsUsed > 60 ? "secondary" : "default"}>
                {apiCallsUsed.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={apiCallsUsed} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {processedData.currentUsage.efficiency.toFixed(1)}%
            </div>
            <div className="flex items-center mt-2">
              {processedData.currentUsage.efficiency > 90 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <p className="text-xs text-muted-foreground">
                {processedData.currentUsage.efficiency > 90 ? 'Excellent' : 
                 processedData.currentUsage.efficiency > 75 ? 'Good' : 'Needs Improvement'}
              </p>
            </div>
            <Progress value={processedData.currentUsage.efficiency} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="breakdown" className="space-y-4">
        <TabsList>
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="trends">Usage Trends</TabsTrigger>
          <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown by Category</CardTitle>
              <CardDescription>
                Detailed breakdown of your AI usage costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processedData.breakdown.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={processedData.breakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="cost"
                      >
                        {processedData.breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 45}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-3">
                    {processedData.breakdown.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: item.color || `hsl(${index * 45}, 70%, 50%)` }}
                          />
                          <div>
                            <p className="font-medium">{item.category}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.tokens?.toLocaleString()} tokens
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${item.cost}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.percentage}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No cost breakdown data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Usage Trends</CardTitle>
              <CardDescription>
                Track your daily AI usage and costs over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processedData.dailyUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={processedData.dailyUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="cost" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Daily Cost ($)"
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="efficiency" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Efficiency (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No usage trend data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>
                AI-powered suggestions to reduce your costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processedData.optimizations.length > 0 ? (
                <div className="space-y-4">
                  {processedData.optimizations.map((optimization) => (
                    <div key={optimization.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{optimization.title}</h3>
                            <Badge variant={
                              optimization.impact === 'high' ? 'default' :
                              optimization.impact === 'medium' ? 'secondary' : 'outline'
                            }>
                              {optimization.impact} impact
                            </Badge>
                            <Badge variant={
                              optimization.status === 'active' ? 'default' :
                              optimization.status === 'recommended' ? 'secondary' : 'outline'
                            }>
                              {optimization.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-2">
                            {optimization.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <DollarSign className="h-4 w-4" />
                              Save ${optimization.savings}
                            </span>
                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                              <TrendingUp className="h-4 w-4" />
                              {optimization.efficiency} efficiency
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant={optimization.status === 'active' ? 'secondary' : 'default'}
                          size="sm"
                        >
                          {optimization.status === 'active' ? 'Active' : 
                           optimization.status === 'recommended' ? 'Enable' : 'Test'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No optimization recommendations available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Predictions</CardTitle>
              <CardDescription>
                Projected costs with and without optimizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processedData.predictions.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={processedData.predictions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="projected" 
                      stackId="1" 
                      stroke="#EF4444" 
                      fill="#EF4444" 
                      fillOpacity={0.3}
                      name="Projected Cost"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="optimized" 
                      stackId="2" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.3}
                      name="Optimized Cost"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No prediction data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CostOptimizer
