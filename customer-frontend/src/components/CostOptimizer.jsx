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
  useAnalyticsOverview
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
  // Note: Cost optimization hooks would be used here when implemented
  // const { data: costOptimization, isLoading: costLoading, error: costError } = useCostOptimization()
  // const { data: predictions, isLoading: predictionsLoading, error: predictionsError } = useUsagePredictions()
  // const { data: recommendations, isLoading: recommendationsLoading, error: recommendationsError } = useOptimizationRecommendations()

  // Loading state
  const isLoading = usageLoading || subscriptionLoading || aiLoading || analyticsLoading
  
  // Error state
  const hasError = usageError || subscriptionError || aiError || analyticsError

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
      efficiency: 94.2 // Default efficiency score
    },
    breakdown: [], // Empty array for now
    dailyUsage: usageStats?.dailyUsage || [],
    optimizations: [], // Empty array for now
    predictions: [], // Empty array for now
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
    <div className={`p-6 space-y-6 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen' 
        : ''
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Cost Optimizer
          </h1>
          <p className={`mt-1 ${
            isDarkMode ? 'text-slate-300' : 'text-gray-600'
          }`}>
            Monitor and optimize your AI usage costs
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          disabled={refreshing}
          className={`flex items-center gap-2 ${
            isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : ''
          }`}
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
          className={`rounded-lg p-4 ${
            isDarkMode 
              ? 'bg-amber-900/20 border-amber-800' 
              : 'bg-amber-50 border-amber-200'
          } border`}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className={`h-5 w-5 ${
              isDarkMode ? 'text-amber-400' : 'text-amber-600'
            }`} />
            <div>
              <h3 className={`font-semibold ${
                isDarkMode ? 'text-amber-200' : 'text-amber-800'
              }`}>
                Budget Alert
              </h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-amber-300' : 'text-amber-700'
              }`}>
                You've used {budgetUsed.toFixed(1)}% of your monthly budget. Consider optimizing your usage.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Usage Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={`${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow' 
            : 'bg-white'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${
              isDarkMode ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Monthly Spend
            </CardTitle>
            <DollarSign className={`h-4 w-4 ${
              isDarkMode ? 'text-slate-400' : 'text-muted-foreground'
            }`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              ${processedData.currentUsage.currentSpend.toFixed(2)}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className={`text-xs ${
                isDarkMode ? 'text-slate-400' : 'text-muted-foreground'
              }`}>
                of ${processedData.currentUsage.monthlyBudget.toFixed(2)} budget
              </p>
              <Badge variant={budgetUsed > 80 ? "destructive" : budgetUsed > 60 ? "secondary" : "default"}>
                {budgetUsed.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={budgetUsed} className="mt-2" />
          </CardContent>
        </Card>

        <Card className={`${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow' 
            : 'bg-white'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${
              isDarkMode ? 'text-slate-300' : 'text-gray-700'
            }`}>
              AI Tokens Used
            </CardTitle>
            <Brain className={`h-4 w-4 ${
              isDarkMode ? 'text-slate-400' : 'text-muted-foreground'
            }`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {processedData.currentUsage.tokensUsed.toLocaleString()}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className={`text-xs ${
                isDarkMode ? 'text-slate-400' : 'text-muted-foreground'
              }`}>
                of {processedData.currentUsage.tokensLimit.toLocaleString()} limit
              </p>
              <Badge variant={tokensUsed > 80 ? "destructive" : tokensUsed > 60 ? "secondary" : "default"}>
                {tokensUsed.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={tokensUsed} className="mt-2" />
          </CardContent>
        </Card>

        <Card className={`${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow' 
            : 'bg-white'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${
              isDarkMode ? 'text-slate-300' : 'text-gray-700'
            }`}>
              API Calls
            </CardTitle>
            <Activity className={`h-4 w-4 ${
              isDarkMode ? 'text-slate-400' : 'text-muted-foreground'
            }`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {processedData.currentUsage.apiCalls.toLocaleString()}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className={`text-xs ${
                isDarkMode ? 'text-slate-400' : 'text-muted-foreground'
              }`}>
                of {processedData.currentUsage.apiLimit.toLocaleString()} limit
              </p>
              <Badge variant={apiCallsUsed > 80 ? "destructive" : apiCallsUsed > 60 ? "secondary" : "default"}>
                {apiCallsUsed.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={apiCallsUsed} className="mt-2" />
          </CardContent>
        </Card>

        <Card className={`${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow' 
            : 'bg-white'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${
              isDarkMode ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Efficiency Score
            </CardTitle>
            <Gauge className={`h-4 w-4 ${
              isDarkMode ? 'text-slate-400' : 'text-muted-foreground'
            }`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {processedData.currentUsage.efficiency.toFixed(1)}%
            </div>
            <div className="flex items-center mt-2">
              {processedData.currentUsage.efficiency > 90 ? (
                <TrendingUp className={`h-4 w-4 mr-1 ${
                  isDarkMode ? 'text-green-400' : 'text-green-500'
                }`} />
              ) : (
                <TrendingDown className={`h-4 w-4 mr-1 ${
                  isDarkMode ? 'text-red-400' : 'text-red-500'
                }`} />
              )}
              <p className={`text-xs ${
                isDarkMode ? 'text-slate-400' : 'text-muted-foreground'
              }`}>
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
        <TabsList className={`${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100'
        }`}>
          <TabsTrigger 
            value="breakdown"
            className={`${
              isDarkMode ? 'data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-slate-300 hover:bg-slate-700' : ''
            }`}
          >
            Cost Breakdown
          </TabsTrigger>
          <TabsTrigger 
            value="trends"
            className={`${
              isDarkMode ? 'data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-slate-300 hover:bg-slate-700' : ''
            }`}
          >
            Usage Trends
          </TabsTrigger>
          <TabsTrigger 
            value="optimizations"
            className={`${
              isDarkMode ? 'data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-slate-300 hover:bg-slate-700' : ''
            }`}
          >
            Optimizations
          </TabsTrigger>
          <TabsTrigger 
            value="predictions"
            className={`${
              isDarkMode ? 'data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-slate-300 hover:bg-slate-700' : ''
            }`}
          >
            Predictions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          <Card className={`${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-white'
          }`}>
            <CardHeader>
              <CardTitle className={`${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Cost Breakdown by Category
              </CardTitle>
              <CardDescription className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
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
                      <Tooltip 
                        formatter={(value) => [`$${value}`, 'Cost']}
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                          border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          color: isDarkMode ? '#f1f5f9' : '#1e293b',
                          fontSize: '14px'
                        }}
                        labelStyle={{
                          color: isDarkMode ? '#f1f5f9' : '#1e293b'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-3">
                    {processedData.breakdown.map((item, index) => (
                      <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                        isDarkMode ? 'bg-slate-700' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: item.color || `hsl(${index * 45}, 70%, 50%)` }}
                          />
                          <div>
                            <p className={`font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {item.category}
                            </p>
                            <p className={`text-sm ${
                              isDarkMode ? 'text-slate-300' : 'text-gray-600'
                            }`}>
                              {item.tokens?.toLocaleString()} tokens
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            ${item.cost}
                          </p>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-slate-300' : 'text-gray-600'
                          }`}>
                            {item.percentage}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={`text-center py-8 ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No cost breakdown data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className={`${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-white'
          }`}>
            <CardHeader>
              <CardTitle className={`${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Daily Usage Trends
              </CardTitle>
              <CardDescription className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Track your daily AI usage and costs over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processedData.dailyUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={processedData.dailyUsage}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={isDarkMode ? '#334155' : '#e2e8f0'}
                    />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: isDarkMode ? '#f1f5f9' : '#1e293b' }}
                    />
                    <YAxis 
                      yAxisId="left" 
                      tick={{ fill: isDarkMode ? '#f1f5f9' : '#1e293b' }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      tick={{ fill: isDarkMode ? '#f1f5f9' : '#1e293b' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        color: isDarkMode ? '#f1f5f9' : '#1e293b',
                        fontSize: '14px'
                      }}
                      labelStyle={{
                        color: isDarkMode ? '#f1f5f9' : '#1e293b'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{
                        color: isDarkMode ? '#f1f5f9' : '#1e293b'
                      }}
                    />
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
                <div className={`text-center py-8 ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No usage trend data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimizations" className="space-y-4">
          <Card className={`${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-white'
          }`}>
            <CardHeader>
              <CardTitle className={`${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Optimization Recommendations
              </CardTitle>
              <CardDescription className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                AI-powered suggestions to reduce your costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processedData.optimizations.length > 0 ? (
                <div className="space-y-4">
                  {processedData.optimizations.map((optimization) => (
                    <div key={optimization.id} className={`border rounded-lg p-4 ${
                      isDarkMode ? 'border-slate-700' : 'border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className={`font-semibold ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {optimization.title}
                            </h3>
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
                          <p className={`mb-2 ${
                            isDarkMode ? 'text-slate-300' : 'text-gray-600'
                          }`}>
                            {optimization.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className={`flex items-center gap-1 ${
                              isDarkMode ? 'text-green-400' : 'text-green-600'
                            }`}>
                              <DollarSign className="h-4 w-4" />
                              Save ${optimization.savings}
                            </span>
                            <span className={`flex items-center gap-1 ${
                              isDarkMode ? 'text-blue-400' : 'text-blue-600'
                            }`}>
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
                <div className={`text-center py-8 ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No optimization recommendations available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card className={`${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-white'
          }`}>
            <CardHeader>
              <CardTitle className={`${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Cost Predictions
              </CardTitle>
              <CardDescription className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Projected costs with and without optimizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processedData.predictions.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={processedData.predictions}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={isDarkMode ? '#334155' : '#e2e8f0'}
                    />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: isDarkMode ? '#f1f5f9' : '#1e293b' }}
                    />
                    <YAxis 
                      tick={{ fill: isDarkMode ? '#f1f5f9' : '#1e293b' }}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Cost']}
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        color: isDarkMode ? '#f1f5f9' : '#1e293b',
                        fontSize: '14px'
                      }}
                      labelStyle={{
                        color: isDarkMode ? '#f1f5f9' : '#1e293b'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{
                        color: isDarkMode ? '#f1f5f9' : '#1e293b'
                      }}
                    />
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
                <div className={`text-center py-8 ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
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
