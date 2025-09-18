const express = require('express');
const { auth } = require('../middleware/auth');
const socketService = require('../services/socketService');
const notificationService = require('../services/notificationService');
const realTimeAnalyticsService = require('../services/realTimeAnalyticsService');

const router = express.Router();

// @route   GET /api/realtime/status
// @desc    Get real-time service status
// @access  Private
router.get('/status', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const isOnline = socketService.isUserOnline(userId);
    const socketInfo = socketService.getUserSocketInfo(userId);
    const analyticsStats = realTimeAnalyticsService.getServiceStats();

    res.json({
      message: 'Real-time service status',
      status: {
        isOnline,
        socketInfo: socketInfo ? {
          connectedAt: socketInfo.connectedAt,
          roomCount: socketInfo.rooms.size
        } : null,
        connectedUsers: socketService.getConnectedUsers().length,
        analyticsStats
      }
    });
  } catch (error) {
    console.error('Real-time status error:', error);
    res.status(500).json({
      message: 'Error retrieving real-time status',
      error: error.message
    });
  }
});

// @route   POST /api/realtime/notifications/send
// @desc    Send a notification to a user
// @access  Private
router.post('/notifications/send', auth, async (req, res) => {
  try {
    const { targetUserId, notification } = req.body;
    
    // Validate input
    if (!targetUserId || !notification) {
      return res.status(400).json({
        message: 'Target user ID and notification data are required'
      });
    }

    // Check if sender has permission (implement your authorization logic)
    // For now, we'll allow users to send notifications to themselves
    if (targetUserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Insufficient permissions to send notification'
      });
    }

    const result = await notificationService.sendNotification(targetUserId, notification);

    if (result.success) {
      res.status(201).json({
        message: 'Notification sent successfully',
        notificationId: result.notificationId,
        delivered: result.delivered
      });
    } else {
      res.status(400).json({
        message: 'Failed to send notification',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      message: 'Error sending notification',
      error: error.message
    });
  }
});

// @route   GET /api/realtime/notifications/pending
// @desc    Get pending notifications for the current user
// @access  Private
router.get('/notifications/pending', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await notificationService.getPendingNotifications(userId);

    res.json({
      message: 'Pending notifications retrieved',
      notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Get pending notifications error:', error);
    res.status(500).json({
      message: 'Error retrieving pending notifications',
      error: error.message
    });
  }
});

// @route   PUT /api/realtime/notifications/:notificationId/read
// @desc    Mark a notification as read
// @access  Private
router.put('/notifications/:notificationId/read', auth, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    await notificationService.markNotificationRead(userId, notificationId);

    res.json({
      message: 'Notification marked as read',
      notificationId
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      message: 'Error marking notification as read',
      error: error.message
    });
  }
});

// @route   PUT /api/realtime/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/notifications/read-all', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    await notificationService.markAllNotificationsRead(userId);

    res.json({
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      message: 'Error marking all notifications as read',
      error: error.message
    });
  }
});

// @route   POST /api/realtime/analytics/subscribe
// @desc    Subscribe to real-time analytics updates
// @access  Private
router.post('/analytics/subscribe', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const subscriptionData = req.body;

    const result = await realTimeAnalyticsService.subscribeToAnalytics(userId, subscriptionData);

    if (result.success) {
      res.status(201).json({
        message: result.message,
        subscriptionId: result.subscriptionId
      });
    } else {
      res.status(400).json({
        message: result.message,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Analytics subscription error:', error);
    res.status(500).json({
      message: 'Error subscribing to analytics',
      error: error.message
    });
  }
});

// @route   DELETE /api/realtime/analytics/subscribe/:subscriptionId
// @desc    Unsubscribe from real-time analytics updates
// @access  Private
router.delete('/analytics/subscribe/:subscriptionId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId } = req.params;

    const result = await realTimeAnalyticsService.unsubscribeFromAnalytics(userId, subscriptionId);

    if (result.success) {
      res.json({
        message: result.message
      });
    } else {
      res.status(404).json({
        message: result.message
      });
    }
  } catch (error) {
    console.error('Analytics unsubscription error:', error);
    res.status(500).json({
      message: 'Error unsubscribing from analytics',
      error: error.message
    });
  }
});

// @route   DELETE /api/realtime/analytics/subscribe-all
// @desc    Unsubscribe from all real-time analytics updates
// @access  Private
router.delete('/analytics/subscribe-all', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await realTimeAnalyticsService.unsubscribeAllAnalytics(userId);

    res.json({
      message: result.message
    });
  } catch (error) {
    console.error('Analytics unsubscribe all error:', error);
    res.status(500).json({
      message: 'Error unsubscribing from all analytics',
      error: error.message
    });
  }
});

// @route   POST /api/realtime/analytics/push
// @desc    Manually push analytics data (for testing or external triggers)
// @access  Private
router.post('/analytics/push', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        message: 'Analytics data is required'
      });
    }

    await realTimeAnalyticsService.pushAnalyticsUpdate(userId, data);

    res.json({
      message: 'Analytics data pushed successfully'
    });
  } catch (error) {
    console.error('Analytics push error:', error);
    res.status(500).json({
      message: 'Error pushing analytics data',
      error: error.message
    });
  }
});

// @route   POST /api/realtime/broadcast
// @desc    Broadcast a message to a room (admin only)
// @access  Private (Admin)
router.post('/broadcast', auth, async (req, res) => {
  try {
    // Check admin permissions
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Admin access required'
      });
    }

    const { roomId, event, data } = req.body;

    if (!roomId || !event) {
      return res.status(400).json({
        message: 'Room ID and event are required'
      });
    }

    socketService.broadcastToRoom(roomId, event, data);

    res.json({
      message: 'Message broadcasted successfully',
      roomId,
      event
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({
      message: 'Error broadcasting message',
      error: error.message
    });
  }
});

// @route   GET /api/realtime/connected-users
// @desc    Get list of connected users (admin only)
// @access  Private (Admin)
router.get('/connected-users', auth, async (req, res) => {
  try {
    // Check admin permissions
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Admin access required'
      });
    }

    const connectedUsers = socketService.getConnectedUsers();

    res.json({
      message: 'Connected users retrieved',
      connectedUsers,
      count: connectedUsers.length
    });
  } catch (error) {
    console.error('Get connected users error:', error);
    res.status(500).json({
      message: 'Error retrieving connected users',
      error: error.message
    });
  }
});

// @route   POST /api/realtime/test-notification
// @desc    Send a test notification (for development)
// @access  Private
router.post('/test-notification', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'test' } = req.body;

    let notification;

    switch (type) {
      case 'content_published':
        notification = {
          type: 'content_published',
          title: 'Test: Content Published',
          message: 'Your test post has been published successfully',
          priority: 'medium',
          data: { contentId: 'test_123' }
        };
        break;
      
      case 'analytics_milestone':
        notification = {
          type: 'analytics_milestone',
          title: 'Test: Milestone Achieved',
          message: 'You\'ve reached 1,000 followers!',
          priority: 'medium',
          data: { metric: 'followers', value: 1000 }
        };
        break;
      
      default:
        notification = {
          type: 'system_update',
          title: 'Test Notification',
          message: 'This is a test notification from the real-time system',
          priority: 'low',
          data: { test: true }
        };
    }

    const result = await notificationService.sendNotification(userId, notification);

    res.json({
      message: 'Test notification sent',
      result
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      message: 'Error sending test notification',
      error: error.message
    });
  }
});

module.exports = router;
