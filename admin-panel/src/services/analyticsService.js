// Analytics Service
import apiService from './api.js';
import { endpoints } from '../config/api.js';
import { debugLog } from '../config/environment.js';

class AnalyticsService {
  // Get dashboard analytics
  async getDashboardAnalytics(params = {}) {
    try {
      const {
        period = '30d',
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
      } = params;

      const queryParams = new URLSearchParams({
        period,
        timezone,
      });

      const response = await apiService.get(`${endpoints.analytics.dashboard}?${queryParams}`);
      
      if (response.success) {
        debugLog('Dashboard analytics fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch dashboard analytics');
      }
    } catch (error) {
      debugLog('Get dashboard analytics error:', error);
      throw error;
    }
  }

  // Get revenue analytics
  async getRevenueAnalytics(params = {}) {
    try {
      const {
        period = '30d',
        groupBy = 'day',
        startDate = '',
        endDate = '',
        currency = 'USD',
      } = params;

      const queryParams = new URLSearchParams({
        period,
        groupBy,
        currency,
      });

      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await apiService.get(`${endpoints.analytics.revenue}?${queryParams}`);
      
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

  // Get user analytics
  async getUserAnalytics(params = {}) {
    try {
      const {
        period = '30d',
        groupBy = 'day',
        segment = 'all',
      } = params;

      const queryParams = new URLSearchParams({
        period,
        groupBy,
        segment,
      });

      const response = await apiService.get(`${endpoints.analytics.users}?${queryParams}`);
      
      if (response.success) {
        debugLog('User analytics fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch user analytics');
      }
    } catch (error) {
      debugLog('Get user analytics error:', error);
      throw error;
    }
  }

  // Get system analytics
  async getSystemAnalytics(params = {}) {
    try {
      const {
        period = '24h',
        metrics = 'all',
      } = params;

      const queryParams = new URLSearchParams({
        period,
        metrics,
      });

      const response = await apiService.get(`${endpoints.analytics.system}?${queryParams}`);
      
      if (response.success) {
        debugLog('System analytics fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch system analytics');
      }
    } catch (error) {
      debugLog('Get system analytics error:', error);
      throw error;
    }
  }

  // Get AI agent analytics
  async getAIAgentAnalytics(params = {}) {
    try {
      const {
        period = '7d',
        agentType = 'all',
        metric = 'performance',
      } = params;

      const queryParams = new URLSearchParams({
        period,
        agentType,
        metric,
      });

      const response = await apiService.get(`/analytics/ai-agents?${queryParams}`);
      
      if (response.success) {
        debugLog('AI agent analytics fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch AI agent analytics');
      }
    } catch (error) {
      debugLog('Get AI agent analytics error:', error);
      throw error;
    }
  }

  // Get platform usage analytics
  async getPlatformUsage(params = {}) {
    try {
      const {
        period = '30d',
        feature = 'all',
        groupBy = 'day',
      } = params;

      const queryParams = new URLSearchParams({
        period,
        feature,
        groupBy,
      });

      const response = await apiService.get(`/analytics/platform-usage?${queryParams}`);
      
      if (response.success) {
        debugLog('Platform usage analytics fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch platform usage analytics');
      }
    } catch (error) {
      debugLog('Get platform usage error:', error);
      throw error;
    }
  }

  // Get cohort analysis
  async getCohortAnalysis(params = {}) {
    try {
      const {
        period = '12m',
        cohortType = 'monthly',
        metric = 'retention',
      } = params;

      const queryParams = new URLSearchParams({
        period,
        cohortType,
        metric,
      });

      const response = await apiService.get(`/analytics/cohort?${queryParams}`);
      
      if (response.success) {
        debugLog('Cohort analysis fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch cohort analysis');
      }
    } catch (error) {
      debugLog('Get cohort analysis error:', error);
      throw error;
    }
  }

  // Get funnel analytics
  async getFunnelAnalytics(params = {}) {
    try {
      const {
        period = '30d',
        funnelType = 'signup',
      } = params;

      const queryParams = new URLSearchParams({
        period,
        funnelType,
      });

      const response = await apiService.get(`/analytics/funnel?${queryParams}`);
      
      if (response.success) {
        debugLog('Funnel analytics fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch funnel analytics');
      }
    } catch (error) {
      debugLog('Get funnel analytics error:', error);
      throw error;
    }
  }

  // Get real-time analytics
  async getRealTimeAnalytics() {
    try {
      const response = await apiService.get('/analytics/realtime');
      
      if (response.success) {
        debugLog('Real-time analytics fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch real-time analytics');
      }
    } catch (error) {
      debugLog('Get real-time analytics error:', error);
      throw error;
    }
  }

  // Get custom report
  async getCustomReport(reportConfig) {
    try {
      const response = await apiService.post('/analytics/custom-report', reportConfig);
      
      if (response.success) {
        debugLog('Custom report generated successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to generate custom report');
      }
    } catch (error) {
      debugLog('Get custom report error:', error);
      throw error;
    }
  }

  // Save custom report
  async saveCustomReport(reportData) {
    try {
      const response = await apiService.post('/analytics/reports', reportData);
      
      if (response.success) {
        debugLog('Custom report saved successfully:', response.data);
        return response.data.report;
      } else {
        throw new Error(response.message || 'Failed to save custom report');
      }
    } catch (error) {
      debugLog('Save custom report error:', error);
      throw error;
    }
  }

  // Get saved reports
  async getSavedReports() {
    try {
      const response = await apiService.get('/analytics/reports');
      
      if (response.success) {
        debugLog('Saved reports fetched successfully:', response.data);
        return response.data.reports;
      } else {
        throw new Error(response.message || 'Failed to fetch saved reports');
      }
    } catch (error) {
      debugLog('Get saved reports error:', error);
      throw error;
    }
  }

  // Delete saved report
  async deleteSavedReport(reportId) {
    try {
      const response = await apiService.delete(`/analytics/reports/${reportId}`);
      
      if (response.success) {
        debugLog('Saved report deleted successfully');
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete saved report');
      }
    } catch (error) {
      debugLog('Delete saved report error:', error);
      throw error;
    }
  }

  // Export analytics data
  async exportAnalytics(params = {}) {
    try {
      const {
        type = 'dashboard',
        format = 'csv',
        period = '30d',
        ...otherParams
      } = params;

      const queryParams = new URLSearchParams({
        type,
        format,
        period,
        ...otherParams,
      });

      await apiService.downloadFile(
        `/analytics/export?${queryParams}`,
        `analytics_${type}_${new Date().toISOString().split('T')[0]}.${format}`
      );

      debugLog('Analytics data exported successfully');
      return true;
    } catch (error) {
      debugLog('Export analytics error:', error);
      throw error;
    }
  }

  // Get performance metrics
  async getPerformanceMetrics(params = {}) {
    try {
      const {
        period = '24h',
        service = 'all',
      } = params;

      const queryParams = new URLSearchParams({
        period,
        service,
      });

      const response = await apiService.get(`/analytics/performance?${queryParams}`);
      
      if (response.success) {
        debugLog('Performance metrics fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch performance metrics');
      }
    } catch (error) {
      debugLog('Get performance metrics error:', error);
      throw error;
    }
  }

  // Get error analytics
  async getErrorAnalytics(params = {}) {
    try {
      const {
        period = '24h',
        severity = 'all',
        service = 'all',
      } = params;

      const queryParams = new URLSearchParams({
        period,
        severity,
        service,
      });

      const response = await apiService.get(`/analytics/errors?${queryParams}`);
      
      if (response.success) {
        debugLog('Error analytics fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch error analytics');
      }
    } catch (error) {
      debugLog('Get error analytics error:', error);
      throw error;
    }
  }

  // Get geographic analytics
  async getGeographicAnalytics(params = {}) {
    try {
      const {
        period = '30d',
        metric = 'users',
      } = params;

      const queryParams = new URLSearchParams({
        period,
        metric,
      });

      const response = await apiService.get(`/analytics/geographic?${queryParams}`);
      
      if (response.success) {
        debugLog('Geographic analytics fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch geographic analytics');
      }
    } catch (error) {
      debugLog('Get geographic analytics error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService;

