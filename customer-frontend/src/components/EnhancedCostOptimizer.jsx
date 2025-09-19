
import { useState, useEffect } from 'react'
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

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'

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

import { useUserUsageStats, useUserSubscription, useAIUsageStats, useAnalyticsOverview, useAnalyticsPerformance } from '../hooks/useApi.js'
import { useApiError } from '../hooks/useApi.js'

const EnhancedCostOptimizer = ({ data, user, onDataUpdate }) => {
  const { isDarkMode } = useTheme()
  const { handleError } = useApiError()

  const { data: userUsageStats, isLoading: isLoadingUsage, error: errorUsage, refetch: refetchUsage } = useUserUsageStats()
  const { data: userSubscription, isLoading: isLoadingSubscription, error: errorSubscription, refetch: refetchSubscription } = useUserSubscription()
  const { data: aiUsageStats, isLoading: isLoadingAiUsage, error: errorAiUsage, refetch: refetchAiUsage } = useAIUsageStats()
  const { data: analyticsOverview, isLoading: isLoadingOverview, error: errorOverview, refetch: refetchOverview } = useAnalyticsOverview()
  const { data: analyticsPerformance, isLoading: isLoadingPerformance, error: errorPerformance, refetch: refetchPerformance } = useAnalyticsPerformance()

  const [currentPlan, setCurrentPlan] = useState('premium') // This might also come from API
  const [budgetAlert, setBudgetAlert] = useState(false)

  useEffect(() => {
    if (errorUsage) handleError(errorUsage)
    if (errorSubscription) handleError(errorSubscription)
    if (errorAiUsage) handleError(errorAiUsage)
    if (errorOverview) handleError(errorOverview)
    if (errorPerformance) handleError(errorPerformance)
  }, [errorUsage, errorSubscription, errorAiUsage, errorOverview, errorPerformance, handleError])

  const isLoading = isLoadingUsage || isLoadingSubscription || isLoadingAiUsage || isLoadingOverview || isLoadingPerformance

  // Derived data from API responses
  const monthlyBudget = userSubscription?.plan?.monthlyBudget || 0
  const currentSpend = userUsageStats?.currentMonthSpend || 0
  const tokensUsed = aiUsageStats?.tokensUsed || 0
  const tokensLimit = userSubscription?.plan?.tokensLimit || 0
  const apiCalls = userUsageStats?.apiCalls || 0
  const apiLimit = userSubscription?.plan?.apiLimit || 0
  const efficiency = analyticsPerformance?.efficiencyScore || 0

  const costBreakdown = analyticsOverview?.costBreakdown || []
  const dailyUsageData = analyticsPerformance?.dailyUsage || []
  const optimizationsData = analyticsPerformance?.optimizations || []
  const predictionsData = analyticsPerformance?.predictions || []
  const plansData = userSubscription?.availablePlans || []

  useEffect(() => {
    if (currentSpend / monthlyBudget > 0.8) {
      setBudgetAlert(true)
    } else {
      setBudgetAlert(false)
    }
  }, [currentSpend, monthlyBudget])

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`
  const formatNumber = (num) => num.toLocaleString()

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'recommended': return 'text-blue-600 bg-blue-100'
      case 'testing': return 'text-orange-600 bg-orange-100'
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

  const MetricCard = ({ title, value, change, icon: Icon, color = "blue", subtitle }) => {
    const isPositive = change > 0
    const colorClasses = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600',
      red: 'text-red-600'
    }

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              {subtitle && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
              )}
              {change !== undefined && (
                <div className="flex items-center mt-1">
                  {isPositive ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{change}%
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">vs last month</span>
                </div>
              )}
            </div>
            <Icon className={`h-8 w-8 ${colorClasses[color]}`} />
          </div>
        </CardContent>
      </Card>
    )
  }

  const OptimizationCard = ({ optimization }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-medium text-slate-900">{optimization.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{optimization.description}</p>
          </div>
          <Badge className={`text-xs ${getStatusColor(optimization.status)}`}>
            {optimization.status}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Monthly Savings</p>
              <p className="font-bold text-green-600">{formatCurrency(optimization.savings)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Efficiency Gain</p>
              <p className="font-bold text-blue-600">{optimization.efficiency}</p>
            </div>
          </div>
          <Badge className={`text-xs ${getImpactColor(optimization.impact)}`}>
            {optimization.impact} impact
          </Badge>
        </div>
      </CardContent>
    </Card>
  )

  const PlanCard = ({ plan }) => (
    <Card className={`relative ${plan.current ? 'ring-2 ring-blue-500' : ''}`}>
      {plan.current && (
        <Badge className="absolute -top-2 left-4 bg-blue-500 text-white">
          Current Plan
        </Badge>
      )}
      <CardContent className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
          <div className="mt-2">
            <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
            <span className="text-slate-600 dark:text-slate-400">/month</span>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="text-sm">
              <span className="font-medium">{formatNumber(plan.tokens)}</span> tokens/month
            </div>
            <div className="text-sm">
              <span className="font-medium">{formatNumber(plan.apiCalls)}</span> API calls/month
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                {feature}
              </div>
            ))}
          </div>
          
          <Button 
            className={`mt-4 w-full ${plan.current ? 'bg-slate-100 text-slate-600 dark:text-slate-400' : ''}`}
            disabled={plan.current}
          >
            {plan.current ? 'Current Plan' : 'Upgrade'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return <div className="p-6 text-center">Loading cost optimization data...</div>
  }

  if (errorUsage || errorSubscription || errorAiUsage || errorOverview || errorPerformance) {
    return <div className="p-6 text-center text-red-500">Error loading data. Please try again later.</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Cost Optimizer
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Intelligent budget management and token optimization
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Budget Settings
          </Button>
        </div>
      </div>

      {/* Budget Alert */}
      {budgetAlert && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">Budget Alert</p>
                <p className="text-sm text-orange-700">
                  You've used {((currentSpend / monthlyBudget) * 100).toFixed(1)}% of your monthly budget
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monthly Spend"
          value={formatCurrency(currentSpend)}
          change={analyticsOverview?.monthlySpendChange || 0}
          icon={DollarSign}
          color="green"
          subtitle={`of ${formatCurrency(monthlyBudget)} budget`}
        />
        <MetricCard
          title="Token Usage"
          value={formatNumber(tokensUsed)}
          change={analyticsOverview?.tokenUsageChange || 0}
          icon={Zap}
          color="blue"
          subtitle={`of ${formatNumber(tokensLimit)} limit`}
        />
        <MetricCard
          title="Cost Efficiency"
          value={`${efficiency}%`}
          change={analyticsOverview?.efficiencyChange || 0}
          icon={Target}
          color="purple"
          subtitle="AI optimization score"
        />
        <MetricCard
          title="Projected Savings"
          value={formatCurrency(analyticsOverview?.projectedSavings || 0)}
          change={analyticsOverview?.projectedSavingsChange || 0}
          icon={TrendingDown}
          color="green"
          subtitle="with optimizations"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Usage</CardTitle>
              <CardDescription>Current month spending breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Monthly Budget</span>
                    <span>{formatCurrency(monthlyBudget)}</span>
                  </div>
                  <Progress 
                    value={(currentSpend / monthlyBudget) * 100} 
                    className="h-3"
                  />
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>Used: {formatCurrency(currentSpend)}</span>
                    <span>Remaining: {formatCurrency(monthlyBudget - currentSpend)}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Token Usage</span>
                    <span>{formatNumber(tokensUsed)} / {formatNumber(tokensLimit)}</span>
                  </div>
                  <Progress 
                    value={(tokensUsed / tokensLimit) * 100} 
                    className="h-3"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>API Calls</span>
                    <span>{formatNumber(apiCalls)} / {formatNumber(apiLimit)}</span>
                  </div>
                  <Progress 
                    value={(apiCalls / apiLimit) * 100} 
                    className="h-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
              <CardDescription>Spending by AI service category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={costBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      fill="#8884d8"
                      dataKey="cost"
                    >
                      {costBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`$${value.toFixed(2)}`, props.payload.category]} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Usage & Efficiency</CardTitle>
              <CardDescription>AI resource consumption over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dailyUsageData}
                    margin={{
                      top: 5, right: 30, left: 20, bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
                    <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value, name) => [
                        name === 'cost' ? formatCurrency(value) :
                        name === 'tokens' ? formatNumber(value) :
                        `${value}%`,
                        name === 'cost' ? 'Daily Cost' :
                        name === 'tokens' ? 'Tokens Used' :
                        'Efficiency'
                      ]}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="cost"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Daily Cost"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="efficiency"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Efficiency %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {costBreakdown.map((category, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-slate-900">{category.category}</h3>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(category.cost)}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{formatNumber(category.tokens)} tokens</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{category.percentage}% of total</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Optimizations Tab */}
        <TabsContent value="optimizations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {optimizationsData.map((optimization) => (
              <OptimizationCard key={optimization.id} optimization={optimization} />
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Optimization Impact</CardTitle>
              <CardDescription>Potential monthly savings from implemented optimizations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-900">Total Potential Savings</p>
                    <p className="text-sm text-green-700">From all optimization strategies</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(optimizationsData.reduce((sum, opt) => sum + opt.savings, 0))}
                    </p>
                    <p className="text-sm text-green-600">per month</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-900">Active Optimizations</p>
                    <p className="text-sm text-blue-700">Currently saving you money</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(optimizationsData.filter(opt => opt.status === 'active').reduce((sum, opt) => sum + opt.savings, 0))}
                    </p>
                    <p className="text-sm text-blue-600">per month</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Predictions & Savings</CardTitle>
              <CardDescription>Projected costs with and without optimizations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={predictionsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="projected" fill="#EF4444" name="Without Optimization" />
                    <Bar dataKey="optimized" fill="#10B981" name="With Optimization" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingDown className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-medium text-slate-900">6-Month Savings</h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(predictionsData.reduce((sum, pred) => sum + pred.saved, 0))}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total projected savings</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Gauge className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-medium text-slate-900">Efficiency Gain</h3>
                <p className="text-2xl font-bold text-blue-600">{analyticsPerformance?.efficiencyGain || 0}%</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Average improvement</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-medium text-slate-900">ROI</h3>
                <p className="text-2xl font-bold text-purple-600">{analyticsPerformance?.roi || 0}%</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Return on optimization</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plansData.map((plan, index) => (
              <PlanCard key={index} plan={plan} />
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Plan Comparison</CardTitle>
              <CardDescription>Find the right plan for your usage patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Recommendation</h4>
                  <p className="text-sm text-blue-700">
                    Based on your current usage of {formatNumber(tokensUsed)} tokens/month, 
                    the <strong>Professional plan</strong> would be optimal and save you ${(monthlyBudget - (plansData.find(p => p.name === 'Professional')?.price || 0)).toFixed(2)}/month.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-slate-900 mb-2">Current Plan Benefits</h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      {userSubscription?.plan?.features?.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-slate-900 mb-2">Usage Analytics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Peak usage day:</span>
                        <span className="font-medium">{formatNumber(analyticsPerformance?.peakUsage || 0)} tokens</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average daily:</span>
                        <span className="font-medium">{formatNumber(analyticsPerformance?.averageDailyUsage || 0)} tokens</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Efficiency score:</span>
                        <span className="font-medium text-green-600">{efficiency}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EnhancedCostOptimizer

