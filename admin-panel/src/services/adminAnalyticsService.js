// Admin Analytics Service
import apiService from './api.js';
import { endpoints } from '../config/api.js';
import { debugLog } from '../config/environment.js';

class AdminAnalyticsService {
  // Get system dashboard data
  async getSystemDashboard(params = {}) {
    try {
      const {
        timeRange = '7d',
        startDate = '',
        endDate = '',
        ...otherParams
      } = params;

      const queryParams = new URLSearchParams({
        timeRange,
        ...otherParams,
      });

      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await apiService.get(`${endpoints.adminAnalytics.dashboard}?${queryParams}`);
      
      if (response.success) {
        debugLog('System dashboard data fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch system dashboard data');
      }
    } catch (error) {
      debugLog('Get system dashboard error:', error);
      throw error;
    }
  }

  // Get platform usage analytics
  async getPlatformUsage(params = {}) {
    try {
      const {
        timeRange = '30d',
        startDate = '',
        endDate = '',
        ...otherParams
      } = params;

      const queryParams = new URLSearchParams({
        timeRange,
        ...otherParams,
      });

      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await apiService.get(`${endpoints.adminAnalytics.platformUsage}?${queryParams}`);
      
      if (response.success) {
        debugLog('Platform usage data fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch platform usage data');
      }
    } catch (error) {
      debugLog('Get platform usage error:', error);
      throw error;
    }
  }

  // Get revenue analytics
  async getRevenueAnalytics(params = {}) {
    try {
      const {
        timeRange = '12m',
        startDate = '',
        endDate = '',
        ...otherParams
      } = params;

      const queryParams = new URLSearchParams({
        timeRange,
        ...otherParams,
      });

      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await apiService.get(`${endpoints.adminAnalytics.revenue}?${queryParams}`);
      
      if (response.success) {
        debugLog('Revenue analytics data fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch revenue analytics data');
      }
    } catch (error) {
      debugLog('Get revenue analytics error:', error);
      throw error;
    }
  }

  // Get AI system performance
  async getAISystemPerformance(params = {}) {
    try {
      const {
        timeRange = '24h',
        startDate = '',
        endDate = '',
        ...otherParams
      } = params;

      const queryParams = new URLSearchParams({
        timeRange,
        ...otherParams,
      });

      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await apiService.get(`${endpoints.adminAnalytics.aiPerformance}?${queryParams}`);
      
      if (response.success) {
        debugLog('AI system performance data fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch AI system performance data');
      }
    } catch (error) {
      debugLog('Get AI system performance error:', error);
      throw error;
    }
  }

  // Generate custom report
  async generateCustomReport(reportConfig) {
    try {
      const response = await apiService.post(endpoints.adminAnalytics.customReport, reportConfig);
      
      if (response.success) {
        debugLog('Custom report generated successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to generate custom report');
      }
    } catch (error) {
      debugLog('Generate custom report error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const adminAnalyticsService = new AdminAnalyticsService();

export default adminAnalyticsService;