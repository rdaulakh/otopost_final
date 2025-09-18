const Notification = require('../models/Notification');
const User = require('../models/User');
const Organization = require('../models/Organization');
const emailService = require('./emailService');
const logger = require('../utils/logger');

class NotificationService {
  constructor() {
    this.supportedTypes = [
      'content_approved',
      'content_rejected',
      'content_published',
      'content_scheduled',
      'campaign_started',
      'campaign_completed',
      'campaign_paused',
      'analytics_ready',
      'ai_agent_completed',
      'ai_agent_failed',
      'subscription_expiring',
      'subscription_expired',
      'payment_successful',
      'payment_failed',
      'social_account_connected',
      'social_account_disconnected',
      'system_alert',
      'crisis_detected',
      'trend_alert',
      'competitor_alert',
      'performance_alert',
      'custom'
    ];
  }

  /**
   * Create a new notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification
   */
  async createNotification(notificationData) {
    try {
      const {
        userId,
        organizationId,
        type,
        title,
        message,
        data = {},
        priority = 'medium',
        expiresAt,
        metadata = {}
      } = notificationData;

      // Validate notification type
      if (!this.supportedTypes.includes(type)) {
        throw new Error(`Unsupported notification type: ${type}`);
      }

      // Get user and organization
      const user = await User.findById(userId);
      const organization = await Organization.findById(organizationId);

      if (!user) {
        throw new Error('User not found');
      }

      if (!organization) {
        throw new Error('Organization not found');
      }

      // Create notification
      const notification = await Notification.createNotification({
        user: userId,
        organization: organizationId,
        type,
        title,
        message,
        data,
        priority,
        expiresAt,
        metadata
      });

      // Send notifications based on user preferences
      await this.sendNotifications(notification, user);

      logger.info(`Notification created: ${notification._id} for user: ${userId}`);
      return notification;

    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Send notifications via different channels
   * @param {Object} notification - Notification object
   * @param {Object} user - User object
   */
  async sendNotifications(notification, user) {
    try {
      // Send in-app notification (always)
      await this.sendInAppNotification(notification);

      // Send email notification if user preferences allow
      if (user.notificationPreferences?.email && this.shouldSendEmail(notification)) {
        await this.sendEmailNotification(notification, user);
      }

      // Send push notification if user preferences allow
      if (user.notificationPreferences?.push && this.shouldSendPush(notification)) {
        await this.sendPushNotification(notification, user);
      }

    } catch (error) {
      logger.error('Error sending notifications:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Send in-app notification
   * @param {Object} notification - Notification object
   */
  async sendInAppNotification(notification) {
    try {
      // In-app notifications are already stored in database
      // This method can be extended for real-time WebSocket notifications
      notification.isInAppSent = true;
      await notification.save();
      
      logger.info(`In-app notification sent: ${notification._id}`);
    } catch (error) {
      logger.error('Error sending in-app notification:', error);
    }
  }

  /**
   * Send email notification
   * @param {Object} notification - Notification object
   * @param {Object} user - User object
   */
  async sendEmailNotification(notification, user) {
    try {
      const emailTemplate = this.getEmailTemplate(notification.type);
      
      const emailData = {
        to: user.email,
        subject: notification.title,
        template: emailTemplate,
        data: {
          user: {
            name: user.firstName || user.username,
            email: user.email
          },
          notification: {
            title: notification.title,
            message: notification.message,
            type: notification.type,
            priority: notification.priority,
            data: notification.data
          }
        }
      };

      await emailService.sendEmail(emailData);
      
      notification.isEmailSent = true;
      await notification.save();
      
      logger.info(`Email notification sent: ${notification._id} to ${user.email}`);
    } catch (error) {
      logger.error('Error sending email notification:', error);
    }
  }

  /**
   * Send push notification
   * @param {Object} notification - Notification object
   * @param {Object} user - User object
   */
  async sendPushNotification(notification, user) {
    try {
      // This would integrate with a push notification service like FCM
      // For now, we'll just mark it as sent
      notification.isPushSent = true;
      await notification.save();
      
      logger.info(`Push notification sent: ${notification._id} to user: ${user._id}`);
    } catch (error) {
      logger.error('Error sending push notification:', error);
    }
  }

  /**
   * Get user notifications
   * @param {String} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} User notifications
   */
  async getUserNotifications(userId, options = {}) {
    try {
      return await Notification.getUserNotifications(userId, options);
    } catch (error) {
      logger.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   * @param {String} notificationId - Notification ID
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(notificationId, userId) {
    try {
      return await Notification.markAsRead(notificationId, userId);
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Update result
   */
  async markAllAsRead(userId) {
    try {
      return await Notification.markAllAsRead(userId);
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Archive notification
   * @param {String} notificationId - Notification ID
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Updated notification
   */
  async archiveNotification(notificationId, userId) {
    try {
      return await Notification.archiveNotification(notificationId, userId);
    } catch (error) {
      logger.error('Error archiving notification:', error);
      throw error;
    }
  }

  /**
   * Get notification statistics for a user
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Notification statistics
   */
  async getNotificationStats(userId) {
    try {
      return await Notification.getNotificationStats(userId);
    } catch (error) {
      logger.error('Error getting notification stats:', error);
      throw error;
    }
  }

  /**
   * Bulk create notifications for multiple users
   * @param {Array} notifications - Array of notification data
   * @returns {Promise<Array>} Created notifications
   */
  async bulkCreateNotifications(notifications) {
    try {
      const createdNotifications = [];
      
      for (const notificationData of notifications) {
        const notification = await this.createNotification(notificationData);
        createdNotifications.push(notification);
      }
      
      logger.info(`Bulk created ${createdNotifications.length} notifications`);
      return createdNotifications;
    } catch (error) {
      logger.error('Error bulk creating notifications:', error);
      throw error;
    }
  }

  /**
   * Clean up expired notifications
   * @returns {Promise<Number>} Number of deleted notifications
   */
  async cleanupExpiredNotifications() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      
      logger.info(`Cleaned up ${result.deletedCount} expired notifications`);
      return result.deletedCount;
    } catch (error) {
      logger.error('Error cleaning up expired notifications:', error);
      throw error;
    }
  }

  /**
   * Get email template for notification type
   * @param {String} type - Notification type
   * @returns {String} Email template name
   */
  getEmailTemplate(type) {
    const templateMap = {
      'content_approved': 'content-approved',
      'content_rejected': 'content-rejected',
      'content_published': 'content-published',
      'content_scheduled': 'content-scheduled',
      'campaign_started': 'campaign-started',
      'campaign_completed': 'campaign-completed',
      'campaign_paused': 'campaign-paused',
      'analytics_ready': 'analytics-ready',
      'ai_agent_completed': 'ai-agent-completed',
      'ai_agent_failed': 'ai-agent-failed',
      'subscription_expiring': 'subscription-expiring',
      'subscription_expired': 'subscription-expired',
      'payment_successful': 'payment-successful',
      'payment_failed': 'payment-failed',
      'social_account_connected': 'social-account-connected',
      'social_account_disconnected': 'social-account-disconnected',
      'system_alert': 'system-alert',
      'crisis_detected': 'crisis-detected',
      'trend_alert': 'trend-alert',
      'competitor_alert': 'competitor-alert',
      'performance_alert': 'performance-alert',
      'custom': 'custom-notification'
    };

    return templateMap[type] || 'default-notification';
  }

  /**
   * Check if email should be sent for notification type
   * @param {Object} notification - Notification object
   * @returns {Boolean} Should send email
   */
  shouldSendEmail(notification) {
    const emailTypes = [
      'subscription_expiring',
      'subscription_expired',
      'payment_failed',
      'crisis_detected',
      'system_alert'
    ];
    
    return emailTypes.includes(notification.type) || notification.priority === 'urgent';
  }

  /**
   * Check if push notification should be sent for notification type
   * @param {Object} notification - Notification object
   * @returns {Boolean} Should send push
   */
  shouldSendPush(notification) {
    const pushTypes = [
      'content_approved',
      'content_published',
      'campaign_started',
      'campaign_completed',
      'ai_agent_completed',
      'crisis_detected',
      'trend_alert',
      'performance_alert'
    ];
    
    return pushTypes.includes(notification.type) || notification.priority === 'high';
  }

  /**
   * Create notification for content approval
   * @param {String} userId - User ID
   * @param {String} organizationId - Organization ID
   * @param {Object} content - Content object
   * @param {String} status - Approval status
   */
  async createContentApprovalNotification(userId, organizationId, content, status) {
    const isApproved = status === 'approved';
    
    return await this.createNotification({
      userId,
      organizationId,
      type: isApproved ? 'content_approved' : 'content_rejected',
      title: isApproved ? 'Content Approved' : 'Content Rejected',
      message: isApproved 
        ? `Your content "${content.title}" has been approved and is ready for publishing.`
        : `Your content "${content.title}" has been rejected. Please review and make necessary changes.`,
      data: {
        contentId: content._id,
        contentTitle: content.title,
        status,
        platforms: content.platforms
      },
      priority: isApproved ? 'medium' : 'high',
      metadata: {
        source: 'content_approval',
        contentId: content._id
      }
    });
  }

  /**
   * Create notification for AI agent completion
   * @param {String} userId - User ID
   * @param {String} organizationId - Organization ID
   * @param {Object} agent - Agent object
   * @param {String} status - Completion status
   */
  async createAIAgentNotification(userId, organizationId, agent, status) {
    const isCompleted = status === 'completed';
    
    return await this.createNotification({
      userId,
      organizationId,
      type: isCompleted ? 'ai_agent_completed' : 'ai_agent_failed',
      title: isCompleted ? 'AI Agent Completed' : 'AI Agent Failed',
      message: isCompleted
        ? `The ${agent.name} agent has completed its task successfully.`
        : `The ${agent.name} agent encountered an error. Please check the logs for details.`,
      data: {
        agentId: agent._id,
        agentName: agent.name,
        status,
        taskType: agent.taskType
      },
      priority: isCompleted ? 'medium' : 'high',
      metadata: {
        source: 'ai_agent',
        agentId: agent._id
      }
    });
  }
}

module.exports = new NotificationService();