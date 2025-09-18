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
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const RevenueDashboard = ({ data = {}, onDataUpdate = () => {}, isDarkMode = false }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('12m')
  const [selectedMetric, setSelectedMetric] = useState('revenue')
  const [isLoading, setIsLoading] = useState(false)

  // Mock revenue data
  const revenueMetrics = {
    totalRevenue: 148080,
    monthlyRevenue: 12340,
    annualRevenue: 148080,
    revenueGrowth: 23.5,
    mrr: 12340,
    arr: 148080,
    ltv: 2450,
    cac: 125,
    paybackPeriod: 3.2,
    churnRate: 2.3,
    expansionRevenue: 2890,
    contractionRevenue: 450
  }

  // Revenue trend data
  const revenueData = [
    { month: 'Jan 2024', revenue: 8500, mrr: 8500, customers: 120, arpu: 71 },
    { month: 'Feb 2024', revenue: 9200, mrr: 9200, customers: 135, arpu: 68 },
    { month: 'Mar 2024', revenue: 10100, mrr: 10100, customers: 158, arpu: 64 },
    { month: 'Apr 2024', revenue: 10800, mrr: 10800, customers: 172, arpu: 63 },
    { month: 'May 2024', revenue: 11500, mrr: 11500, customers: 189, arpu: 61 },
    { month: 'Jun 2024', revenue: 12340, mrr: 12340, customers: 210, arpu: 59 },
    { month: 'Jul 2024', revenue: 13200, mrr: 13200, customers: 235, arpu: 56 },
    { month: 'Aug 2024', revenue: 14100, mrr: 14100, customers: 258, arpu: 55 },
    { month: 'Sep 2024', revenue: 15200, mrr: 15200, customers: 285, arpu: 53 },
    { month: 'Oct 2024', revenue: 16500, mrr: 16500, customers: 312, arpu: 53 },
    { month: 'Nov 2024', revenue: 17800, mrr: 17800, customers: 340, arpu: 52 },
    { month: 'Dec 2024', revenue: 19200, mrr: 19200, customers: 368, arpu: 52 }
  ]

  // Revenue by plan
  const revenueByPlan = [
    { name: 'Starter', revenue: 2900, percentage: 23.5, color: '#6B7280' },
    { name: 'Pro', revenue: 4950, percentage: 40.1, color: '#3B82F6' },
    { name: 'Premium', revenue: 4490, percentage: 36.4, color: '#8B5CF6' }
  ]

  // Cohort analysis data
  const cohortData = [
    { cohort: 'Jan 2024', month0: 100, month1: 85, month2: 78, month3: 72, month4: 68, month5: 65 },
    { cohort: 'Feb 2024', month0: 100, month1: 88, month2: 82, month3: 76, month4: 71, month5: null },
    { cohort: 'Mar 2024', month0: 100, month1: 90, month2: 85, month3: 79, month4: null, month5: null },
    { cohort: 'Apr 2024', month0: 100, month1: 92, month2: 87, month3: null, month4: null, month5: null },
    { cohort: 'May 2024', month0: 100, month1: 94, month2: null, month3: null, month4: null, month5: null },
    { cohort: 'Jun 2024', month0: 100, month1: null, month2: null, month3: null, month4: null, month5: null }
  ]

  // Key metrics cards
  const keyMetrics = [
    {
      title: 'Monthly Recurring Revenue',
      value: `$${revenueMetrics.mrr.toLocaleString()}`,
      change: '+23.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Current MRR'
    },
    {
      title: 'Annual Recurring Revenue',
      value: `$${revenueMetrics.arr.toLocaleString()}`,
      change: '+28.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Projected ARR'
    },
    {
      title: 'Customer Lifetime Value',
      value: `$${revenueMetrics.ltv.toLocaleString()}`,
      change: '+15.7%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Average LTV'
    },
    {
      title: 'Customer Acquisition Cost',
      value: `$${revenueMetrics.cac}`,
      change: '-8.3%',
      trend: 'down',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Average CAC'
    },
    {
      title: 'LTV/CAC Ratio',
      value: `${(revenueMetrics.ltv / revenueMetrics.cac).toFixed(1)}:1`,
      change: '+12.4%',
      trend: 'up',
      icon: BarChart3,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Efficiency ratio'
    },
    {
      title: 'Payback Period',
      value: `${revenueMetrics.paybackPeriod} months`,
      change: '-0.8 months',
      trend: 'down',
      icon: Calendar,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      description: 'Time to recover CAC'
    }
  ]

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Revenue Dashboard</h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
              Financial metrics, forecasting, and revenue analytics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                isDarkMode 
                  ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' 
                  : 'border-gray-300 bg-white'
              }`}
            >
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="12m">Last 12 Months</option>
              <option value="24m">Last 24 Months</option>
            </select>
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              variant='outline'
              size='sm'
              className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant='outline' size='sm' className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
              <Download className='h-4 w-4 mr-2' />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {keyMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${isDarkMode ? metric.bgColor.replace('bg-', 'bg-').replace('-50', '-900/30') : metric.bgColor}`}>
                          <Icon className={`h-5 w-5 ${isDarkMode ? metric.color.replace('text-', 'text-').replace('-600', '-400') : metric.color}`} />
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{metric.title}</p>
                          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{metric.value}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center space-x-1 ${
                          metric.trend === 'up' ? 'text-green-600' : 
                          metric.trend === 'down' ? 'text-red-600' : `${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`
                        }`}>
                          {metric.trend === 'up' && <ArrowUpRight className="h-4 w-4" />}
                          {metric.trend === 'down' && <ArrowDownRight className="h-4 w-4" />}
                          <span className="text-sm font-medium">{metric.change}</span>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{metric.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Revenue Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MRR Growth Chart */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>MRR Growth Trend</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Monthly recurring revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={revenueData}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={isDarkMode ? "#374151" : "#e5e7eb"} 
                  />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: isDarkMode ? "#ffffff" : "#374151" }}
                    axisLine={{ stroke: isDarkMode ? "#374151" : "#e5e7eb" }}
                  />
                  <YAxis 
                    tick={{ fill: isDarkMode ? "#ffffff" : "#374151" }}
                    axisLine={{ stroke: isDarkMode ? "#374151" : "#e5e7eb" }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#ffffff" : "#ffffff",
                      border: isDarkMode ? "1px solid #e5e7eb" : "1px solid #e5e7eb",
                      borderRadius: "8px",
                      color: isDarkMode ? "#000000" : "#374151"
                    }}
                    labelStyle={{ color: isDarkMode ? "#000000" : "#374151" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="mrr" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.1}
                    name="MRR"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue by Plan */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Revenue by Plan</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Revenue distribution across subscription plans</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RechartsPieChart>
                  <Pie
                    data={revenueByPlan}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="revenue"
                  >
                    {revenueByPlan.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#ffffff" : "#ffffff",
                      border: isDarkMode ? "1px solid #e5e7eb" : "1px solid #e5e7eb",
                      borderRadius: "8px",
                      color: isDarkMode ? "#000000" : "#374151"
                    }}
                    labelStyle={{ color: isDarkMode ? "#000000" : "#374151" }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-3">
                {revenueByPlan.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${item.revenue.toLocaleString()}</span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-2`}>({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer & ARPU Trends */}
          <Card className={`lg:col-span-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Customer Growth & ARPU</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Customer count and average revenue per user trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={isDarkMode ? "#374151" : "#e5e7eb"} 
                  />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: isDarkMode ? "#ffffff" : "#374151" }}
                    axisLine={{ stroke: isDarkMode ? "#374151" : "#e5e7eb" }}
                  />
                  <YAxis 
                    yAxisId="left" 
                    tick={{ fill: isDarkMode ? "#ffffff" : "#374151" }}
                    axisLine={{ stroke: isDarkMode ? "#374151" : "#e5e7eb" }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tick={{ fill: isDarkMode ? "#ffffff" : "#374151" }}
                    axisLine={{ stroke: isDarkMode ? "#374151" : "#e5e7eb" }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#ffffff" : "#ffffff",
                      border: isDarkMode ? "1px solid #e5e7eb" : "1px solid #e5e7eb",
                      borderRadius: "8px",
                      color: isDarkMode ? "#000000" : "#374151"
                    }}
                    labelStyle={{ color: isDarkMode ? "#000000" : "#374151" }}
                  />
                  <Legend 
                    wrapperStyle={{ color: isDarkMode ? "#ffffff" : "#374151" }}
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="customers" 
                    fill="#3B82F6" 
                    name="Customers"
                    opacity={0.7}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="arpu" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    name="ARPU ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Health Indicators */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Revenue Health</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">Churn Rate</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={revenueMetrics.churnRate < 5 ? "success" : "destructive"}>
                      {revenueMetrics.churnRate}%
                    </Badge>
                    {revenueMetrics.churnRate < 5 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Expansion Revenue</span>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${revenueMetrics.expansionRevenue.toLocaleString()}
                    </span>
                    <p className="text-xs text-green-600">+18.5% MoM</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Contraction Revenue</span>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${revenueMetrics.contractionRevenue.toLocaleString()}
                    </span>
                    <p className="text-xs text-red-600">+5.2% MoM</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">Net Revenue Retention</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="success">112%</Badge>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">Gross Revenue Retention</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="success">97.7%</Badge>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Revenue Forecast</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Next Month</span>
                    <span className="text-sm font-medium">$13,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Next Quarter</span>
                    <span className="text-sm font-medium">$42,800</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Next Year</span>
                    <span className="text-sm font-medium">$185,000</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cohort Analysis */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Revenue Cohort Analysis</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Customer retention and revenue retention by cohort</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className={`text-left p-3 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Cohort</th>
                    <th className={`text-center p-3 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Month 0</th>
                    <th className={`text-center p-3 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Month 1</th>
                    <th className={`text-center p-3 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Month 2</th>
                    <th className={`text-center p-3 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Month 3</th>
                    <th className={`text-center p-3 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Month 4</th>
                    <th className={`text-center p-3 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Month 5</th>
                  </tr>
                </thead>
                <tbody>
                  {cohortData.map((cohort, index) => (
                    <tr key={index} className={`border-b transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-slate-800/50' 
                        : 'hover:bg-gray-50'
                    }`}>
                      <td className={`p-3 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cohort.cohort}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-sm ${
                          isDarkMode 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {cohort.month0}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {cohort.month1 && (
                          <span className={`px-2 py-1 rounded text-sm ${
                            cohort.month1 >= 80 ? (isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800') :
                            cohort.month1 >= 60 ? (isDarkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800') :
                            (isDarkMode ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800')
                          }`}>
                            {cohort.month1}%
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {cohort.month2 && (
                          <span className={`px-2 py-1 rounded text-sm ${
                            cohort.month2 >= 75 ? (isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800') :
                            cohort.month2 >= 55 ? (isDarkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800') :
                            (isDarkMode ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800')
                          }`}>
                            {cohort.month2}%
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {cohort.month3 && (
                          <span className={`px-2 py-1 rounded text-sm ${
                            cohort.month3 >= 70 ? (isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800') :
                            cohort.month3 >= 50 ? (isDarkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800') :
                            (isDarkMode ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800')
                          }`}>
                            {cohort.month3}%
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {cohort.month4 && (
                          <span className={`px-2 py-1 rounded text-sm ${
                            cohort.month4 >= 65 ? (isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800') :
                            cohort.month4 >= 45 ? (isDarkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800') :
                            (isDarkMode ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800')
                          }`}>
                            {cohort.month4}%
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {cohort.month5 && (
                          <span className={`px-2 py-1 rounded text-sm ${
                            cohort.month5 >= 60 ? (isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800') :
                            cohort.month5 >= 40 ? (isDarkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800') :
                            (isDarkMode ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800')
                          }`}>
                            {cohort.month5}%
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RevenueDashboard

