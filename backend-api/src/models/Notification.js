const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
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
    ],
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    default: 'unread',
    index: true
  },
  readAt: {
    type: Date
  },
  archivedAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  },
  isEmailSent: {
    type: Boolean,
    default: false
  },
  isPushSent: {
    type: Boolean,
    default: false
  },
  isInAppSent: {
    type: Boolean,
    default: true
  },
  metadata: {
    source: String,
    platform: String,
    campaignId: String,
    contentId: String,
    agentId: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
notificationSchema.index({ user: 1, status: 1, createdAt: -1 });
notificationSchema.index({ organization: 1, type: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, status: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for time since creation
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
});

// Static method to create notification
notificationSchema.statics.createNotification = async function(notificationData) {
  try {
    const notification = new this(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    throw new Error(`Failed to create notification: ${error.message}`);
  }
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  const {
    status = 'unread',
    type,
    priority,
    limit = 50,
    skip = 0,
    sortBy = 'createdAt',
    sortOrder = -1
  } = options;

  const query = { user: userId };
  
  if (status !== 'all') query.status = status;
  if (type) query.type = type;
  if (priority) query.priority = priority;

  const sort = {};
  sort[sortBy] = sortOrder;

  return await this.find(query)
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('user', 'username email firstName lastName')
    .populate('organization', 'name');
};

// Static method to mark as read
notificationSchema.statics.markAsRead = async function(notificationId, userId) {
  return await this.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { 
      status: 'read',
      readAt: new Date()
    },
    { new: true }
  );
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { user: userId, status: 'unread' },
    { 
      status: 'read',
      readAt: new Date()
    }
  );
};

// Static method to archive notification
notificationSchema.statics.archiveNotification = async function(notificationId, userId) {
  return await this.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { 
      status: 'archived',
      archivedAt: new Date()
    },
    { new: true }
  );
};

// Static method to get notification stats
notificationSchema.statics.getNotificationStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    unread: 0,
    read: 0,
    archived: 0,
    total: 0
  };

  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  return result;
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

// Instance method to archive
notificationSchema.methods.archive = function() {
  this.status = 'archived';
  this.archivedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);

