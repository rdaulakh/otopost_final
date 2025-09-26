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

export const useNotificationCenter = () => {
  const [notificationStats, setNotificationStats] = useState({
    total_notifications: 0,
    unread_notifications: 0,
    unresolved_notifications: 0,
    critical_alerts: 0,
    notifications_today: 0,
    resolved_today: 0,
    total_alert_rules: 0,
    active_alert_rules: 0,
    triggered_rules_today: 0,
    channel_distribution: {},
    severity_distribution: {},
    avg_response_time: '0 min',
    delivery_rate: 0,
    escalations: 0,
    subscribers: 0
  });
  
  const [notifications, setNotifications] = useState([]);
  const [alertRules, setAlertRules] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedAlertRule, setSelectedAlertRule] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotificationStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get('/notifications/stats');
      
      if (response.data.success) {
        setNotificationStats(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch notification statistics');
      }
    } catch (err) {
      console.error('Error fetching notification stats:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch notification statistics');
      
      // Fallback to mock data if API fails
      const mockStats = {
        total_notifications: 1247,
        unread_notifications: 89,
        unresolved_notifications: 23,
        critical_alerts: 5,
        notifications_today: 34,
        resolved_today: 45,
        total_alert_rules: 12,
        active_alert_rules: 10,
        triggered_rules_today: 3,
        channel_distribution: {
          email: 456,
          sms: 123,
          slack: 234,
          webhook: 89,
          push: 178,
          'in-app': 167
        },
        severity_distribution: {
          low: 567,
          medium: 423,
          high: 189,
          critical: 68
        },
        avg_response_time: '2.3 min',
        delivery_rate: 99.2,
        escalations: 8,
        subscribers: 156
      };
      setNotificationStats(mockStats);
      return mockStats;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/notifications?${queryParams}`);
      
      if (response.data.success) {
        setNotifications(response.data.data.notifications);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch notifications');
      
      // Fallback to mock notifications
      const mockNotifications = [
        {
          id: 'notification_1',
          title: 'High CPU Usage Alert',
          message: 'CPU usage has exceeded 85% for the past 10 minutes on server-01',
          type: 'alert',
          category: 'system',
          severity: 'high',
          channel: 'email',
          recipient: 'admin@platform.com',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read_at: null,
          resolved_at: null,
          is_read: false,
          is_resolved: false,
          metadata: {
            source: 'system',
            rule_id: 'rule_1',
            triggered_by: 'automated_monitoring',
            escalation_level: 2
          },
          actions: [
            { id: 'acknowledge', label: 'Acknowledge', type: 'primary' },
            { id: 'resolve', label: 'Resolve', type: 'success' },
            { id: 'escalate', label: 'Escalate', type: 'warning' }
          ]
        },
        {
          id: 'notification_2',
          title: 'Customer Churn Risk',
          message: 'Customer health score for Acme Corp has dropped to 35',
          type: 'warning',
          category: 'customer',
          severity: 'critical',
          channel: 'slack',
          recipient: '#customer-success',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          read_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          resolved_at: null,
          is_read: true,
          is_resolved: false,
          metadata: {
            source: 'system',
            rule_id: 'rule_2',
            triggered_by: 'automated_monitoring',
            escalation_level: 3
          },
          actions: [
            { id: 'acknowledge', label: 'Acknowledge', type: 'primary' },
            { id: 'resolve', label: 'Resolve', type: 'success' },
            { id: 'escalate', label: 'Escalate', type: 'warning' }
          ]
        }
      ];
      setNotifications(mockNotifications);
      return { notifications: mockNotifications, pagination: { current: 1, pages: 1, total: 2, limit: 20 } };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAlertRules = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/notifications/alert-rules?${queryParams}`);
      
      if (response.data.success) {
        setAlertRules(response.data.data.alert_rules);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch alert rules');
      }
    } catch (err) {
      console.error('Error fetching alert rules:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch alert rules');
      
      // Fallback to mock alert rules
      const mockAlertRules = [
        {
          id: 'rule_1',
          name: 'High CPU Usage',
          description: 'Alert when CPU usage exceeds 80% for 5 minutes',
          category: 'system',
          severity: 'high',
          condition: 'cpu_usage > 80',
          duration: '5m',
          channels: ['email', 'slack', 'webhook'],
          recipients: ['ops-team@platform.com', '#alerts'],
          enabled: true,
          triggered: 12,
          last_triggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'rule_2',
          name: 'Customer Churn Risk',
          description: 'Alert when customer health score drops below 40',
          category: 'customer',
          severity: 'critical',
          condition: 'health_score < 40',
          duration: '1h',
          channels: ['email', 'sms', 'slack'],
          recipients: ['success@platform.com', '#customer-success'],
          enabled: true,
          triggered: 5,
          last_triggered: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setAlertRules(mockAlertRules);
      return { alert_rules: mockAlertRules, pagination: { current: 1, pages: 1, total: 2, limit: 20 } };
    } finally {
      setLoading(false);
    }
  }, []);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.put(`/notifications/${notificationId}/read`);
      
      if (response.data.success) {
        // Update local state
        setNotifications(prev => prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        ));
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to mark notification as read');
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err.response?.data?.message || err.message || 'Failed to mark notification as read');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveNotification = useCallback(async (notificationId, resolutionNote = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.put(`/notifications/${notificationId}/resolve`, {
        resolution_note: resolutionNote
      });
      
      if (response.data.success) {
        // Update local state
        setNotifications(prev => prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_resolved: true, resolved_at: new Date().toISOString() }
            : notification
        ));
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to resolve notification');
      }
    } catch (err) {
      console.error('Error resolving notification:', err);
      setError(err.response?.data?.message || err.message || 'Failed to resolve notification');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkNotificationAction = useCallback(async (notificationIds, action, note = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.post('/notifications/bulk-action', {
        notification_ids: notificationIds,
        action,
        note
      });
      
      if (response.data.success) {
        // Update local state based on action
        setNotifications(prev => prev.map(notification => {
          if (notificationIds.includes(notification.id)) {
            switch (action) {
              case 'read':
                return { ...notification, is_read: true, read_at: new Date().toISOString() };
              case 'unread':
                return { ...notification, is_read: false, read_at: null };
              case 'resolve':
                return { ...notification, is_resolved: true, resolved_at: new Date().toISOString() };
              default:
                return notification;
            }
          }
          return notification;
        }));
        
        // Remove deleted notifications
        if (action === 'delete') {
          setNotifications(prev => prev.filter(notification => !notificationIds.includes(notification.id)));
        }
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to perform bulk action');
      }
    } catch (err) {
      console.error('Error performing bulk notification action:', err);
      setError(err.response?.data?.message || err.message || 'Failed to perform bulk action');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createAlertRule = useCallback(async (ruleData) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.post('/notifications/alert-rules', ruleData);
      
      if (response.data.success) {
        // Add to local state
        setAlertRules(prev => [response.data.data, ...prev]);
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create alert rule');
      }
    } catch (err) {
      console.error('Error creating alert rule:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create alert rule');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAlertRule = useCallback(async (ruleId, updates) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.put(`/notifications/alert-rules/${ruleId}`, updates);
      
      if (response.data.success) {
        // Update local state
        setAlertRules(prev => prev.map(rule => 
          rule.id === ruleId 
            ? { ...rule, ...updates, updated_at: new Date().toISOString() }
            : rule
        ));
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update alert rule');
      }
    } catch (err) {
      console.error('Error updating alert rule:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update alert rule');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAlertRule = useCallback(async (ruleId) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.delete(`/notifications/alert-rules/${ruleId}`);
      
      if (response.data.success) {
        // Remove from local state
        setAlertRules(prev => prev.filter(rule => rule.id !== ruleId));
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete alert rule');
      }
    } catch (err) {
      console.error('Error deleting alert rule:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete alert rule');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const testNotification = useCallback(async (channel, recipient, message) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.post('/notifications/test', {
        channel,
        recipient,
        message
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to send test notification');
      }
    } catch (err) {
      console.error('Error sending test notification:', err);
      setError(err.response?.data?.message || err.message || 'Failed to send test notification');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAllData = useCallback(async (filters = {}) => {
    await Promise.all([
      fetchNotificationStats(),
      fetchNotifications(filters),
      fetchAlertRules(filters)
    ]);
  }, [fetchNotificationStats, fetchNotifications, fetchAlertRules]);

  return {
    // Data
    notificationStats,
    notifications,
    alertRules,
    selectedNotification,
    selectedAlertRule,
    
    // State
    loading,
    error,
    
    // Actions
    fetchNotificationStats,
    fetchNotifications,
    fetchAlertRules,
    markNotificationAsRead,
    resolveNotification,
    bulkNotificationAction,
    createAlertRule,
    updateAlertRule,
    deleteAlertRule,
    testNotification,
    refreshAllData,
    
    // Local state management
    setSelectedNotification,
    setSelectedAlertRule
  };
};

export default useNotificationCenter;
