import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Import notification center hooks
import { 
  useNotifications,
  useAlertRules,
  useNotificationChannels,
  useNotificationMetrics,
  useCreateNotification,
  useUpdateNotification,
  useDeleteNotification,
  useCreateAlertRule,
  useUpdateAlertRule
} from '../hooks/useNotificationCenter.js'
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  Smartphone,
  Slack,
  Webhook,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Play,
  Pause,
  RefreshCw,
  Filter,
  Search,
  Download,
  Upload,
  Copy,
  ExternalLink,
  Users,
  Target,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  Server,
  Database,
  Globe,
  Monitor,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  Lock,
  Key,
  FileText,
  Calendar,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format, formatDistanceToNow } from 'date-fns'

const NotificationCenter = ({ data = {}, onDataUpdate = () => {}, isDarkMode = false }) => {
  const [activeTab, setActiveTab] = useState('alerts')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreatingRule, setIsCreatingRule] = useState(false)

  // Real API integration for notification center data
  const { 
    data: notificationsData, 
    isLoading: notificationsLoading, 
    error: notificationsError,
    refetch: refetchNotifications 
  } = useNotifications({ 
    category: selectedCategory, 
    severity: selectedSeverity, 
    search: searchTerm 
  })

  const { 
    data: alertRulesData, 
    isLoading: rulesLoading, 
    error: rulesError,
    refetch: refetchRules 
  } = useAlertRules()

  const { 
    data: channelsData, 
    isLoading: channelsLoading, 
    error: channelsError,
    refetch: refetchChannels 
  } = useNotificationChannels()

  const { 
    data: metricsData, 
    isLoading: metricsLoading, 
    error: metricsError,
    refetch: refetchMetrics 
  } = useNotificationMetrics()

  // Combined loading and error states
  const isLoading = notificationsLoading || rulesLoading || channelsLoading || metricsLoading
  const hasError = notificationsError || rulesError || channelsError || metricsError

  // Use ONLY real API data - NO static fallbacks
  const notificationStats = metricsData?.stats || {}
  const alertRules = alertRulesData?.rules || []
  const recentNotifications = notificationsData?.notifications || []
  const notificationChannels = channelsData?.channels || []

  // Error handling - show error messages instead of static data
  if (hasError) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Notification Data</h3>
            <p className="text-gray-600 mb-4">Unable to fetch notification center data from the API.</p>
            <Button onClick={() => {
              refetchNotifications()
              refetchRules()
              refetchChannels()
              refetchMetrics()
            }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }// Alert rules and configurations
      recipients: ['ops-team@aisocialmedia.com', '#alerts'],
      enabled: true,
      triggered: 12,
      lastTriggered: '2024-09-15T14:30:00Z',
      status: 'active'
    },
    {
      id: 2,
      name: 'Customer Churn Risk',
      description: 'Alert when customer health score drops below 40',
      category: 'customer',
      severity: 'critical',
      condition: 'health_score < 40',
      duration: '1h',
      channels: ['email', 'sms', 'slack'],
      recipients: ['success@aisocialmedia.com', '#customer-success'],
      enabled: true,
      triggered: 5,
      lastTriggered: '2024-09-15T16:45:00Z',
      status: 'active'
    },
    {
      id: 3,
      name: 'Revenue Milestone',
      description: 'Alert when daily revenue exceeds $15,000',
      category: 'business',
      severity: 'low',
      condition: 'daily_revenue > 15000',
      duration: 'immediate',
      channels: ['email', 'slack'],
      recipients: ['finance@aisocialmedia.com', '#revenue'],
      enabled: true,
      triggered: 8,
      lastTriggered: '2024-09-15T18:20:00Z',
      status: 'active'
    },
    {
      id: 4,
      name: 'API Rate Limit Exceeded',
      description: 'Alert when API rate limit is exceeded',
      category: 'api',
      severity: 'medium',
      condition: 'api_requests > rate_limit',
      duration: '1m',
      channels: ['email', 'webhook'],
      recipients: ['dev@aisocialmedia.com'],
      enabled: true,
      triggered: 23,
      lastTriggered: '2024-09-15T12:15:00Z',
      status: 'active'
    },
    {
      id: 5,
      name: 'Failed Payment Alert',
      description: 'Alert when payment processing fails',
      category: 'billing',
      severity: 'high',
      condition: 'payment_failed = true',
      duration: 'immediate',
      channels: ['email', 'sms', 'slack'],
      recipients: ['billing@aisocialmedia.com', '#billing-alerts'],
      enabled: true,
      triggered: 3,
      lastTriggered: '2024-09-14T20:30:00Z',
      status: 'active'
    }
  ]

  // Recent notifications
      recipients: 3,
      acknowledged: false,
      escalated: false
    },
    {
      id: 2,
      title: 'Customer Health Score Alert',
      message: 'Customer TechStart Inc. health score dropped to 35',
      severity: 'critical',
      category: 'customer',
      timestamp: '2024-09-15T18:45:00Z',
      status: 'acknowledged',
      channels: ['email', 'sms', 'slack'],
      recipients: 5,
      acknowledged: true,
      escalated: true
    },
    {
      id: 3,
      title: 'Daily Revenue Milestone',
      message: 'Daily revenue reached $16,240 - new record!',
      severity: 'low',
      category: 'business',
      timestamp: '2024-09-15T18:20:00Z',
      status: 'resolved',
      channels: ['email', 'slack'],
      recipients: 8,
      acknowledged: true,
      escalated: false
    },
    {
      id: 4,
      title: 'API Rate Limit Warning',
      message: 'Customer premium-user-123 approaching rate limit (90%)',
      severity: 'medium',
      category: 'api',
      timestamp: '2024-09-15T17:15:00Z',
      status: 'resolved',
      channels: ['email', 'webhook'],
      recipients: 2,
      acknowledged: true,
      escalated: false
    },
    {
      id: 5,
      title: 'Payment Processing Failed',
      message: 'Payment failed for subscription sub_1234567890',
      severity: 'high',
      category: 'billing',
      timestamp: '2024-09-15T16:30:00Z',
      status: 'resolved',
      channels: ['email', 'sms', 'slack'],
      recipients: 4,
      acknowledged: true,
      escalated: false
    }
  ]

  // Notification channels

  // Escalation rules
        { level: 2, recipients: ['manager@aisocialmedia.com'], channels: ['email', 'sms', 'phone'] },
        { level: 3, recipients: ['cto@aisocialmedia.com'], channels: ['email', 'sms', 'phone'] }
      ],
      enabled: true
    },
    {
      id: 2,
      name: 'High Priority Escalation',
      description: 'Escalate high priority alerts if not resolved within 1 hour',
      severity: 'high',
      timeout: 60,
      escalationLevels: [
        { level: 1, recipients: ['team-lead@aisocialmedia.com'], channels: ['email', 'slack'] },
        { level: 2, recipients: ['manager@aisocialmedia.com'], channels: ['email', 'sms'] }
      ],
      enabled: true
    }
  ]

  // Alert categories



  const getSeverityBadge = (severity) => {
    const severityConfig = severityLevels.find(s => s.id === severity)
    
    const darkSeverityColors = {
      low: 'bg-gray-600 text-white',
      medium: 'bg-yellow-600 text-white',
      high: 'bg-orange-600 text-white',
      critical: 'bg-red-600 text-white'
    }
    
    return (
      <Badge className={isDarkMode ? (darkSeverityColors[severity] || 'bg-gray-600 text-white') : (severityConfig?.color || 'bg-gray-100 text-gray-800')}>
        {severityConfig?.name || severity}
      </Badge>
    )
  }

  const getCategoryBadge = (category) => {
    const categoryConfig = alertCategories.find(c => c.id === category)
    const Icon = categoryConfig?.icon || Activity
    
    const darkCategoryColors = {
      system: 'bg-blue-600 text-white',
      customer: 'bg-green-600 text-white',
      business: 'bg-purple-600 text-white',
      api: 'bg-red-600 text-white',
      security: 'bg-yellow-600 text-white'
    }
    
    return (
      <Badge className={isDarkMode ? (darkCategoryColors[category] || 'bg-gray-600 text-white') : (categoryConfig?.color || 'bg-gray-100 text-gray-800')}>
        <Icon className="h-3 w-3 mr-1" />
        {categoryConfig?.name || category}
      </Badge>
    )
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'bg-red-100 text-red-800',
      acknowledged: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800'
    }
    
    const darkStatusColors = {
      active: 'bg-red-600 text-white',
      acknowledged: 'bg-yellow-600 text-white',
      resolved: 'bg-green-600 text-white'
    }
    
    const statusIcons = {
      active: AlertTriangle,
      acknowledged: Clock,
      resolved: CheckCircle
    }
    
    const Icon = statusIcons[status] || Clock
    
    return (
      <Badge className={isDarkMode ? (darkStatusColors[status] || 'bg-gray-600 text-white') : (statusColors[status] || 'bg-gray-100 text-gray-800')}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    )
  }

  const renderAlertsTab = () => (
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
                  placeholder="Search alerts..."
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
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                  isDarkMode 
                    ? 'border-slate-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                <option value="all">All Severities</option>
                {severityLevels.map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                  isDarkMode 
                    ? 'border-slate-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                <option value="all">All Categories</option>
                {alertCategories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <Button size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Recent Notifications</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Latest alerts and system notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentNotifications.map((notification) => (
              <div key={notification.id} className={`flex items-start space-x-4 p-4 border rounded-lg transition-colors ${
                isDarkMode 
                  ? 'border-slate-600 hover:bg-slate-700/50' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <div className="flex-shrink-0 mt-1">
                  <div className={`p-2 rounded-lg ${
                    notification.severity === 'critical' ? (isDarkMode ? 'bg-red-900/30' : 'bg-red-50') :
                    notification.severity === 'high' ? (isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50') :
                    notification.severity === 'medium' ? (isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50') : 
                    (isDarkMode ? 'bg-slate-700' : 'bg-gray-50')
                  }`}>
                    <AlertTriangle className={`h-4 w-4 ${
                      notification.severity === 'critical' ? 'text-red-600' :
                      notification.severity === 'high' ? 'text-orange-600' :
                      notification.severity === 'medium' ? 'text-yellow-600' : (isDarkMode ? 'text-gray-300' : 'text-gray-600')
                    }`} />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{notification.title}</h4>
                    <div className="flex items-center space-x-2">
                      {getSeverityBadge(notification.severity)}
                      {getCategoryBadge(notification.category)}
                      {getStatusBadge(notification.status)}
                    </div>
                  </div>
                  
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>{notification.message}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className={`flex items-center space-x-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span>{formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}</span>
                      <span>{notification.recipients} recipients</span>
                      <span>{notification.channels.join(', ')}</span>
                      {notification.escalated && (
                        <Badge className={isDarkMode ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800'}>
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Escalated
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!notification.acknowledged && notification.status === 'active' && (
                        <Button variant="outline" size="sm" className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : ''}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Acknowledge
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className={isDarkMode ? 'text-slate-300 hover:bg-slate-700' : ''}>
                        <Eye className="h-4 w-4" />
                      </Button>
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

  const renderRulesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Alert Rules</h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Configure automated alert conditions and triggers</p>
        </div>
        <Button
          onClick={() => setIsCreatingAlert(true)}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </div>

      <div className="space-y-4">
        {alertRules.map((rule) => (
          <Card key={rule.id} className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{rule.name}</h4>
                      {getSeverityBadge(rule.severity)}
                      {getCategoryBadge(rule.category)}
                      <Badge className={rule.enabled ? (isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800') : (isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800')}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>{rule.description}</p>
                    <div className={`flex items-center space-x-4 mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span>Condition: {rule.condition}</span>
                      <span>Duration: {rule.duration}</span>
                      <span>Triggered: {rule.triggered} times</span>
                      <span>Last: {formatDistanceToNow(new Date(rule.lastTriggered), { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Channels:</span>
                      {rule.channels.map((channel, index) => (
                        <Badge key={index} variant="outline" className={`text-xs ${isDarkMode ? 'border-slate-600 text-slate-300' : ''}`}>
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className={isDarkMode ? 'text-slate-300 hover:bg-slate-700' : ''}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className={isDarkMode ? 'text-slate-300 hover:bg-slate-700' : ''}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className={isDarkMode ? 'text-slate-300 hover:bg-slate-700' : ''}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className={isDarkMode ? 'text-slate-300 hover:bg-slate-700' : ''}>
                    {rule.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderChannelsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notification Channels</h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Configure delivery channels for alerts and notifications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notificationChannels.map((channel) => {
          const Icon = channel.icon
          return (
            <Card key={channel.id} className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{channel.name}</h4>
                      <Badge className={
                        channel.status === 'connected' ? (isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800') :
                        channel.status === 'error' ? (isDarkMode ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800') :
                        (isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800')
                      }>
                        {channel.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className={isDarkMode ? 'text-slate-300 hover:bg-slate-700' : ''}>
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className={isDarkMode ? 'text-slate-300 hover:bg-slate-700' : ''}>
                      {channel.enabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Delivery Rate</span>
                    <span className="font-medium">{channel.deliveryRate}%</span>
                  </div>
                  
                  <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${channel.deliveryRate}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Avg Delivery Time</span>
                    <span className="font-medium">{channel.avgDeliveryTime}</span>
                  </div>
                  
                  <div className={`pt-2 ${isDarkMode ? 'border-t border-slate-700' : 'border-t border-gray-200'}`}>
                    <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Configuration:</p>
                    <div className="space-y-1">
                      {Object.entries(channel.config).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} capitalize`}>{key.replace('_', ' ')}:</span>
                          <span className={`font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate max-w-32`}>
                            {typeof value === 'string' && value.includes('*') ? value : 
                             typeof value === 'string' && value.length > 20 ? `${value.substring(0, 20)}...` : 
                             String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )

  const renderEscalationTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Escalation Rules</h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Configure automatic escalation for unacknowledged alerts</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </div>

      <div className="space-y-4">
        {escalationRules.map((rule) => (
          <Card key={rule.id} className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{rule.name}</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{rule.description}</p>
                  <div className={`flex items-center space-x-4 mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>Severity: {rule.severity}</span>
                    <span>Timeout: {rule.timeout} minutes</span>
                    <span>Levels: {rule.escalationLevels.length}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={rule.enabled ? (isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800') : (isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800')}>
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Button variant="ghost" size="sm" className={isDarkMode ? 'text-slate-300 hover:bg-slate-700' : ''}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Escalation Levels:</p>
                {rule.escalationLevels.map((level, index) => (
                  <div key={index} className={`flex items-center space-x-4 p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
                      <span className="text-xs font-medium text-blue-600">{level.level}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Recipients:</span>
                        <span className="font-medium">{level.recipients.join(', ')}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm mt-1">
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Channels:</span>
                        {level.channels.map((channel, idx) => (
                        <Badge key={idx} variant="outline" className={`text-xs ${isDarkMode ? 'border-slate-600 text-slate-300' : ''}`}>
                          {channel}
                        </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderHistoryTab = () => (
    <div className="space-y-6">
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Notification History</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Historical alert data and delivery statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{notificationStats.totalAlerts.toLocaleString()}</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Alerts</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{notificationStats.resolvedToday}</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Resolved Today</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{notificationStats.avgResponseTime}</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Avg Response Time</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{notificationStats.deliveryRate}%</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Delivery Rate</p>
            </div>
          </div>
          
          <div className="text-center py-8">
            <Clock className={`h-12 w-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Detailed history analytics coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'rules':
        return renderRulesTab()
      case 'channels':
        return renderChannelsTab()
      case 'escalation':
        return renderEscalationTab()
      case 'history':
        return renderHistoryTab()
      default:
        return renderAlertsTab()
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
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notification Center</h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
              Advanced alerts, notifications, and escalation management
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className={isDarkMode ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800'}>
              <AlertTriangle className="h-3 w-3 mr-1" />
              {notificationStats.activeAlerts} Active
            </Badge>
            <Button variant="outline" size="sm">
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
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active Alerts</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{notificationStats.activeAlerts}</p>
                </div>
                <div className="p-2 bg-red-50 rounded-lg">
                  <Bell className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500">
                  {notificationStats.escalations} escalated
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Response Time</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{notificationStats.avgResponseTime}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Average response time
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Delivery Rate</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{notificationStats.deliveryRate}%</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Across {notificationStats.channels} channels
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Subscribers</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{notificationStats.subscribers}</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Active subscribers
                </span>
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

export default NotificationCenter

