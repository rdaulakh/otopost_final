const socketService = require('./socketService');

class NotificationService {
  constructor() {
    this.notificationTypes = {
      CONTENT_PUBLISHED: 'content_published',
      CONTENT_SCHEDULED: 'content_scheduled',
      CONTENT_FAILED: 'content_failed',
      ANALYTICS_MILESTONE: 'analytics_milestone',
      AI_SUGGESTION: 'ai_suggestion',
      SOCIAL_MENTION: 'social_mention',
      ENGAGEMENT_SPIKE: 'engagement_spike',
      SYSTEM_UPDATE: 'system_update',
      ACCOUNT_CONNECTED: 'account_connected',
      ACCOUNT_DISCONNECTED: 'account_disconnected',
      SUBSCRIPTION_UPDATED: 'subscription_updated',
      TEAM_INVITATION: 'team_invitation',
      COMMENT_RECEIVED: 'comment_received',
      MESSAGE_RECEIVED: 'message_received'
    };

    this.priorities = {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      URGENT: 'urgent'
    };
  }

  async sendNotification(userId, notification) {
    try {
      // Validate notification data
      const validatedNotification = this.validateNotification(notification);
      
      // Add metadata
      const enrichedNotification = {
        ...validatedNotification,
        id: this.generateNotificationId(),
        userId,
        createdAt: new Date(),
        read: false,
        delivered: false
      };

      // Send real-time notification if user is online
      if (socketService.isUserOnline(userId)) {
        socketService.sendNotificationToUser(userId, enrichedNotification);
        enrichedNotification.delivered = true;
      }

      // Store notification for offline delivery
      await this.storeNotification(enrichedNotification);

      // Send push notification if enabled
      await this.sendPushNotification(userId, enrichedNotification);

      // Send email notification if configured
      await this.sendEmailNotification(userId, enrichedNotification);

      return {
        success: true,
        notificationId: enrichedNotification.id,
        delivered: enrichedNotification.delivered
      };

    } catch (error) {
      console.error('Error sending notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendBulkNotifications(userIds, notification) {
    const results = [];
    
    for (const userId of userIds) {
      const result = await this.sendNotification(userId, notification);
      results.push({ userId, ...result });
    }

    return results;
  }

  // Content-related notifications
  async notifyContentPublished(userId, contentData) {
    const notification = {
      type: this.notificationTypes.CONTENT_PUBLISHED,
      title: 'Content Published Successfully',
      message: `Your post "${contentData.title}" has been published to ${contentData.platforms.join(', ')}`,
      priority: this.priorities.MEDIUM,
      data: {
        contentId: contentData.id,
        platforms: contentData.platforms,
        publishedAt: contentData.publishedAt
      },
      actions: [
        {
          label: 'View Post',
          action: 'view_content',
          data: { contentId: contentData.id }
        },
        {
          label: 'View Analytics',
          action: 'view_analytics',
          data: { contentId: contentData.id }
        }
      ]
    };

    return this.sendNotification(userId, notification);
  }

  async notifyContentScheduled(userId, contentData) {
    const notification = {
      type: this.notificationTypes.CONTENT_SCHEDULED,
      title: 'Content Scheduled',
      message: `Your post "${contentData.title}" has been scheduled for ${new Date(contentData.scheduledFor).toLocaleString()}`,
      priority: this.priorities.LOW,
      data: {
        contentId: contentData.id,
        scheduledFor: contentData.scheduledFor,
        platforms: contentData.platforms
      },
      actions: [
        {
          label: 'Edit Schedule',
          action: 'edit_schedule',
          data: { contentId: contentData.id }
        }
      ]
    };

    return this.sendNotification(userId, notification);
  }

  async notifyContentFailed(userId, contentData, error) {
    const notification = {
      type: this.notificationTypes.CONTENT_FAILED,
      title: 'Content Publishing Failed',
      message: `Failed to publish "${contentData.title}" to ${contentData.platform}. ${error}`,
      priority: this.priorities.HIGH,
      data: {
        contentId: contentData.id,
        platform: contentData.platform,
        error: error
      },
      actions: [
        {
          label: 'Retry Publishing',
          action: 'retry_publish',
          data: { contentId: contentData.id, platform: contentData.platform }
        },
        {
          label: 'Edit Content',
          action: 'edit_content',
          data: { contentId: contentData.id }
        }
      ]
    };

    return this.sendNotification(userId, notification);
  }

  // Analytics notifications
  async notifyAnalyticsMilestone(userId, milestoneData) {
    const notification = {
      type: this.notificationTypes.ANALYTICS_MILESTONE,
      title: 'Milestone Achieved! 🎉',
      message: `You've reached ${milestoneData.value} ${milestoneData.metric}!`,
      priority: this.priorities.MEDIUM,
      data: milestoneData,
      actions: [
        {
          label: 'View Analytics',
          action: 'view_analytics',
          data: { period: '30d' }
        }
      ]
    };

    return this.sendNotification(userId, notification);
  }

  async notifyEngagementSpike(userId, spikeData) {
    const notification = {
      type: this.notificationTypes.ENGAGEMENT_SPIKE,
      title: 'Engagement Spike Detected! 📈',
      message: `Your ${spikeData.contentType} is performing ${spikeData.increase}% better than usual`,
      priority: this.priorities.MEDIUM,
      data: spikeData,
      actions: [
        {
          label: 'View Content',
          action: 'view_content',
          data: { contentId: spikeData.contentId }
        }
      ]
    };

    return this.sendNotification(userId, notification);
  }

  // AI-related notifications
  async notifyAISuggestion(userId, suggestionData) {
    const notification = {
      type: this.notificationTypes.AI_SUGGESTION,
      title: 'AI Suggestion Available',
      message: suggestionData.message,
      priority: this.priorities.LOW,
      data: suggestionData,
      actions: [
        {
          label: 'View Suggestion',
          action: 'view_suggestion',
          data: { suggestionId: suggestionData.id }
        },
        {
          label: 'Apply Suggestion',
          action: 'apply_suggestion',
          data: { suggestionId: suggestionData.id }
        }
      ]
    };

    return this.sendNotification(userId, notification);
  }

  // Social media notifications
  async notifySocialMention(userId, mentionData) {
    const notification = {
      type: this.notificationTypes.SOCIAL_MENTION,
      title: 'New Mention',
      message: `You were mentioned by @${mentionData.author} on ${mentionData.platform}`,
      priority: this.priorities.MEDIUM,
      data: mentionData,
      actions: [
        {
          label: 'View Mention',
          action: 'view_mention',
          data: { mentionId: mentionData.id }
        },
        {
          label: 'Reply',
          action: 'reply_mention',
          data: { mentionId: mentionData.id }
        }
      ]
    };

    return this.sendNotification(userId, notification);
  }

  async notifyCommentReceived(userId, commentData) {
    const notification = {
      type: this.notificationTypes.COMMENT_RECEIVED,
      title: 'New Comment',
      message: `${commentData.author} commented on your post: "${commentData.preview}"`,
      priority: this.priorities.MEDIUM,
      data: commentData,
      actions: [
        {
          label: 'View Comment',
          action: 'view_comment',
          data: { commentId: commentData.id }
        },
        {
          label: 'Reply',
          action: 'reply_comment',
          data: { commentId: commentData.id }
        }
      ]
    };

    return this.sendNotification(userId, notification);
  }

  // Account notifications
  async notifyAccountConnected(userId, accountData) {
    const notification = {
      type: this.notificationTypes.ACCOUNT_CONNECTED,
      title: 'Account Connected',
      message: `Your ${accountData.platform} account (@${accountData.username}) has been connected successfully`,
      priority: this.priorities.LOW,
      data: accountData,
      actions: [
        {
          label: 'View Accounts',
          action: 'view_accounts',
          data: {}
        }
      ]
    };

    return this.sendNotification(userId, notification);
  }

  async notifyAccountDisconnected(userId, accountData) {
    const notification = {
      type: this.notificationTypes.ACCOUNT_DISCONNECTED,
      title: 'Account Disconnected',
      message: `Your ${accountData.platform} account has been disconnected`,
      priority: this.priorities.HIGH,
      data: accountData,
      actions: [
        {
          label: 'Reconnect Account',
          action: 'reconnect_account',
          data: { platform: accountData.platform }
        }
      ]
    };

    return this.sendNotification(userId, notification);
  }

  // System notifications
  async notifySystemUpdate(userId, updateData) {
    const notification = {
      type: this.notificationTypes.SYSTEM_UPDATE,
      title: 'System Update',
      message: updateData.message,
      priority: this.priorities.LOW,
      data: updateData,
      actions: updateData.actions || []
    };

    return this.sendNotification(userId, notification);
  }

  // Utility methods
  validateNotification(notification) {
    const required = ['type', 'title', 'message'];
    
    for (const field of required) {
      if (!notification[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return {
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority || this.priorities.MEDIUM,
      data: notification.data || {},
      actions: notification.actions || [],
      expiresAt: notification.expiresAt,
      category: notification.category || 'general'
    };
  }

  generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async storeNotification(notification) {
    // In a real implementation, you would store this in your database
    // For now, we'll use Redis for temporary storage
    if (socketService.redis) {
      const key = `notifications:${notification.userId}`;
      await socketService.redis.lpush(key, JSON.stringify(notification));
      await socketService.redis.ltrim(key, 0, 99); // Keep last 100 notifications
      await socketService.redis.expire(key, 2592000); // Expire after 30 days
    }
  }

  async getPendingNotifications(userId) {
    if (socketService.redis) {
      const key = `notifications:${userId}`;
      const notifications = await socketService.redis.lrange(key, 0, -1);
      return notifications.map(n => JSON.parse(n)).filter(n => !n.read);
    }
    return [];
  }

  async markNotificationRead(userId, notificationId) {
    if (socketService.redis) {
      const key = `notifications:${userId}`;
      const notifications = await socketService.redis.lrange(key, 0, -1);
      
      const updatedNotifications = notifications.map(n => {
        const notification = JSON.parse(n);
        if (notification.id === notificationId) {
          notification.read = true;
          notification.readAt = new Date();
        }
        return JSON.stringify(notification);
      });

      // Replace the list
      await socketService.redis.del(key);
      if (updatedNotifications.length > 0) {
        await socketService.redis.lpush(key, ...updatedNotifications);
        await socketService.redis.expire(key, 2592000);
      }
    }
  }

  async markAllNotificationsRead(userId) {
    if (socketService.redis) {
      const key = `notifications:${userId}`;
      const notifications = await socketService.redis.lrange(key, 0, -1);
      
      const updatedNotifications = notifications.map(n => {
        const notification = JSON.parse(n);
        notification.read = true;
        notification.readAt = new Date();
        return JSON.stringify(notification);
      });

      // Replace the list
      await socketService.redis.del(key);
      if (updatedNotifications.length > 0) {
        await socketService.redis.lpush(key, ...updatedNotifications);
        await socketService.redis.expire(key, 2592000);
      }
    }
  }

  async sendPushNotification(userId, notification) {
    // Implement push notification logic here
    // This would integrate with services like Firebase Cloud Messaging
    console.log(`Push notification sent to user ${userId}:`, notification.title);
  }

  async sendEmailNotification(userId, notification) {
    // Implement email notification logic here
    // This would integrate with your email service
    if (notification.priority === this.priorities.HIGH || notification.priority === this.priorities.URGENT) {
      console.log(`Email notification sent to user ${userId}:`, notification.title);
    }
  }

  // Real-time analytics updates
  async sendAnalyticsUpdate(userId, analyticsData) {
    socketService.sendAnalyticsUpdate(userId, analyticsData);
  }

  // Broadcast to all connected users
  async broadcastSystemNotification(notification) {
    const connectedUsers = socketService.getConnectedUsers();
    return this.sendBulkNotifications(connectedUsers, notification);
  }
}

module.exports = new NotificationService();
