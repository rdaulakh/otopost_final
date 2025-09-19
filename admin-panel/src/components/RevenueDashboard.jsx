import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users, 
  CreditCard,
  Calendar,
  BarChart3,
  PieChart,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useRevenueMetrics, useRevenueAnalytics, useSubscriptionAnalytics, useCohortAnalysis } from '../hooks/useAdminApi'

const RevenueDashboard = ({ data = {}, onDataUpdate = () => {}, isDarkMode = false }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('12m')
  const [selectedMetric, setSelectedMetric] = useState('revenue')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Real API integration
  const { 
    data: revenueMetrics, 
    isLoading: metricsLoading, 
    error: metricsError,
    refetch: refetchMetrics 
  } = useRevenueMetrics({ timeRange: selectedTimeRange })

  const { 
    data: revenueAnalytics, 
    isLoading: analyticsLoading, 
    error: analyticsError,
    refetch: refetchAnalytics 
  } = useRevenueAnalytics({ timeRange: selectedTimeRange })

  const { 
    data: subscriptionAnalytics, 
    isLoading: subscriptionLoading, 
    error: subscriptionError,
    refetch: refetchSubscription 
  } = useSubscriptionAnalytics({ timeRange: selectedTimeRange })

  const { 
    data: cohortAnalysis, 
    isLoading: cohortLoading, 
    error: cohortError,
    refetch: refetchCohort 
  } = useCohortAnalysis({ timeRange: selectedTimeRange })

  // Combined loading state
  const isLoading = metricsLoading || analyticsLoading || subscriptionLoading || cohortLoading

  // Combined error state
  const hasError = metricsError || analyticsError || subscriptionError || cohortError

  // Refresh all data
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchMetrics(),
        refetchAnalytics(),
        refetchSubscription(),
        refetchCohort()
      ])
      onDataUpdate()
    } catch (error) {
      console.error('Failed to refresh revenue dashboard data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(handleRefresh, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Handle time range change
  const handleTimeRangeChange = (newTimeRange) => {
    setSelectedTimeRange(newTimeRange)
  }

  // Handle metric change
  const handleMetricChange = (newMetric) => {
    setSelectedMetric(newMetric)
  }

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Format percentage
  const formatPercentage = (num) => {
    if (!num) return '0%'
    return `${num.toFixed(1)}%`
  }

  // Get trend indicator
  const getTrendIndicator = (value, isPositive = true) => {
    if (!value) return null
    const Icon = (isPositive && value > 0) || (!isPositive && value < 0) ? TrendingUp : TrendingDown
    const color = (isPositive && value > 0) || (!isPositive && value < 0) ? 'text-green-500' : 'text-red-500'
    
    return (
      <div className={`flex items-center ${color}`}>
        <Icon className="h-4 w-4 mr-1" />
        <span className="text-sm font-medium">{Math.abs(value).toFixed(1)}%</span>
      </div>
    )
  }

  // Error state
  if (hasError && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Failed to load revenue data
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          We're having trouble loading your revenue dashboard. Please try refreshing.
        </p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  // Loading state
  if (isLoading && !revenueMetrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Loading Revenue Dashboard
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Fetching revenue metrics and analytics...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Revenue Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track revenue metrics, growth, and financial performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={selectedTimeRange} 
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="3m">Last 3 months</option>
            <option value="6m">Last 6 months</option>
            <option value="12m">Last 12 months</option>
            <option value="24m">Last 24 months</option>
          </select>
          
          <select 
            value={selectedMetric} 
            onChange={(e) => handleMetricChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="revenue">Revenue</option>
            <option value="mrr">MRR</option>
            <option value="arr">ARR</option>
            <option value="customers">Customers</option>
          </select>
          
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenueMetrics?.totalRevenue)}
            </div>
            {getTrendIndicator(revenueMetrics?.revenueGrowth)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenueMetrics?.mrr)}
            </div>
            {getTrendIndicator(revenueMetrics?.mrrGrowth)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Recurring Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenueMetrics?.arr)}
            </div>
            {getTrendIndicator(revenueMetrics?.arrGrowth)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer LTV</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenueMetrics?.ltv)}
            </div>
            <p className="text-xs text-muted-foreground">
              CAC: {formatCurrency(revenueMetrics?.cac)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Revenue Trends
          </CardTitle>
          <CardDescription>
            Monthly revenue growth and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueAnalytics?.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stackId="1"
                  stroke="#3b82f6" 
                  fill="#3b82f6"
                  fillOpacity={0.6}
                  name="Revenue"
                />
                <Area 
                  type="monotone" 
                  dataKey="mrr" 
                  stackId="2"
                  stroke="#10b981" 
                  fill="#10b981"
                  fillOpacity={0.6}
                  name="MRR"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Revenue by Plan
            </CardTitle>
            <CardDescription>
              Revenue distribution across subscription plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={subscriptionAnalytics?.revenueByPlan}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {subscriptionAnalytics?.revenueByPlan?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Key Metrics
            </CardTitle>
            <CardDescription>
              Important financial and growth metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Churn Rate</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold">{formatPercentage(revenueMetrics?.churnRate)}</span>
                {getTrendIndicator(revenueMetrics?.churnRateChange, false)}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Payback Period</span>
              <span className="text-sm font-bold">{revenueMetrics?.paybackPeriod} months</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Expansion Revenue</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold">{formatCurrency(revenueMetrics?.expansionRevenue)}</span>
                {getTrendIndicator(revenueMetrics?.expansionGrowth)}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Net Revenue Retention</span>
              <span className="text-sm font-bold">{formatPercentage(revenueMetrics?.nrr)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">ARPU</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold">{formatCurrency(revenueMetrics?.arpu)}</span>
                {getTrendIndicator(revenueMetrics?.arpuGrowth)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Cohort Analysis
          </CardTitle>
          <CardDescription>
            Customer retention by signup cohort
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Cohort</th>
                  <th className="text-center p-2">Month 0</th>
                  <th className="text-center p-2">Month 1</th>
                  <th className="text-center p-2">Month 2</th>
                  <th className="text-center p-2">Month 3</th>
                  <th className="text-center p-2">Month 4</th>
                  <th className="text-center p-2">Month 5</th>
                </tr>
              </thead>
              <tbody>
                {cohortAnalysis?.cohorts?.map((cohort, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{cohort.cohort}</td>
                    <td className="text-center p-2">
                      <Badge variant="default">100%</Badge>
                    </td>
                    {[1, 2, 3, 4, 5].map((month) => (
                      <td key={month} className="text-center p-2">
                        {cohort[`month${month}`] ? (
                          <Badge 
                            variant={cohort[`month${month}`] >= 80 ? 'default' : 
                                   cohort[`month${month}`] >= 60 ? 'secondary' : 'destructive'}
                          >
                            {cohort[`month${month}`]}%
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Forecasting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Revenue Forecast
          </CardTitle>
          <CardDescription>
            Projected revenue based on current trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueAnalytics?.forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Actual Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Forecasted Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RevenueDashboard
