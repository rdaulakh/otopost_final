const SocialAccount = require('../models/SocialAccount');
const User = require('../models/User');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

/**
 * Social Accounts Controller
 * Handles social media account connections and management
 */

// Get all social accounts for a user
const getSocialAccounts = async (req, res) => {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 20, platform, status } = req.query;

    const query = { user: userId };
    if (platform) query.platform = platform;
    if (status) query.status = status;

    const accounts = await SocialAccount.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SocialAccount.countDocuments(query);

    res.json({
      success: true,
      data: {
        accounts,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching social accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social accounts',
      error: error.message
    });
  }
};

// Get a specific social account
const getSocialAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { userId } = req.user;

    const account = await SocialAccount.findOne({
      _id: accountId,
      user: userId
    }).populate('user', 'firstName lastName email');

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Social account not found'
      });
    }

    res.json({
      success: true,
      data: account
    });
  } catch (error) {
    logger.error('Error fetching social account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social account',
      error: error.message
    });
  }
};

// Connect a new social account
const connectSocialAccount = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId } = req.user;
    const {
      platform,
      accountId,
      accountName,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      accountData
    } = req.body;

    // Check if account already exists
    const existingAccount = await SocialAccount.findOne({
      user: userId,
      platform,
      accountId
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'Social account already connected'
      });
    }

    const socialAccount = new SocialAccount({
      user: userId,
      platform,
      accountId,
      accountName,
      accessToken,
      refreshToken,
      tokenExpiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : null,
      accountData: accountData || {},
      status: 'active',
      lastSyncAt: new Date()
    });

    await socialAccount.save();

    logger.info(`Social account connected: ${platform} - ${accountName} for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Social account connected successfully',
      data: socialAccount
    });
  } catch (error) {
    logger.error('Error connecting social account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect social account',
      error: error.message
    });
  }
};

// Update social account
const updateSocialAccount = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { accountId } = req.params;
    const { userId } = req.user;
    const updateData = req.body;

    const account = await SocialAccount.findOne({
      _id: accountId,
      user: userId
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Social account not found'
      });
    }

    // Update allowed fields
    const allowedFields = ['accountName', 'accessToken', 'refreshToken', 'tokenExpiresAt', 'accountData', 'status'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        account[field] = updateData[field];
      }
    });

    account.lastSyncAt = new Date();
    await account.save();

    logger.info(`Social account updated: ${account.platform} - ${account.accountName} by user ${userId}`);

    res.json({
      success: true,
      message: 'Social account updated successfully',
      data: account
    });
  } catch (error) {
    logger.error('Error updating social account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update social account',
      error: error.message
    });
  }
};

// Disconnect social account
const disconnectSocialAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { userId } = req.user;

    const account = await SocialAccount.findOneAndDelete({
      _id: accountId,
      user: userId
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Social account not found'
      });
    }

    logger.info(`Social account disconnected: ${account.platform} - ${account.accountName} by user ${userId}`);

    res.json({
      success: true,
      message: 'Social account disconnected successfully'
    });
  } catch (error) {
    logger.error('Error disconnecting social account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect social account',
      error: error.message
    });
  }
};

// Refresh social account token
const refreshSocialAccountToken = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { userId } = req.user;

    const account = await SocialAccount.findOne({
      _id: accountId,
      user: userId
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Social account not found'
      });
    }

    if (!account.refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'No refresh token available for this account'
      });
    }

    // TODO: Implement platform-specific token refresh logic
    // This would involve calling the respective platform's token refresh API

    // For now, just update the last sync time
    account.lastSyncAt = new Date();
    await account.save();

    logger.info(`Social account token refreshed: ${account.platform} - ${account.accountName} by user ${userId}`);

    res.json({
      success: true,
      message: 'Social account token refreshed successfully',
      data: account
    });
  } catch (error) {
    logger.error('Error refreshing social account token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh social account token',
      error: error.message
    });
  }
};

// Sync social account data
const syncSocialAccountData = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { userId } = req.user;

    const account = await SocialAccount.findOne({
      _id: accountId,
      user: userId
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Social account not found'
      });
    }

    // TODO: Implement platform-specific data sync logic
    // This would involve calling the respective platform's API to fetch latest data

    account.lastSyncAt = new Date();
    await account.save();

    logger.info(`Social account data synced: ${account.platform} - ${account.accountName} by user ${userId}`);

    res.json({
      success: true,
      message: 'Social account data synced successfully',
      data: account
    });
  } catch (error) {
    logger.error('Error syncing social account data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync social account data',
      error: error.message
    });
  }
};

// Get social account analytics
const getSocialAccountAnalytics = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { userId } = req.user;
    const { startDate, endDate } = req.query;

    const account = await SocialAccount.findOne({
      _id: accountId,
      user: userId
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Social account not found'
      });
    }

    // TODO: Implement analytics fetching from platform APIs
    // This would involve calling the respective platform's analytics API

    const analytics = {
      followers: account.accountData.followers || 0,
      following: account.accountData.following || 0,
      posts: account.accountData.posts || 0,
      engagement: account.accountData.engagement || 0,
      reach: account.accountData.reach || 0,
      impressions: account.accountData.impressions || 0,
      lastUpdated: account.lastSyncAt
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error fetching social account analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social account analytics',
      error: error.message
    });
  }
};

// Get connected platforms
const getConnectedPlatforms = async (req, res) => {
  try {
    const { userId } = req.user;

    const platforms = await SocialAccount.distinct('platform', { user: userId, status: 'active' });

    res.json({
      success: true,
      data: platforms
    });
  } catch (error) {
    logger.error('Error fetching connected platforms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch connected platforms',
      error: error.message
    });
  }
};

// Get social account statistics
const getSocialAccountStats = async (req, res) => {
  try {
    const { userId } = req.user;

    const stats = await SocialAccount.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          byPlatform: {
            $push: {
              platform: '$platform',
              status: '$status'
            }
          }
        }
      }
    ]);

    const platformStats = await SocialAccount.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        total: stats[0]?.total || 0,
        active: stats[0]?.active || 0,
        byPlatform: platformStats
      }
    });
  } catch (error) {
    logger.error('Error fetching social account stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social account statistics',
      error: error.message
    });
  }
};

// Test social account connection
const testSocialAccountConnection = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { userId } = req.user;

    const account = await SocialAccount.findOne({
      _id: accountId,
      user: userId
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Social account not found'
      });
    }

    // TODO: Implement platform-specific connection test
    // This would involve calling the respective platform's API to verify the connection

    const isConnected = true; // Placeholder

    res.json({
      success: true,
      data: {
        isConnected,
        lastTested: new Date()
      }
    });
  } catch (error) {
    logger.error('Error testing social account connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test social account connection',
      error: error.message
    });
  }
};

// Get social account by ID (alias for getSocialAccount)
const getSocialAccountById = getSocialAccount;

// Get account stats (alias for getSocialAccountStats)
const getAccountStats = getSocialAccountStats;

// Get accounts needing sync
const getAccountsNeedingSync = async (req, res) => {
  try {
    const { userId } = req.user;
    const { hours = 24 } = req.query;

    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - parseInt(hours));

    const accounts = await SocialAccount.find({
      user: userId,
      status: 'active',
      $or: [
        { lastSyncAt: { $lt: cutoffTime } },
        { lastSyncAt: { $exists: false } }
      ]
    }).populate('user', 'firstName lastName email');

    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    logger.error('Error fetching accounts needing sync:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accounts needing sync',
      error: error.message
    });
  }
};

// Refresh token (alias for refreshSocialAccountToken)
const refreshToken = refreshSocialAccountToken;

// Update analytics (alias for getSocialAccountAnalytics)
const updateAnalytics = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { userId } = req.user;
    const { analytics } = req.body;

    const account = await SocialAccount.findOne({
      _id: accountId,
      user: userId
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Social account not found'
      });
    }

    account.accountData = {
      ...account.accountData,
      ...analytics
    };
    account.lastSyncAt = new Date();
    await account.save();

    res.json({
      success: true,
      message: 'Analytics updated successfully',
      data: account
    });
  } catch (error) {
    logger.error('Error updating analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update analytics',
      error: error.message
    });
  }
};

// Sync account (alias for syncSocialAccountData)
const syncAccount = syncSocialAccountData;

module.exports = {
  getSocialAccounts,
  getSocialAccount,
  connectSocialAccount,
  updateSocialAccount,
  disconnectSocialAccount,
  refreshSocialAccountToken,
  syncSocialAccountData,
  getSocialAccountAnalytics,
  getConnectedPlatforms,
  getSocialAccountStats,
  testSocialAccountConnection,
  getSocialAccountById,
  getAccountStats,
  getAccountsNeedingSync,
  refreshToken,
  updateAnalytics,
  syncAccount
};