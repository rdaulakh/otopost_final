import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

export const useCustomerSuccess = () => {
  const [successMetrics, setSuccessMetrics] = useState({
    overview: {
      total_customers: 0,
      active_customers: 0,
      churn_rate: 0,
      avg_health_score: 0,
      nps: 0,
      csat: 0,
      onboarding_completion: 0,
      time_to_value: 0,
      expansion_revenue: 0,
      retention_rate: 0
    },
    segments: {},
    journey_stages: {},
    financial: {},
    engagement: {}
  });
  
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [atRiskCustomers, setAtRiskCustomers] = useState([]);
  const [trends, setTrends] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSuccessMetrics = useCallback(async (timeRange = '30d') => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get(`/customer-success/metrics?timeRange=${timeRange}`);
      
      if (response.data.success) {
        setSuccessMetrics(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch customer success metrics');
      }
    } catch (err) {
      console.error('Error fetching customer success metrics:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch customer success metrics');
      
      // Fallback to mock data if API fails
      const mockMetrics = {
        overview: {
          total_customers: 2847,
          active_customers: 2156,
          churn_rate: 2.3,
          avg_health_score: 78.5,
          nps: 67,
          csat: 4.2,
          onboarding_completion: 89.3,
          time_to_value: 4.2,
          expansion_revenue: 23.5,
          retention_rate: 94.7
        },
        segments: {
          champions: { count: 456, percentage: 16.0, avg_health_score: 90, churn_risk: 'low' },
          advocates: { count: 623, percentage: 21.9, avg_health_score: 82, churn_risk: 'low' },
          satisfied: { count: 892, percentage: 31.3, avg_health_score: 75, churn_risk: 'medium' },
          at_risk: { count: 534, percentage: 18.8, avg_health_score: 58, churn_risk: 'high' },
          critical: { count: 342, percentage: 12.0, avg_health_score: 35, churn_risk: 'critical' }
        },
        journey_stages: {
          trial_started: { customers: 1247, conversion_rate: 78.5, avg_duration: 7, dropoff_rate: 21.5 },
          onboarding: { customers: 978, conversion_rate: 89.3, avg_duration: 3, dropoff_rate: 10.7 },
          first_value: { customers: 873, conversion_rate: 92.1, avg_duration: 4.2, dropoff_rate: 7.9 },
          active_user: { customers: 756, conversion_rate: 95.3, avg_duration: 30, dropoff_rate: 4.7 },
          power_user: { customers: 642, conversion_rate: 98.1, avg_duration: 90, dropoff_rate: 1.9 }
        },
        financial: {
          total_mrr: 145000,
          avg_ltv: 5200,
          total_expansion_revenue: 23500,
          payment_health: { current: 2650, overdue: 197 }
        },
        engagement: {
          avg_login_frequency: 18.5,
          avg_feature_adoption: 67.3,
          total_support_tickets: 234,
          avg_nps: 6.7,
          avg_csat: 4.2
        }
      };
      setSuccessMetrics(mockMetrics);
      return mockMetrics;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCustomers = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/customer-success/customers?${queryParams}`);
      
      if (response.data.success) {
        setCustomers(response.data.data.customers);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch customers');
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch customers');
      
      // Fallback to mock customers
      const mockCustomers = [
        {
          id: 'customer_1',
          name: 'John Smith',
          email: 'john@acme.com',
          company: 'Acme Corp',
          industry: 'Technology',
          plan: 'Enterprise',
          health_score: 85,
          segment: 'Champions',
          journey_stage: 'Power User',
          churn_risk: 'low',
          created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          last_active: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          onboarding_completed: true,
          first_value_achieved: true,
          engagement: {
            login_frequency: 25,
            feature_adoption: 89,
            support_tickets: 2,
            nps_score: 9,
            csat_score: 5
          },
          usage: {
            posts_created: 245,
            campaigns_run: 18,
            api_calls: 5600,
            storage_used: 450,
            team_members: 8,
            integrations_connected: 6
          },
          financial: {
            mrr: 299,
            ltv: 8500,
            expansion_revenue: 150,
            payment_status: 'current'
          }
        },
        {
          id: 'customer_2',
          name: 'Sarah Johnson',
          email: 'sarah@techstart.com',
          company: 'TechStart Inc',
          industry: 'Marketing',
          plan: 'Professional',
          health_score: 42,
          segment: 'At Risk',
          journey_stage: 'Active User',
          churn_risk: 'high',
          created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          last_active: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          onboarding_completed: true,
          first_value_achieved: false,
          engagement: {
            login_frequency: 8,
            feature_adoption: 34,
            support_tickets: 5,
            nps_score: 3,
            csat_score: 2
          },
          usage: {
            posts_created: 12,
            campaigns_run: 2,
            api_calls: 450,
            storage_used: 89,
            team_members: 3,
            integrations_connected: 1
          },
          financial: {
            mrr: 99,
            ltv: 1200,
            expansion_revenue: 0,
            payment_status: 'current'
          }
        }
      ];
      setCustomers(mockCustomers);
      return { customers: mockCustomers, pagination: { current: 1, pages: 1, total: 2, limit: 20 } };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCustomerDetails = useCallback(async (customerId) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get(`/customer-success/customers/${customerId}`);
      
      if (response.data.success) {
        setSelectedCustomer(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch customer details');
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch customer details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAtRiskCustomers = useCallback(async (limit = 50) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get(`/customer-success/at-risk?limit=${limit}`);
      
      if (response.data.success) {
        setAtRiskCustomers(response.data.data.at_risk_customers);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch at-risk customers');
      }
    } catch (err) {
      console.error('Error fetching at-risk customers:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch at-risk customers');
      
      // Fallback to mock at-risk customers
      const mockAtRisk = [
        {
          id: 'customer_2',
          name: 'Sarah Johnson',
          company: 'TechStart Inc',
          health_score: 42,
          churn_risk: 'high',
          financial: { ltv: 1200, mrr: 99 },
          risk_analysis: {
            primary_risk_factors: ['Low engagement', 'Support tickets'],
            days_since_last_login: 14,
            support_ticket_trend: 'increasing',
            usage_trend: 'decreasing',
            payment_health: 'current',
            recommended_actions: ['Schedule check-in call', 'Review usage patterns', 'Offer training session']
          }
        }
      ];
      setAtRiskCustomers(mockAtRisk);
      return { 
        at_risk_customers: mockAtRisk, 
        summary: { 
          total_at_risk: 1, 
          critical_risk: 0, 
          high_risk: 1, 
          avg_health_score: 42, 
          potential_revenue_at_risk: 1200 
        } 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrends = useCallback(async (timeRange = '30d', metric = 'health_score') => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get(`/customer-success/analytics/trends?timeRange=${timeRange}&metric=${metric}`);
      
      if (response.data.success) {
        setTrends(response.data.data.trends);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch trends');
      }
    } catch (err) {
      console.error('Error fetching trends:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch trends');
      
      // Fallback to mock trends
      const mockTrends = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
        return {
          date: date.toISOString().split('T')[0],
          health_score: Math.floor(Math.random() * 20) + 70,
          churn_rate: Math.random() * 5 + 1,
          nps: Math.floor(Math.random() * 20) + 60,
          csat: Math.random() * 1 + 4,
          active_customers: Math.floor(Math.random() * 100) + 2000,
          new_customers: Math.floor(Math.random() * 20) + 5,
          churned_customers: Math.floor(Math.random() * 10) + 1
        };
      });
      setTrends(mockTrends);
      return { 
        trends: mockTrends, 
        summary: { 
          avg_health_score: 78.5, 
          avg_churn_rate: 2.3, 
          avg_nps: 67, 
          avg_csat: 4.2 
        } 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateHealthScore = useCallback(async (customerId, healthScore, reason = 'Manual update by admin') => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.put(`/customer-success/customers/${customerId}/health-score`, {
        health_score: healthScore,
        reason
      });
      
      if (response.data.success) {
        // Update local state
        setCustomers(prev => prev.map(customer => 
          customer.id === customerId 
            ? { ...customer, health_score: healthScore }
            : customer
        ));
        
        if (selectedCustomer && selectedCustomer.id === customerId) {
          setSelectedCustomer(prev => ({ ...prev, health_score: healthScore }));
        }
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update health score');
      }
    } catch (err) {
      console.error('Error updating health score:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update health score');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedCustomer]);

  const createOutreach = useCallback(async (customerId, outreachData) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.post(`/customer-success/customers/${customerId}/outreach`, outreachData);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create outreach');
      }
    } catch (err) {
      console.error('Error creating outreach:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create outreach');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAllData = useCallback(async (timeRange = '30d', filters = {}) => {
    await Promise.all([
      fetchSuccessMetrics(timeRange),
      fetchCustomers(filters),
      fetchAtRiskCustomers(),
      fetchTrends(timeRange)
    ]);
  }, [fetchSuccessMetrics, fetchCustomers, fetchAtRiskCustomers, fetchTrends]);

  // Calculate derived metrics
  const getDerivedMetrics = useCallback(() => {
    return {
      churnRiskDistribution: {
        low: customers.filter(c => c.churn_risk === 'low').length,
        medium: customers.filter(c => c.churn_risk === 'medium').length,
        high: customers.filter(c => c.churn_risk === 'high').length,
        critical: customers.filter(c => c.churn_risk === 'critical').length
      },
      segmentDistribution: {
        champions: customers.filter(c => c.segment === 'Champions').length,
        advocates: customers.filter(c => c.segment === 'Advocates').length,
        satisfied: customers.filter(c => c.segment === 'Satisfied').length,
        atRisk: customers.filter(c => c.segment === 'At Risk').length,
        critical: customers.filter(c => c.segment === 'Critical').length
      },
      healthScoreDistribution: {
        excellent: customers.filter(c => c.health_score >= 80).length,
        good: customers.filter(c => c.health_score >= 60 && c.health_score < 80).length,
        fair: customers.filter(c => c.health_score >= 40 && c.health_score < 60).length,
        poor: customers.filter(c => c.health_score < 40).length
      }
    };
  }, [customers]);

  return {
    // Data
    successMetrics,
    customers,
    selectedCustomer,
    atRiskCustomers,
    trends,
    
    // Derived metrics
    derivedMetrics: getDerivedMetrics(),
    
    // State
    loading,
    error,
    
    // Actions
    fetchSuccessMetrics,
    fetchCustomers,
    fetchCustomerDetails,
    fetchAtRiskCustomers,
    fetchTrends,
    updateHealthScore,
    createOutreach,
    refreshAllData,
    
    // Local state management
    setSelectedCustomer
  };
};

export default useCustomerSuccess;
