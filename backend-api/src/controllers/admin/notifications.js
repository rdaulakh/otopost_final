const Notification = require('../../models/Notification');
const User = require('../../models/User');
const Organization = require('../../models/Organization');
const logger = require('../../utils/logger');

const adminNotificationController = {
  // Get all notifications with pagination and filters
  getAllNotifications: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        type = '',
        status = '',
        priority = '',
        userId = '',
        organizationId = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        startDate = '',
        endDate = ''
      } = req.query;

      // Build query
      const query = {};
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } },
          { type: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (type) query.type = type;
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (userId) query.userId = userId;
      if (organizationId) query.organizationId = organizationId;
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [notifications, total] = await Promise.all([
        Notification.find(query)
          .populate('userId', 'firstName lastName email username')
          .populate('organizationId', 'name')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Notification.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'notifications_list_viewed', 'notification', null, {
        query: req.query,
        ip: req.ip
      });

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages
          }
        }
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminNotification.getAllNotifications',
        adminId: req.admin._id,
        query: req.query,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get notifications',
        code: 'ADMIN_NOTIFICATION_LIST_ERROR'
      });
    }
  },

  // Get notification statistics
  getNotificationStats: async (req, res) => {
    try {
      const { timeRange = '30d', startDate = '', endDate = '' } = req.query;

      // Calculate date range
      const end = new Date();
      let start;
      
      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
      } else {
        switch (timeRange) {
          case '7d':
            start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '90d':
            start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case '1y':
            start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
      }

      const [
        totalNotifications,
        sentNotifications,
        pendingNotifications,
        failedNotifications,
        notificationsByType,
        notificationsByStatus,
        notificationsByPriority,
        deliveryStats
      ] = await Promise.all([
        Notification.countDocuments({ createdAt: { $gte: start, $lte: end } }),
        Notification.countDocuments({ 
          createdAt: { $gte: start, $lte: end },
          status: 'sent'
        }),
        Notification.countDocuments({ 
          createdAt: { $gte: start, $lte: end },
          status: 'pending'
        }),
        Notification.countDocuments({ 
          createdAt: { $gte: start, $lte: end },
          status: 'failed'
        }),
        Notification.aggregate([
          {
            $match: { createdAt: { $gte: start, $lte: end } }
          },
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 }
            }
          }
        ]),
        Notification.aggregate([
          {
            $match: { createdAt: { $gte: start, $lte: end } }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]),
        Notification.aggregate([
          {
            $match: { createdAt: { $gte: start, $lte: end } }
          },
          {
            $group: {
              _id: '$priority',
              count: { $sum: 1 }
            }
          }
        ]),
        Notification.aggregate([
          {
            $match: { 
              createdAt: { $gte: start, $lte: end },
              status: 'sent'
            }
          },
          {
            $group: {
              _id: null,
              totalDelivered: { $sum: 1 },
              totalOpened: { $sum: '$analytics.opens' },
              totalClicked: { $sum: '$analytics.clicks' },
              avgOpenRate: { $avg: '$analytics.openRate' },
              avgClickRate: { $avg: '$analytics.clickRate' }
            }
          }
        ])
      ]);

      const stats = {
        overview: {
          total: totalNotifications,
          sent: sentNotifications,
          pending: pendingNotifications,
          failed: failedNotifications
        },
        byType: notificationsByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byStatus: notificationsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byPriority: notificationsByPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        delivery: deliveryStats[0] || {
          totalDelivered: 0,
          totalOpened: 0,
          totalClicked: 0,
          avgOpenRate: 0,
          avgClickRate: 0
        },
        period: { start, end }
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminNotification.getNotificationStats',
        adminId: req.admin._id,
        query: req.query,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get notification statistics',
        code: 'ADMIN_NOTIFICATION_STATS_ERROR'
      });
    }
  },

  // Get notification by ID
  getNotificationById: async (req, res) => {
    try {
      const { id } = req.params;

      const notification = await Notification.findById(id)
        .populate('userId', 'firstName lastName email username')
        .populate('organizationId', 'name');

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
          code: 'NOTIFICATION_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        data: { notification }
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminNotification.getNotificationById',
        adminId: req.admin._id,
        notificationId: req.params.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get notification',
        code: 'ADMIN_NOTIFICATION_GET_ERROR'
      });
    }
  },

  // Get notification analytics
  getNotificationAnalytics: async (req, res) => {
    try {
      const { id } = req.params;
      const { timeRange = '30d' } = req.query;

      const notification = await Notification.findById(id);
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
          code: 'NOTIFICATION_NOT_FOUND'
        });
      }

      // For now, return basic analytics
      // In a real implementation, you would have more detailed analytics
      const analytics = {
        opens: notification.analytics?.opens || 0,
        clicks: notification.analytics?.clicks || 0,
        openRate: notification.analytics?.openRate || 0,
        clickRate: notification.analytics?.clickRate || 0,
        delivered: notification.analytics?.delivered || 0,
        bounced: notification.analytics?.bounced || 0
      };

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminNotification.getNotificationAnalytics',
        adminId: req.admin._id,
        notificationId: req.params.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get notification analytics',
        code: 'ADMIN_NOTIFICATION_ANALYTICS_ERROR'
      });
    }
  },

  // Create notification
  createNotification: async (req, res) => {
    try {
      const notificationData = {
        ...req.body,
        createdBy: req.admin._id,
        createdAt: new Date()
      };

      const notification = await Notification.create(notificationData);

      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'notification_created', 'notification', notification._id, {
        type: notification.type,
        ip: req.ip
      });

      res.status(201).json({
        success: true,
        data: { notification }
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminNotification.createNotification',
        adminId: req.admin._id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to create notification',
        code: 'ADMIN_NOTIFICATION_CREATE_ERROR'
      });
    }
  },

  // Update notification
  updateNotification: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };

      const notification = await Notification.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).populate('userId', 'firstName lastName email');

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
          code: 'NOTIFICATION_NOT_FOUND'
        });
      }

      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'notification_updated', 'notification', id, {
        ip: req.ip
      });

      res.json({
        success: true,
        data: { notification }
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminNotification.updateNotification',
        adminId: req.admin._id,
        notificationId: req.params.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to update notification',
        code: 'ADMIN_NOTIFICATION_UPDATE_ERROR'
      });
    }
  },

  // Delete notification
  deleteNotification: async (req, res) => {
    try {
      const { id } = req.params;

      const notification = await Notification.findByIdAndDelete(id);
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
          code: 'NOTIFICATION_NOT_FOUND'
        });
      }

      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'notification_deleted', 'notification', id, {
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminNotification.deleteNotification',
        adminId: req.admin._id,
        notificationId: req.params.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to delete notification',
        code: 'ADMIN_NOTIFICATION_DELETE_ERROR'
      });
    }
  },

  // Moderate notification
  moderateNotification: async (req, res) => {
    try {
      const { id } = req.params;
      const { action, reason, notes } = req.body;

      const notification = await Notification.findById(id);
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
          code: 'NOTIFICATION_NOT_FOUND'
        });
      }

      // Update notification based on moderation action
      const updateData = {
        moderation: {
          status: action,
          reason,
          notes,
          moderatedBy: req.admin._id,
          moderatedAt: new Date()
        }
      };

      if (action === 'approved') {
        updateData.status = 'sent';
      } else if (action === 'rejected') {
        updateData.status = 'rejected';
      }

      const updatedNotification = await Notification.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).populate('userId', 'firstName lastName email');

      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'notification_moderated', 'notification', id, {
        action,
        reason,
        ip: req.ip
      });

      res.json({
        success: true,
        data: { notification: updatedNotification }
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminNotification.moderateNotification',
        adminId: req.admin._id,
        notificationId: req.params.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to moderate notification',
        code: 'ADMIN_NOTIFICATION_MODERATION_ERROR'
      });
    }
  },

  // Update notification status
  updateNotificationStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const notification = await Notification.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).populate('userId', 'firstName lastName email');

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
          code: 'NOTIFICATION_NOT_FOUND'
        });
      }

      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'notification_status_updated', 'notification', id, {
        status,
        ip: req.ip
      });

      res.json({
        success: true,
        data: { notification }
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminNotification.updateNotificationStatus',
        adminId: req.admin._id,
        notificationId: req.params.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to update notification status',
        code: 'ADMIN_NOTIFICATION_STATUS_UPDATE_ERROR'
      });
    }
  },

  // Get notification templates
  getNotificationTemplates: async (req, res) => {
    try {
      const { type = '', category = '' } = req.query;

      const query = {};
      if (type) query.type = type;
      if (category) query.category = category;

      const templates = await Notification.find({ isTemplate: true, ...query })
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: templates
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminNotification.getNotificationTemplates',
        adminId: req.admin._id,
        query: req.query,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get notification templates',
        code: 'ADMIN_NOTIFICATION_TEMPLATES_ERROR'
      });
    }
  },

  // Create notification template
  createNotificationTemplate: async (req, res) => {
    try {
      const templateData = {
        ...req.body,
        isTemplate: true,
        createdBy: req.admin._id,
        createdAt: new Date()
      };

      const template = await Notification.create(templateData);

      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'notification_template_created', 'notification', template._id, {
        type: template.type,
        ip: req.ip
      });

      res.status(201).json({
        success: true,
        data: { template }
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminNotification.createNotificationTemplate',
        adminId: req.admin._id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to create notification template',
        code: 'ADMIN_NOTIFICATION_TEMPLATE_CREATE_ERROR'
      });
    }
  },

  // Update notification template
  updateNotificationTemplate: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };

      const template = await Notification.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Notification template not found',
          code: 'NOTIFICATION_TEMPLATE_NOT_FOUND'
        });
      }

      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'notification_template_updated', 'notification', id, {
        ip: req.ip
      });

      res.json({
        success: true,
        data: { template }
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminNotification.updateNotificationTemplate',
        adminId: req.admin._id,
        templateId: req.params.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to update notification template',
        code: 'ADMIN_NOTIFICATION_TEMPLATE_UPDATE_ERROR'
      });
    }
  },

  // Delete notification template
  deleteNotificationTemplate: async (req, res) => {
    try {
      const { id } = req.params;

      const template = await Notification.findByIdAndDelete(id);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Notification template not found',
          code: 'NOTIFICATION_TEMPLATE_NOT_FOUND'
        });
      }

      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'notification_template_deleted', 'notification', id, {
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Notification template deleted successfully'
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminNotification.deleteNotificationTemplate',
        adminId: req.admin._id,
        templateId: req.params.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to delete notification template',
        code: 'ADMIN_NOTIFICATION_TEMPLATE_DELETE_ERROR'
      });
    }
  },

  // Send bulk notification
  sendBulkNotification: async (req, res) => {
    try {
      const { recipients, notificationData } = req.body;

      // Create notifications for each recipient
      const notifications = await Promise.all(
        recipients.map(recipientId => 
          Notification.create({
            ...notificationData,
            userId: recipientId,
            createdBy: req.admin._id,
            createdAt: new Date()
          })
        )
      );

      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'bulk_notification_sent', 'notification', null, {
        recipientCount: recipients.length,
        ip: req.ip
      });

      res.json({
        success: true,
        data: { 
          notifications,
          count: notifications.length
        }
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminNotification.sendBulkNotification',
        adminId: req.admin._id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to send bulk notification',
        code: 'ADMIN_BULK_NOTIFICATION_ERROR'
      });
    }
  },

  // Export notifications
  exportNotifications: async (req, res) => {
    try {
      const { format = 'csv', filters = {} } = req.query;

      // Build query from filters
      const query = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) query[key] = value;
      });

      const notifications = await Notification.find(query)
        .populate('userId', 'firstName lastName email')
        .populate('organizationId', 'name')
        .sort({ createdAt: -1 });

      // Convert to CSV format
      const csvData = notifications.map(item => ({
        ID: item._id,
        Title: item.title,
        Type: item.type,
        Status: item.status,
        Priority: item.priority,
        Recipient: item.userId ? `${item.userId.firstName} ${item.userId.lastName}` : 'N/A',
        Organization: item.organizationId?.name || 'N/A',
        CreatedAt: item.createdAt,
        SentAt: item.sentAt,
        Opens: item.analytics?.opens || 0,
        Clicks: item.analytics?.clicks || 0
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=notifications-export.csv');
      
      // Simple CSV conversion
      const csv = [
        Object.keys(csvData[0] || {}).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      res.send(csv);

    } catch (error) {
      logger.logError(error, {
        controller: 'adminNotification.exportNotifications',
        adminId: req.admin._id,
        query: req.query,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to export notifications',
        code: 'ADMIN_NOTIFICATION_EXPORT_ERROR'
      });
    }
  },

  // Search notifications
  searchNotifications: async (req, res) => {
    try {
      const { q, limit = 20, type = '', status = '' } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required',
          code: 'SEARCH_QUERY_REQUIRED'
        });
      }

      const query = {
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { message: { $regex: q, $options: 'i' } },
          { type: { $regex: q, $options: 'i' } }
        ]
      };

      if (type) query.type = type;
      if (status) query.status = status;

      const notifications = await Notification.find(query)
        .populate('userId', 'firstName lastName username')
        .populate('organizationId', 'name')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: { notifications }
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminNotification.searchNotifications',
        adminId: req.admin._id,
        query: req.query,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to search notifications',
        code: 'ADMIN_NOTIFICATION_SEARCH_ERROR'
      });
    }
  },

  // Get notification analytics overview
  getNotificationAnalyticsOverview: async (req, res) => {
    try {
      const { timeRange = '30d' } = req.query;

      // Calculate date range
      const end = new Date();
      let start;
      switch (timeRange) {
        case '7d':
          start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const analytics = await Notification.aggregate([
        {
          $match: { 
            createdAt: { $gte: start, $lte: end },
            status: 'sent'
          }
        },
        {
          $group: {
            _id: null,
            totalSent: { $sum: 1 },
            totalOpens: { $sum: '$analytics.opens' },
            totalClicks: { $sum: '$analytics.clicks' },
            avgOpenRate: { $avg: '$analytics.openRate' },
            avgClickRate: { $avg: '$analytics.clickRate' }
          }
        }
      ]);

      res.json({
        success: true,
        data: analytics[0] || {
          totalSent: 0,
          totalOpens: 0,
          totalClicks: 0,
          avgOpenRate: 0,
          avgClickRate: 0
        }
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminNotification.getNotificationAnalyticsOverview',
        adminId: req.admin._id,
        query: req.query,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get notification analytics overview',
        code: 'ADMIN_NOTIFICATION_ANALYTICS_OVERVIEW_ERROR'
      });
    }
  }
};

module.exports = adminNotificationController;
