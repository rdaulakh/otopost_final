// Notification Management Service
import apiService from './api.js';
import { endpoints } from '../config/api.js';
import { PAGINATION } from '../config/constants.js';
import { debugLog } from '../config/environment.js';

class NotificationManagementService {
  // Get all notifications with pagination and filters
  async getNotifications(params = {}) {
    try {
      const {
        page = PAGINATION.DEFAULT_PAGE,
        limit = PAGINATION.DEFAULT_LIMIT,
        type = '',
        status = '',
        priority = '',
        userId = '',
        organizationId = '',
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

      if (type) queryParams.append('type', type);
      if (status) queryParams.append('status', status);
      if (priority) queryParams.append('priority', priority);
      if (userId) queryParams.append('userId', userId);
      if (organizationId) queryParams.append('organizationId', organizationId);

      const response = await apiService.get(`${endpoints.notifications.list}?${queryParams}`);
      
      if (response.success) {
        debugLog('Notifications fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      debugLog('Get notifications error:', error);
      throw error;
    }
  }

  // Get notification by ID
  async getNotification(notificationId) {
    try {
      const response = await apiService.get(endpoints.notifications.get(notificationId));
      
      if (response.success) {
        debugLog('Notification fetched successfully:', response.data);
        return response.data.notification;
      } else {
        throw new Error(response.message || 'Failed to fetch notification');
      }
    } catch (error) {
      debugLog('Get notification error:', error);
      throw error;
    }
  }

  // Get notification statistics
  async getNotificationStats(params = {}) {
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

      const response = await apiService.get(`${endpoints.notifications.stats}?${queryParams}`);
      
      if (response.success) {
        debugLog('Notification stats fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch notification statistics');
      }
    } catch (error) {
      debugLog('Get notification stats error:', error);
      throw error;
    }
  }

  // Create notification
  async createNotification(notificationData) {
    try {
      const response = await apiService.post(endpoints.notifications.create, notificationData);
      
      if (response.success) {
        debugLog('Notification created successfully:', response.data);
        return response.data.notification;
      } else {
        throw new Error(response.message || 'Failed to create notification');
      }
    } catch (error) {
      debugLog('Create notification error:', error);
      throw error;
    }
  }

  // Update notification
  async updateNotification(notificationId, notificationData) {
    try {
      const response = await apiService.put(endpoints.notifications.update(notificationId), notificationData);
      
      if (response.success) {
        debugLog('Notification updated successfully:', response.data);
        return response.data.notification;
      } else {
        throw new Error(response.message || 'Failed to update notification');
      }
    } catch (error) {
      debugLog('Update notification error:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await apiService.put(endpoints.notifications.markAsRead(notificationId));
      
      if (response.success) {
        debugLog('Notification marked as read successfully');
        return response.data.notification;
      } else {
        throw new Error(response.message || 'Failed to mark notification as read');
      }
    } catch (error) {
      debugLog('Mark notification as read error:', error);
      throw error;
    }
  }

  // Mark notification as unread
  async markAsUnread(notificationId) {
    try {
      const response = await apiService.put(endpoints.notifications.markAsUnread(notificationId));
      
      if (response.success) {
        debugLog('Notification marked as unread successfully');
        return response.data.notification;
      } else {
        throw new Error(response.message || 'Failed to mark notification as unread');
      }
    } catch (error) {
      debugLog('Mark notification as unread error:', error);
      throw error;
    }
  }

  // Archive notification
  async archiveNotification(notificationId) {
    try {
      const response = await apiService.put(endpoints.notifications.archive(notificationId));
      
      if (response.success) {
        debugLog('Notification archived successfully');
        return response.data.notification;
      } else {
        throw new Error(response.message || 'Failed to archive notification');
      }
    } catch (error) {
      debugLog('Archive notification error:', error);
      throw error;
    }
  }

  // Restore notification
  async restoreNotification(notificationId) {
    try {
      const response = await apiService.put(endpoints.notifications.restore(notificationId));
      
      if (response.success) {
        debugLog('Notification restored successfully');
        return response.data.notification;
      } else {
        throw new Error(response.message || 'Failed to restore notification');
      }
    } catch (error) {
      debugLog('Restore notification error:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const response = await apiService.delete(endpoints.notifications.delete(notificationId));
      
      if (response.success) {
        debugLog('Notification deleted successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to delete notification');
      }
    } catch (error) {
      debugLog('Delete notification error:', error);
      throw error;
    }
  }

  // Get notification preferences
  async getNotificationPreferences(userId) {
    try {
      const response = await apiService.get(endpoints.notifications.getPreferences(userId));
      
      if (response.success) {
        debugLog('Notification preferences fetched successfully:', response.data);
        return response.data.preferences;
      } else {
        throw new Error(response.message || 'Failed to fetch notification preferences');
      }
    } catch (error) {
      debugLog('Get notification preferences error:', error);
      throw error;
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(userId, preferences) {
    try {
      const response = await apiService.put(endpoints.notifications.updatePreferences(userId), preferences);
      
      if (response.success) {
        debugLog('Notification preferences updated successfully');
        return response.data.preferences;
      } else {
        throw new Error(response.message || 'Failed to update notification preferences');
      }
    } catch (error) {
      debugLog('Update notification preferences error:', error);
      throw error;
    }
  }

  // Send bulk notification
  async sendBulkNotification(notificationData) {
    try {
      const response = await apiService.post(endpoints.notifications.sendBulk, notificationData);
      
      if (response.success) {
        debugLog('Bulk notification sent successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to send bulk notification');
      }
    } catch (error) {
      debugLog('Send bulk notification error:', error);
      throw error;
    }
  }

  // Get notification templates
  async getNotificationTemplates(params = {}) {
    try {
      const {
        type = '',
        category = '',
        ...otherParams
      } = params;

      const queryParams = new URLSearchParams({
        ...otherParams,
      });

      if (type) queryParams.append('type', type);
      if (category) queryParams.append('category', category);

      const response = await apiService.get(`${endpoints.notifications.templates}?${queryParams}`);
      
      if (response.success) {
        debugLog('Notification templates fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch notification templates');
      }
    } catch (error) {
      debugLog('Get notification templates error:', error);
      throw error;
    }
  }

  // Create notification template
  async createNotificationTemplate(templateData) {
    try {
      const response = await apiService.post(endpoints.notifications.createTemplate, templateData);
      
      if (response.success) {
        debugLog('Notification template created successfully:', response.data);
        return response.data.template;
      } else {
        throw new Error(response.message || 'Failed to create notification template');
      }
    } catch (error) {
      debugLog('Create notification template error:', error);
      throw error;
    }
  }

  // Update notification template
  async updateNotificationTemplate(templateId, templateData) {
    try {
      const response = await apiService.put(endpoints.notifications.updateTemplate(templateId), templateData);
      
      if (response.success) {
        debugLog('Notification template updated successfully:', response.data);
        return response.data.template;
      } else {
        throw new Error(response.message || 'Failed to update notification template');
      }
    } catch (error) {
      debugLog('Update notification template error:', error);
      throw error;
    }
  }

  // Delete notification template
  async deleteNotificationTemplate(templateId) {
    try {
      const response = await apiService.delete(endpoints.notifications.deleteTemplate(templateId));
      
      if (response.success) {
        debugLog('Notification template deleted successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to delete notification template');
      }
    } catch (error) {
      debugLog('Delete notification template error:', error);
      throw error;
    }
  }

  // Search notifications
  async searchNotifications(query, params = {}) {
    try {
      const {
        limit = 20,
        type = '',
        status = '',
        ...otherParams
      } = params;

      const queryParams = new URLSearchParams({
        q: query,
        limit: limit.toString(),
        ...otherParams,
      });

      if (type) queryParams.append('type', type);
      if (status) queryParams.append('status', status);

      const response = await apiService.get(`${endpoints.notifications.search}?${queryParams}`);
      
      if (response.success) {
        debugLog('Notification search completed successfully:', response.data);
        return response.data.notifications;
      } else {
        throw new Error(response.message || 'Failed to search notifications');
      }
    } catch (error) {
      debugLog('Search notifications error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const notificationManagementService = new NotificationManagementService();

export default notificationManagementService;
