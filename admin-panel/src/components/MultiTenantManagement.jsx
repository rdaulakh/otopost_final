import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  Globe, 
  Palette, 
  Settings,
  Users,
  DollarSign,
  BarChart3,
  Shield,
  Key,
  Database,
  Server,
  Monitor,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  Cloud,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Edit,
  Plus,
  Trash2,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Zap,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  FileText,
  Image,
  Code,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Layers,
  Package,
  CreditCard,
  PieChart,
  LineChart
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, formatDistanceToNow } from 'date-fns'

const MultiTenantManagement = ({ data = {}, onDataUpdate = () => {}, isDarkMode = false }) => {
  const [activeTab, setActiveTab] = useState('tenants')
  const [selectedTenant, setSelectedTenant] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPlan, setSelectedPlan] = useState('all')
  const [isCreatingTenant, setIsCreatingTenant] = useState(false)

  // Multi-tenant statistics
  const tenantStats = {
    totalTenants: 47,
    activeTenants: 42,
    trialTenants: 8,
    suspendedTenants: 3,
    totalRevenue: 89340,
    avgRevenuePerTenant: 1900,
    totalUsers: 12847,
    avgUsersPerTenant: 273,
    resourceUtilization: 67.8,
    storageUsed: 2.4 // TB
  }

  // Tenant instances
  const tenants = [
    {
      id: 1,
      name: 'TechStart Solutions',
      subdomain: 'techstart',
      customDomain: 'social.techstart.com',
      plan: 'Enterprise',
      status: 'active',
      createdAt: '2024-06-15T10:00:00Z',
      lastActivity: '2024-09-15T18:30:00Z',
      users: 456,
      revenue: 4890,
      storageUsed: 125.6, // GB
      cpuUsage: 45.2,
      memoryUsage: 67.8,
      apiCalls: 234567,
      features: {
        whiteLabel: true,
        customDomain: true,
        apiAccess: true,
        advancedAnalytics: true,
        prioritySupport: true,
        sso: true,
        customIntegrations: true
      },
      branding: {
        logo: '/api/placeholder/120/40',
        primaryColor: '#2563EB',
        secondaryColor: '#1E40AF',
        accentColor: '#3B82F6',
        fontFamily: 'Inter',
        customCss: true
      },
      contact: {
        name: 'Sarah Johnson',
        email: 'admin@techstart.com',
        phone: '+1-555-0123'
      },
      billing: {
        plan: 'Enterprise',
        price: 4890,
        billingCycle: 'monthly',
        nextBilling: '2024-10-15',
        paymentMethod: 'Credit Card'
      }
    },
    {
      id: 2,
      name: 'Digital Marketing Pro',
      subdomain: 'digitalmarketing',
      customDomain: null,
      plan: 'Professional',
      status: 'active',
      createdAt: '2024-07-20T14:30:00Z',
      lastActivity: '2024-09-15T16:45:00Z',
      users: 234,
      revenue: 2490,
      storageUsed: 78.3,
      cpuUsage: 32.1,
      memoryUsage: 54.2,
      apiCalls: 156789,
      features: {
        whiteLabel: true,
        customDomain: false,
        apiAccess: true,
        advancedAnalytics: true,
        prioritySupport: false,
        sso: false,
        customIntegrations: false
      },
      branding: {
        logo: '/api/placeholder/120/40',
        primaryColor: '#10B981',
        secondaryColor: '#059669',
        accentColor: '#34D399',
        fontFamily: 'Roboto',
        customCss: false
      },
      contact: {
        name: 'Michael Chen',
        email: 'admin@digitalmarketing.pro',
        phone: '+1-555-0456'
      },
      billing: {
        plan: 'Professional',
        price: 2490,
        billingCycle: 'monthly',
        nextBilling: '2024-10-20',
        paymentMethod: 'Credit Card'
      }
    },
    {
      id: 3,
      name: 'StartupGrow',
      subdomain: 'startupgrow',
      customDomain: 'app.startupgrow.io',
      plan: 'Business',
      status: 'trial',
      createdAt: '2024-09-01T09:15:00Z',
      lastActivity: '2024-09-15T12:20:00Z',
      users: 89,
      revenue: 0,
      storageUsed: 23.7,
      cpuUsage: 18.5,
      memoryUsage: 31.4,
      apiCalls: 45678,
      features: {
        whiteLabel: false,
        customDomain: true,
        apiAccess: true,
        advancedAnalytics: false,
        prioritySupport: false,
        sso: false,
        customIntegrations: false
      },
      branding: {
        logo: '/api/placeholder/120/40',
        primaryColor: '#8B5CF6',
        secondaryColor: '#7C3AED',
        accentColor: '#A78BFA',
        fontFamily: 'Poppins',
        customCss: false
      },
      contact: {
        name: 'Emily Rodriguez',
        email: 'founder@startupgrow.io',
        phone: '+1-555-0789'
      },
      billing: {
        plan: 'Business Trial',
        price: 0,
        billingCycle: 'trial',
        nextBilling: '2024-09-30',
        paymentMethod: 'None'
      }
    },
    {
      id: 4,
      name: 'Enterprise Corp',
      subdomain: 'enterprise',
      customDomain: 'social.enterprise-corp.com',
      plan: 'Enterprise Plus',
      status: 'suspended',
      createdAt: '2024-05-10T11:45:00Z',
      lastActivity: '2024-09-10T08:30:00Z',
      users: 678,
      revenue: 9890,
      storageUsed: 245.8,
      cpuUsage: 0,
      memoryUsage: 0,
      apiCalls: 0,
      features: {
        whiteLabel: true,
        customDomain: true,
        apiAccess: true,
        advancedAnalytics: true,
        prioritySupport: true,
        sso: true,
        customIntegrations: true
      },
      branding: {
        logo: '/api/placeholder/120/40',
        primaryColor: '#EF4444',
        secondaryColor: '#DC2626',
        accentColor: '#F87171',
        fontFamily: 'Arial',
        customCss: true
      },
      contact: {
        name: 'David Wilson',
        email: 'it@enterprise-corp.com',
        phone: '+1-555-0321'
      },
      billing: {
        plan: 'Enterprise Plus',
        price: 9890,
        billingCycle: 'monthly',
        nextBilling: '2024-10-10',
        paymentMethod: 'Invoice'
      }
    }
  ]

  // Tenant plans and pricing
  const tenantPlans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 490,
      billingCycle: 'monthly',
      maxUsers: 50,
      maxStorage: 10, // GB
      apiCallsLimit: 10000,
      features: {
        whiteLabel: false,
        customDomain: false,
        apiAccess: true,
        advancedAnalytics: false,
        prioritySupport: false,
        sso: false,
        customIntegrations: false
      },
      resourceLimits: {
        cpu: 2,
        memory: 4, // GB
        bandwidth: 100 // GB
      }
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 2490,
      billingCycle: 'monthly',
      maxUsers: 250,
      maxStorage: 100,
      apiCallsLimit: 100000,
      features: {
        whiteLabel: true,
        customDomain: false,
        apiAccess: true,
        advancedAnalytics: true,
        prioritySupport: false,
        sso: false,
        customIntegrations: false
      },
      resourceLimits: {
        cpu: 4,
        memory: 8,
        bandwidth: 500
      }
    },
    {
      id: 'business',
      name: 'Business',
      price: 4890,
      billingCycle: 'monthly',
      maxUsers: 500,
      maxStorage: 500,
      apiCallsLimit: 500000,
      features: {
        whiteLabel: true,
        customDomain: true,
        apiAccess: true,
        advancedAnalytics: true,
        prioritySupport: true,
        sso: true,
        customIntegrations: false
      },
      resourceLimits: {
        cpu: 8,
        memory: 16,
        bandwidth: 1000
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 9890,
      billingCycle: 'monthly',
      maxUsers: 1000,
      maxStorage: 1000,
      apiCallsLimit: 1000000,
      features: {
        whiteLabel: true,
        customDomain: true,
        apiAccess: true,
        advancedAnalytics: true,
        prioritySupport: true,
        sso: true,
        customIntegrations: true
      },
      resourceLimits: {
        cpu: 16,
        memory: 32,
        bandwidth: 2000
      }
    }
  ]

  // Resource usage data
  const resourceUsageData = [
    { date: '2024-09-09', cpu: 45.2, memory: 67.8, storage: 2.1, bandwidth: 1.8 },
    { date: '2024-09-10', cpu: 48.1, memory: 69.2, storage: 2.2, bandwidth: 2.1 },
    { date: '2024-09-11', cpu: 42.8, memory: 65.4, storage: 2.2, bandwidth: 1.9 },
    { date: '2024-09-12', cpu: 51.3, memory: 71.6, storage: 2.3, bandwidth: 2.3 },
    { date: '2024-09-13', cpu: 47.9, memory: 68.9, storage: 2.3, bandwidth: 2.0 },
    { date: '2024-09-14', cpu: 44.6, memory: 66.7, storage: 2.4, bandwidth: 1.8 },
    { date: '2024-09-15', cpu: 49.2, memory: 70.1, storage: 2.4, bandwidth: 2.2 }
  ]

  // Tenant revenue data
  const tenantRevenueData = [
    { month: 'May', revenue: 67890, tenants: 38 },
    { month: 'Jun', revenue: 72340, tenants: 41 },
    { month: 'Jul', revenue: 78920, tenants: 43 },
    { month: 'Aug', revenue: 84560, tenants: 45 },
    { month: 'Sep', revenue: 89340, tenants: 47 }
  ]

  // Feature usage distribution
  const featureUsageData = [
    { feature: 'White Label', usage: 78, color: '#3B82F6' },
    { feature: 'Custom Domain', usage: 65, color: '#10B981' },
    { feature: 'API Access', usage: 92, color: '#8B5CF6' },
    { feature: 'Advanced Analytics', usage: 71, color: '#F59E0B' },
    { feature: 'SSO', usage: 45, color: '#EF4444' },
    { feature: 'Custom Integrations', usage: 32, color: '#06B6D4' }
  ]

  const tabs = [
    { id: 'tenants', name: 'Tenants', icon: Building2 },
    { id: 'plans', name: 'Plans & Pricing', icon: Package },
    { id: 'resources', name: 'Resources', icon: Server },
    { id: 'branding', name: 'White Label', icon: Palette },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 }
  ]

  const statusOptions = [
    { id: 'active', name: 'Active', color: 'bg-green-100 text-green-800' },
    { id: 'trial', name: 'Trial', color: 'bg-blue-100 text-blue-800' },
    { id: 'suspended', name: 'Suspended', color: 'bg-red-100 text-red-800' },
    { id: 'pending', name: 'Pending', color: 'bg-yellow-100 text-yellow-800' }
  ]

  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find(s => s.id === status)
    
    const darkStatusColors = {
      active: 'bg-green-600 text-white',
      trial: 'bg-yellow-600 text-white',
      suspended: 'bg-red-600 text-white',
      inactive: 'bg-gray-600 text-white'
    }
    
    return (
      <Badge className={isDarkMode ? (darkStatusColors[status] || 'bg-gray-600 text-white') : (statusConfig?.color || 'bg-gray-100 text-gray-800')}>
        {statusConfig?.name || status}
      </Badge>
    )
  }

  const getFeatureBadge = (enabled) => {
    return enabled ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-gray-400" />
    )
  }

  const renderTenantsTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardContent className='p-6'>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search tenants..."
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
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                  isDarkMode 
                    ? 'border-slate-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                <option value="all">All Status</option>
                {statusOptions.map(status => (
                  <option key={status.id} value={status.id}>{status.name}</option>
                ))}
              </select>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                  isDarkMode 
                    ? 'border-slate-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                <option value="all">All Plans</option>
                {tenantPlans.map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.name}</option>
                ))}
              </select>
            </div>
            <Button
              onClick={() => setIsCreatingTenant(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Tenant
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tenant List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tenants.map((tenant) => (
          <Card key={tenant.id} className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{tenant.name}</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{tenant.subdomain}.aisocialmedia.com</p>
                    {tenant.customDomain && (
                      <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{tenant.customDomain}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(tenant.status)}
                  <Badge variant="outline" className={isDarkMode ? 'border-slate-600 text-slate-300' : ''}>{tenant.plan}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Users</p>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{tenant.users.toLocaleString()}</p>
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Revenue</p>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${tenant.revenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Storage</p>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{tenant.storageUsed} GB</p>
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>API Calls</p>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{tenant.apiCalls.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>CPU Usage</span>
                  <span className="font-medium">{tenant.cpuUsage}%</span>
                </div>
                <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${tenant.cpuUsage}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Memory Usage</span>
                  <span className="font-medium">{tenant.memoryUsage}%</span>
                </div>
                <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${tenant.memoryUsage}%` }}
                  />
                </div>
              </div>

              <div className={`flex items-center justify-between text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                <span>Created: {format(new Date(tenant.createdAt), 'MMM dd, yyyy')}</span>
                <span>Last active: {formatDistanceToNow(new Date(tenant.lastActivity), { addSuffix: true })}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Features:</span>
                  {getFeatureBadge(tenant.features.whiteLabel)}
                  {getFeatureBadge(tenant.features.customDomain)}
                  {getFeatureBadge(tenant.features.sso)}
                  {getFeatureBadge(tenant.features.apiAccess)}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className={isDarkMode ? 'text-slate-300 hover:bg-slate-700' : ''}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className={isDarkMode ? 'text-slate-300 hover:bg-slate-700' : ''}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className={isDarkMode ? 'text-slate-300 hover:bg-slate-700' : ''}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderPlansTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tenant Plans & Pricing</h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Manage subscription plans and pricing tiers</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tenantPlans.map((plan) => (
          <Card key={plan.id} className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                <div className="mt-2">
                  <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${plan.price}</span>
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>/{plan.billingCycle}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Max Users</span>
                  <span className="font-medium">{plan.maxUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Storage</span>
                  <span className="font-medium">{plan.maxStorage} GB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>API Calls</span>
                  <span className="font-medium">{plan.apiCallsLimit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>CPU Cores</span>
                  <span className="font-medium">{plan.resourceLimits.cpu}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Memory</span>
                  <span className="font-medium">{plan.resourceLimits.memory} GB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Bandwidth</span>
                  <span className="font-medium">{plan.resourceLimits.bandwidth} GB</span>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Features:</p>
                <div className="space-y-1">
                  {Object.entries(plan.features).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center justify-between text-sm">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} capitalize`}>{feature.replace(/([A-Z])/g, ' $1')}</span>
                      {getFeatureBadge(enabled)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className={`flex-1 ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : ''}`}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className={isDarkMode ? 'text-slate-300 hover:bg-slate-700' : ''}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderResourcesTab = () => (
    <div className="space-y-6">
      {/* Resource Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>CPU Usage</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>67.8%</p>
              </div>
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                <Cpu className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
            <div className="mt-2">
              <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '67.8%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Memory Usage</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>72.3%</p>
              </div>
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                <MemoryStick className={`h-5 w-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
            </div>
            <div className="mt-2">
              <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                <div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{ width: '72.3%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Storage Used</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{tenantStats.storageUsed} TB</p>
              </div>
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                <HardDrive className={`h-5 w-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>of 5 TB allocated</span>
            </div>
          </CardContent>
        </Card>

        <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Bandwidth</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>1.8 TB</p>
              </div>
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
                <Wifi className={`h-5 w-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage Trends */}
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Resource Usage Trends</CardTitle>
          <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Historical resource utilization across all tenants</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={resourceUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
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
              <Line type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={2} name="CPU %" />
              <Line type="monotone" dataKey="memory" stroke="#10B981" strokeWidth={2} name="Memory %" />
              <Line type="monotone" dataKey="storage" stroke="#8B5CF6" strokeWidth={2} name="Storage (TB)" />
              <Line type="monotone" dataKey="bandwidth" stroke="#F59E0B" strokeWidth={2} name="Bandwidth (TB)" />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Resource Allocation by Tenant */}
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Resource Allocation by Tenant</CardTitle>
          <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Current resource usage breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tenants.filter(t => t.status === 'active').map((tenant) => (
              <div key={tenant.id} className={`p-4 border rounded-lg ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{tenant.name}</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{tenant.plan} Plan</p>
                  </div>
                  <Badge variant='outline' className={isDarkMode ? 'border-slate-600 text-slate-300' : ''}>{tenant.users} users</Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>CPU</span>
                      <span className="font-medium">{tenant.cpuUsage}%</span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${tenant.cpuUsage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Memory</span>
                      <span className="font-medium">{tenant.memoryUsage}%</span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${tenant.memoryUsage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Storage</span>
                      <span className="font-medium">{tenant.storageUsed} GB</span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(tenant.storageUsed / 1000) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>API Calls</span>
                      <span className="font-medium">{(tenant.apiCalls / 1000).toFixed(0)}K</span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                      <div 
                        className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((tenant.apiCalls / 1000000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderBrandingTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>White Label Management</h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Manage branding and customization for tenant instances</p>
      </div>

      <div className="space-y-6">
        {tenants.filter(t => t.features.whiteLabel).map((tenant) => (
          <Card key={tenant.id} className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardContent className='p-6'>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{tenant.name}</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{tenant.subdomain}.aisocialmedia.com</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}>White Label Enabled</Badge>
                  <Button variant='ghost' size='sm' className={isDarkMode ? 'text-slate-300 hover:bg-slate-700' : ''}>
                    <Edit className='h-4 w-4' />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Logo
                    </label>
                    <div className="flex items-center space-x-4">
                      <img
                        src={tenant.branding.logo}
                        alt="Logo"
                        className="h-10 w-auto border rounded"
                      />
                      <Button variant="outline" size="sm" className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : ''}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Primary Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: tenant.branding.primaryColor }}
                      />
                      <input
                        type="text"
                        value={tenant.branding.primaryColor}
                        className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                          isDarkMode 
                            ? 'border-slate-600 bg-slate-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Secondary Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: tenant.branding.secondaryColor }}
                      />
                      <input
                        type="text"
                        value={tenant.branding.secondaryColor}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Font Family
                    </label>
                    <input
                      type="text"
                      value={tenant.branding.fontFamily}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Custom Domain
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={tenant.customDomain || 'Not configured'}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Custom CSS
                    </label>
                    <div className="flex items-center space-x-2">
                      <Badge className={tenant.branding.customCss ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {tenant.branding.customCss ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Code className="h-4 w-4 mr-2" />
                        Edit CSS
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Preview
                    </label>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={tenant.branding.logo}
                          alt="Logo"
                          className="h-6 w-auto"
                        />
                        <span 
                          className="font-medium"
                          style={{ 
                            color: tenant.branding.primaryColor,
                            fontFamily: tenant.branding.fontFamily
                          }}
                        >
                          {tenant.name}
                        </span>
                      </div>
                      <div 
                        className="w-full h-2 rounded"
                        style={{ backgroundColor: tenant.branding.primaryColor }}
                      />
                    </div>
                  </div>
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
      {/* Revenue Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Tenant Revenue Growth</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Monthly revenue and tenant count trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={tenantRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
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
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Revenue ($)" />
                <Line type="monotone" dataKey="tenants" stroke="#10B981" strokeWidth={2} name="Tenants" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Feature Usage Distribution</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Adoption rates across tenant features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {featureUsageData.map((feature, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: feature.color }}
                    />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{feature.feature}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-24 rounded-full h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${feature.usage}%`,
                          backgroundColor: feature.color
                        }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} w-12`}>{feature.usage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tenant Distribution */}
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Tenant Distribution by Plan</CardTitle>
          <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Current tenant distribution across pricing plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {tenantPlans.map((plan) => {
              const tenantCount = tenants.filter(t => t.plan.toLowerCase().includes(plan.name.toLowerCase())).length
              const percentage = ((tenantCount / tenants.length) * 100).toFixed(1)
              
              return (
                <div key={plan.id} className="text-center">
                  <div className="p-4 bg-blue-50 rounded-lg mb-3">
                    <Package className="h-8 w-8 text-blue-600 mx-auto" />
                  </div>
                  <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h4>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{tenantCount}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{percentage}% of tenants</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>${plan.price}/month</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'plans':
        return renderPlansTab()
      case 'resources':
        return renderResourcesTab()
      case 'branding':
        return renderBrandingTab()
      case 'analytics':
        return renderAnalyticsTab()
      default:
        return renderTenantsTab()
    }
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
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Multi-Tenant Management</h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
              White-label instances, resource allocation, and tenant administration
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className={isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}>
              <Building2 className="h-3 w-3 mr-1" />
              {tenantStats.totalTenants} Tenants
            </Badge>
            <Button variant="outline" size="sm" className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : ''}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active Tenants</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{tenantStats.activeTenants}</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <Building2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {tenantStats.trialTenants} on trial
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Revenue</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${tenantStats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600 ml-1">+18.5%</span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-2`}>vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Users</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{tenantStats.totalUsers.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Avg {tenantStats.avgUsersPerTenant} per tenant
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Resource Usage</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{tenantStats.resourceUtilization}%</p>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Server className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div className="mt-2">
                <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                  <div 
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${tenantStats.resourceUtilization}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
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
                      ? (isDarkMode ? 'border-blue-500 text-blue-400' : 'border-blue-500 text-blue-600')
                      : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-slate-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')
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

export default MultiTenantManagement

