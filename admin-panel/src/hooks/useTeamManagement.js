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

export const useTeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamAnalytics, setTeamAnalytics] = useState({
    summary: {
      total_members: 0,
      active_members: 0,
      inactive_members: 0,
      pending_members: 0,
      suspended_members: 0,
      avg_tenure: '0 years',
      turnover_rate: 0
    },
    role_distribution: [],
    department_distribution: [],
    performance_metrics: {},
    security_metrics: {},
    recent_activities: [],
    upcoming_reviews: []
  });
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTeamMembers = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/team-management/members?${queryParams}`);
      
      if (response.data.success) {
        setTeamMembers(response.data.data.members);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch team members');
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch team members');
      
      // Fallback to mock data
      const mockMembers = [
        {
          id: 'team_1',
          name: 'Admin User',
          email: 'admin@aisocialmedia.com',
          role: 'Super Admin',
          status: 'Active',
          department: 'Engineering',
          last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminUser',
          created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'team_2',
          name: 'Jane Doe',
          email: 'jane.doe@aisocialmedia.com',
          role: 'Admin',
          status: 'Active',
          department: 'Marketing',
          last_active: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JaneDoe',
          created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'team_3',
          name: 'John Smith',
          email: 'john.smith@aisocialmedia.com',
          role: 'Support Manager',
          status: 'Active',
          department: 'Support',
          last_active: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnSmith',
          created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'team_4',
          name: 'Emily White',
          email: 'emily.white@aisocialmedia.com',
          role: 'Financial Manager',
          status: 'Inactive',
          department: 'Finance',
          last_active: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EmilyWhite',
          created_at: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setTeamMembers(mockMembers);
      return { members: mockMembers, pagination: { current: 1, pages: 1, total: 4, limit: 10 } };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeamAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get('/team-management/analytics');
      
      if (response.data.success) {
        setTeamAnalytics(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch team analytics');
      }
    } catch (err) {
      console.error('Error fetching team analytics:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch team analytics');
      
      // Fallback to mock analytics
      const mockAnalytics = {
        summary: {
          total_members: 4,
          active_members: 3,
          inactive_members: 1,
          pending_members: 0,
          suspended_members: 0,
          avg_tenure: '1.8 years',
          turnover_rate: 5.2
        },
        role_distribution: [
          { role: 'Super Admin', count: 1, color: '#8b5cf6' },
          { role: 'Admin', count: 1, color: '#3b82f6' },
          { role: 'Manager', count: 2, color: '#10b981' },
          { role: 'Other', count: 0, color: '#f59e0b' }
        ],
        department_distribution: [
          { department: 'Engineering', count: 1, color: '#3b82f6' },
          { department: 'Marketing', count: 1, color: '#10b981' },
          { department: 'Support', count: 1, color: '#ef4444' },
          { department: 'Finance', count: 1, color: '#8b5cf6' }
        ],
        performance_metrics: {
          avg_performance_rating: 4.2,
          avg_tasks_completed: 156,
          avg_tickets_resolved: 89,
          high_performers: 2,
          needs_improvement: 0
        },
        security_metrics: {
          two_factor_enabled: 3,
          recent_logins: 3,
          password_updates_needed: 1
        },
        recent_activities: [
          {
            id: 'activity_1',
            type: 'member_added',
            description: 'New team member John Doe added to Marketing department',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            user: 'Admin User'
          }
        ],
        upcoming_reviews: []
      };
      setTeamAnalytics(mockAnalytics);
      return mockAnalytics;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailableRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get('/team-management/roles');
      
      if (response.data.success) {
        setAvailableRoles(response.data.data.roles);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch available roles');
      }
    } catch (err) {
      console.error('Error fetching available roles:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch available roles');
      
      // Fallback to mock roles
      const mockRoles = [
        {
          id: 'super_admin',
          name: 'Super Admin',
          description: 'Full system access with all permissions',
          permissions: ['all'],
          level: 10
        },
        {
          id: 'admin',
          name: 'Admin',
          description: 'Administrative access with most permissions',
          permissions: ['user_management', 'content_management', 'analytics'],
          level: 8
        },
        {
          id: 'support_manager',
          name: 'Support Manager',
          description: 'Manage customer support and tickets',
          permissions: ['support_tickets', 'user_communication'],
          level: 6
        },
        {
          id: 'financial_manager',
          name: 'Financial Manager',
          description: 'Access to financial data and billing',
          permissions: ['financial_data', 'billing'],
          level: 6
        }
      ];
      setAvailableRoles(mockRoles);
      return { roles: mockRoles };
    } finally {
      setLoading(false);
    }
  }, []);

  const inviteTeamMember = useCallback(async (invitationData) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.post('/team-management/members/invite', invitationData);
      
      if (response.data.success) {
        // Refresh team members list
        await fetchTeamMembers();
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to invite team member');
      }
    } catch (err) {
      console.error('Error inviting team member:', err);
      setError(err.response?.data?.message || err.message || 'Failed to invite team member');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTeamMembers]);

  const updateTeamMember = useCallback(async (memberId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.put(`/team-management/members/${memberId}`, updateData);
      
      if (response.data.success) {
        // Update local state
        setTeamMembers(prev => prev.map(member => 
          member.id === memberId 
            ? { ...member, ...updateData, updated_at: new Date().toISOString() }
            : member
        ));
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update team member');
      }
    } catch (err) {
      console.error('Error updating team member:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update team member');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeTeamMember = useCallback(async (memberId, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const queryParams = new URLSearchParams(options).toString();
      const response = await api.delete(`/team-management/members/${memberId}?${queryParams}`);
      
      if (response.data.success) {
        // Remove from local state
        setTeamMembers(prev => prev.filter(member => member.id !== memberId));
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to remove team member');
      }
    } catch (err) {
      console.error('Error removing team member:', err);
      setError(err.response?.data?.message || err.message || 'Failed to remove team member');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTeamMemberDetails = useCallback(async (memberId) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get(`/team-management/members/${memberId}`);
      
      if (response.data.success) {
        setSelectedMember(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch team member details');
      }
    } catch (err) {
      console.error('Error fetching team member details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch team member details');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAllData = useCallback(async (filters = {}) => {
    await Promise.all([
      fetchTeamMembers(filters),
      fetchTeamAnalytics(),
      fetchAvailableRoles()
    ]);
  }, [fetchTeamMembers, fetchTeamAnalytics, fetchAvailableRoles]);

  // Calculate derived metrics
  const getDerivedMetrics = useCallback(() => {
    return {
      statusDistribution: {
        active: teamMembers.filter(m => m.status === 'Active').length,
        inactive: teamMembers.filter(m => m.status === 'Inactive').length,
        pending: teamMembers.filter(m => m.status === 'Pending').length,
        suspended: teamMembers.filter(m => m.status === 'Suspended').length
      },
      roleDistribution: teamMembers.reduce((acc, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1;
        return acc;
      }, {}),
      departmentDistribution: teamMembers.reduce((acc, member) => {
        acc[member.department] = (acc[member.department] || 0) + 1;
        return acc;
      }, {}),
      recentlyActive: teamMembers.filter(member => {
        const lastActive = new Date(member.last_active);
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        return lastActive > threeDaysAgo;
      }).length
    };
  }, [teamMembers]);

  return {
    // Data
    teamMembers,
    teamAnalytics,
    availableRoles,
    selectedMember,
    
    // Derived metrics
    derivedMetrics: getDerivedMetrics(),
    
    // State
    loading,
    error,
    
    // Actions
    fetchTeamMembers,
    fetchTeamAnalytics,
    fetchAvailableRoles,
    inviteTeamMember,
    updateTeamMember,
    removeTeamMember,
    getTeamMemberDetails,
    refreshAllData,
    
    // Local state management
    setSelectedMember
  };
};

export default useTeamManagement;
