import { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext.jsx'

// Note: Cost optimizer hooks would be imported here when implemented
// import { 
//   useCostOptimization,
//   useCostAnalytics,
//   useBudgetRecommendations,
//   useUpdateBudget
// } from '../hooks/useCustomerApi.js'
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

const EnhancedCostOptimizer = () => {
  const { isDarkMode } = useTheme()
  console.log('EnhancedCostOptimizer component loaded - WORKING VERSION!')

  // Cost optimization data
  const [costData] = useState({
    currentUsage: {
      monthlyBudget: 150.00,
      currentSpend: 89.50,
      tokensUsed: 45000,
      tokensLimit: 75000,
      apiCalls: 2340,
      apiLimit: 5000,
      efficiency: 94.2
    },
    breakdown: [
      { category: 'Content Generation', cost: 32.50, tokens: 18500, percentage: 36.3, color: '#3B82F6' },
      { category: 'Image Creation', cost: 28.75, tokens: 12300, percentage: 32.1, color: '#10B981' },
      { category: 'Strategy Analysis', cost: 15.25, tokens: 8900, percentage: 17.0, color: '#8B5CF6' },
      { category: 'Performance Analytics', cost: 8.50, tokens: 3800, percentage: 9.5, color: '#F59E0B' },
      { category: 'Optimization Tasks', cost: 4.50, tokens: 1500, percentage: 5.1, color: '#EF4444' }
    ],
    dailyUsage: [
      { date: '2024-01-01', cost: 2.85, tokens: 1250, efficiency: 92 },
      { date: '2024-01-02', cost: 3.20, tokens: 1450, efficiency: 94 },
      { date: '2024-01-03', cost: 2.95, tokens: 1320, efficiency: 91 },
      { date: '2024-01-04', cost: 4.10, tokens: 1850, efficiency: 96 },
      { date: '2024-01-05', cost: 3.75, tokens: 1680, efficiency: 95 },
      { date: '2024-01-06', cost: 2.60, tokens: 1150, efficiency: 89 },
      { date: '2024-01-07', cost: 3.45, tokens: 1520, efficiency: 93 },
      { date: '2024-01-08', cost: 4.25, tokens: 1920, efficiency: 97 },
      { date: '2024-01-09', cost: 3.10, tokens: 1380, efficiency: 92 },
      { date: '2024-01-10', cost: 3.85, tokens: 1720, efficiency: 94 },
      { date: '2024-01-11', cost: 2.75, tokens: 1220, efficiency: 90 },
      { date: '2024-01-12', cost: 4.50, tokens: 2050, efficiency: 98 },
      { date: '2024-01-13', cost: 3.25, tokens: 1450, efficiency: 93 },
      { date: '2024-01-14', cost: 3.90, tokens: 1750, efficiency: 95 }
    ],
    optimizations: [
      {
        id: 1,
        title: 'Batch Content Generation',
        description: 'Generate multiple posts in single API calls',
        savings: 15.50,
        impact: 'high',
        status: 'active',
        efficiency: '+12%'
      },
      {
        id: 2,
        title: 'Smart Token Management',
        description: 'Optimize prompt length and complexity',
        savings: 8.25,
        impact: 'medium',
        status: 'active',
        efficiency: '+8%'
      },
      {
        id: 3,
        title: 'Caching Strategy',
        description: 'Cache frequently used AI responses',
        savings: 12.75,
        impact: 'high',
        status: 'recommended',
        efficiency: '+15%'
      },
      {
        id: 4,
        title: 'Off-Peak Processing',
        description: 'Schedule non-urgent tasks during low-cost hours',
        savings: 6.50,
        impact: 'low',
        status: 'testing',
        efficiency: '+5%'
      }
    ],
    predictions: [
      { month: 'Jan', projected: 89.50, optimized: 72.30, saved: 17.20 },
      { month: 'Feb', projected: 95.20, optimized: 76.80, saved: 18.40 },
      { month: 'Mar', projected: 102.10, optimized: 82.15, saved: 19.95 },
      { month: 'Apr', projected: 108.75, optimized: 87.25, saved: 21.50 },
      { month: 'May', projected: 115.60, optimized: 92.80, saved: 22.80 },
      { month: 'Jun', projected: 122.30, optimized: 98.10, saved: 24.20 }
    ],
    plans: [
      {
        name: 'Starter',
        price: 29,
        tokens: 25000,
        apiCalls: 1000,
        features: ['Basic AI agents', 'Standard support', '5 social accounts'],
        current: false
      },
      {
        name: 'Professional',
        price: 79,
        tokens: 75000,
        apiCalls: 5000,
        features: ['All AI agents', 'Priority support', '15 social accounts', 'Advanced analytics'],
        current: false
      },
      {
        name: 'Premium',
        price: 149,
        tokens: 150000,
        apiCalls: 12000,
        features: ['Unlimited AI agents', '24/7 support', 'Unlimited accounts', 'Custom integrations'],
        current: true
      },
      {
        name: 'Enterprise',
        price: 299,
        tokens: 500000,
        apiCalls: 50000,
        features: ['White-label solution', 'Dedicated support', 'Custom AI training', 'API access'],
        current: false
      }
    ]
  })

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
      blue: isDarkMode ? 'text-blue-400' : 'text-blue-600',
      green: isDarkMode ? 'text-green-400' : 'text-green-600',
      purple: isDarkMode ? 'text-purple-400' : 'text-purple-600',
      orange: isDarkMode ? 'text-orange-400' : 'text-orange-600',
      red: isDarkMode ? 'text-red-400' : 'text-red-600'
    }

    return (
      <Card className={`${
        isDarkMode 
          ? 'bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow' 
          : 'bg-white'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {title}
              </p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {value}
              </p>
              {subtitle && (
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {subtitle}
                </p>
              )}
              {change !== undefined && (
                <div className="flex items-center mt-1">
                  {isPositive ? (
                    <ArrowUpRight className={`h-4 w-4 mr-1 ${
                      isDarkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                  ) : (
                    <ArrowDownRight className={`h-4 w-4 mr-1 ${
                      isDarkMode ? 'text-red-400' : 'text-red-500'
                    }`} />
                  )}
                  <span className={`text-sm font-medium ${
                    isPositive 
                      ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                      : (isDarkMode ? 'text-red-400' : 'text-red-600')
                  }`}>
                    {isPositive ? '+' : ''}{change}%
                  </span>
                  <span className={`text-sm ml-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    vs last month
                  </span>
                </div>
              )}
            </div>
            {Icon && <Icon className={`h-8 w-8 ${colorClasses[color]}`} />}
          </div>
        </CardContent>
      </Card>
    )
  }

  const OptimizationCard = ({ optimization }) => (
    <Card className={`hover:shadow-lg transition-shadow ${
      isDarkMode 
        ? 'bg-slate-800 border-slate-700' 
        : 'bg-white'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className={`font-medium ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              {optimization.title}
            </h3>
            <p className={`text-sm mt-1 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {optimization.description}
            </p>
          </div>
          <Badge className={`text-xs ${getStatusColor(optimization.status)}`}>
            {optimization.status}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <p className={`text-sm ${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Monthly Savings
              </p>
              <p className={`font-bold ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                {formatCurrency(optimization.savings)}
              </p>
            </div>
            <div>
              <p className={`text-sm ${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Efficiency Gain
              </p>
              <p className={`font-bold ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {optimization.efficiency}
              </p>
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
    <Card className={`relative ${
      isDarkMode 
        ? 'bg-slate-800 border-slate-700' 
        : 'bg-white'
    } ${plan.current ? 'ring-2 ring-blue-500' : ''}`}>
      {plan.current && (
        <Badge className="absolute -top-2 left-4 bg-blue-500 text-white">
          Current Plan
        </Badge>
      )}
      <CardContent className="p-6">
        <div className="text-center">
          <h3 className={`text-lg font-bold ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            {plan.name}
          </h3>
          <div className="mt-2">
            <span className={`text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              ${plan.price}
            </span>
            <span className={`${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              /month
            </span>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className={`text-sm ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              <span className="font-medium">{formatNumber(plan.tokens)}</span> tokens/month
            </div>
            <div className={`text-sm ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              <span className="font-medium">{formatNumber(plan.apiCalls)}</span> API calls/month
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            {plan.features.map((feature, index) => (
              <div key={index} className={`flex items-center text-sm ${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                <CheckCircle className={`h-4 w-4 mr-2 ${
                  isDarkMode ? 'text-green-400' : 'text-green-500'
                }`} />
                {feature}
              </div>
            ))}
          </div>
          
          <Button 
            className={`mt-4 w-full ${
              plan.current 
                ? (isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600') 
                : ''
            }`}
            disabled={plan.current}
          >
            {plan.current ? 'Current Plan' : 'Upgrade'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={`p-6 space-y-6 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen' 
        : ''
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Cost Optimizer
          </h1>
          <p className={`mt-1 ${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Intelligent budget management and token optimization
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            className={`${
              isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : ''
            }`}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={`${
              isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : ''
            }`}
          >
            <Settings className="h-4 w-4 mr-2" />
            Budget Settings
          </Button>
        </div>
      </div>

      {/* Budget Alert */}
      {costData.currentUsage.currentSpend / costData.currentUsage.monthlyBudget > 0.8 && (
        <Card className={`${
          isDarkMode 
            ? 'bg-amber-900/20 border-amber-800' 
            : 'bg-orange-50 border-orange-200'
        } border`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className={`h-5 w-5 ${
                isDarkMode ? 'text-amber-400' : 'text-orange-600'
              }`} />
              <div>
                <p className={`font-medium ${
                  isDarkMode ? 'text-amber-200' : 'text-orange-900'
                }`}>
                  Budget Alert
                </p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-amber-300' : 'text-orange-700'
                }`}>
                  You've used {((costData.currentUsage.currentSpend / costData.currentUsage.monthlyBudget) * 100).toFixed(1)}% of your monthly budget
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
          value={formatCurrency(costData.currentUsage.currentSpend)}
          change={-12.5}
          icon={DollarSign}
          color="green"
          subtitle={`of ${formatCurrency(costData.currentUsage.monthlyBudget)} budget`}
        />
        <MetricCard
          title="Token Usage"
          value={formatNumber(costData.currentUsage.tokensUsed)}
          change={8.2}
          icon={Zap}
          color="blue"
          subtitle={`of ${formatNumber(costData.currentUsage.tokensLimit)} limit`}
        />
        <MetricCard
          title="Cost Efficiency"
          value={`${costData.currentUsage.efficiency}%`}
          change={5.3}
          icon={Target}
          color="purple"
          subtitle="AI optimization score"
        />
        <MetricCard
          title="Projected Savings"
          value={formatCurrency(82.15)}
          change={15.8}
          icon={TrendingDown}
          color="green"
          subtitle="with optimizations"
        />
      </div>

      {/* Budget Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={`${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white'
        }`}>
          <CardHeader>
            <CardTitle className={`${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Budget Usage
            </CardTitle>
            <CardDescription className={`${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Current month spending breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className={`flex justify-between text-sm mb-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  <span>Monthly Budget</span>
                  <span>{formatCurrency(costData.currentUsage.monthlyBudget)}</span>
                </div>
                <Progress 
                  value={(costData.currentUsage.currentSpend / costData.currentUsage.monthlyBudget) * 100} 
                  className="h-3"
                />
                <div className={`flex justify-between text-xs mt-1 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <span>Used: {formatCurrency(costData.currentUsage.currentSpend)}</span>
                  <span>Remaining: {formatCurrency(costData.currentUsage.monthlyBudget - costData.currentUsage.currentSpend)}</span>
                </div>
              </div>
              
              <div>
                <div className={`flex justify-between text-sm mb-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  <span>Token Usage</span>
                  <span>{formatNumber(costData.currentUsage.tokensUsed)} / {formatNumber(costData.currentUsage.tokensLimit)}</span>
                </div>
                <Progress 
                  value={(costData.currentUsage.tokensUsed / costData.currentUsage.tokensLimit) * 100} 
                  className="h-3"
                />
              </div>
              
              <div>
                <div className={`flex justify-between text-sm mb-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  <span>API Calls</span>
                  <span>{formatNumber(costData.currentUsage.apiCalls)} / {formatNumber(costData.currentUsage.apiLimit)}</span>
                </div>
                <Progress 
                  value={(costData.currentUsage.apiCalls / costData.currentUsage.apiLimit) * 100} 
                  className="h-3"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white'
        }`}>
          <CardHeader>
            <CardTitle className={`${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Cost Breakdown
            </CardTitle>
            <CardDescription className={`${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Spending by AI service category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={costData.breakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="cost"
                    label={({ category, percentage }) => `${category}: ${percentage}%`}
                  >
                    {costData.breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList className={`grid w-full grid-cols-4 ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100'
        }`}>
          <TabsTrigger 
            value="usage"
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
          <TabsTrigger 
            value="plans"
            className={`${
              isDarkMode ? 'data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-slate-300 hover:bg-slate-700' : ''
            }`}
          >
            Plans
          </TabsTrigger>
        </TabsList>

        {/* Usage Trends Tab */}
        <TabsContent value="usage" className="space-y-6">
          <Card className={`${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-white'
          }`}>
            <CardHeader>
              <CardTitle className={`${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Daily Usage & Efficiency
              </CardTitle>
              <CardDescription className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Track your daily spending and AI efficiency over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={costData.dailyUsage}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={isDarkMode ? '#334155' : '#e2e8f0'}
                    />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value, name) => [
                        name === 'cost' ? formatCurrency(value) : 
                        name === 'tokens' ? formatNumber(value) : 
                        `${value}%`, 
                        name === 'cost' ? 'Daily Cost' : 
                        name === 'tokens' ? 'Tokens Used' : 
                        'Efficiency'
                      ]}
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
            {costData.breakdown.map((category, index) => (
              <Card key={index} className={`${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700' 
                  : 'bg-white'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {category.category}
                    </h3>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                  </div>
                  <div className="space-y-1">
                    <p className={`text-2xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {formatCurrency(category.cost)}
                    </p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {formatNumber(category.tokens)} tokens
                    </p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {category.percentage}% of total
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Optimizations Tab */}
        <TabsContent value="optimizations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {costData.optimizations.map((optimization) => (
              <OptimizationCard key={optimization.id} optimization={optimization} />
            ))}
          </div>
          
          <Card className={`${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-white'
          }`}>
            <CardHeader>
              <CardTitle className={`${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Optimization Impact
              </CardTitle>
              <CardDescription className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Potential monthly savings from implemented optimizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`flex items-center justify-between p-4 rounded-lg ${
                  isDarkMode ? 'bg-green-900/20' : 'bg-green-50'
                }`}>
                  <div>
                    <p className={`font-medium ${
                      isDarkMode ? 'text-green-200' : 'text-green-900'
                    }`}>
                      Total Potential Savings
                    </p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-green-300' : 'text-green-700'
                    }`}>
                      From all optimization strategies
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      {formatCurrency(costData.optimizations.reduce((sum, opt) => sum + opt.savings, 0))}
                    </p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      per month
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center justify-between p-4 rounded-lg ${
                  isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                }`}>
                  <div>
                    <p className={`font-medium ${
                      isDarkMode ? 'text-blue-200' : 'text-blue-900'
                    }`}>
                      Active Optimizations
                    </p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-700'
                    }`}>
                      Currently saving you money
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {formatCurrency(costData.optimizations.filter(opt => opt.status === 'active').reduce((sum, opt) => sum + opt.savings, 0))}
                    </p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      per month
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <Card className={`${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-white'
          }`}>
            <CardHeader>
              <CardTitle className={`${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Cost Predictions & Savings
              </CardTitle>
              <CardDescription className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Projected costs with and without optimizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costData.predictions}>
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
                      formatter={(value) => formatCurrency(value)}
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
                    <Bar dataKey="projected" fill="#EF4444" name="Without Optimization" />
                    <Bar dataKey="optimized" fill="#10B981" name="With Optimization" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={`${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-white'
            }`}>
              <CardContent className="p-4 text-center">
                <TrendingDown className={`h-8 w-8 mx-auto mb-2 ${
                  isDarkMode ? 'text-green-400' : 'text-green-500'
                }`} />
                <h3 className={`font-medium ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  6-Month Savings
                </h3>
                <p className={`text-2xl font-bold ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`}>
                  {formatCurrency(costData.predictions.reduce((sum, pred) => sum + pred.saved, 0))}
                </p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Total projected savings
                </p>
              </CardContent>
            </Card>
            
            <Card className={`${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-white'
            }`}>
              <CardContent className="p-4 text-center">
                <Gauge className={`h-8 w-8 mx-auto mb-2 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-500'
                }`} />
                <h3 className={`font-medium ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Efficiency Gain
                </h3>
                <p className={`text-2xl font-bold ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  +23%
                </p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Average improvement
                </p>
              </CardContent>
            </Card>
            
            <Card className={`${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-white'
            }`}>
              <CardContent className="p-4 text-center">
                <Target className={`h-8 w-8 mx-auto mb-2 ${
                  isDarkMode ? 'text-purple-400' : 'text-purple-500'
                }`} />
                <h3 className={`font-medium ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  ROI
                </h3>
                <p className={`text-2xl font-bold ${
                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  340%
                </p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Return on optimization
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {costData.plans.map((plan, index) => (
              <PlanCard key={index} plan={plan} />
            ))}
          </div>
          
          <Card className={`${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-white'
          }`}>
            <CardHeader>
              <CardTitle className={`${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Plan Comparison
              </CardTitle>
              <CardDescription className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Find the right plan for your usage patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                }`}>
                  <h4 className={`font-medium mb-2 ${
                    isDarkMode ? 'text-blue-200' : 'text-blue-900'
                  }`}>
                    Recommendation
                  </h4>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    Based on your current usage of {formatNumber(costData.currentUsage.tokensUsed)} tokens/month, 
                    the <strong>Professional plan</strong> would be optimal and save you ${(149 - 79).toFixed(2)}/month.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 border rounded-lg ${
                    isDarkMode ? 'border-slate-700' : 'border-gray-200'
                  }`}>
                    <h4 className={`font-medium mb-2 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      Current Plan Benefits
                    </h4>
                    <ul className={`text-sm space-y-1 ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      <li>• High token limit for peak usage</li>
                      <li>• 24/7 priority support</li>
                      <li>• Unlimited social accounts</li>
                      <li>• Custom integrations available</li>
                    </ul>
                  </div>
                  
                  <div className={`p-4 border rounded-lg ${
                    isDarkMode ? 'border-slate-700' : 'border-gray-200'
                  }`}>
                    <h4 className={`font-medium mb-2 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      Usage Analytics
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Peak usage day:</span>
                        <span className={`font-medium ${
                          isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          2,050 tokens
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Average daily:</span>
                        <span className={`font-medium ${
                          isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          1,607 tokens
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Efficiency score:</span>
                        <span className={`font-medium ${
                          isDarkMode ? 'text-green-400' : 'text-green-600'
                        }`}>
                          94.2%
                        </span>
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

