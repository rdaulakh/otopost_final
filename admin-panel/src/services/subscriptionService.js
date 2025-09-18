// Subscription Management Service
import apiService from './api.js';
import { endpoints } from '../config/api.js';
import { PAGINATION } from '../config/constants.js';
import { debugLog } from '../config/environment.js';

class SubscriptionService {
  // Get all subscriptions with pagination and filters
  async getSubscriptions(params = {}) {
    try {
      const {
        page = PAGINATION.DEFAULT_PAGE,
        limit = PAGINATION.DEFAULT_LIMIT,
        search = '',
        status = '',
        plan = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        ...otherParams
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...otherParams,
      });

      if (search) queryParams.append('search', search);
      if (status) queryParams.append('status', status);
      if (plan) queryParams.append('plan', plan);

      const response = await apiService.get(`${endpoints.subscriptions.list}?${queryParams}`);
      
      if (response.success) {
        debugLog('Subscriptions fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch subscriptions');
      }
    } catch (error) {
      debugLog('Get subscriptions error:', error);
      throw error;
    }
  }

  // Get subscription by ID
  async getSubscription(subscriptionId) {
    try {
      const response = await apiService.get(endpoints.subscriptions.get(subscriptionId));
      
      if (response.success) {
        debugLog('Subscription fetched successfully:', response.data);
        return response.data.subscription;
      } else {
        throw new Error(response.message || 'Failed to fetch subscription');
      }
    } catch (error) {
      debugLog('Get subscription error:', error);
      throw error;
    }
  }

  // Create new subscription
  async createSubscription(subscriptionData) {
    try {
      const response = await apiService.post(endpoints.subscriptions.create, subscriptionData);
      
      if (response.success) {
        debugLog('Subscription created successfully:', response.data);
        return response.data.subscription;
      } else {
        throw new Error(response.message || 'Failed to create subscription');
      }
    } catch (error) {
      debugLog('Create subscription error:', error);
      throw error;
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId, subscriptionData) {
    try {
      const response = await apiService.put(endpoints.subscriptions.update(subscriptionId), subscriptionData);
      
      if (response.success) {
        debugLog('Subscription updated successfully:', response.data);
        return response.data.subscription;
      } else {
        throw new Error(response.message || 'Failed to update subscription');
      }
    } catch (error) {
      debugLog('Update subscription error:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId, reason = '') {
    try {
      const response = await apiService.patch(endpoints.subscriptions.update(subscriptionId), {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date().toISOString(),
      });
      
      if (response.success) {
        debugLog('Subscription cancelled successfully');
        return response.data.subscription;
      } else {
        throw new Error(response.message || 'Failed to cancel subscription');
      }
    } catch (error) {
      debugLog('Cancel subscription error:', error);
      throw error;
    }
  }

  // Reactivate subscription
  async reactivateSubscription(subscriptionId) {
    try {
      const response = await apiService.patch(endpoints.subscriptions.update(subscriptionId), {
        status: 'active',
        reactivatedAt: new Date().toISOString(),
      });
      
      if (response.success) {
        debugLog('Subscription reactivated successfully');
        return response.data.subscription;
      } else {
        throw new Error(response.message || 'Failed to reactivate subscription');
      }
    } catch (error) {
      debugLog('Reactivate subscription error:', error);
      throw error;
    }
  }

  // Get subscription statistics
  async getSubscriptionStats() {
    try {
      const response = await apiService.get(endpoints.subscriptions.stats);
      
      if (response.success) {
        debugLog('Subscription stats fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch subscription statistics');
      }
    } catch (error) {
      debugLog('Get subscription stats error:', error);
      throw error;
    }
  }

  // Get revenue analytics
  async getRevenueAnalytics(params = {}) {
    try {
      const {
        period = '30d',
        startDate = '',
        endDate = '',
        groupBy = 'day',
      } = params;

      const queryParams = new URLSearchParams({
        period,
        groupBy,
      });

      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await apiService.get(`/subscriptions/revenue?${queryParams}`);
      
      if (response.success) {
        debugLog('Revenue analytics fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch revenue analytics');
      }
    } catch (error) {
      debugLog('Get revenue analytics error:', error);
      throw error;
    }
  }

  // Get subscription plans
  async getSubscriptionPlans() {
    try {
      const response = await apiService.get('/subscription-plans');
      
      if (response.success) {
        debugLog('Subscription plans fetched successfully:', response.data);
        return response.data.plans;
      } else {
        throw new Error(response.message || 'Failed to fetch subscription plans');
      }
    } catch (error) {
      debugLog('Get subscription plans error:', error);
      throw error;
    }
  }

  // Create subscription plan
  async createSubscriptionPlan(planData) {
    try {
      const response = await apiService.post('/subscription-plans', planData);
      
      if (response.success) {
        debugLog('Subscription plan created successfully:', response.data);
        return response.data.plan;
      } else {
        throw new Error(response.message || 'Failed to create subscription plan');
      }
    } catch (error) {
      debugLog('Create subscription plan error:', error);
      throw error;
    }
  }

  // Update subscription plan
  async updateSubscriptionPlan(planId, planData) {
    try {
      const response = await apiService.put(`/subscription-plans/${planId}`, planData);
      
      if (response.success) {
        debugLog('Subscription plan updated successfully:', response.data);
        return response.data.plan;
      } else {
        throw new Error(response.message || 'Failed to update subscription plan');
      }
    } catch (error) {
      debugLog('Update subscription plan error:', error);
      throw error;
    }
  }

  // Delete subscription plan
  async deleteSubscriptionPlan(planId) {
    try {
      const response = await apiService.delete(`/subscription-plans/${planId}`);
      
      if (response.success) {
        debugLog('Subscription plan deleted successfully');
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete subscription plan');
      }
    } catch (error) {
      debugLog('Delete subscription plan error:', error);
      throw error;
    }
  }

  // Get billing history
  async getBillingHistory(params = {}) {
    try {
      const {
        page = PAGINATION.DEFAULT_PAGE,
        limit = PAGINATION.DEFAULT_LIMIT,
        userId = '',
        status = '',
        startDate = '',
        endDate = '',
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (userId) queryParams.append('userId', userId);
      if (status) queryParams.append('status', status);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await apiService.get(`/billing/history?${queryParams}`);
      
      if (response.success) {
        debugLog('Billing history fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch billing history');
      }
    } catch (error) {
      debugLog('Get billing history error:', error);
      throw error;
    }
  }

  // Process refund
  async processRefund(paymentId, amount, reason = '') {
    try {
      const response = await apiService.post(`/billing/refund`, {
        paymentId,
        amount,
        reason,
      });
      
      if (response.success) {
        debugLog('Refund processed successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to process refund');
      }
    } catch (error) {
      debugLog('Process refund error:', error);
      throw error;
    }
  }

  // Get churn analytics
  async getChurnAnalytics(params = {}) {
    try {
      const {
        period = '30d',
        cohort = '',
      } = params;

      const queryParams = new URLSearchParams({ period });
      if (cohort) queryParams.append('cohort', cohort);

      const response = await apiService.get(`/subscriptions/churn?${queryParams}`);
      
      if (response.success) {
        debugLog('Churn analytics fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch churn analytics');
      }
    } catch (error) {
      debugLog('Get churn analytics error:', error);
      throw error;
    }
  }

  // Get LTV analytics
  async getLTVAnalytics(params = {}) {
    try {
      const {
        period = '12m',
        segmentBy = 'plan',
      } = params;

      const queryParams = new URLSearchParams({
        period,
        segmentBy,
      });

      const response = await apiService.get(`/subscriptions/ltv?${queryParams}`);
      
      if (response.success) {
        debugLog('LTV analytics fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch LTV analytics');
      }
    } catch (error) {
      debugLog('Get LTV analytics error:', error);
      throw error;
    }
  }

  // Export subscription data
  async exportSubscriptions(params = {}) {
    try {
      const {
        format = 'csv',
        filters = {},
        fields = [],
      } = params;

      const queryParams = new URLSearchParams({
        format,
        ...filters,
      });

      if (fields.length > 0) {
        queryParams.append('fields', fields.join(','));
      }

      await apiService.downloadFile(
        `/subscriptions/export?${queryParams}`,
        `subscriptions_export_${new Date().toISOString().split('T')[0]}.${format}`
      );

      debugLog('Subscriptions exported successfully');
      return true;
    } catch (error) {
      debugLog('Export subscriptions error:', error);
      throw error;
    }
  }

  // Get subscription usage
  async getSubscriptionUsage(subscriptionId, params = {}) {
    try {
      const {
        period = '30d',
        metric = 'all',
      } = params;

      const queryParams = new URLSearchParams({
        period,
        metric,
      });

      const response = await apiService.get(`/subscriptions/${subscriptionId}/usage?${queryParams}`);
      
      if (response.success) {
        debugLog('Subscription usage fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch subscription usage');
      }
    } catch (error) {
      debugLog('Get subscription usage error:', error);
      throw error;
    }
  }

  // Update subscription limits
  async updateSubscriptionLimits(subscriptionId, limits) {
    try {
      const response = await apiService.patch(`/subscriptions/${subscriptionId}/limits`, limits);
      
      if (response.success) {
        debugLog('Subscription limits updated successfully');
        return response.data.subscription;
      } else {
        throw new Error(response.message || 'Failed to update subscription limits');
      }
    } catch (error) {
      debugLog('Update subscription limits error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const subscriptionService = new SubscriptionService();

export default subscriptionService;

