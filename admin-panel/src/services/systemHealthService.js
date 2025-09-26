// System Health Service
import apiService from './api.js';
import { endpoints } from '../config/api.js';
import { debugLog } from '../config/environment.js';

class SystemHealthService {
  // Get system health status
  async getSystemHealth() {
    try {
      const response = await apiService.get(endpoints.system.health);
      
      if (response.success) {
        debugLog('System health fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch system health');
      }
    } catch (error) {
      debugLog('Get system health error:', error);
      throw error;
    }
  }

  // Get system metrics
  async getSystemMetrics(params = {}) {
    try {
      const {
        timeRange = '1h',
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

      const response = await apiService.get(`${endpoints.system.metrics}?${queryParams}`);
      
      if (response.success) {
        debugLog('System metrics fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch system metrics');
      }
    } catch (error) {
      debugLog('Get system metrics error:', error);
      throw error;
    }
  }

  // Get system alerts
  async getSystemAlerts(params = {}) {
    try {
      const {
        status = 'all',
        severity = 'all',
        limit = 50,
        ...otherParams
      } = params;

      const queryParams = new URLSearchParams({
        status,
        severity,
        limit: limit.toString(),
        ...otherParams,
      });

      const response = await apiService.get(`${endpoints.system.alerts}?${queryParams}`);
      
      if (response.success) {
        debugLog('System alerts fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch system alerts');
      }
    } catch (error) {
      debugLog('Get system alerts error:', error);
      throw error;
    }
  }

  // Get database health
  async getDatabaseHealth() {
    try {
      const response = await apiService.get('/system/database/health');
      
      if (response.success) {
        debugLog('Database health fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch database health');
      }
    } catch (error) {
      debugLog('Get database health error:', error);
      throw error;
    }
  }

  // Get Redis health
  async getRedisHealth() {
    try {
      const response = await apiService.get('/system/redis/health');
      
      if (response.success) {
        debugLog('Redis health fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch Redis health');
      }
    } catch (error) {
      debugLog('Get Redis health error:', error);
      throw error;
    }
  }

  // Get performance metrics
  async getPerformanceMetrics(params = {}) {
    try {
      const {
        timeRange = '1h',
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

      const response = await apiService.get('/system/performance', { params: queryParams });
      
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

  // Get error logs
  async getErrorLogs(params = {}) {
    try {
      const {
        level = 'error',
        limit = 100,
        startDate = '',
        endDate = '',
        ...otherParams
      } = params;

      const queryParams = new URLSearchParams({
        level,
        limit: limit.toString(),
        ...otherParams,
      });

      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await apiService.get('/system/logs/errors', { params: queryParams });
      
      if (response.success) {
        debugLog('Error logs fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch error logs');
      }
    } catch (error) {
      debugLog('Get error logs error:', error);
      throw error;
    }
  }

  // Get slow queries
  async getSlowQueries(params = {}) {
    try {
      const {
        limit = 50,
        minDuration = 1000,
        startDate = '',
        endDate = '',
        ...otherParams
      } = params;

      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        minDuration: minDuration.toString(),
        ...otherParams,
      });

      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await apiService.get('/system/database/slow-queries', { params: queryParams });
      
      if (response.success) {
        debugLog('Slow queries fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch slow queries');
      }
    } catch (error) {
      debugLog('Get slow queries error:', error);
      throw error;
    }
  }

  // Acknowledge alert
  async acknowledgeAlert(alertId) {
    try {
      const response = await apiService.post(`/system/alerts/${alertId}/acknowledge`);
      
      if (response.success) {
        debugLog('Alert acknowledged successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to acknowledge alert');
      }
    } catch (error) {
      debugLog('Acknowledge alert error:', error);
      throw error;
    }
  }

  // Resolve alert
  async resolveAlert(alertId, resolution) {
    try {
      const response = await apiService.post(`/system/alerts/${alertId}/resolve`, { resolution });
      
      if (response.success) {
        debugLog('Alert resolved successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to resolve alert');
      }
    } catch (error) {
      debugLog('Resolve alert error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const systemHealthService = new SystemHealthService();

export default systemHealthService;
