const mongoose = require('mongoose');

const socialAccountSchema = new mongoose.Schema({
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
  platform: {
    type: String,
    required: true,
    enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'snapchat'],
    index: true
  },
  accountId: {
    type: String,
    required: true
  },
  accountName: {
    type: String,
    required: true
  },
  accountUsername: {
    type: String,
    required: true
  },
  accountUrl: {
    type: String
  },
  profilePicture: {
    type: String
  },
  followersCount: {
    type: Number,
    default: 0
  },
  followingCount: {
    type: Number,
    default: 0
  },
  postsCount: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isConnected: {
    type: Boolean,
    default: true,
    index: true
  },
  lastSyncAt: {
    type: Date,
    default: Date.now
  },
  syncStatus: {
    type: String,
    enum: ['syncing', 'synced', 'failed', 'never'],
    default: 'never'
  },
  syncError: {
    type: String
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String
  },
  tokenExpiresAt: {
    type: Date
  },
  permissions: [{
    type: String,
    enum: [
      'read_insights',
      'publish_posts',
      'manage_posts',
      'read_audience',
      'manage_comments',
      'read_messages',
      'manage_ads',
      'read_analytics'
    ]
  }],
  settings: {
    autoPost: {
      type: Boolean,
      default: false
    },
    autoRespond: {
      type: Boolean,
      default: false
    },
    syncFrequency: {
      type: String,
      enum: ['realtime', 'hourly', 'daily', 'weekly'],
      default: 'daily'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  analytics: {
    lastUpdated: {
      type: Date
    },
    engagementRate: {
      type: Number,
      default: 0
    },
    reachRate: {
      type: Number,
      default: 0
    },
    impressionRate: {
      type: Number,
      default: 0
    },
    clickThroughRate: {
      type: Number,
      default: 0
    }
  },
  metadata: {
    platformData: mongoose.Schema.Types.Mixed,
    lastError: String,
    errorCount: {
      type: Number,
      default: 0
    },
    lastErrorAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes
socialAccountSchema.index({ user: 1, platform: 1 }, { unique: true });
socialAccountSchema.index({ organization: 1, platform: 1 });
socialAccountSchema.index({ isActive: 1, isConnected: 1 });
socialAccountSchema.index({ lastSyncAt: 1 });

// Virtual for account display name
socialAccountSchema.virtual('displayName').get(function() {
  return this.accountName || this.accountUsername || `${this.platform} Account`;
});

// Virtual for connection status
socialAccountSchema.virtual('connectionStatus').get(function() {
  if (!this.isConnected) return 'disconnected';
  if (this.tokenExpiresAt && this.tokenExpiresAt < new Date()) return 'expired';
  if (this.syncStatus === 'failed') return 'error';
  return 'connected';
});

// Static method to create social account
socialAccountSchema.statics.createSocialAccount = async function(accountData) {
  try {
    // Check if account already exists
    const existingAccount = await this.findOne({
      user: accountData.user,
      platform: accountData.platform
    });

    if (existingAccount) {
      // Update existing account
      Object.assign(existingAccount, accountData);
      await existingAccount.save();
      return existingAccount;
    }

    const socialAccount = new this(accountData);
    await socialAccount.save();
    return socialAccount;
  } catch (error) {
    throw new Error(`Failed to create social account: ${error.message}`);
  }
};

// Static method to get user's social accounts
socialAccountSchema.statics.getUserAccounts = async function(userId, options = {}) {
  const {
    platform,
    isActive = true,
    isConnected = true,
    includeInactive = false
  } = options;

  const query = { user: userId };
  
  if (platform) query.platform = platform;
  if (!includeInactive) query.isActive = isActive;
  if (isConnected !== null) query.isConnected = isConnected;

  return await this.find(query)
    .sort({ platform: 1, createdAt: -1 })
    .populate('user', 'username email firstName lastName')
    .populate('organization', 'name');
};

// Static method to update sync status
socialAccountSchema.statics.updateSyncStatus = async function(accountId, status, error = null) {
  const updateData = {
    syncStatus: status,
    lastSyncAt: new Date()
  };

  if (error) {
    updateData.syncError = error;
    updateData['metadata.errorCount'] = { $inc: 1 };
    updateData['metadata.lastError'] = error;
    updateData['metadata.lastErrorAt'] = new Date();
  }

  return await this.findByIdAndUpdate(accountId, updateData, { new: true });
};

// Static method to get accounts needing sync
socialAccountSchema.statics.getAccountsNeedingSync = async function() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  return await this.find({
    isActive: true,
    isConnected: true,
    $or: [
      { lastSyncAt: { $lt: oneHourAgo } },
      { syncStatus: 'failed' },
      { syncStatus: 'never' }
    ]
  }).sort({ lastSyncAt: 1 });
};

// Static method to disconnect account
socialAccountSchema.statics.disconnectAccount = async function(accountId, userId) {
  return await this.findOneAndUpdate(
    { _id: accountId, user: userId },
    {
      isConnected: false,
      isActive: false,
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
      syncStatus: 'never'
    },
    { new: true }
  );
};

// Instance method to update analytics
socialAccountSchema.methods.updateAnalytics = function(analyticsData) {
  this.analytics = {
    ...this.analytics,
    ...analyticsData,
    lastUpdated: new Date()
  };
  return this.save();
};

// Instance method to check token validity
socialAccountSchema.methods.isTokenValid = function() {
  if (!this.tokenExpiresAt) return true;
  return this.tokenExpiresAt > new Date();
};

// Instance method to refresh token
socialAccountSchema.methods.refreshAccessToken = async function(newToken, expiresAt) {
  this.accessToken = newToken;
  if (expiresAt) this.tokenExpiresAt = expiresAt;
  this.syncStatus = 'synced';
  this.syncError = null;
  return this.save();
};

module.exports = mongoose.model('SocialAccount', socialAccountSchema);

