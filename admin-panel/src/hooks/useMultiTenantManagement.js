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

export const useMultiTenantManagement = () => {
  const [tenantStats, setTenantStats] = useState({
    overview: {
      total_tenants: 0,
      active_tenants: 0,
      trial_tenants: 0,
      suspended_tenants: 0,
      inactive_tenants: 0
    },
    financial: {
      total_revenue: 0,
      avg_revenue_per_tenant: 0,
      monthly_recurring_revenue: 0,
      yearly_recurring_revenue: 0,
      overdue_payments: 0
    },
    usage: {
      total_users: 0,
      avg_users_per_tenant: 0,
      total_storage_used: 0,
      total_api_calls: 0,
      total_bandwidth_used: 0,
      avg_cpu_usage: 0,
      avg_memory_usage: 0
    },
    plan_distribution: {},
    feature_adoption: {},
    health: {},
    growth: {}
  });
  
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [resourceUsage, setResourceUsage] = useState({
    overview: {},
    trends: [],
    top_consumers: {},
    alerts: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTenantStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get('/multi-tenant/stats');
      
      if (response.data.success) {
        setTenantStats(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch tenant statistics');
      }
    } catch (err) {
      console.error('Error fetching tenant stats:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch tenant statistics');
      
      // Fallback to mock data if API fails
      const mockStats = {
        overview: {
          total_tenants: 47,
          active_tenants: 42,
          trial_tenants: 8,
          suspended_tenants: 3,
          inactive_tenants: 2
        },
        financial: {
          total_revenue: 89340,
          avg_revenue_per_tenant: 1900,
          monthly_recurring_revenue: 75000,
          yearly_recurring_revenue: 14340,
          overdue_payments: 3
        },
        usage: {
          total_users: 12847,
          avg_users_per_tenant: 273,
          total_storage_used: 2400, // GB
          total_api_calls: 15678900,
          total_bandwidth_used: 8900, // GB
          avg_cpu_usage: 45.2,
          avg_memory_usage: 67.8
        },
        plan_distribution: {
          starter: 12,
          professional: 18,
          enterprise: 14,
          custom: 3
        },
        feature_adoption: {
          white_label: 17,
          custom_domain: 17,
          api_access: 35,
          advanced_analytics: 17,
          sso: 17,
          custom_integrations: 17
        },
        health: {
          avg_uptime: 99.9,
          avg_response_time: 125,
          avg_error_rate: 0.8,
          tenants_with_incidents: 2
        },
        growth: {
          new_tenants_this_month: 5,
          churned_tenants_this_month: 1,
          trial_to_paid_conversion: 78.5,
          avg_time_to_value: 4.2
        }
      };
      setTenantStats(mockStats);
      return mockStats;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTenants = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/multi-tenant/tenants?${queryParams}`);
      
      if (response.data.success) {
        setTenants(response.data.data.tenants);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch tenants');
      }
    } catch (err) {
      console.error('Error fetching tenants:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch tenants');
      
      // Fallback to mock tenants
      const mockTenants = [
        {
          id: 'tenant_1',
          name: 'TechStart Solutions',
          subdomain: 'techstart',
          custom_domain: 'social.techstart.com',
          plan: 'Enterprise',
          status: 'active',
          industry: 'Technology',
          created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          users: 456,
          storage_used: 125.6,
          cpu_usage: 45.2,
          memory_usage: 67.8,
          api_calls: 234567,
          bandwidth_used: 890,
          revenue: 4890,
          billing_cycle: 'monthly',
          payment_status: 'current',
          contact: {
            name: 'Sarah Johnson',
            email: 'admin@techstart.com',
            phone: '+1-555-0123'
          },
          features: {
            white_label: true,
            custom_domain: true,
            api_access: true,
            advanced_analytics: true,
            priority_support: true,
            sso: true,
            custom_integrations: true
          },
          health: {
            overall_score: 92,
            uptime: 99.9,
            response_time: 89,
            error_rate: 0.2
          }
        },
        {
          id: 'tenant_2',
          name: 'Digital Marketing Pro',
          subdomain: 'digitalmarketing',
          custom_domain: null,
          plan: 'Professional',
          status: 'active',
          industry: 'Marketing',
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          last_activity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          users: 234,
          storage_used: 78.3,
          cpu_usage: 32.1,
          memory_usage: 54.2,
          api_calls: 156789,
          bandwidth_used: 567,
          revenue: 2490,
          billing_cycle: 'monthly',
          payment_status: 'current',
          contact: {
            name: 'Mike Chen',
            email: 'admin@digitalmarketing.com',
            phone: '+1-555-0456'
          },
          features: {
            white_label: false,
            custom_domain: false,
            api_access: true,
            advanced_analytics: false,
            priority_support: false,
            sso: false,
            custom_integrations: false
          },
          health: {
            overall_score: 85,
            uptime: 99.8,
            response_time: 134,
            error_rate: 0.5
          }
        }
      ];
      setTenants(mockTenants);
      return { tenants: mockTenants, pagination: { current: 1, pages: 1, total: 2, limit: 20 } };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTenantDetails = useCallback(async (tenantId) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get(`/multi-tenant/tenants/${tenantId}`);
      
      if (response.data.success) {
        setSelectedTenant(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch tenant details');
      }
    } catch (err) {
      console.error('Error fetching tenant details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch tenant details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchResourceUsage = useCallback(async (timeRange = '7d') => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get(`/multi-tenant/resource-usage?timeRange=${timeRange}`);
      
      if (response.data.success) {
        setResourceUsage(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch resource usage');
      }
    } catch (err) {
      console.error('Error fetching resource usage:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch resource usage');
      
      // Fallback to mock resource usage
      const mockResourceUsage = {
        overview: {
          total_cpu_usage: 45.2,
          total_memory_usage: 67.8,
          total_storage_used: 2400,
          total_bandwidth_used: 8900,
          total_api_calls: 15678900
        },
        trends: Array.from({ length: 7 }, (_, i) => {
          const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
          return {
            date: date.toISOString().split('T')[0],
            total_cpu: Math.random() * 80 + 10,
            total_memory: Math.random() * 85 + 10,
            total_storage: Math.random() * 1000 + 500,
            total_bandwidth: Math.random() * 500 + 100,
            active_tenants: Math.floor(Math.random() * 10) + 40,
            api_calls: Math.floor(Math.random() * 1000000) + 500000
          };
        }),
        top_consumers: {
          by_cpu: [],
          by_memory: [],
          by_storage: [],
          by_api_calls: []
        },
        alerts: [
          {
            type: 'high_cpu',
            message: 'Tenant techstart is using 95% CPU',
            severity: 'critical',
            tenant_id: 'tenant_1',
            timestamp: new Date().toISOString()
          }
        ]
      };
      setResourceUsage(mockResourceUsage);
      return mockResourceUsage;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTenant = useCallback(async (tenantData) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.post('/multi-tenant/tenants', tenantData);
      
      if (response.data.success) {
        // Add to local state
        setTenants(prev => [response.data.data, ...prev]);
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create tenant');
      }
    } catch (err) {
      console.error('Error creating tenant:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create tenant');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTenant = useCallback(async (tenantId, updates) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.put(`/multi-tenant/tenants/${tenantId}`, updates);
      
      if (response.data.success) {
        // Update local state
        setTenants(prev => prev.map(tenant => 
          tenant.id === tenantId 
            ? { ...tenant, ...updates, updated_at: new Date().toISOString() }
            : tenant
        ));
        
        if (selectedTenant && selectedTenant.id === tenantId) {
          setSelectedTenant(prev => ({ ...prev, ...updates, updated_at: new Date().toISOString() }));
        }
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update tenant');
      }
    } catch (err) {
      console.error('Error updating tenant:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update tenant');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedTenant]);

  const updateTenantStatus = useCallback(async (tenantId, status, reason = 'Status updated by admin') => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.put(`/multi-tenant/tenants/${tenantId}/status`, {
        status,
        reason
      });
      
      if (response.data.success) {
        // Update local state
        setTenants(prev => prev.map(tenant => 
          tenant.id === tenantId 
            ? { ...tenant, status, status_changed_at: new Date().toISOString() }
            : tenant
        ));
        
        if (selectedTenant && selectedTenant.id === tenantId) {
          setSelectedTenant(prev => ({ ...prev, status, status_changed_at: new Date().toISOString() }));
        }
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update tenant status');
      }
    } catch (err) {
      console.error('Error updating tenant status:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update tenant status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedTenant]);

  const deleteTenant = useCallback(async (tenantId, confirmDeletion = true, backupData = true) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.delete(`/multi-tenant/tenants/${tenantId}`, {
        data: {
          confirm_deletion: confirmDeletion,
          backup_data: backupData
        }
      });
      
      if (response.data.success) {
        // Remove from local state (or mark as deletion in progress)
        setTenants(prev => prev.filter(tenant => tenant.id !== tenantId));
        
        if (selectedTenant && selectedTenant.id === tenantId) {
          setSelectedTenant(null);
        }
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete tenant');
      }
    } catch (err) {
      console.error('Error deleting tenant:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete tenant');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedTenant]);

  const refreshAllData = useCallback(async (filters = {}, timeRange = '7d') => {
    await Promise.all([
      fetchTenantStats(),
      fetchTenants(filters),
      fetchResourceUsage(timeRange)
    ]);
  }, [fetchTenantStats, fetchTenants, fetchResourceUsage]);

  // Calculate derived metrics
  const getDerivedMetrics = useCallback(() => {
    return {
      statusDistribution: {
        active: tenants.filter(t => t.status === 'active').length,
        trial: tenants.filter(t => t.status === 'trial').length,
        suspended: tenants.filter(t => t.status === 'suspended').length,
        inactive: tenants.filter(t => t.status === 'inactive').length
      },
      planDistribution: {
        starter: tenants.filter(t => t.plan === 'Starter').length,
        professional: tenants.filter(t => t.plan === 'Professional').length,
        enterprise: tenants.filter(t => t.plan === 'Enterprise').length,
        custom: tenants.filter(t => t.plan === 'Custom').length
      },
      paymentHealthDistribution: {
        current: tenants.filter(t => t.payment_status === 'current').length,
        overdue: tenants.filter(t => t.payment_status === 'overdue').length
      },
      customDomainUsage: {
        with_custom_domain: tenants.filter(t => t.custom_domain).length,
        without_custom_domain: tenants.filter(t => !t.custom_domain).length
      }
    };
  }, [tenants]);

  return {
    // Data
    tenantStats,
    tenants,
    selectedTenant,
    resourceUsage,
    
    // Derived metrics
    derivedMetrics: getDerivedMetrics(),
    
    // State
    loading,
    error,
    
    // Actions
    fetchTenantStats,
    fetchTenants,
    fetchTenantDetails,
    fetchResourceUsage,
    createTenant,
    updateTenant,
    updateTenantStatus,
    deleteTenant,
    refreshAllData,
    
    // Local state management
    setSelectedTenant
  };
};

export default useMultiTenantManagement;
