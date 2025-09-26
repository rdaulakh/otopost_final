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

export const useSubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [metrics, setMetrics] = useState({
    subscriptions: {
      total: 0,
      active: 0,
      trial: 0,
      pastDue: 0,
      cancelled: 0
    },
    revenue: {
      totalMRR: 0,
      avgRevenuePerUser: 0,
      annualRecurringRevenue: 0,
      projectedRevenue: 0
    },
    performance: {
      churnRate: 0,
      conversionRate: 0,
      ltv: 0,
      cac: 0
    },
    planDistribution: [],
    growthTrends: []
  });
  const [revenueAnalytics, setRevenueAnalytics] = useState({
    revenueData: [],
    summary: {}
  });
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubscriptionMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get('/subscriptions/metrics');
      
      if (response.data.success) {
        setMetrics(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch subscription metrics');
      }
    } catch (err) {
      console.error('Error fetching subscription metrics:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch subscription metrics');
      
      // Fallback to mock data if API fails
      setMetrics({
        subscriptions: {
          total: 247,
          active: 189,
          trial: 23,
          pastDue: 12,
          cancelled: 23
        },
        revenue: {
          totalMRR: 18750,
          avgRevenuePerUser: 99.21,
          annualRecurringRevenue: 225000,
          projectedRevenue: 270000
        },
        performance: {
          churnRate: 2.3,
          conversionRate: 78.5,
          ltv: 2380,
          cac: 45
        },
        planDistribution: [
          { name: 'Starter', count: 89, revenue: 2581 },
          { name: 'Pro', count: 124, revenue: 12276 },
          { name: 'Premium', count: 34, revenue: 10166 }
        ],
        growthTrends: Array.from({ length: 12 }, (_, i) => ({
          month: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
          subscriptions: 100 + (i * 10) + Math.floor(Math.random() * 20),
          revenue: 8000 + (i * 1000) + Math.floor(Math.random() * 2000),
          churn: 2 + Math.random() * 3
        }))
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubscriptions = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/subscriptions?${queryParams}`);
      
      if (response.data.success) {
        setSubscriptions(response.data.data.subscriptions);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch subscriptions');
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch subscriptions');
      
      // Fallback to mock subscriptions
      const mockSubscriptions = [
        {
          id: 'sub_001',
          user_id: 'user_001',
          user_name: 'Sarah Johnson',
          user_email: 'sarah@techstart.com',
          plan: 'Pro',
          status: 'active',
          amount: 99,
          billing_cycle: 'monthly',
          next_billing: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          trial_end: null,
          payment_method: 'card',
          mrr: 99,
          usage: { posts: 45, accounts: 8, ai_tokens: 250 },
          customer: {
            name: 'Sarah Johnson',
            email: 'sarah@techstart.com',
            avatar: '/api/placeholder/40/40'
          }
        },
        {
          id: 'sub_002',
          user_id: 'user_002',
          user_name: 'Michael Chen',
          user_email: 'michael@growthco.io',
          plan: 'Premium',
          status: 'active',
          amount: 299,
          billing_cycle: 'monthly',
          next_billing: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
          trial_end: null,
          payment_method: 'card',
          mrr: 299,
          usage: { posts: 180, accounts: 25, ai_tokens: 450 },
          customer: {
            name: 'Michael Chen',
            email: 'michael@growthco.io',
            avatar: '/api/placeholder/40/40'
          }
        }
      ];
      setSubscriptions(mockSubscriptions);
      return { subscriptions: mockSubscriptions, pagination: { current: 1, pages: 1, total: 2, limit: 20 } };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubscriptionPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get('/subscriptions/plans');
      
      if (response.data.success) {
        setSubscriptionPlans(response.data.data.plans);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch subscription plans');
      }
    } catch (err) {
      console.error('Error fetching subscription plans:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch subscription plans');
      
      // Fallback to mock plans
      const mockPlans = [
        {
          id: 'starter',
          name: 'Starter',
          description: 'Perfect for individuals and small teams',
          pricing: {
            monthly: { amount: 29, currency: 'USD' },
            yearly: { amount: 290, currency: 'USD', discount: 17 }
          },
          features: {
            socialAccounts: { included: 5 },
            monthlyPosts: { included: 50 },
            aiGenerations: { included: 25 }
          },
          isActive: true,
          isPopular: false
        },
        {
          id: 'pro',
          name: 'Pro',
          description: 'Advanced features for growing businesses',
          pricing: {
            monthly: { amount: 99, currency: 'USD' },
            yearly: { amount: 990, currency: 'USD', discount: 17 }
          },
          features: {
            socialAccounts: { included: 15 },
            monthlyPosts: { included: 200 },
            aiGenerations: { included: 100 }
          },
          isActive: true,
          isPopular: true
        },
        {
          id: 'premium',
          name: 'Premium',
          description: 'Enterprise-grade solution',
          pricing: {
            monthly: { amount: 299, currency: 'USD' },
            yearly: { amount: 2990, currency: 'USD', discount: 17 }
          },
          features: {
            socialAccounts: { included: -1 }, // Unlimited
            monthlyPosts: { included: -1 }, // Unlimited
            aiGenerations: { included: 500 }
          },
          isActive: true,
          isPopular: false
        }
      ];
      setSubscriptionPlans(mockPlans);
      return { plans: mockPlans };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubscriptionDetails = useCallback(async (subscriptionId) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get(`/subscriptions/${subscriptionId}`);
      
      if (response.data.success) {
        setSelectedSubscription(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch subscription details');
      }
    } catch (err) {
      console.error('Error fetching subscription details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch subscription details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRevenueAnalytics = useCallback(async (timeRange = '12m') => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get(`/subscriptions/analytics/revenue?timeRange=${timeRange}`);
      
      if (response.data.success) {
        setRevenueAnalytics(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch revenue analytics');
      }
    } catch (err) {
      console.error('Error fetching revenue analytics:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch revenue analytics');
      
      // Fallback to mock analytics
      const mockAnalytics = {
        revenueData: Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (11 - i));
          return {
            month: date.toISOString().slice(0, 7),
            monthName: date.toLocaleDateString('en-US', { month: 'short' }),
            mrr: 8000 + (i * 1000) + Math.floor(Math.random() * 2000),
            subscriptions: 100 + (i * 10) + Math.floor(Math.random() * 20),
            newSubscriptions: Math.floor(Math.random() * 20) + 10,
            churnedSubscriptions: Math.floor(Math.random() * 10) + 2
          };
        }),
        summary: {
          totalRevenue: 150000,
          avgMonthlyGrowth: 12.5,
          totalSubscriptions: 247,
          timeRange
        }
      };
      setRevenueAnalytics(mockAnalytics);
      return mockAnalytics;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSubscription = useCallback(async (subscriptionId, updates) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.put(`/subscriptions/${subscriptionId}`, updates);
      
      if (response.data.success) {
        // Update local state
        setSubscriptions(prev => prev.map(subscription => 
          subscription.id === subscriptionId ? { ...subscription, ...updates } : subscription
        ));
        
        if (selectedSubscription && selectedSubscription.id === subscriptionId) {
          setSelectedSubscription(prev => ({ ...prev, ...updates }));
        }
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update subscription');
      }
    } catch (err) {
      console.error('Error updating subscription:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedSubscription]);

  const cancelSubscription = useCallback(async (subscriptionId, reason = 'Cancelled by admin') => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.post(`/subscriptions/${subscriptionId}/cancel`, { reason });
      
      if (response.data.success) {
        // Update local state
        setSubscriptions(prev => prev.map(subscription => 
          subscription.id === subscriptionId 
            ? { ...subscription, status: 'cancelled', cancelled_at: new Date().toISOString() }
            : subscription
        ));
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to cancel subscription');
      }
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError(err.response?.data?.message || err.message || 'Failed to cancel subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reactivateSubscription = useCallback(async (subscriptionId) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.post(`/subscriptions/${subscriptionId}/reactivate`);
      
      if (response.data.success) {
        // Update local state
        setSubscriptions(prev => prev.map(subscription => 
          subscription.id === subscriptionId 
            ? { ...subscription, status: 'active', reactivated_at: new Date().toISOString() }
            : subscription
        ));
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to reactivate subscription');
      }
    } catch (err) {
      console.error('Error reactivating subscription:', err);
      setError(err.response?.data?.message || err.message || 'Failed to reactivate subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createSubscriptionPlan = useCallback(async (planData) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.post('/subscriptions/plans', planData);
      
      if (response.data.success) {
        // Update local state
        setSubscriptionPlans(prev => [...prev, response.data.data]);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create subscription plan');
      }
    } catch (err) {
      console.error('Error creating subscription plan:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create subscription plan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAllData = useCallback(async (timeRange = '12m') => {
    await Promise.all([
      fetchSubscriptionMetrics(),
      fetchSubscriptions(),
      fetchSubscriptionPlans(),
      fetchRevenueAnalytics(timeRange)
    ]);
  }, [fetchSubscriptionMetrics, fetchSubscriptions, fetchSubscriptionPlans, fetchRevenueAnalytics]);

  return {
    // Data
    subscriptions,
    subscriptionPlans,
    metrics,
    revenueAnalytics,
    selectedSubscription,
    
    // State
    loading,
    error,
    
    // Actions
    fetchSubscriptionMetrics,
    fetchSubscriptions,
    fetchSubscriptionPlans,
    fetchSubscriptionDetails,
    fetchRevenueAnalytics,
    updateSubscription,
    cancelSubscription,
    reactivateSubscription,
    createSubscriptionPlan,
    refreshAllData,
    setSelectedSubscription
  };
};

export default useSubscriptionManagement;
