import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import useSupportCenter from '../hooks/useSupportCenter';

const SupportCenter = ({ data = {}, onDataUpdate = () => {}, isDarkMode = false }) => {
  const {
    supportMetrics,
    tickets,
    supportTeam,
    analytics,
    selectedTicket,
    loading,
    error,
    fetchTickets,
    fetchTicketDetails,
    updateTicket,
    addMessage,
    refreshAllData,
    setSelectedTicket
  } = useSupportCenter();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0, limit: 20 });
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Load initial data
  useEffect(() => {
    refreshAllData(selectedTimeRange);
    setLastRefresh(new Date());
  }, [refreshAllData, selectedTimeRange]);

  // Fetch tickets when filters change
  useEffect(() => {
    const filters = {
      page: pagination.current,
      limit: pagination.limit,
      status: selectedFilter,
      priority: selectedPriority,
      search: searchTerm,
      sortBy,
      sortOrder
    };

    fetchTickets(filters).then((result) => {
      if (result && result.pagination) {
        setPagination(result.pagination);
      }
    });
  }, [selectedFilter, selectedPriority, searchTerm, sortBy, sortOrder, pagination.current, fetchTickets]);

  const handleManualRefresh = async () => {
    await refreshAllData(selectedTimeRange);
    setLastRefresh(new Date());
  };

  const statusOptions = [
    { id: 'open', name: 'Open', color: 'bg-blue-100 text-blue-800', icon: MessageCircle },
    { id: 'in_progress', name: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    { id: 'pending', name: 'Pending', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
    { id: 'resolved', name: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { id: 'closed', name: 'Closed', color: 'bg-gray-100 text-gray-800', icon: XCircle }
  ];

  const priorityOptions = [
    { id: 'low', name: 'Low', color: 'bg-gray-100 text-gray-800' },
    { id: 'medium', name: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'high', name: 'High', color: 'bg-red-100 text-red-800' },
    { id: 'urgent', name: 'Urgent', color: 'bg-red-200 text-red-900' }
  ];

  const categoryOptions = [
    { id: 'technical', name: 'Technical', icon: Zap },
    { id: 'billing', name: 'Billing', icon: MessageSquare },
    { id: 'feature_request', name: 'Feature Request', icon: Star },
    { id: 'account', name: 'Account', icon: Users },
    { id: 'other', name: 'Other', icon: MoreHorizontal }
  ];

  const filterOptions = [
    { id: 'all', name: 'All Tickets', count: supportMetrics.tickets.totalTickets },
    { id: 'open', name: 'Open', count: supportMetrics.tickets.openTickets },
    { id: 'in_progress', name: 'In Progress', count: supportMetrics.tickets.inProgressTickets },
    { id: 'pending', name: 'Pending', count: supportMetrics.tickets.pendingTickets },
    { id: 'resolved', name: 'Resolved', count: supportMetrics.tickets.closedTickets }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find(s => s.id === status);
    const Icon = statusConfig?.icon || MessageCircle;
    
    const getDarkModeColor = (status) => {
      switch (status) {
        case 'open': return 'bg-blue-600 text-white';
        case 'in_progress': return 'bg-yellow-600 text-white';
        case 'pending': return 'bg-orange-600 text-white';
        case 'resolved': return 'bg-green-600 text-white';
        case 'closed': return 'bg-gray-600 text-white';
        default: return 'bg-gray-600 text-white';
      }
    };
    
    return (
      <Badge className={isDarkMode ? getDarkModeColor(status) : (statusConfig?.color || 'bg-gray-100 text-gray-800')}>
        <Icon className="h-3 w-3 mr-1" />
        {statusConfig?.name || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = priorityOptions.find(p => p.id === priority);
    
    const getDarkModeColor = (priority) => {
      switch (priority) {
        case 'low': return 'bg-gray-600 text-white';
        case 'medium': return 'bg-yellow-600 text-white';
        case 'high': return 'bg-red-600 text-white';
        case 'urgent': return 'bg-red-700 text-white';
        default: return 'bg-gray-600 text-white';
      }
    };
    
    return (
      <Badge className={isDarkMode ? getDarkModeColor(priority) : (priorityConfig?.color || 'bg-gray-100 text-gray-800')}>
        {priorityConfig?.name || priority}
      </Badge>
    );
  };

  const getCategoryIcon = (category) => {
    const categoryConfig = categoryOptions.find(c => c.id === category);
    const Icon = categoryConfig?.icon || MoreHorizontal;
    return <Icon className="h-4 w-4" />;
  };

  const getTimeSince = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffInHours = Math.floor((now - then) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleTicketClick = async (ticket) => {
    await fetchTicketDetails(ticket.id);
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      await updateTicket(ticketId, { status: newStatus });
      // Refresh tickets list
      const filters = {
        page: pagination.current,
        limit: pagination.limit,
        status: selectedFilter,
        priority: selectedPriority,
        search: searchTerm,
        sortBy,
        sortOrder
      };
      await fetchTickets(filters);
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };

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
            {error && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
                API Error: {error} (Showing fallback data)
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-xs text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
            
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              title="Manual refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
            </select>
            
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
            <Card className={`hover:shadow-lg transition-shadow relative ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
              {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                  <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Open Tickets</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{supportMetrics.tickets.openTickets}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                    <MessageSquare className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {supportMetrics.tickets.totalTickets} total tickets
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
            <Card className={`hover:shadow-lg transition-shadow relative ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
              {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                  <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Resolved Today</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{supportMetrics.tickets.resolvedToday}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                    <CheckCircle className={`h-5 w-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className={`h-4 w-4 mr-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    +{supportMetrics.trends.resolutionImprovement}% from yesterday
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
            <Card className={`hover:shadow-lg transition-shadow relative ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
              {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                  <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Avg Response Time</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{supportMetrics.performance.avgResponseTime}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
                    <Clock className={`h-5 w-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Target: &lt; 4 hours
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
            <Card className={`hover:shadow-lg transition-shadow relative ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
              {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                  <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Satisfaction</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{supportMetrics.performance.customerSatisfaction}/5</p>
                  </div>
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                    <Star className={`h-5 w-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className={`h-4 w-4 mr-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    +{supportMetrics.trends.satisfactionTrend}% this month
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === filter.id
                    ? isDarkMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-100 text-blue-700'
                    : isDarkMode
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {filter.name} ({filter.count})
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 border rounded-lg text-sm ${
                  isDarkMode 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className={`px-3 py-2 border rounded-lg text-sm ${
                isDarkMode 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Priorities</option>
              {priorityOptions.map((priority) => (
                <option key={priority.id} value={priority.id}>
                  {priority.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tickets Table */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : ''}>Support Tickets</CardTitle>
            <CardDescription className={isDarkMode ? 'text-slate-400' : ''}>
              Manage and track customer support requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                    <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>Ticket</th>
                    <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>Customer</th>
                    <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>Status</th>
                    <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>Priority</th>
                    <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>Assignee</th>
                    <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>Updated</th>
                    <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.length > 0 ? (
                    tickets.map((ticket) => (
                      <tr 
                        key={ticket.id} 
                        className={`border-b hover:bg-opacity-50 cursor-pointer ${
                          isDarkMode 
                            ? 'border-slate-700 hover:bg-slate-700' 
                            : 'border-gray-100 hover:bg-gray-50'
                        }`}
                        onClick={() => handleTicketClick(ticket)}
                      >
                        <td className="py-4 px-4">
                          <div>
                            <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {ticket.id}
                            </div>
                            <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                              {ticket.subject}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={ticket.customer.avatar}
                              alt={ticket.customer.name}
                              className="h-8 w-8 rounded-full"
                            />
                            <div>
                              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {ticket.customer.name}
                              </div>
                              <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                {ticket.customer.plan}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(ticket.status)}
                        </td>
                        <td className="py-4 px-4">
                          {getPriorityBadge(ticket.priority)}
                        </td>
                        <td className="py-4 px-4">
                          <div className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-900'}`}>
                            {ticket.assignee}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                            {getTimeSince(ticket.updated_at)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTicketClick(ticket);
                              }}
                              className={`p-1 rounded hover:bg-opacity-20 ${
                                isDarkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-200'
                              }`}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle edit
                              }}
                              className={`p-1 rounded hover:bg-opacity-20 ${
                                isDarkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-200'
                              }`}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center">
                        <div className={`text-gray-500 ${isDarkMode ? 'text-slate-400' : ''}`}>
                          {loading ? 'Loading tickets...' : 'No tickets found'}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Showing {((pagination.current - 1) * pagination.limit) + 1} to {Math.min(pagination.current * pagination.limit, pagination.total)} of {pagination.total} tickets
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, current: Math.max(1, prev.current - 1) }))}
                    disabled={pagination.current === 1}
                    className={`px-3 py-1 rounded text-sm ${
                      pagination.current === 1
                        ? 'opacity-50 cursor-not-allowed'
                        : isDarkMode
                          ? 'bg-slate-700 text-white hover:bg-slate-600'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border'
                    }`}
                  >
                    Previous
                  </button>
                  <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Page {pagination.current} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, current: Math.min(prev.pages, prev.current + 1) }))}
                    disabled={pagination.current === pagination.pages}
                    className={`px-3 py-1 rounded text-sm ${
                      pagination.current === pagination.pages
                        ? 'opacity-50 cursor-not-allowed'
                        : isDarkMode
                          ? 'bg-slate-700 text-white hover:bg-slate-600'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Support Team */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : ''}>Support Team</CardTitle>
            <CardDescription className={isDarkMode ? 'text-slate-400' : ''}>
              Team performance and availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supportTeam.map((member) => (
                <div 
                  key={member.id} 
                  className={`p-4 rounded-lg border ${
                    isDarkMode ? 'border-slate-600 bg-slate-700' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 ${
                        member.status === 'online' 
                          ? 'bg-green-500 border-white' 
                          : 'bg-gray-400 border-white'
                      }`} />
                    </div>
                    <div>
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {member.name}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        {member.role}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Active</div>
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {member.activeTickets}
                      </div>
                    </div>
                    <div>
                      <div className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Resolved</div>
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {member.resolvedToday}
                      </div>
                    </div>
                    <div>
                      <div className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Rating</div>
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {member.avgRating}/5
                      </div>
                    </div>
                    <div>
                      <div className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Status</div>
                      <div className={`font-medium capitalize ${
                        member.status === 'online' 
                          ? 'text-green-600' 
                          : isDarkMode ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        {member.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Ticket Volume</CardTitle>
              <CardDescription className={isDarkMode ? 'text-slate-400' : ''}>
                Daily ticket creation and resolution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                {analytics.ticketVolume.length > 0 ? (
                  <div className="w-full">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                    <p className={`text-center ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Ticket volume chart with {analytics.ticketVolume.length} data points
                    </p>
                    <p className={`text-sm text-center mt-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      Time range: {selectedTimeRange} | Last update: {lastRefresh.toLocaleTimeString()}
                    </p>
                  </div>
                ) : (
                  <div>
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {loading ? 'Loading analytics...' : 'No analytics data available'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Category Distribution</CardTitle>
              <CardDescription className={isDarkMode ? 'text-slate-400' : ''}>
                Tickets by category type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                {analytics.categoryDistribution.length > 0 ? (
                  <div className="w-full">
                    <PieChart className="h-16 w-16 mx-auto mb-4 text-purple-500" />
                    <p className={`text-center ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Category distribution with {analytics.categoryDistribution.length} categories
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                      {analytics.categoryDistribution.map((category, index) => (
                        <div key={index} className="flex items-center space-x-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                            {category.name} ({category.value}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <PieChart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {loading ? 'Loading category data...' : 'No category data available'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupportCenter;
