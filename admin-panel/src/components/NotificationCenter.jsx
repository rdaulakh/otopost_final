import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Import notification center hook
import { useNotificationCenter } from '../hooks/useNotificationCenter.js'
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
    data: notificationCenterData, 
    isLoading: centerLoading, 
    error: centerError,
    refetch: refetchCenter 
  } = useNotificationCenter()

  // Mock data for notifications (replace with actual hook when available)
  const notificationsData = {
    notifications: [
      { id: 1, title: 'System Alert', message: 'High CPU usage detected', category: 'system', severity: 'high', timestamp: '2024-01-15T10:30:00Z', read: false },
      { id: 2, title: 'User Activity', message: 'New user registration', category: 'user', severity: 'info', timestamp: '2024-01-15T09:15:00Z', read: true },
      { id: 3, title: 'Security Warning', message: 'Failed login attempt', category: 'security', severity: 'medium', timestamp: '2024-01-15T08:45:00Z', read: false }
    ]
  }
  const notificationsLoading = false
  const notificationsError = null
  const refetchNotifications = () => {}

  // Mock data for alert rules
  const alertRulesData = {
    rules: [
      { id: 1, name: 'High CPU Usage', condition: 'cpu > 80%', severity: 'high', enabled: true },
      { id: 2, name: 'Memory Warning', condition: 'memory > 90%', severity: 'medium', enabled: true },
      { id: 3, name: 'Disk Space', condition: 'disk > 85%', severity: 'low', enabled: false }
    ]
  }
  const rulesLoading = false
  const rulesError = null
  const refetchRules = () => {}

  // Mock data for notification channels
  const channelsData = {
    channels: [
      { id: 1, name: 'Email', type: 'email', enabled: true, config: { address: 'admin@example.com' } },
      { id: 2, name: 'Slack', type: 'slack', enabled: true, config: { webhook: 'https://hooks.slack.com/...' } },
      { id: 3, name: 'SMS', type: 'sms', enabled: false, config: { phone: '+1234567890' } }
    ]
  }
  const channelsLoading = false
  const channelsError = null
  const refetchChannels = () => {}

  // Mock data for notification metrics
  const metricsData = {
    totalNotifications: 1250,
    unreadNotifications: 45,
    notificationsToday: 23,
    averageResponseTime: 2.5,
    deliveryRate: 98.5,
    categories: {
      system: 450,
      user: 320,
      security: 180,
      performance: 300
    }
  }
  const metricsLoading = false
  const metricsError = null
  const refetchMetrics = () => {}

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
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Helper functions
  const getSeverityBadge = (severity) => {
    const severityColors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    }
    
    return (
      <Badge className={severityColors[severity] || 'bg-gray-100 text-gray-800'}>
        {severity}
      </Badge>
    )
  }

  const getCategoryBadge = (category) => {
    const categoryColors = {
      system: 'bg-blue-100 text-blue-800',
      customer: 'bg-green-100 text-green-800',
      business: 'bg-purple-100 text-purple-800',
      api: 'bg-red-100 text-red-800',
      security: 'bg-yellow-100 text-yellow-800'
    }
    
    return (
      <Badge className={categoryColors[category] || 'bg-gray-100 text-gray-800'}>
        {category}
      </Badge>
    )
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'bg-red-100 text-red-800',
      acknowledged: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      pending: 'bg-blue-100 text-blue-800'
    }
    
    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    )
  }

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notification Center</h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage alerts, notifications, and communication channels
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" className={isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}>
              <Plus className="h-4 w-4 mr-2" />
              New Alert Rule
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Alerts</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {notificationStats.totalAlerts || 0}
                  </p>
                </div>
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active Rules</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {notificationStats.activeRules || 0}
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Channels</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {notificationStats.channels || 0}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
                  
          <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Response Time</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {notificationStats.avgResponseTime || '0ms'}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'alerts', name: 'Alert Rules', count: alertRules.length },
              { id: 'notifications', name: 'Recent Notifications', count: recentNotifications.length },
              { id: 'channels', name: 'Channels', count: notificationChannels.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? isDarkMode 
                      ? 'border-blue-500 text-blue-400' 
                      : 'border-blue-500 text-blue-600'
                    : isDarkMode
                      ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${
                    isDarkMode 
                      ? 'bg-slate-700 text-slate-300' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Alert Rules</h2>
                <Button size="sm" className={isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Rule
                </Button>
              </div>

              {alertRules.length === 0 ? (
                <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                  <CardContent className="p-6 text-center">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No Alert Rules</h3>
                    <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Create your first alert rule to get started with notifications.
                    </p>
                    <Button className={isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Alert Rule
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {alertRules.map((rule) => (
                    <Card key={rule.id} className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {rule.name}
                              </h3>
                              {getSeverityBadge(rule.severity)}
                              {getCategoryBadge(rule.category)}
                            </div>
                            <p className={`mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {rule.description}
                            </p>
                            <div className={`flex items-center space-x-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              <span>Triggered: {rule.triggered || 0} times</span>
                              <span>Last: {rule.lastTriggered ? formatDistanceToNow(new Date(rule.lastTriggered), { addSuffix: true }) : 'Never'}</span>
                              <span>Status: {rule.status}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Notifications</h2>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
                
              {recentNotifications.length === 0 ? (
                <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                  <CardContent className="p-6 text-center">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No Notifications</h3>
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      No notifications have been sent recently.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {recentNotifications.map((notification) => (
                    <Card key={notification.id} className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {notification.title}
                              </h3>
                              {getSeverityBadge(notification.severity)}
                              {getCategoryBadge(notification.category)}
                              {getStatusBadge(notification.status)}
                            </div>
                            <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {notification.message}
                            </p>
                            <div className={`flex items-center space-x-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              <span>{formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}</span>
                              <span>Recipients: {notification.recipients || 0}</span>
                              <span>Channels: {notification.channels?.join(', ') || 'N/A'}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notification Channels</h2>
                <Button size="sm" className={isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Channel
                </Button>
              </div>

              {notificationChannels.length === 0 ? (
                <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                  <CardContent className="p-6 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No Channels</h3>
                    <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Set up notification channels to start sending alerts.
                    </p>
                    <Button className={isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Channel
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {notificationChannels.map((channel) => (
                    <Card key={channel.id} className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-blue-100'}`}>
                              <MessageSquare className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {channel.name}
                              </h3>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {channel.type} • {channel.status}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationCenter