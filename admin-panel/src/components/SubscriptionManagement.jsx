import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CreditCard, 
  Users, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Crown,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Modal from './ui/Modal';
import CreatePlanForm from './CreatePlanForm';
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import subscriptionService from '../services/subscriptionService'
import planService from '../services/planService'

const SubscriptionManagement = ({ data = {}, onDataUpdate = () => {}, isDarkMode = false }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedPlan, setSelectedPlan] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState("desc");
const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false);

  // API state
  const [apiSubscriptions, setApiSubscriptions] = useState([])
  const [apiStats, setApiStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Data fetching functions
  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const params = {
        page: 1,
        limit: 100,
        search: searchTerm,
        status: selectedFilter !== 'all' ? selectedFilter : '',
        plan: selectedPlan !== 'all' ? selectedPlan : '',
        sortBy,
        sortOrder
      }
      
      const response = await subscriptionService.getSubscriptions(params)
      setApiSubscriptions(response.subscriptions || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching subscriptions:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await subscriptionService.getSubscriptionStats()
      setApiStats(response || {})
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  // Fetch available plans
  const fetchPlans = async () => {
    try {
      const response = await planService.getPlans()
      setApiSubscriptions(response.plans || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching plans:', err)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchPlans() // Load plans instead of subscriptions
    fetchStats()
  }, [])

  // Refetch when filters change
  useEffect(() => {
    fetchPlans()
  }, [searchTerm, selectedFilter, selectedPlan, sortBy, sortOrder])

  // Map API data to original component structure
  const subscriptions = apiSubscriptions.map(plan => ({
    id: plan._id,
    user_id: plan._id, // Plans don't have organizationId
    user_name: plan.name,
    user_email: plan.description || 'Plan template',
    plan: plan.name,
    status: plan.isActive ? 'active' : 'inactive',
    amount: plan.pricing?.monthly?.amount || 0,
    billing_cycle: 'monthly',
    next_billing: null, // Plans don't have billing dates
    created_at: plan.createdAt,
    trial_end: null, // Plans don't have trial end
    payment_method: 'N/A', // Plans are templates
    mrr: plan.pricing?.monthly?.amount || 0,
    usage: {
      posts: plan.features?.monthlyPosts?.included || 0,
      accounts: plan.features?.socialAccounts?.included || 0,
      ai_tokens: plan.features?.aiGenerations?.included || 0
    }
  }))

  // Original subscription plans (keeping the design)
  const subscriptionPlans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      interval: 'month',
      features: ['5 Social Accounts', '50 Posts/Month', 'Basic Analytics', 'Email Support'],
      color: isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800',
      icon: Zap,
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 99,
      interval: 'month',
      features: ['15 Social Accounts', '200 Posts/Month', 'Advanced Analytics', 'Priority Support', 'AI Content Generation'],
      color: isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800',
      icon: Star,
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 299,
      interval: 'month',
      features: ['Unlimited Accounts', 'Unlimited Posts', 'Custom Analytics', '24/7 Support', 'White-label Solution', 'API Access'],
      color: isDarkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800',
      icon: Crown,
      popular: false
    }
  ]

  // Subscription actions
  const handleCancelSubscription = async (subscriptionId) => {
    try {
      await subscriptionService.cancelSubscription(subscriptionId, 'Cancelled by admin')
      await fetchSubscriptions()
      await fetchStats()
    } catch (err) {
      console.error('Error cancelling subscription:', err)
    }
  }

  const handleReactivateSubscription = async (subscriptionId) => {
    try {
      await subscriptionService.reactivateSubscription(subscriptionId)
      await fetchSubscriptions()
      await fetchStats()
    } catch (err) {
      console.error('Error reactivating subscription:', err)
    }
  }

  const handleCreateSubscription = async (subscriptionData) => {
    try {
      await subscriptionService.createSubscription(subscriptionData)
      await fetchSubscriptions()
      await fetchStats()
    } catch (err) {
      console.error('Error creating subscription:', err)
    }
  }

  const handleUpdateSubscription = async (subscriptionId, subscriptionData) => {
    try {
      await subscriptionService.updateSubscription(subscriptionId, subscriptionData)
      await fetchSubscriptions()
      await fetchStats()
    } catch (err) {
      console.error('Error updating subscription:', err)
    }
  }

  const statusOptions = [
    { id: 'active', name: 'Active', color: isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800', icon: CheckCircle },
    { id: 'trial', name: 'Trial', color: isDarkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800', icon: Clock },
    { id: 'past_due', name: 'Past Due', color: isDarkMode ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800', icon: AlertCircle },
    { id: 'cancelled', name: 'Cancelled', color: isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800', icon: XCircle }
  ]

  const filterOptions = [
    { id: 'all', name: 'All Subscriptions', count: subscriptions.length },
    { id: 'active', name: 'Active', count: subscriptions.filter(s => s.status === 'active').length },
    { id: 'trial', name: 'Trial', count: subscriptions.filter(s => s.status === 'trial').length },
    { id: 'past_due', name: 'Past Due', count: subscriptions.filter(s => s.status === 'past_due').length },
    { id: 'cancelled', name: 'Cancelled', count: subscriptions.filter(s => s.status === 'cancelled').length }
  ]

  // Calculate metrics (using API data when available, fallback to calculated)
  const metrics = {
    totalSubscriptions: apiStats.total || subscriptions.length,
    activeSubscriptions: apiStats.active || subscriptions.filter(s => s.status === 'active').length,
    trialSubscriptions: subscriptions.filter(s => s.status === 'trial').length,
    totalMRR: apiStats.totalRevenue || subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.mrr, 0),
    avgRevenuePerUser: apiStats.avgRevenue || (subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.mrr, 0) / subscriptions.filter(s => s.status === 'active').length || 0),
    churnRate: apiStats.cancelled ? (apiStats.cancelled / (apiStats.total || 1)) * 100 : 2.3,
    conversionRate: 78.5
  }

  // Chart data
  const revenueData = [
    { month: 'Jan', mrr: 8500, subscriptions: 120 },
    { month: 'Feb', mrr: 9200, subscriptions: 135 },
    { month: 'Mar', mrr: 10100, subscriptions: 158 },
    { month: 'Apr', mrr: 10800, subscriptions: 172 },
    { month: 'May', mrr: 11500, subscriptions: 189 },
    { month: 'Jun', mrr: 12340, subscriptions: 210 },
  ]

  const planDistribution = [
    { name: 'Starter', value: subscriptions.filter(s => s.plan === 'Starter').length, color: '#6B7280' },
    { name: 'Pro', value: subscriptions.filter(s => s.plan === 'Pro').length, color: '#3B82F6' },
    { name: 'Premium', value: subscriptions.filter(s => s.plan === 'Premium').length, color: '#8B5CF6' }
  ]

  // Filter and sort subscriptions
  const filteredSubscriptions = useMemo(() => {
    let filtered = subscriptions.filter(subscription => {
      const matchesSearch = subscription.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           subscription.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           subscription.plan.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFilter = selectedFilter === 'all' || subscription.status === selectedFilter
      const matchesPlan = selectedPlan === 'all' || subscription.plan === selectedPlan
      
      return matchesSearch && matchesFilter && matchesPlan
    })

    // Sort subscriptions
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy === 'created_at' || sortBy === 'next_billing') {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [subscriptions, searchTerm, selectedFilter, selectedPlan, sortBy, sortOrder])

  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find(s => s.id === status)
    const Icon = statusConfig?.icon || CheckCircle
    
    return (
      <Badge className={statusConfig?.color || (isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800')}>
        <Icon className="h-3 w-3 mr-1" />
        {statusConfig?.name || status}
      </Badge>
    )
  }

  const handleCreatePlan = async (newPlan) => {
    try {
      console.log("Creating new plan:", newPlan);
      
      // Generate planId from name
      const planId = newPlan.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Create plan data
      const planData = {
        planId: planId,
        name: newPlan.name,
        description: newPlan.features || 'Custom plan created by admin',
        pricing: {
          monthly: {
            amount: newPlan.price,
            currency: 'USD'
          },
          yearly: {
            amount: newPlan.price * 12 * 0.8, // 20% discount for yearly
            currency: 'USD',
            discount: 20
          },
          quarterly: {
            amount: newPlan.price * 3 * 0.9, // 10% discount for quarterly
            currency: 'USD',
            discount: 10
          }
        },
        features: {
          users: { included: 1, additionalCost: 0 },
          socialAccounts: { included: 2, additionalCost: 0 },
          monthlyPosts: { included: 10 },
          aiGenerations: { included: 5 },
          storageGB: { included: 1, additionalCost: 0 },
          analyticsRetentionDays: 30,
          aiAgents: true,
          analytics: true,
          teamCollaboration: false,
          whiteLabel: false,
          apiAccess: false,
          prioritySupport: false,
          customBranding: false,
          advancedAnalytics: false,
          multipleWorkspaces: false,
          sso: false
        },
        isActive: true,
        isPopular: false,
        sortOrder: 0,
        trial: {
          enabled: true,
          days: 14
        },
        category: 'custom',
        tags: ['custom', 'admin-created']
      };
      
      await planService.createPlan(planData);
      await fetchPlans(); // Refresh the plans list
      await fetchStats();
      setIsCreatePlanModalOpen(false);
      
      alert('Plan created successfully!');
    } catch (error) {
      console.error('Error creating plan:', error);
      alert(`Error creating plan: ${error.message}`);
    }
  };

  const getPlanBadge = (plan) => {
    const planConfig = subscriptionPlans.find(p => p.name === plan)
    const Icon = planConfig?.icon || Star
    
    return (
      <Badge className={planConfig?.color || (isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800')}>
        <Icon className="h-3 w-3 mr-1" />
        {plan}
      </Badge>
    )
  }

  return (
    <>
      <Modal isOpen={isCreatePlanModalOpen} onClose={() => setIsCreatePlanModalOpen(false)} title="Create New Subscription Plan" isDarkMode={isDarkMode}>
        <CreatePlanForm onSave={handleCreatePlan} onCancel={() => setIsCreatePlanModalOpen(false)} isDarkMode={isDarkMode} />
      </Modal>
      <div className={`min-h-screen p-6 transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
      }`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Subscription Management</h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage billing plans, subscriptions, and revenue
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant='outline' size='sm' className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
              <Download className='h-4 w-4 mr-2' />
              Export
            </Button>
            <Button size='sm' onClick={() => setIsCreatePlanModalOpen(true)} className={isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}>
              <Plus className='h-4 w-4 mr-2' />
              Create Plan
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total MRR</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${metrics.totalMRR.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600 ml-1">+23.5%</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-2`}>vs last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active Subscriptions</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{metrics.activeSubscriptions}</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600 ml-1">+12.3%</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-2`}>vs last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>ARPU</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${Math.round(metrics.avgRevenuePerUser)}</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600 ml-1">+8.7%</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-2`}>vs last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Churn Rate</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{metrics.churnRate}%</p>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <ArrowDownRight className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600 ml-1">-1.2%</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-2`}>vs last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MRR Growth Chart */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
              <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>MRR Growth</CardTitle>
              <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Monthly recurring revenue trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
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
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Plan Distribution */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
              <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Plan Distribution</CardTitle>
              <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Subscription plans breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {planDistribution.map((entry, index) => (
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
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {planDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.name}</span>
                    </div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Plans */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Subscription Plans</CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Manage pricing plans and features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan) => {
                const Icon = plan.icon
                return (
                  <div
                    key={plan.id}
                    className={`relative p-6 rounded-lg border-2 transition-all hover:shadow-lg ${
                      plan.popular 
                        ? isDarkMode 
                          ? 'border-blue-500 bg-slate-800/50' 
                          : 'border-blue-500 bg-blue-50'
                        : isDarkMode 
                          ? 'border-slate-600 bg-slate-800/30' 
                          : 'border-gray-200 bg-white'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                      </div>
                    )}
                    <div className="text-center">
                      <Icon className={`h-8 w-8 mx-auto mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                      <div className="mt-2">
                        <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${plan.price}</span>
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>/{plan.interval}</span>
                      </div>
                    </div>
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder="Search subscriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkMode
                        ? 'bg-slate-800 border-slate-600 text-white placeholder-gray-400'
                        : 'border border-gray-300'
                    }`}
                  />
                </div>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className={`px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-600 text-white' 
                      : 'border border-gray-300'
                  }`}
                  style={isDarkMode ? { color: 'white' } : {}}
                >
                  {filterOptions.map(option => (
                    <option 
                      key={option.id} 
                      value={option.id}
                      style={isDarkMode ? { backgroundColor: '#1e293b', color: 'white' } : {}}
                    >
                      {option.name} ({option.count})
                    </option>
                  ))}
                </select>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className={`px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-600 text-white' 
                      : 'border border-gray-300'
                  }`}
                  style={isDarkMode ? { color: 'white' } : {}}
                >
                  <option 
                    value="all"
                    style={isDarkMode ? { backgroundColor: '#1e293b', color: 'white' } : {}}
                  >
                    All Plans
                  </option>
                  {subscriptionPlans.map(plan => (
                    <option 
                      key={plan.id} 
                      value={plan.name}
                      style={isDarkMode ? { backgroundColor: '#1e293b', color: 'white' } : {}}
                    >
                      {plan.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions Table */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Subscriptions ({filteredSubscriptions.length})</CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage customer subscriptions and billing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Customer</th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Plan</th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Status</th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Amount</th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Next Billing</th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Usage</th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((subscription) => (
                    <motion.tr
                      key={subscription.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`border-b transition-colors ${
                        isDarkMode 
                          ? 'hover:bg-slate-800/50' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="p-4">
                        <div>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{subscription.user_name}</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{subscription.user_email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        {getPlanBadge(subscription.plan)}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(subscription.status)}
                      </td>
                      <td className="p-4">
                        <div>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${subscription.amount}</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{subscription.billing_cycle}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          {subscription.next_billing ? (
                            <>
                              <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {format(new Date(subscription.next_billing), 'MMM dd, yyyy')}
                              </p>
                              {subscription.trial_end && (
                                <p className="text-xs text-yellow-600">
                                  Trial ends: {format(new Date(subscription.trial_end), 'MMM dd')}
                                </p>
                              )}
                            </>
                          ) : (
                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>-</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{subscription.usage.posts} posts</p>
                          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{subscription.usage.accounts} accounts</p>
                          <p className="text-xs text-gray-400">{subscription.usage.ai_tokens} tokens</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredSubscriptions.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className={`h-12 w-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No subscriptions found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}

export default SubscriptionManagement;

