// System Health Monitoring Service
import apiService from './api.js';
import { endpoints } from '../config/api.js';
import { PAGINATION } from '../config/constants.js';
import { debugLog } from '../config/environment.js';

class SystemService {
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
        period = '1h',
        metrics = 'all',
        interval = '5m',
      } = params;

      const queryParams = new URLSearchParams({
        period,
        metrics,
        interval,
      });

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
        page = PAGINATION.DEFAULT_PAGE,
        limit = PAGINATION.DEFAULT_LIMIT,
        severity = '',
        status = '',
        service = '',
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (severity) queryParams.append('severity', severity);
      if (status) queryParams.append('status', status);
      if (service) queryParams.append('service', service);

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

  // Create system alert
  async createSystemAlert(alertData) {
    try {
      const response = await apiService.post(endpoints.system.alerts, alertData);
      
      if (response.success) {
        debugLog('System alert created successfully:', response.data);
        return response.data.alert;
      } else {
        throw new Error(response.message || 'Failed to create system alert');
      }
    } catch (error) {
      debugLog('Create system alert error:', error);
      throw error;
    }
  }

  // Update alert status
  async updateAlertStatus(alertId, status, notes = '') {
    try {
      const response = await apiService.patch(`/system/alerts/${alertId}`, {
        status,
        notes,
        updatedAt: new Date().toISOString(),
      });
      
      if (response.success) {
        debugLog('Alert status updated successfully');
        return response.data.alert;
      } else {
        throw new Error(response.message || 'Failed to update alert status');
      }
    } catch (error) {
      debugLog('Update alert status error:', error);
      throw error;
    }
  }

  // Get service status
  async getServiceStatus() {
    try {
      const response = await apiService.get('/system/services');
      
      if (response.success) {
        debugLog('Service status fetched successfully:', response.data);
        return response.data.services;
      } else {
        throw new Error(response.message || 'Failed to fetch service status');
      }
    } catch (error) {
      debugLog('Get service status error:', error);
      throw error;
    }
  }

  // Get infrastructure status
  async getInfrastructureStatus() {
    try {
      const response = await apiService.get('/system/infrastructure');
      
      if (response.success) {
        debugLog('Infrastructure status fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch infrastructure status');
      }
    } catch (error) {
      debugLog('Get infrastructure status error:', error);
      throw error;
    }
  }

  // Get API performance metrics
  async getAPIPerformance(params = {}) {
    try {
      const {
        period = '1h',
        endpoint = 'all',
      } = params;

      const queryParams = new URLSearchParams({
        period,
        endpoint,
      });

      const response = await apiService.get(`/system/api-performance?${queryParams}`);
      
      if (response.success) {
        debugLog('API performance metrics fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch API performance metrics');
      }
    } catch (error) {
      debugLog('Get API performance error:', error);
      throw error;
    }
  }

  // Get database metrics
  async getDatabaseMetrics(params = {}) {
    try {
      const {
        period = '1h',
        database = 'primary',
      } = params;

      const queryParams = new URLSearchParams({
        period,
        database,
      });

      const response = await apiService.get(`/system/database-metrics?${queryParams}`);
      
      if (response.success) {
        debugLog('Database metrics fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch database metrics');
      }
    } catch (error) {
      debugLog('Get database metrics error:', error);
      throw error;
    }
  }

  // Get system logs
  async getSystemLogs(params = {}) {
    try {
      const {
        page = PAGINATION.DEFAULT_PAGE,
        limit = PAGINATION.DEFAULT_LIMIT,
        level = '',
        service = '',
        startDate = '',
        endDate = '',
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (level) queryParams.append('level', level);
      if (service) queryParams.append('service', service);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await apiService.get(`/system/logs?${queryParams}`);
      
      if (response.success) {
        debugLog('System logs fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch system logs');
      }
    } catch (error) {
      debugLog('Get system logs error:', error);
      throw error;
    }
  }

  // Configure alert rules
  async configureAlertRules(ruleData) {
    try {
      const response = await apiService.post('/system/alert-rules', ruleData);
      
      if (response.success) {
        debugLog('Alert rule configured successfully:', response.data);
        return response.data.rule;
      } else {
        throw new Error(response.message || 'Failed to configure alert rule');
      }
    } catch (error) {
      debugLog('Configure alert rule error:', error);
      throw error;
    }
  }

  // Get alert rules
  async getAlertRules() {
    try {
      const response = await apiService.get('/system/alert-rules');
      
      if (response.success) {
        debugLog('Alert rules fetched successfully:', response.data);
        return response.data.rules;
      } else {
        throw new Error(response.message || 'Failed to fetch alert rules');
      }
    } catch (error) {
      debugLog('Get alert rules error:', error);
      throw error;
    }
  }

  // Update alert rule
  async updateAlertRule(ruleId, ruleData) {
    try {
      const response = await apiService.put(`/system/alert-rules/${ruleId}`, ruleData);
      
      if (response.success) {
        debugLog('Alert rule updated successfully:', response.data);
        return response.data.rule;
      } else {
        throw new Error(response.message || 'Failed to update alert rule');
      }
    } catch (error) {
      debugLog('Update alert rule error:', error);
      throw error;
    }
  }

  // Delete alert rule
  async deleteAlertRule(ruleId) {
    try {
      const response = await apiService.delete(`/system/alert-rules/${ruleId}`);
      
      if (response.success) {
        debugLog('Alert rule deleted successfully');
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete alert rule');
      }
    } catch (error) {
      debugLog('Delete alert rule error:', error);
      throw error;
    }
  }

  // Get system configuration
  async getSystemConfiguration() {
    try {
      const response = await apiService.get('/system/configuration');
      
      if (response.success) {
        debugLog('System configuration fetched successfully:', response.data);
        return response.data.configuration;
      } else {
        throw new Error(response.message || 'Failed to fetch system configuration');
      }
    } catch (error) {
      debugLog('Get system configuration error:', error);
      throw error;
    }
  }

  // Update system configuration
  async updateSystemConfiguration(configData) {
    try {
      const response = await apiService.put('/system/configuration', configData);
      
      if (response.success) {
        debugLog('System configuration updated successfully:', response.data);
        return response.data.configuration;
      } else {
        throw new Error(response.message || 'Failed to update system configuration');
      }
    } catch (error) {
      debugLog('Update system configuration error:', error);
      throw error;
    }
  }

  // Restart service
  async restartService(serviceName) {
    try {
      const response = await apiService.post(`/system/services/${serviceName}/restart`);
      
      if (response.success) {
        debugLog('Service restarted successfully:', serviceName);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to restart service');
      }
    } catch (error) {
      debugLog('Restart service error:', error);
      throw error;
    }
  }

  // Scale service
  async scaleService(serviceName, instances) {
    try {
      const response = await apiService.post(`/system/services/${serviceName}/scale`, {
        instances,
      });
      
      if (response.success) {
        debugLog('Service scaled successfully:', serviceName, instances);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to scale service');
      }
    } catch (error) {
      debugLog('Scale service error:', error);
      throw error;
    }
  }

  // Get maintenance windows
  async getMaintenanceWindows() {
    try {
      const response = await apiService.get('/system/maintenance');
      
      if (response.success) {
        debugLog('Maintenance windows fetched successfully:', response.data);
        return response.data.windows;
      } else {
        throw new Error(response.message || 'Failed to fetch maintenance windows');
      }
    } catch (error) {
      debugLog('Get maintenance windows error:', error);
      throw error;
    }
  }

  // Schedule maintenance
  async scheduleMaintenance(maintenanceData) {
    try {
      const response = await apiService.post('/system/maintenance', maintenanceData);
      
      if (response.success) {
        debugLog('Maintenance scheduled successfully:', response.data);
        return response.data.maintenance;
      } else {
        throw new Error(response.message || 'Failed to schedule maintenance');
      }
    } catch (error) {
      debugLog('Schedule maintenance error:', error);
      throw error;
    }
  }

  // Get backup status
  async getBackupStatus() {
    try {
      const response = await apiService.get('/system/backups');
      
      if (response.success) {
        debugLog('Backup status fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch backup status');
      }
    } catch (error) {
      debugLog('Get backup status error:', error);
      throw error;
    }
  }

  // Trigger backup
  async triggerBackup(backupType = 'full') {
    try {
      const response = await apiService.post('/system/backups/trigger', {
        type: backupType,
      });
      
      if (response.success) {
        debugLog('Backup triggered successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to trigger backup');
      }
    } catch (error) {
      debugLog('Trigger backup error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const systemService = new SystemService();

export default systemService;

