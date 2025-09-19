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
  Gauge,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useSystemHealth, useSystemMetrics, useServiceStatus } from '../hooks/useAdminApi'

const SystemHealth = ({ data = {}, onDataUpdate = () => {}, isDarkMode = false }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Real API integration
  const { 
    data: systemHealth, 
    isLoading: healthLoading, 
    error: healthError,
    refetch: refetchHealth 
  } = useSystemHealth()

  const { 
    data: systemMetrics, 
    isLoading: metricsLoading, 
    error: metricsError,
    refetch: refetchMetrics 
  } = useSystemMetrics({ timeRange: selectedTimeRange })

  const { 
    data: serviceStatus, 
    isLoading: statusLoading, 
    error: statusError,
    refetch: refetchStatus 
  } = useServiceStatus()

  // Combined loading state
  const isLoading = healthLoading || metricsLoading || statusLoading

  // Combined error state
  const hasError = healthError || metricsError || statusError

  // Refresh all data
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchHealth(),
        refetchMetrics(),
        refetchStatus()
      ])
      onDataUpdate()
    } catch (error) {
      console.error('Failed to refresh system health data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(handleRefresh, 30 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Handle time range change
  const handleTimeRangeChange = (newTimeRange) => {
    setSelectedTimeRange(newTimeRange)
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'operational':
      case 'healthy':
        return 'text-green-500 bg-green-100 dark:bg-green-900'
      case 'degraded':
      case 'warning':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900'
      case 'down':
      case 'critical':
      case 'error':
        return 'text-red-500 bg-red-100 dark:bg-red-900'
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-900'
    }
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'operational':
      case 'healthy':
        return CheckCircle
      case 'degraded':
      case 'warning':
        return AlertTriangle
      case 'down':
      case 'critical':
      case 'error':
        return XCircle
      default:
        return AlertCircle
    }
  }

  // Format uptime
  const formatUptime = (uptime) => {
    if (!uptime) return '0%'
    return `${uptime.toFixed(2)}%`
  }

  // Format response time
  const formatResponseTime = (time) => {
    if (!time) return '0ms'
    if (time >= 1000) return `${(time / 1000).toFixed(1)}s`
    return `${time}ms`
  }

  // Format number
  const formatNumber = (num) => {
    if (!num) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Error state
  if (hasError && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Failed to load system health data
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          We're having trouble loading system health information. Please try refreshing.
        </p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  // Loading state
  if (isLoading && !systemHealth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Loading System Health
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Fetching system status and performance metrics...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Health</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor system performance and service status
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={selectedTimeRange} 
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
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
        </div>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Overall System Status
              </CardTitle>
              <CardDescription>
                Current system health and uptime statistics
              </CardDescription>
            </div>
            <Badge className={getStatusColor(systemHealth?.overall?.status)}>
              {React.createElement(getStatusIcon(systemHealth?.overall?.status), { className: "h-4 w-4 mr-1" })}
              {systemHealth?.overall?.status || 'Unknown'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatUptime(systemHealth?.overall?.uptime)}
              </div>
              <div className="text-sm text-gray-500">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(systemHealth?.overall?.activeUsers)}
              </div>
              <div className="text-sm text-gray-500">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(systemHealth?.overall?.apiCalls)}
              </div>
              <div className="text-sm text-gray-500">API Calls</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {systemHealth?.overall?.errorRate || 0}%
              </div>
              <div className="text-sm text-gray-500">Error Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="h-5 w-5 mr-2" />
            Service Status
          </CardTitle>
          <CardDescription>
            Individual service health and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {serviceStatus?.services?.map((service, index) => {
              const StatusIcon = getStatusIcon(service.status)
              return (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <StatusIcon className={`h-5 w-5 ${
                      service.status === 'operational' ? 'text-green-500' :
                      service.status === 'degraded' ? 'text-yellow-500' : 'text-red-500'
                    }`} />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Last checked: {new Date(service.lastCheck).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <div className="font-medium">{formatUptime(service.uptime)}</div>
                      <div className="text-gray-500">Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{formatResponseTime(service.responseTime)}</div>
                      <div className="text-gray-500">Response</div>
                    </div>
                    <Badge className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemMetrics?.cpu?.toFixed(1) || 0}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${systemMetrics?.cpu || 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemMetrics?.memory?.toFixed(1) || 0}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${systemMetrics?.memory || 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemMetrics?.disk?.toFixed(1) || 0}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${systemMetrics?.disk || 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network I/O</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemMetrics?.network?.toFixed(1) || 0} MB/s
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Current throughput
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      {systemMetrics?.chartData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Performance Trends
            </CardTitle>
            <CardDescription>
              System performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={systemMetrics.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cpu" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="CPU %"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="memory" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Memory %"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="disk" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Disk %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Incidents */}
      {systemHealth?.incidents && systemHealth.incidents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Recent Incidents
            </CardTitle>
            <CardDescription>
              Latest system incidents and resolutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemHealth.incidents.slice(0, 5).map((incident, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {incident.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {incident.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Started: {new Date(incident.startTime).toLocaleString()}</span>
                      {incident.endTime && (
                        <span>Resolved: {new Date(incident.endTime).toLocaleString()}</span>
                      )}
                      <Badge variant={incident.status === 'resolved' ? 'default' : 'destructive'}>
                        {incident.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SystemHealth
