import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Target, 
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Star,
  Award,
  Zap,
  Eye,
  Edit,
  Send,
  Plus,
  Filter,
  Search,
  Download,
  RefreshCw,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  FileText,
  Bookmark,
  Flag,
  UserCheck,
  UserX,
  UserPlus,
  Settings,
  Bell,
  Gift,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts'
import { format } from 'date-fns'

const CustomerSuccess = ({ isDarkMode = false }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [selectedSegment, setSelectedSegment] = useState('all')
  const [selectedHealthScore, setSelectedHealthScore] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  // Define tabs for navigation
  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'customers', name: 'Customers', icon: Users },
    { id: 'onboarding', name: 'Onboarding', icon: UserPlus },
    { id: 'playbooks', name: 'Playbooks', icon: Bookmark },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp }
  ]


  // Mock data for customer metrics
  const customerMetrics = {
    totalCustomers: 1250,
    activeCustomers: 1180,
    churnedCustomers: 70,
    newCustomers: 45,
    npsScore: 8.2,
    csatScore: 4.6,
    retentionRate: 94.4,
    growthRate: 12.5
  }

  // Mock data for customer segments
  const customerSegments = [
    { id: 1, name: 'Enterprise', count: 45, growth: 15.2, health: 'High', color: '#3B82F6', description: 'Large enterprise customers', percentage: 3.6 },
    { id: 2, name: 'Mid-Market', count: 120, growth: 8.7, health: 'Medium', color: '#10B981', description: 'Medium-sized businesses', percentage: 9.6 },
    { id: 3, name: 'SMB', count: 1085, growth: 22.1, health: 'High', color: '#F59E0B', description: 'Small and medium businesses', percentage: 86.8 }
  ]


  // Mock data for customer journey
  const journeyStages = [
    { stage: 'Onboarding', customers: 45, conversion: 95 },
    { stage: 'Activation', customers: 42, conversion: 88 },
    { stage: 'Adoption', customers: 38, conversion: 90 },
    { stage: 'Retention', customers: 35, conversion: 92 }
  ]

  // Mock data for health trends
  const healthTrendData = [
    { date: '2024-01-01', high: 45, medium: 120, low: 35 },
    { date: '2024-01-08', high: 48, medium: 115, low: 32 },
    { date: '2024-01-15', high: 52, medium: 110, low: 28 },
    { date: '2024-01-22', high: 55, medium: 105, low: 25 },
    { date: '2024-01-29', high: 58, medium: 100, low: 22 },
    { date: '2024-02-05', high: 62, medium: 95, low: 18 },
    { date: '2024-02-12', high: 65, medium: 90, low: 15 }
  ]

  // Combined loading and error states
  const hasError = false

  // Use mock data
  const successMetrics = customerMetrics

  // Error handling - show error messages instead of static data
  if (hasError) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Customer Success Data</h3>
            <p className="text-gray-600 mb-4">Unable to fetch customer success data from the API.</p>
            <Button onClick={() => {
              // Refresh data
            }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Customer health scores and segments

  // Customer journey stages

  // Onboarding completion data

  // Customer health trends

  // Churn prediction data

  // Individual customer data
  const customers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah@techstart.com',
      company: 'TechStart Inc',
      plan: 'Enterprise',
      healthScore: 85,
      segment: 'Healthy',
      joinDate: '2024-06-15',
      lastActivity: '2024-09-15',
      totalPosts: 156,
      engagementRate: 8.2,
      revenue: 2499.99,
      status: 'active'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael@growthco.io',
      company: 'GrowthCo',
      plan: 'Pro',
      healthScore: 67,
      segment: 'At Risk',
      joinDate: '2024-08-20',
      lastActivity: '2024-09-12T14:20:00Z',
      totalRevenue: 890,
      nps: 6,
      onboardingProgress: 85,
      riskLevel: 'high',
      nextAction: 'Schedule check-in call',
      csm: 'Lisa Wang',
      tags: ['at-risk', 'low-engagement', 'needs-attention']
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily@digitalagency.com',
      company: 'Digital Agency Pro',
      plan: 'Premium',
      healthScore: 85,
      segment: 'Advocates',
      joinDate: '2024-07-10',
      lastActivity: '2024-09-15T16:45:00Z',
      totalRevenue: 1890,
      nps: 8,
      onboardingProgress: 100,
      riskLevel: 'low',
      nextAction: 'Feature adoption campaign',
      csm: 'David Kim',
      tags: ['satisfied', 'feature-adopter', 'referral-source']
    }
  ];

  // Onboarding steps data
  const onboardingSteps = [
    {
      step: 'Account Setup',
      avgTime: '2-3 days',
      completion: 95,
      description: 'Initial account configuration and team setup'
    },
    {
      step: 'Data Import',
      avgTime: '1-2 days',
      completion: 88,
      description: 'Import existing data and configure integrations'
    },
    {
      step: 'Team Training',
      avgTime: '3-5 days',
      completion: 82,
      description: 'Train team members on platform features'
    },
    {
      step: 'First Campaign',
      avgTime: '2-4 days',
      completion: 76,
      description: 'Launch first marketing campaign'
    },
    {
      step: 'Analytics Setup',
      avgTime: '1-2 days',
      completion: 71,
      description: 'Configure tracking and reporting'
    }
  ]

  // Churn prediction data
  const churnPredictionData = [
    { month: 'Jan', actual: 12, predicted: 14, accuracy: 85 },
    { month: 'Feb', actual: 8, predicted: 9, accuracy: 89 },
    { month: 'Mar', actual: 15, predicted: 13, accuracy: 87 },
    { month: 'Apr', actual: 11, predicted: 12, accuracy: 91 },
    { month: 'May', actual: 9, predicted: 10, accuracy: 90 },
    { month: 'Jun', actual: 13, predicted: 14, accuracy: 92 },
    { month: 'Jul', actual: 7, predicted: 8, accuracy: 88 },
    { month: 'Aug', actual: 16, predicted: 15, accuracy: 94 },
    { month: 'Sep', actual: 10, predicted: 11, accuracy: 91 },
    { month: 'Oct', actual: 14, predicted: 13, accuracy: 93 },
    { month: 'Nov', actual: 6, predicted: 7, accuracy: 86 },
    { month: 'Dec', actual: 18, predicted: 17, accuracy: 94 }
  ]

  // Success playbooks
  const successPlaybooks = [
    {
      id: 1,
      name: 'New Customer Onboarding',
      description: 'Complete onboarding process for new customers',
      triggers: ['new_signup', 'first_login'],
      steps: 6,
      completion: 89.3,
      status: 'active'
    },
    {
      id: 2,
      name: 'At-Risk Customer Recovery',
      description: 'Re-engagement campaign for declining health scores',
      triggers: ['health_score_drop', 'low_activity'],
      steps: 4,
      completion: 67.8,
      status: 'active'
    },
    {
      id: 3,
      name: 'Expansion Opportunity',
      description: 'Upsell campaign for high-value customers',
      triggers: ['usage_threshold', 'feature_limit'],
      steps: 5,
      completion: 45.2,
      status: 'active'
    }
  ]

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRiskBadge = (risk) => {
    const colors = {
      low: isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800',
      medium: isDarkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800',
      high: isDarkMode ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-800',
      critical: isDarkMode ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800'
    }
    return colors[risk] || (isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800')
  }


  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Health Score</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{successMetrics.avgHealthScore}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Heart className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${successMetrics.avgHealthScore}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Churn Rate</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{successMetrics.churnRate}%</p>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <ArrowDown className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600 ml-1">-0.5%</span>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>NPS Score</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{successMetrics.nps}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <Star className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <ArrowUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600 ml-1">+3</span>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Retention Rate</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{successMetrics.retentionRate}%</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <ArrowUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600 ml-1">+1.2%</span>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Time to Value</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{successMetrics.timeToValue}d</p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <ArrowDown className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600 ml-1">-0.8d</span>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Customer Health Distribution</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Customer segments by health score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customerSegments.map((segment, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: segment.color }}
                    />
                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{segment.name}</h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{segment.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{segment.count}</p>
                    <p className="text-sm text-gray-500">{segment.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Health Score Trends</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Customer health distribution over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={healthTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
                <XAxis 
                  dataKey="date" 
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
                <Legend 
                  wrapperStyle={{ color: isDarkMode ? "#ffffff" : "#374151" }}
                />
                <Area type="monotone" dataKey="champions" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="advocates" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="satisfied" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="atRisk" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                <Area type="monotone" dataKey="critical" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Customer Journey */}
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Customer Journey Funnel</CardTitle>
          <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Conversion rates through customer lifecycle stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {journeyStages.map((stage, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stage.stage}</h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {(stage.customers || 0).toLocaleString()} customers • Avg: {stage.avgDuration || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Conversion Rate</p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stage.conversionRate}%</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Drop-off Rate</p>
                      <p className="font-medium text-red-600">{stage.dropoffRate}%</p>
                    </div>
                    <div className="w-32">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stage.conversionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {index < journeyStages.length - 1 && (
                  <div className="flex justify-center mt-2 mb-2">
                    <ArrowDown className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderCustomersTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'border-slate-600 bg-slate-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              <select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                  isDarkMode 
                    ? 'border-slate-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                <option value="all">All Segments</option>
                {customerSegments.map(segment => (
                  <option key={segment.name} value={segment.name}>{segment.name}</option>
                ))}
              </select>
              <select
                value={selectedHealthScore}
                onChange={(e) => setSelectedHealthScore(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                  isDarkMode 
                    ? 'border-slate-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                <option value="all">All Health Scores</option>
                <option value="high">High (80+)</option>
                <option value="medium">Medium (60-79)</option>
                <option value="low">Low (&lt;60)</option>
              </select>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Customer Overview</CardTitle>
          <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Detailed customer information and health metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Customer</th>
                  <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Health Score</th>
                  <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Segment</th>
                  <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Plan</th>
                  <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Revenue</th>
                  <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Last Activity</th>
                  <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>CSM</th>
                  <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className={`border-b transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-slate-800/50' 
                      : 'hover:bg-gray-50'
                  }`}>
                    <td className="p-4">
                      <div>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{customer.name}</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{customer.email}</p>
                        <p className="text-sm text-gray-500">{customer.company}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-bold ${getHealthScoreColor(customer.healthScore)}`}>
                          {customer.healthScore}
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              customer.healthScore >= 80 ? 'bg-green-600' :
                              customer.healthScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${customer.healthScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getRiskBadge(customer.riskLevel)}>
                        {customer.segment}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">{customer.plan}</Badge>
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${(customer.totalRevenue || customer.revenue || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {format(new Date(customer.lastActivity), 'MMM dd, HH:mm')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{customer.csm}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderOnboardingTab = () => (
    <div className="space-y-6">
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Onboarding Completion Rates</CardTitle>
          <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Step-by-step onboarding progress and completion metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {onboardingSteps.map((step, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{step.step}</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Average time: {step.avgTime}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{step.completion}%</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>completion</p>
                  </div>
                  <div className="w-32">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${step.completion}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Onboarding Performance</CardTitle>
          <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Overall onboarding metrics and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-4 bg-green-50 rounded-lg mb-3">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
              </div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{successMetrics.onboardingCompletion}%</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Completion Rate</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-blue-50 rounded-lg mb-3">
                <Clock className="h-8 w-8 text-blue-600 mx-auto" />
              </div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{successMetrics.timeToValue}d</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Time to Value</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-purple-50 rounded-lg mb-3">
                <Users className="h-8 w-8 text-purple-600 mx-auto" />
              </div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>1,247</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active Onboardings</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPlaybooksTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Success Playbooks</h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Automated workflows for customer success</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Playbook
        </Button>
      </div>

      <div className="space-y-4">
        {successPlaybooks.map((playbook) => (
          <Card key={playbook.id} className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{playbook.name}</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{playbook.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{playbook.steps} steps</span>
                      <span>{playbook.completion}% completion rate</span>
                      <span>Triggers: {playbook.triggers.join(', ')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={playbook.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {playbook.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Churn Prediction vs Actual</CardTitle>
          <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>AI-powered churn prediction accuracy</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={churnPredictionData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
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
              <Legend 
                wrapperStyle={{ color: isDarkMode ? "#ffffff" : "#374151" }}
              />
              <Line type="monotone" dataKey="predicted" stroke="#3B82F6" strokeWidth={2} name="Predicted" />
              <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} name="Actual" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Customer Satisfaction</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>CSAT and NPS trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>CSAT Score</span>
                <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{successMetrics.csat}/5</span>
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= successMetrics.csat
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <div className="flex items-center justify-between mt-6">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>NPS Score</span>
                <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{successMetrics.nps}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(successMetrics.nps + 100) / 2}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Expansion Revenue</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Upsell and cross-sell performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">+{successMetrics.expansionRevenue}%</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Expansion Revenue Growth</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>156</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Upsells</p>
                </div>
                <div>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>89</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cross-sells</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'customers':
        return renderCustomersTab()
      case 'onboarding':
        return renderOnboardingTab()
      case 'playbooks':
        return renderPlaybooksTab()
      case 'analytics':
        return renderAnalyticsTab()
      default:
        return renderOverviewTab()
    }
  }

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      <div className=" mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Customer Success</h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
              Customer health monitoring, onboarding management, and retention analytics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                isDarkMode 
                  ? 'border-slate-600 bg-slate-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : isDarkMode 
                        ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderCurrentTab()}
        </motion.div>
      </div>
    </div>
  )
}

export default CustomerSuccess

