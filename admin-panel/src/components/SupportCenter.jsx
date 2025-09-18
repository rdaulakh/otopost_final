import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Send,
  Paperclip,
  Star,
  Flag,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  Tag,
  TrendingUp,
  BarChart3,
  MessageCircle,
  HeadphonesIcon,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

const SupportCenter = ({ data = {}, onDataUpdate = () => {}, isDarkMode = false }) => {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  // Support metrics
  const supportMetrics = {
    totalTickets: 1247,
    openTickets: 23,
    resolvedToday: 45,
    avgResponseTime: '2.3 hours',
    avgResolutionTime: '18.5 hours',
    customerSatisfaction: 4.7,
    firstResponseRate: 94.2,
    resolutionRate: 87.5
  }

  // Mock ticket data
  const tickets = [
    {
      id: 'TKT-001',
      subject: 'Unable to connect Instagram account',
      customer: {
        name: 'Sarah Johnson',
        email: 'sarah@techstart.com',
        plan: 'Premium',
        avatar: '/api/placeholder/40/40'
      },
      status: 'open',
      priority: 'high',
      category: 'technical',
      assignee: 'John Smith',
      created_at: '2024-09-15T14:30:00Z',
      updated_at: '2024-09-15T16:45:00Z',
      messages: 3,
      tags: ['instagram', 'connection', 'api'],
      satisfaction: null
    },
    {
      id: 'TKT-002',
      subject: 'Billing question about Pro plan upgrade',
      customer: {
        name: 'Michael Chen',
        email: 'michael@growthco.io',
        plan: 'Pro',
        avatar: '/api/placeholder/40/40'
      },
      status: 'pending',
      priority: 'medium',
      category: 'billing',
      assignee: 'Lisa Wang',
      created_at: '2024-09-15T10:15:00Z',
      updated_at: '2024-09-15T12:30:00Z',
      messages: 5,
      tags: ['billing', 'upgrade', 'pro-plan'],
      satisfaction: null
    },
    {
      id: 'TKT-003',
      subject: 'Feature request: Bulk post scheduling',
      customer: {
        name: 'Emily Rodriguez',
        email: 'emily@digitalagency.com',
        plan: 'Premium',
        avatar: '/api/placeholder/40/40'
      },
      status: 'resolved',
      priority: 'low',
      category: 'feature_request',
      assignee: 'David Kim',
      created_at: '2024-09-14T16:20:00Z',
      updated_at: '2024-09-15T09:15:00Z',
      messages: 8,
      tags: ['feature-request', 'scheduling', 'bulk'],
      satisfaction: 5
    },
    {
      id: 'TKT-004',
      subject: 'AI content generation not working',
      customer: {
        name: 'James Wilson',
        email: 'james@consulting.biz',
        plan: 'Pro',
        avatar: '/api/placeholder/40/40'
      },
      status: 'in_progress',
      priority: 'high',
      category: 'technical',
      assignee: 'John Smith',
      created_at: '2024-09-15T08:45:00Z',
      updated_at: '2024-09-15T11:20:00Z',
      messages: 12,
      tags: ['ai', 'content-generation', 'bug'],
      satisfaction: null
    },
    {
      id: 'TKT-005',
      subject: 'Account deletion request',
      customer: {
        name: 'Lisa Wang',
        email: 'lisa@ecommerce.shop',
        plan: 'Starter',
        avatar: '/api/placeholder/40/40'
      },
      status: 'closed',
      priority: 'medium',
      category: 'account',
      assignee: 'Lisa Wang',
      created_at: '2024-09-13T14:10:00Z',
      updated_at: '2024-09-14T16:30:00Z',
      messages: 6,
      tags: ['account', 'deletion', 'gdpr'],
      satisfaction: 4
    }
  ]

  // Support team members
  const supportTeam = [
    {
      name: 'John Smith',
      role: 'Senior Support Engineer',
      avatar: '/api/placeholder/40/40',
      activeTickets: 8,
      resolvedToday: 12,
      avgRating: 4.8,
      status: 'online'
    },
    {
      name: 'Lisa Wang',
      role: 'Support Specialist',
      avatar: '/api/placeholder/40/40',
      activeTickets: 5,
      resolvedToday: 9,
      avgRating: 4.6,
      status: 'online'
    },
    {
      name: 'David Kim',
      role: 'Technical Support',
      avatar: '/api/placeholder/40/40',
      activeTickets: 3,
      resolvedToday: 7,
      avgRating: 4.9,
      status: 'away'
    }
  ]

  // Support analytics data
  const ticketVolumeData = [
    { date: '2024-09-09', tickets: 45, resolved: 42 },
    { date: '2024-09-10', tickets: 52, resolved: 48 },
    { date: '2024-09-11', tickets: 38, resolved: 41 },
    { date: '2024-09-12', tickets: 61, resolved: 55 },
    { date: '2024-09-13', tickets: 47, resolved: 49 },
    { date: '2024-09-14', tickets: 55, resolved: 52 },
    { date: '2024-09-15', tickets: 43, resolved: 45 }
  ]

  const categoryDistribution = [
    { name: 'Technical', value: 45, color: '#3B82F6' },
    { name: 'Billing', value: 25, color: '#10B981' },
    { name: 'Feature Request', value: 15, color: '#8B5CF6' },
    { name: 'Account', value: 10, color: '#F59E0B' },
    { name: 'Other', value: 5, color: '#6B7280' }
  ]

  const responseTimeData = [
    { hour: '00:00', avgTime: 3.2 },
    { hour: '04:00', avgTime: 2.8 },
    { hour: '08:00', avgTime: 1.5 },
    { hour: '12:00', avgTime: 2.1 },
    { hour: '16:00', avgTime: 1.8 },
    { hour: '20:00', avgTime: 2.5 }
  ]

  const statusOptions = [
    { id: 'open', name: 'Open', color: 'bg-blue-100 text-blue-800', icon: MessageCircle },
    { id: 'in_progress', name: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    { id: 'pending', name: 'Pending', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
    { id: 'resolved', name: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { id: 'closed', name: 'Closed', color: 'bg-gray-100 text-gray-800', icon: XCircle }
  ]

  const priorityOptions = [
    { id: 'low', name: 'Low', color: 'bg-gray-100 text-gray-800' },
    { id: 'medium', name: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'high', name: 'High', color: 'bg-red-100 text-red-800' },
    { id: 'urgent', name: 'Urgent', color: 'bg-red-200 text-red-900' }
  ]

  const categoryOptions = [
    { id: 'technical', name: 'Technical', icon: Zap },
    { id: 'billing', name: 'Billing', icon: MessageSquare },
    { id: 'feature_request', name: 'Feature Request', icon: Star },
    { id: 'account', name: 'Account', icon: Users },
    { id: 'other', name: 'Other', icon: MoreHorizontal }
  ]

  const filterOptions = [
    { id: 'all', name: 'All Tickets', count: tickets.length },
    { id: 'open', name: 'Open', count: tickets.filter(t => t.status === 'open').length },
    { id: 'in_progress', name: 'In Progress', count: tickets.filter(t => t.status === 'in_progress').length },
    { id: 'pending', name: 'Pending', count: tickets.filter(t => t.status === 'pending').length },
    { id: 'resolved', name: 'Resolved', count: tickets.filter(t => t.status === 'resolved').length }
  ]

  // Filter and sort tickets
  const filteredTickets = useMemo(() => {
    let filtered = tickets.filter(ticket => {
      const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFilter = selectedFilter === 'all' || ticket.status === selectedFilter
      const matchesPriority = selectedPriority === 'all' || ticket.priority === selectedPriority
      
      return matchesSearch && matchesFilter && matchesPriority
    })

    // Sort tickets
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy === 'created_at' || sortBy === 'updated_at') {
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
  }, [tickets, searchTerm, selectedFilter, selectedPriority, sortBy, sortOrder])

  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find(s => s.id === status)
    const Icon = statusConfig?.icon || MessageCircle
    
    // Dark mode badge colors
    const getDarkModeColor = (status) => {
      switch (status) {
        case 'open': return 'bg-blue-600 text-white'
        case 'in_progress': return 'bg-yellow-600 text-white'
        case 'pending': return 'bg-orange-600 text-white'
        case 'resolved': return 'bg-green-600 text-white'
        case 'closed': return 'bg-gray-600 text-white'
        default: return 'bg-gray-600 text-white'
      }
    }
    
    return (
      <Badge className={isDarkMode ? getDarkModeColor(status) : (statusConfig?.color || 'bg-gray-100 text-gray-800')}>
        <Icon className="h-3 w-3 mr-1" />
        {statusConfig?.name || status}
      </Badge>
    )
  }

  const getPriorityBadge = (priority) => {
    const priorityConfig = priorityOptions.find(p => p.id === priority)
    
    // Dark mode badge colors
    const getDarkModeColor = (priority) => {
      switch (priority) {
        case 'low': return 'bg-gray-600 text-white'
        case 'medium': return 'bg-yellow-600 text-white'
        case 'high': return 'bg-red-600 text-white'
        case 'urgent': return 'bg-red-700 text-white'
        default: return 'bg-gray-600 text-white'
      }
    }
    
    return (
      <Badge className={isDarkMode ? getDarkModeColor(priority) : (priorityConfig?.color || 'bg-gray-100 text-gray-800')}>
        {priorityConfig?.name || priority}
      </Badge>
    )
  }

  const getCategoryIcon = (category) => {
    const categoryConfig = categoryOptions.find(c => c.id === category)
    const Icon = categoryConfig?.icon || MoreHorizontal
    return <Icon className="h-4 w-4" />
  }

  const getTimeSince = (date) => {
    const now = new Date()
    const then = new Date(date)
    const diffInHours = Math.floor((now - then) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
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
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Support Center</h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
              Customer support tickets, team management, and analytics
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant='outline' size='sm' className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
              <Download className='h-4 w-4 mr-2' />
              Export
            </Button>
            <Button size='sm' className={isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}>
              <Plus className='h-4 w-4 mr-2' />
              New Ticket
            </Button>
          </div>
        </div>

        {/* Support Metrics */}
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
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Open Tickets</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{supportMetrics.openTickets}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                    <MessageSquare className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {supportMetrics.totalTickets} total tickets
                  </span>
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
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Avg Response Time</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{supportMetrics.avgResponseTime}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                    <Clock className={`h-5 w-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {supportMetrics.firstResponseRate}% first response rate
                  </span>
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
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Resolution Rate</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{supportMetrics.resolutionRate}%</p>
                  </div>
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                    <CheckCircle className={`h-5 w-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {supportMetrics.resolvedToday} resolved today
                  </span>
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
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Customer Satisfaction</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{supportMetrics.customerSatisfaction}/5</p>
                  </div>
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                    <Star className={`h-5 w-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= supportMetrics.customerSatisfaction
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ticket Volume */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Ticket Volume</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Daily ticket creation and resolution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={ticketVolumeData}>
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
                    dataKey="tickets" 
                    stackId="1"
                    stroke="#3B82F6" 
                    fill="#3B82F6"
                    fillOpacity={0.6}
                    name="Created"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="resolved" 
                    stackId="2"
                    stroke="#10B981" 
                    fill="#10B981"
                    fillOpacity={0.6}
                    name="Resolved"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Ticket Categories</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Distribution by category type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
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
                {categoryDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.name}</span>
                    </div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Team */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Support Team</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Team performance and availability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {supportTeam.map((member, index) => (
                <div key={index} className={`p-4 border rounded-lg ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="relative">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        member.status === 'online' ? 'bg-green-500' :
                        member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{member.name}</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{member.role}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active Tickets</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{member.activeTickets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Resolved Today</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{member.resolvedToday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Avg Rating</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{member.avgRating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:bg-slate-600' 
                        : 'border-gray-300 bg-white'
                    }`}
                  />
                </div>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' 
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {filterOptions.map(option => (
                    <option key={option.id} value={option.id} style={isDarkMode ? { backgroundColor: '#334155', color: 'white' } : {}}>
                      {option.name} ({option.count})
                    </option>
                  ))}
                </select>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' 
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <option value="all" style={isDarkMode ? { backgroundColor: '#334155', color: 'white' } : {}}>All Priorities</option>
                  {priorityOptions.map(priority => (
                    <option key={priority.id} value={priority.id} style={isDarkMode ? { backgroundColor: '#334155', color: 'white' } : {}}>{priority.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Support Tickets ({filteredTickets.length})</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Manage customer support requests and communications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Ticket</th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Customer</th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Status</th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Priority</th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Assignee</th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Updated</th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <motion.tr
                      key={ticket.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`border-b transition-colors ${
                        isDarkMode 
                          ? 'border-slate-700 hover:bg-slate-700/50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          {getCategoryIcon(ticket.category)}
                          <div>
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{ticket.id}</p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-xs truncate`}>
                              {ticket.subject}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <MessageCircle className={`h-3 w-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{ticket.messages} messages</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={ticket.customer.avatar}
                            alt={ticket.customer.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{ticket.customer.name}</p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{ticket.customer.email}</p>
                            <Badge 
                              size="sm" 
                              className={`mt-1 ${
                                isDarkMode 
                                  ? 'bg-slate-700 text-white' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {ticket.customer.plan}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="p-4">
                        {getPriorityBadge(ticket.priority)}
                      </td>
                      <td className="p-4">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{ticket.assignee}</p>
                      </td>
                      <td className="p-4">
                        <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getTimeSince(ticket.updated_at)}
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {format(new Date(ticket.updated_at), 'MMM dd, HH:mm')}
                        </p>
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
            
            {filteredTickets.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className={`h-12 w-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No tickets found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SupportCenter

