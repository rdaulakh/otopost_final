import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Import compliance security hooks
import { 
  useComplianceFrameworks,
  useSecurityEvents,
  useComplianceMetrics,
  useSecurityTrends,
  useAccessControlData,
  useUpdateComplianceFramework,
  useCreateSecurityEvent,
  useUpdateSecurityEvent
} from '../hooks/useComplianceSecurity.js'
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FileText,
  Download,
  Search,
  Filter,
  MoreHorizontal,
  Key,
  Database,
  Globe,
  Server,
  Activity,
  Bell,
  Settings,
  RefreshCw,
  Calendar,
  MapPin,
  Smartphone,
  Monitor,
  Wifi,
  HardDrive,
  Zap,
  Flag,
  UserCheck,
  FileCheck,
  ShieldCheck
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

const ComplianceSecurity = ({ data = {}, onDataUpdate = () => {}, isDarkMode = false }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Real API integration for compliance security data
  const { 
    data: complianceMetrics, 
    isLoading: metricsLoading, 
    error: metricsError,
    refetch: refetchMetrics 
  } = useComplianceMetrics({ timeRange: selectedTimeRange })

  const { 
    data: complianceFrameworks, 
    isLoading: frameworksLoading, 
    error: frameworksError,
    refetch: refetchFrameworks 
  } = useComplianceFrameworks()

  const { 
    data: securityEventsData, 
    isLoading: eventsLoading, 
    error: eventsError,
    refetch: refetchEvents 
  } = useSecurityEvents({ 
    category: selectedCategory, 
    search: searchTerm,
    timeRange: selectedTimeRange 
  })

  const { 
    data: securityTrendsData, 
    isLoading: trendsLoading,
    refetch: refetchTrends 
  } = useSecurityTrends({ timeRange: selectedTimeRange })

  const { 
    data: accessControlData, 
    isLoading: accessLoading,
    refetch: refetchAccess 
  } = useAccessControlData()

  // Combined loading state
  const isLoading = metricsLoading || frameworksLoading || eventsLoading || trendsLoading || accessLoading

  // Use real API data with fallbacks
  const securityMetrics = complianceMetrics?.metrics || {}
  const securityEvents = securityEventsData?.events || []

  // Security events and audit logs
  const securityEvents = [
    {
      id: 1,
      type: 'login_attempt',
      severity: 'medium',
      title: 'Multiple failed login attempts',
      description: 'User attempted to login 5 times with incorrect password',
      user: 'john.doe@example.com',
      ip: '192.168.1.100',
      location: 'New York, US',
      device: 'Chrome on Windows',
      timestamp: '2024-09-15T19:25:00Z',
      status: 'blocked'
    },
    {
      id: 2,
      type: 'data_access',
      severity: 'low',
      title: 'Bulk data export',
      description: 'Admin exported customer data for analytics',
      user: 'admin@aisocialmedia.com',
      ip: '10.0.0.5',
      location: 'San Francisco, US',
      device: 'Firefox on macOS',
      timestamp: '2024-09-15T18:45:00Z',
      status: 'allowed'
    },
    {
      id: 3,
      type: 'permission_change',
      severity: 'high',
      title: 'Admin permissions granted',
      description: 'User granted super admin permissions',
      user: 'lisa.wang@aisocialmedia.com',
      ip: '10.0.0.12',
      location: 'San Francisco, US',
      device: 'Safari on macOS',
      timestamp: '2024-09-15T17:30:00Z',
      status: 'approved'
    },
    {
      id: 4,
      type: 'api_access',
      severity: 'medium',
      title: 'Unusual API usage pattern',
      description: 'API calls exceeded normal threshold by 300%',
      user: 'api_user_12345',
      ip: '203.0.113.45',
      location: 'London, UK',
      device: 'API Client',
      timestamp: '2024-09-15T16:15:00Z',
      status: 'monitoring'
    },
    {
      id: 5,
      type: 'data_deletion',
      severity: 'high',
      title: 'GDPR data deletion request',
      description: 'Customer requested complete data deletion',
      user: 'privacy@aisocialmedia.com',
      ip: '10.0.0.8',
      location: 'San Francisco, US',
      device: 'Chrome on Linux',
      timestamp: '2024-09-15T15:20:00Z',
      status: 'completed'
    }
  ]

  // Data privacy metrics
  const privacyMetrics = {
    dataSubjects: 2847,
    consentRate: 94.2,
    optOutRequests: 23,
    dataRetentionCompliance: 98.7,
    rightToBeForgotten: 12,
    dataPortabilityRequests: 8,
    privacyPolicyUpdates: 2,
    cookieConsent: 96.8
  }

  // Security trends data
  const securityTrendsData = [
    { date: '2024-09-09', threats: 12, blocked: 145, vulnerabilities: 3 },
    { date: '2024-09-10', threats: 8, blocked: 167, vulnerabilities: 2 },
    { date: '2024-09-11', threats: 15, blocked: 134, vulnerabilities: 4 },
    { date: '2024-09-12', threats: 6, blocked: 189, vulnerabilities: 1 },
    { date: '2024-09-13', threats: 11, blocked: 156, vulnerabilities: 2 },
    { date: '2024-09-14', threats: 4, blocked: 178, vulnerabilities: 1 },
    { date: '2024-09-15', threats: 0, blocked: 198, vulnerabilities: 2 }
  ]

  // Compliance status distribution
  const complianceDistribution = [
    { name: 'Compliant', value: 85, color: '#10B981' },
    { name: 'In Progress', value: 12, color: '#F59E0B' },
    { name: 'Non-Compliant', value: 3, color: '#EF4444' }
  ]

  // Access control data
  const accessControlData = [
    { role: 'Super Admin', users: 2, permissions: 100 },
    { role: 'Admin', users: 5, permissions: 85 },
    { role: 'Support', users: 12, permissions: 45 },
    { role: 'Viewer', users: 23, permissions: 15 }
  ]

  const eventTypes = [
    { id: 'login_attempt', name: 'Login Attempts', icon: Key, color: 'text-blue-600' },
    { id: 'data_access', name: 'Data Access', icon: Database, color: 'text-green-600' },
    { id: 'permission_change', name: 'Permission Changes', icon: UserCheck, color: 'text-purple-600' },
    { id: 'api_access', name: 'API Access', icon: Globe, color: 'text-orange-600' },
    { id: 'data_deletion', name: 'Data Deletion', icon: FileCheck, color: 'text-red-600' }
  ]

  const severityLevels = [
    { id: 'low', name: 'Low', color: 'bg-green-100 text-green-800' },
    { id: 'medium', name: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'high', name: 'High', color: 'bg-red-100 text-red-800' },
    { id: 'critical', name: 'Critical', color: 'bg-red-200 text-red-900' }
  ]

  const getEventIcon = (type) => {
    const eventType = eventTypes.find(t => t.id === type)
    const Icon = eventType?.icon || Activity
    return <Icon className={`h-4 w-4 ${eventType?.color || (isDarkMode ? 'text-gray-300' : 'text-gray-600')}`} />
  }

  const getSeverityBadge = (severity) => {
    const severityConfig = severityLevels.find(s => s.id === severity)
    
    // Dark mode badge colors
    const getDarkModeColor = (severity) => {
      switch (severity) {
        case 'low': return 'bg-gray-600 text-white'
        case 'medium': return 'bg-yellow-600 text-white'
        case 'high': return 'bg-red-600 text-white'
        case 'critical': return 'bg-red-700 text-white'
        default: return 'bg-gray-600 text-white'
      }
    }
    
    return (
      <Badge className={isDarkMode ? getDarkModeColor(severity) : (severityConfig?.color || 'bg-gray-100 text-gray-800')}>
        {severityConfig?.name || severity}
      </Badge>
    )
  }

  const getComplianceStatusBadge = (status) => {
    const statusColors = {
      compliant: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      non_compliant: 'bg-red-100 text-red-800'
    }
    
    // Dark mode badge colors
    const getDarkModeColor = (status) => {
      switch (status) {
        case 'compliant': return 'bg-green-600 text-white'
        case 'in_progress': return 'bg-yellow-600 text-white'
        case 'non_compliant': return 'bg-red-600 text-white'
        default: return 'bg-gray-600 text-white'
      }
    }
    
    const statusIcons = {
      compliant: CheckCircle,
      in_progress: Clock,
      non_compliant: XCircle
    }
    
    const Icon = statusIcons[status] || Clock
    
    return (
      <Badge className={isDarkMode ? getDarkModeColor(status) : (statusColors[status] || 'bg-gray-100 text-gray-800')}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const handleRefresh = async () => {
    setIsLoading(true)
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
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Compliance & Security</h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
              Security monitoring, compliance tracking, and audit logs
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Security Overview */}
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
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Security Score</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{securityMetrics.securityScore}%</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${securityMetrics.securityScore}%` }}
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
            <Card className={`hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active Threats</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{securityMetrics.activeThreats}</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600 ml-1">All Clear</span>
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
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Blocked Attempts</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{securityMetrics.blockedAttempts.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last 30 days</span>
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
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Compliance Score</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{securityMetrics.complianceScore}%</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileCheck className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${securityMetrics.complianceScore}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Security Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Events Trend */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Security Events</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Threats detected and blocked over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={securityTrendsData}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={isDarkMode ? "#374151" : "#e5e7eb"} 
                  />
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
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="blocked" 
                    stackId="1"
                    stroke="#10B981" 
                    fill="#10B981"
                    fillOpacity={0.6}
                    name="Blocked"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="threats" 
                    stackId="2"
                    stroke="#EF4444" 
                    fill="#EF4444"
                    fillOpacity={0.6}
                    name="Threats"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Compliance Status */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Compliance Status</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Overall compliance distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={complianceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {complianceDistribution.map((entry, index) => (
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
                {complianceDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Frameworks */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Compliance Frameworks</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Status and progress of compliance requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {complianceFrameworks.map((framework, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{framework.name}</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{framework.description}</p>
                    </div>
                    {getComplianceStatusBadge(framework.status)}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Compliance Score</span>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{framework.score}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${framework.score}%` }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{framework.completed}</p>
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Completed</p>
                      </div>
                      <div className="text-center">
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{framework.pending}</p>
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pending</p>
                      </div>
                      <div className="text-center">
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{framework.requirements}</p>
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</p>
                      </div>
                    </div>
                    
                    <div className={`flex items-center justify-between text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span>Last Audit: {format(new Date(framework.lastAudit), 'MMM dd, yyyy')}</span>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Privacy Metrics */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Data Privacy Metrics</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>GDPR and privacy compliance statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="p-3 bg-blue-50 rounded-lg mb-2">
                  <Users className="h-6 w-6 text-blue-600 mx-auto" />
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{privacyMetrics.dataSubjects.toLocaleString()}</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Data Subjects</p>
              </div>
              
              <div className="text-center">
                <div className="p-3 bg-green-50 rounded-lg mb-2">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto" />
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{privacyMetrics.consentRate}%</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Consent Rate</p>
              </div>
              
              <div className="text-center">
                <div className="p-3 bg-yellow-50 rounded-lg mb-2">
                  <FileText className="h-6 w-6 text-yellow-600 mx-auto" />
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{privacyMetrics.rightToBeForgotten}</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Deletion Requests</p>
              </div>
              
              <div className="text-center">
                <div className="p-3 bg-purple-50 rounded-lg mb-2">
                  <Download className="h-6 w-6 text-purple-600 mx-auto" />
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{privacyMetrics.dataPortabilityRequests}</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Data Exports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Events Log */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Security Events & Audit Log</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Recent security events and system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securityEvents.map((event) => (
                <div key={event.id} className={`flex items-start space-x-4 p-4 border rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-slate-800/50 border-slate-700' 
                    : 'hover:bg-gray-50'
                }`}>
                  <div className="flex-shrink-0 mt-1">
                    {getEventIcon(event.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{event.title}</h4>
                      <div className="flex items-center space-x-2">
                        {getSeverityBadge(event.severity)}
                        <Badge variant={event.status === 'allowed' ? 'success' : 
                                      event.status === 'blocked' ? 'destructive' : 'secondary'}>
                          {event.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>{event.description}</p>
                    
                    <div className={`flex items-center space-x-4 mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{event.user}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Globe className="h-3 w-3" />
                        <span>{event.ip}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Monitor className="h-3 w-3" />
                        <span>{event.device}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(event.timestamp), 'MMM dd, HH:mm')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Access Control */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Access Control & Permissions</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>User roles and permission distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={accessControlData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDarkMode ? "#374151" : "#e5e7eb"} 
                />
                <XAxis 
                  dataKey="role" 
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
                  dataKey="users" 
                  fill="#3B82F6" 
                  name="Users"
                />
                <Bar 
                  yAxisId="right"
                  dataKey="permissions" 
                  fill="#8B5CF6" 
                  name="Permission Level (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ComplianceSecurity

