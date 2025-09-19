import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth token
const createApiClient = () => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  });
};

export const useSupportCenter = () => {
  const [supportMetrics, setSupportMetrics] = useState({
    tickets: {
      totalTickets: 0,
      openTickets: 0,
      resolvedToday: 0,
      pendingTickets: 0,
      inProgressTickets: 0,
      closedTickets: 0
    },
    performance: {
      avgResponseTime: '0 hours',
      avgResolutionTime: '0 hours',
      customerSatisfaction: 0,
      firstResponseRate: 0,
      resolutionRate: 0
    },
    team: {
      totalMembers: 0,
      onlineMembers: 0,
      totalActiveTickets: 0,
      totalResolvedToday: 0,
      avgTeamRating: 0
    },
    trends: {
      ticketGrowth: 0,
      resolutionImprovement: 0,
      satisfactionTrend: 0
    }
  });

  const [tickets, setTickets] = useState([]);
  const [supportTeam, setSupportTeam] = useState([]);
  const [analytics, setAnalytics] = useState({
    ticketVolume: [],
    categoryDistribution: [],
    responseTime: [],
    satisfactionTrends: []
  });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSupportMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get('/support/metrics');
      
      if (response.data.success) {
        setSupportMetrics(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch support metrics');
      }
    } catch (err) {
      console.error('Error fetching support metrics:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch support metrics');
      
      // Fallback to mock data if API fails
      setSupportMetrics({
        tickets: {
          totalTickets: 1247,
          openTickets: 23,
          resolvedToday: 45,
          pendingTickets: 12,
          inProgressTickets: 8,
          closedTickets: 1159
        },
        performance: {
          avgResponseTime: '2.3 hours',
          avgResolutionTime: '18.5 hours',
          customerSatisfaction: 4.7,
          firstResponseRate: 94.2,
          resolutionRate: 87.5
        },
        team: {
          totalMembers: 4,
          onlineMembers: 3,
          totalActiveTickets: 18,
          totalResolvedToday: 33,
          avgTeamRating: 4.7
        },
        trends: {
          ticketGrowth: 12.5,
          resolutionImprovement: 8.3,
          satisfactionTrend: 2.1
        }
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTickets = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/support/tickets?${queryParams}`);
      
      if (response.data.success) {
        setTickets(response.data.data.tickets);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch tickets');
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch tickets');
      
      // Fallback to mock tickets
      const mockTickets = [
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
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
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
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          messages: 5,
          tags: ['billing', 'upgrade', 'pro-plan'],
          satisfaction: null
        }
      ];
      setTickets(mockTickets);
      return { tickets: mockTickets, pagination: { current: 1, pages: 1, total: 2, limit: 20 } };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTicketDetails = useCallback(async (ticketId) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get(`/support/tickets/${ticketId}`);
      
      if (response.data.success) {
        setSelectedTicket(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch ticket details');
      }
    } catch (err) {
      console.error('Error fetching ticket details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch ticket details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSupportTeam = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get('/support/team');
      
      if (response.data.success) {
        setSupportTeam(response.data.data.team);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch support team');
      }
    } catch (err) {
      console.error('Error fetching support team:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch support team');
      
      // Fallback to mock team data
      setSupportTeam([
        {
          id: 1,
          name: 'John Smith',
          role: 'Senior Support Engineer',
          email: 'john.smith@company.com',
          avatar: '/api/placeholder/40/40',
          activeTickets: 8,
          resolvedToday: 12,
          avgRating: 4.8,
          status: 'online',
          specialties: ['technical', 'api']
        },
        {
          id: 2,
          name: 'Lisa Wang',
          role: 'Support Specialist',
          email: 'lisa.wang@company.com',
          avatar: '/api/placeholder/40/40',
          activeTickets: 5,
          resolvedToday: 9,
          avgRating: 4.6,
          status: 'online',
          specialties: ['billing', 'account']
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async (timeRange = '7d') => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get(`/support/analytics?timeRange=${timeRange}`);
      
      if (response.data.success) {
        setAnalytics(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch analytics');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch analytics');
      
      // Fallback to mock analytics
      const mockAnalytics = {
        ticketVolume: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tickets: Math.floor(Math.random() * 30) + 20,
          resolved: Math.floor(Math.random() * 25) + 15
        })),
        categoryDistribution: [
          { name: 'Technical', value: 45, color: '#3B82F6' },
          { name: 'Billing', value: 25, color: '#10B981' },
          { name: 'Feature Request', value: 15, color: '#8B5CF6' },
          { name: 'Account', value: 10, color: '#F59E0B' },
          { name: 'Other', value: 5, color: '#6B7280' }
        ],
        responseTime: [
          { hour: '00:00', avgTime: 3.2 },
          { hour: '04:00', avgTime: 2.8 },
          { hour: '08:00', avgTime: 1.5 },
          { hour: '12:00', avgTime: 2.1 },
          { hour: '16:00', avgTime: 1.8 },
          { hour: '20:00', avgTime: 2.5 }
        ],
        satisfactionTrends: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          rating: Math.random() * 1 + 4
        }))
      };
      setAnalytics(mockAnalytics);
      return mockAnalytics;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTicket = useCallback(async (ticketId, updates) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.put(`/support/tickets/${ticketId}`, updates);
      
      if (response.data.success) {
        // Update local state
        setTickets(prev => prev.map(ticket => 
          ticket.id === ticketId ? { ...ticket, ...updates } : ticket
        ));
        
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket(prev => ({ ...prev, ...updates }));
        }
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update ticket');
      }
    } catch (err) {
      console.error('Error updating ticket:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update ticket');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedTicket]);

  const addMessage = useCallback(async (ticketId, message, attachments = []) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.post(`/support/tickets/${ticketId}/messages`, {
        message,
        attachments
      });
      
      if (response.data.success) {
        // Update selected ticket with new message
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket(prev => ({
            ...prev,
            conversation: [...(prev.conversation || []), response.data.data]
          }));
        }
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to add message');
      }
    } catch (err) {
      console.error('Error adding message:', err);
      setError(err.response?.data?.message || err.message || 'Failed to add message');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedTicket]);

  const refreshAllData = useCallback(async (timeRange = '7d') => {
    await Promise.all([
      fetchSupportMetrics(),
      fetchTickets(),
      fetchSupportTeam(),
      fetchAnalytics(timeRange)
    ]);
  }, [fetchSupportMetrics, fetchTickets, fetchSupportTeam, fetchAnalytics]);

  return {
    // Data
    supportMetrics,
    tickets,
    supportTeam,
    analytics,
    selectedTicket,
    
    // State
    loading,
    error,
    
    // Actions
    fetchSupportMetrics,
    fetchTickets,
    fetchTicketDetails,
    fetchSupportTeam,
    fetchAnalytics,
    updateTicket,
    addMessage,
    refreshAllData,
    setSelectedTicket
  };
};

export default useSupportCenter;
