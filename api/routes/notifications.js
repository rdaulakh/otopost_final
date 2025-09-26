const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for notification endpoints
const notificationRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 300, // limit each IP to 300 requests per 5 minutes
  message: 'Too many notification requests from this IP'
});

router.use(notificationRateLimit);
router.use(auth);

// Generate mock notification data
const generateMockNotifications = () => {
  const notificationTypes = ['alert', 'info', 'warning', 'success', 'error'];
  const categories = ['system', 'customer', 'business', 'api', 'billing', 'security', 'performance'];
  const severities = ['low', 'medium', 'high', 'critical'];
  const channels = ['email', 'sms', 'slack', 'webhook', 'push', 'in-app'];
  
  const notifications = [];
  for (let i = 1; i <= 100; i++) {
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const isRead = Math.random() > 0.3;
    const isResolved = Math.random() > 0.4;
    
    notifications.push({
      id: `notification_${i}`,
      title: `Notification ${i}`,
      message: `This is a sample notification message for notification ${i}`,
      type: notificationTypes[Math.floor(Math.random() * notificationTypes.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      channel: channels[Math.floor(Math.random() * channels.length)],
      recipient: 'admin@platform.com',
      created_at: createdAt.toISOString(),
      read_at: isRead ? new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString() : null,
      resolved_at: isResolved ? new Date(createdAt.getTime() + Math.random() * 48 * 60 * 60 * 1000).toISOString() : null,
      is_read: isRead,
      is_resolved: isResolved,
      metadata: {
        source: 'system',
        rule_id: `rule_${Math.floor(Math.random() * 20) + 1}`,
        triggered_by: 'automated_monitoring',
        escalation_level: Math.floor(Math.random() * 3) + 1
      },
      actions: [
        { id: 'acknowledge', label: 'Acknowledge', type: 'primary' },
        { id: 'resolve', label: 'Resolve', type: 'success' },
        { id: 'escalate', label: 'Escalate', type: 'warning' }
      ]
    });
  }
  
  return notifications;
};

const generateMockAlertRules = () => {
  return [
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
    },
    {
      id: 'rule_3',
      name: 'Revenue Milestone',
      description: 'Alert when daily revenue exceeds $15,000',
      category: 'business',
      severity: 'low',
      condition: 'daily_revenue > 15000',
      duration: 'immediate',
      channels: ['email', 'slack'],
      recipients: ['finance@platform.com', '#revenue'],
      enabled: true,
      triggered: 8,
      last_triggered: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'rule_4',
      name: 'API Rate Limit Exceeded',
      description: 'Alert when API rate limit is exceeded',
      category: 'api',
      severity: 'medium',
      condition: 'api_requests > rate_limit',
      duration: '1m',
      channels: ['email', 'webhook'],
      recipients: ['dev@platform.com'],
      enabled: true,
      triggered: 23,
      last_triggered: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: 'active',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'rule_5',
      name: 'Failed Payment Alert',
      description: 'Alert when payment processing fails',
      category: 'billing',
      severity: 'high',
      condition: 'payment_failed = true',
      duration: 'immediate',
      channels: ['email', 'sms', 'slack'],
      recipients: ['billing@platform.com', '#billing-alerts'],
      enabled: true,
      triggered: 7,
      last_triggered: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    }
  ];
};

// @route   GET /api/notifications/stats
// @desc    Get notification statistics
// @access  Authenticated
router.get('/stats', async (req, res) => {
  try {
    const notifications = generateMockNotifications();
    const alertRules = generateMockAlertRules();
    
    const stats = {
      total_notifications: notifications.length,
      unread_notifications: notifications.filter(n => !n.is_read).length,
      unresolved_notifications: notifications.filter(n => !n.is_resolved).length,
      critical_alerts: notifications.filter(n => n.severity === 'critical').length,
      
      // Today's activity
      notifications_today: notifications.filter(n => {
        const today = new Date();
        const notificationDate = new Date(n.created_at);
        return notificationDate.toDateString() === today.toDateString();
      }).length,
      
      resolved_today: notifications.filter(n => {
        if (!n.resolved_at) return false;
        const today = new Date();
        const resolvedDate = new Date(n.resolved_at);
        return resolvedDate.toDateString() === today.toDateString();
      }).length,
      
      // Alert rules
      total_alert_rules: alertRules.length,
      active_alert_rules: alertRules.filter(r => r.enabled).length,
      triggered_rules_today: alertRules.filter(r => {
        if (!r.last_triggered) return false;
        const today = new Date();
        const triggeredDate = new Date(r.last_triggered);
        return triggeredDate.toDateString() === today.toDateString();
      }).length,
      
      // Channel statistics
      channel_distribution: {
        email: notifications.filter(n => n.channel === 'email').length,
        sms: notifications.filter(n => n.channel === 'sms').length,
        slack: notifications.filter(n => n.channel === 'slack').length,
        webhook: notifications.filter(n => n.channel === 'webhook').length,
        push: notifications.filter(n => n.channel === 'push').length,
        'in-app': notifications.filter(n => n.channel === 'in-app').length
      },
      
      // Severity distribution
      severity_distribution: {
        low: notifications.filter(n => n.severity === 'low').length,
        medium: notifications.filter(n => n.severity === 'medium').length,
        high: notifications.filter(n => n.severity === 'high').length,
        critical: notifications.filter(n => n.severity === 'critical').length
      },
      
      // Performance metrics
      avg_response_time: '2.3 min',
      delivery_rate: 99.2,
      escalations: 8,
      subscribers: 156,
      
      last_updated: new Date()
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics',
      error: error.message
    });
  }
});

// @route   GET /api/notifications
// @desc    Get notifications with filtering and pagination
// @access  Authenticated
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type = 'all',
      category = 'all',
      severity = 'all',
      channel = 'all',
      status = 'all', // all, read, unread, resolved, unresolved
      search = '',
      sortBy = 'created_at',
      sortOrder = 'desc',
      date_from,
      date_to
    } = req.query;

    let notifications = generateMockNotifications();

    // Apply filters
    if (type !== 'all') {
      notifications = notifications.filter(n => n.type === type);
    }
    
    if (category !== 'all') {
      notifications = notifications.filter(n => n.category === category);
    }
    
    if (severity !== 'all') {
      notifications = notifications.filter(n => n.severity === severity);
    }
    
    if (channel !== 'all') {
      notifications = notifications.filter(n => n.channel === channel);
    }
    
    if (status !== 'all') {
      switch (status) {
        case 'read':
          notifications = notifications.filter(n => n.is_read);
          break;
        case 'unread':
          notifications = notifications.filter(n => !n.is_read);
          break;
        case 'resolved':
          notifications = notifications.filter(n => n.is_resolved);
          break;
        case 'unresolved':
          notifications = notifications.filter(n => !n.is_resolved);
          break;
      }
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      notifications = notifications.filter(n => 
        n.title.toLowerCase().includes(searchLower) ||
        n.message.toLowerCase().includes(searchLower) ||
        n.category.toLowerCase().includes(searchLower)
      );
    }
    
    if (date_from) {
      notifications = notifications.filter(n => new Date(n.created_at) >= new Date(date_from));
    }
    
    if (date_to) {
      notifications = notifications.filter(n => new Date(n.created_at) <= new Date(date_to));
    }

    // Sort notifications
    notifications.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'created_at' || sortBy === 'read_at' || sortBy === 'resolved_at') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedNotifications = notifications.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(notifications.length / limit),
          total: notifications.length,
          limit: parseInt(limit)
        },
        filters: {
          type,
          category,
          severity,
          channel,
          status,
          search,
          sortBy,
          sortOrder,
          date_from,
          date_to
        }
      }
    });

  } catch (error) {
    console.error('Notifications list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// @route   GET /api/notifications/alert-rules
// @desc    Get alert rules with filtering
// @access  Admin
router.get('/alert-rules', adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category = 'all',
      severity = 'all',
      status = 'all', // all, active, inactive
      search = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    let alertRules = generateMockAlertRules();

    // Apply filters
    if (category !== 'all') {
      alertRules = alertRules.filter(r => r.category === category);
    }
    
    if (severity !== 'all') {
      alertRules = alertRules.filter(r => r.severity === severity);
    }
    
    if (status !== 'all') {
      switch (status) {
        case 'active':
          alertRules = alertRules.filter(r => r.enabled);
          break;
        case 'inactive':
          alertRules = alertRules.filter(r => !r.enabled);
          break;
      }
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      alertRules = alertRules.filter(r => 
        r.name.toLowerCase().includes(searchLower) ||
        r.description.toLowerCase().includes(searchLower) ||
        r.category.toLowerCase().includes(searchLower)
      );
    }

    // Sort alert rules
    alertRules.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'created_at' || sortBy === 'updated_at' || sortBy === 'last_triggered') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedRules = alertRules.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        alert_rules: paginatedRules,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(alertRules.length / limit),
          total: alertRules.length,
          limit: parseInt(limit)
        },
        filters: {
          category,
          severity,
          status,
          search,
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error) {
    console.error('Alert rules error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alert rules',
      error: error.message
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Authenticated
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: {
        id,
        is_read: true,
        read_at: new Date().toISOString(),
        read_by: req.user.email
      }
    });

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

// @route   PUT /api/notifications/:id/resolve
// @desc    Resolve notification
// @access  Authenticated
router.put('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution_note = '' } = req.body;

    res.json({
      success: true,
      message: 'Notification resolved successfully',
      data: {
        id,
        is_resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: req.user.email,
        resolution_note
      }
    });

  } catch (error) {
    console.error('Resolve notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve notification',
      error: error.message
    });
  }
});

// @route   POST /api/notifications/bulk-action
// @desc    Perform bulk actions on notifications
// @access  Authenticated
router.post('/bulk-action', async (req, res) => {
  try {
    const { notification_ids, action, note = '' } = req.body;

    if (!notification_ids || !Array.isArray(notification_ids) || notification_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Notification IDs are required'
      });
    }

    if (!['read', 'unread', 'resolve', 'delete'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }

    res.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      data: {
        action,
        notification_ids,
        processed_count: notification_ids.length,
        processed_at: new Date().toISOString(),
        processed_by: req.user.email,
        note
      }
    });

  } catch (error) {
    console.error('Bulk notification action error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk action',
      error: error.message
    });
  }
});

// @route   POST /api/notifications/alert-rules
// @desc    Create new alert rule
// @access  Admin
router.post('/alert-rules', adminAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      severity,
      condition,
      duration,
      channels,
      recipients
    } = req.body;

    // Validation
    if (!name || !description || !category || !severity || !condition) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, category, severity, and condition are required'
      });
    }

    const newRule = {
      id: `rule_${Date.now()}`,
      name,
      description,
      category,
      severity,
      condition,
      duration: duration || 'immediate',
      channels: channels || ['email'],
      recipients: recipients || [],
      enabled: true,
      triggered: 0,
      last_triggered: null,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: req.user.email
    };

    res.status(201).json({
      success: true,
      message: 'Alert rule created successfully',
      data: newRule
    });

  } catch (error) {
    console.error('Create alert rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create alert rule',
      error: error.message
    });
  }
});

// @route   PUT /api/notifications/alert-rules/:id
// @desc    Update alert rule
// @access  Admin
router.put('/alert-rules/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    res.json({
      success: true,
      message: 'Alert rule updated successfully',
      data: {
        id,
        ...updates,
        updated_at: new Date().toISOString(),
        updated_by: req.user.email
      }
    });

  } catch (error) {
    console.error('Update alert rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update alert rule',
      error: error.message
    });
  }
});

// @route   DELETE /api/notifications/alert-rules/:id
// @desc    Delete alert rule
// @access  Admin
router.delete('/alert-rules/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    res.json({
      success: true,
      message: 'Alert rule deleted successfully',
      data: {
        id,
        deleted_at: new Date().toISOString(),
        deleted_by: req.user.email
      }
    });

  } catch (error) {
    console.error('Delete alert rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete alert rule',
      error: error.message
    });
  }
});

// @route   POST /api/notifications/test
// @desc    Test notification delivery
// @access  Admin
router.post('/test', adminAuth, async (req, res) => {
  try {
    const { channel, recipient, message = 'Test notification from AI Social Media Platform' } = req.body;

    if (!channel || !recipient) {
      return res.status(400).json({
        success: false,
        message: 'Channel and recipient are required'
      });
    }

    // In production, this would actually send the test notification
    res.json({
      success: true,
      message: 'Test notification sent successfully',
      data: {
        channel,
        recipient,
        message,
        sent_at: new Date().toISOString(),
        test_id: `test_${Date.now()}`,
        delivery_status: 'delivered'
      }
    });

  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: error.message
    });
  }
});

module.exports = router;
