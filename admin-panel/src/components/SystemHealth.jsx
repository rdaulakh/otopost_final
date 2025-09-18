import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Server, 
  Database, 
  Cpu, 
  HardDrive,
  Wifi,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Zap,
  Globe,
  Monitor,
  RefreshCw,
  Settings,
  Bell,
  TrendingUp,
  BarChart3,
  Eye,
  Download,
  AlertCircle,
  Gauge
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const SystemHealth = ({ data = {}, onDataUpdate = () => {}, isDarkMode = false }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [isLoading, setIsLoading] = useState(false)
  const [realTimeData, setRealTimeData] = useState({})

  // System status data
  const systemStatus = {
    overall: 'operational',
    uptime: 99.97,
    lastIncident: '2024-08-15',
    services: [
      {
        name: 'API Gateway',
        status: 'operational',
        uptime: 99.98,
        responseTime: 145,
        lastCheck: '2024-09-15T19:30:00Z'
      },
      {
        name: 'Database',
        status: 'operational',
        uptime: 99.95,
        responseTime: 23,
        lastCheck: '2024-09-15T19:30:00Z'
      },
      {
        name: 'AI Processing',
        status: 'operational',
        uptime: 99.92,
        responseTime: 2340,
        lastCheck: '2024-09-15T19:30:00Z'
      },
      {
        name: 'File Storage',
        status: 'operational',
        uptime: 99.99,
        responseTime: 89,
        lastCheck: '2024-09-15T19:30:00Z'
      },
      {
        name: 'Authentication',
        status: 'operational',
        uptime: 99.97,
        responseTime: 156,
        lastCheck: '2024-09-15T19:30:00Z'
      },
      {
        name: 'Social Media APIs',
        status: 'degraded',
        uptime: 98.45,
        responseTime: 3450,
        lastCheck: '2024-09-15T19:30:00Z'
      }
    ]
  }

  // Performance metrics
  const performanceMetrics = {
    cpu: 45.2,
    memory: 67.8,
    disk: 78.3,
    network: 23.4,
    apiCalls: 1247893,
    activeUsers: 1923,
    queueSize: 234,
    errorRate: 0.12
  }

  // Alerts and incidents
  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'High Memory Usage',
      description: 'Memory usage has exceeded 65% threshold',
      timestamp: '2024-09-15T19:25:00Z',
      service: 'API Gateway',
      severity: 'medium'
    },
    {
      id: 2,
      type: 'info',
      title: 'Scheduled Maintenance',
      description: 'Database maintenance scheduled for tonight',
      timestamp: '2024-09-15T18:00:00Z',
      service: 'Database',
      severity: 'low'
    },
    {
      id: 3,
      type: 'error',
      title: 'Social Media API Degradation',
      description: 'Instagram API experiencing slower response times',
      timestamp: '2024-09-15T17:45:00Z',
      service: 'Social Media APIs',
      severity: 'high'
    }
  ]

  // Performance data over time
  const performanceData = [
    { time: '00:00', cpu: 35, memory: 45, responseTime: 120, requests: 1200 },
    { time: '04:00', cpu: 28, memory: 42, responseTime: 115, requests: 800 },
    { time: '08:00', cpu: 52, memory: 58, responseTime: 135, requests: 2400 },
    { time: '12:00', cpu: 67, memory: 72, responseTime: 165, requests: 3200 },
    { time: '16:00', cpu: 58, memory: 65, responseTime: 145, requests: 2800 },
    { time: '20:00', cpu: 45, memory: 55, responseTime: 125, requests: 1800 }
  ]

  // API endpoint health
  const apiEndpoints = [
    { endpoint: '/api/auth/login', status: 'healthy', avgResponseTime: 145, requests24h: 12450, errorRate: 0.05 },
    { endpoint: '/api/posts/create', status: 'healthy', avgResponseTime: 234, requests24h: 8920, errorRate: 0.12 },
    { endpoint: '/api/analytics/data', status: 'healthy', avgResponseTime: 567, requests24h: 15670, errorRate: 0.08 },
    { endpoint: '/api/ai/generate', status: 'degraded', avgResponseTime: 2340, requests24h: 4560, errorRate: 0.45 },
    { endpoint: '/api/social/publish', status: 'healthy', avgResponseTime: 890, requests24h: 6780, errorRate: 0.15 }
  ]

  // Infrastructure metrics
  const infrastructureMetrics = [
    {
      name: 'Load Balancer',
      status: 'healthy',
      metrics: { connections: 1234, throughput: '45.2 MB/s', uptime: '99.98%' },
      icon: Globe
    },
    {
      name: 'Database Cluster',
      status: 'healthy',
      metrics: { connections: 89, queries: '2.3K/sec', storage: '78.3%' },
      icon: Database
    },
    {
      name: 'Cache Layer',
      status: 'healthy',
      metrics: { hitRate: '94.5%', memory: '67.8%', operations: '15.6K/sec' },
      icon: Zap
    },
    {
      name: 'CDN',
      status: 'healthy',
      metrics: { bandwidth: '123.4 GB', requests: '456K', cacheHit: '89.2%' },
      icon: Wifi
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
      case 'healthy':
        return 'text-green-600 bg-green-50'
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50'
      case 'outage':
      case 'unhealthy':
        return 'text-red-600 bg-red-50'
      default:
        return `${isDarkMode ? 'text-gray-300' : 'text-gray-600'} bg-gray-50`
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
      case 'healthy':
        return CheckCircle
      case 'degraded':
        return AlertTriangle
      case 'outage':
      case 'unhealthy':
        return XCircle
      default:
        return Clock
    }
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return XCircle
      case 'warning':
        return AlertTriangle
      case 'info':
        return CheckCircle
      default:
        return AlertCircle
    }
  }

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'low':
        return 'text-blue-600 bg-blue-50'
      default:
        return `${isDarkMode ? 'text-gray-300' : 'text-gray-600'} bg-gray-50`
    }
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData({
        timestamp: new Date().toISOString(),
        cpu: Math.random() * 20 + 40,
        memory: Math.random() * 15 + 60,
        activeRequests: Math.floor(Math.random() * 100) + 200
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

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
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Health</h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
              Platform monitoring, performance metrics, and alerts
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
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
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
              <Settings className='h-4 w-4 mr-2' />
              Configure
            </Button>
          </div>
        </div>

        {/* Overall Status */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                  <CheckCircle className={`h-8 w-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>All Systems Operational</h2>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Platform uptime: {systemStatus.uptime}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Last incident</p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{systemStatus.lastIncident}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>CPU Usage</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{performanceMetrics.cpu}%</p>
                  </div>
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                    <Cpu className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                </div>
                <div className="mt-2">
                  <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${performanceMetrics.cpu}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Memory Usage</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{performanceMetrics.memory}%</p>
                  </div>
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                    <Monitor className={`h-5 w-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                </div>
                <div className="mt-2">
                  <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${performanceMetrics.memory}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Disk Usage</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{performanceMetrics.disk}%</p>
                  </div>
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
                    <HardDrive className={`h-5 w-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                  </div>
                </div>
                <div className="mt-2">
                  <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${performanceMetrics.disk}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Error Rate</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{performanceMetrics.errorRate}%</p>
                  </div>
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                    <Shield className={`h-5 w-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  </div>
                </div>
                <div className="mt-2">
                  <Badge variant={performanceMetrics.errorRate < 1 ? "success" : "destructive"}>
                    {performanceMetrics.errorRate < 1 ? 'Healthy' : 'Needs Attention'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Performance */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>System Performance</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>CPU and memory usage over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={isDarkMode ? "#374151" : "#e5e7eb"} 
                  />
                  <XAxis 
                    dataKey="time" 
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
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cpu" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="CPU %"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="memory" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    name="Memory %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* API Response Times */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>API Response Times</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Average response times and request volume</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={isDarkMode ? "#374151" : "#e5e7eb"} 
                  />
                  <XAxis 
                    dataKey="time" 
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
                  <Legend />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="requests" 
                    stroke="#10B981" 
                    fill="#10B981"
                    fillOpacity={0.1}
                    name="Requests"
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="#F59E0B" 
                    strokeWidth={3}
                    name="Response Time (ms)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Services Status */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Service Status</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Individual service health and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemStatus.services.map((service, index) => {
                const StatusIcon = getStatusIcon(service.status)
                return (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{service.name}</h3>
                      <Badge className={getStatusColor(service.status)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {service.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Uptime</span>
                        <span className="font-medium">{service.uptime}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Response Time</span>
                        <span className="font-medium">{service.responseTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Last Check</span>
                        <span className="font-medium">
                          {new Date(service.lastCheck).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Infrastructure Metrics */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Infrastructure Health</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Core infrastructure components status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {infrastructureMetrics.map((component, index) => {
                const Icon = component.icon
                return (
                  <div key={index} className="text-center">
                    <div className={`p-4 rounded-lg mb-3 ${
                      isDarkMode 
                        ? 'bg-slate-800 border border-slate-700' 
                        : 'bg-gray-50'
                    }`}>
                      <Icon className={`h-8 w-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mx-auto mb-2`} />
                      <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{component.name}</h3>
                      <Badge className={getStatusColor(component.status)} size="sm">
                        {component.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      {Object.entries(component.metrics).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} capitalize`}>{key}</span>
                          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Alerts and Incidents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Alerts */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
              <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Bell className='h-5 w-5 mr-2' />
                Recent Alerts
              </CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>System alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => {
                  const AlertIcon = getAlertIcon(alert.type)
                  return (
                    <div
                      key={alert.id}
                      className="flex items-start space-x-3 p-3 border rounded-lg"
                    >
                      <AlertIcon className={`h-5 w-5 mt-0.5 ${
                        alert.type === 'error' ? 'text-red-500' :
                        alert.type === 'warning' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{alert.title}</h4>
                          <Badge className={getAlertColor(alert.severity)} size="sm">
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>{alert.description}</p>
                        <div className={`flex items-center justify-between mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span>{alert.service}</span>
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* API Endpoints Health */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>API Endpoints</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Individual endpoint performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiEndpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <code className={`text-sm px-2 py-1 rounded ${
                          isDarkMode 
                            ? 'bg-slate-700 text-gray-300' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          {endpoint.endpoint}
                        </code>
                        <Badge className={getStatusColor(endpoint.status)} size="sm">
                          {endpoint.status}
                        </Badge>
                      </div>
                      <div className={`flex items-center space-x-4 mt-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <span>{endpoint.avgResponseTime}ms avg</span>
                        <span>{endpoint.requests24h.toLocaleString()} requests</span>
                        <span>{endpoint.errorRate}% errors</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SystemHealth

