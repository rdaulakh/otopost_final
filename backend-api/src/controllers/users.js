const User = require('../models/User');
const Organization = require('../models/Organization');
const logger = require('../utils/logger');
const redisConnection = require('../config/redis');

const usersController = {
  // Get current user profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
        .populate('organizationId')
        .select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            profilePicture: user.profilePicture,
            phoneNumber: user.phoneNumber,
            timezone: user.preferences.timezone,
            language: user.preferences.language,
            notifications: user.preferences.notifications,
            organization: {
              id: user.organizationId._id,
              name: user.organizationId.name,
              subscription: user.organizationId.subscription
            },
            permissions: user.permissions,
            activity: {
              lastLoginAt: user.activity.lastLoginAt,
              lastActiveAt: user.activity.lastActiveAt
            }
          }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'users.getProfile',
        userId: req.user._id,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get user profile',
        code: 'PROFILE_ERROR'
      });
    }
  },
  
  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { firstName, lastName, phoneNumber, profilePicture, timezone, language } = req.body;
      
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      // Update user fields
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phoneNumber) user.phoneNumber = phoneNumber;
      if (profilePicture) user.profilePicture = profilePicture;
      if (timezone) user.preferences.timezone = timezone;
      if (language) user.preferences.language = language;
      
      await user.save();
      
      // Log profile update
      logger.logUserActivity(user._id, 'profile_updated', {
        updatedFields: Object.keys(req.body),
        ip: req.ip
      });
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            profilePicture: user.profilePicture,
            preferences: user.preferences
          }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'users.updateProfile',
        userId: req.user._id,
        body: req.body,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        code: 'PROFILE_UPDATE_ERROR'
      });
    }
  },
  
  // Change password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      // Verify current password
      const isCurrentPasswordValid = await user.verifyPassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD'
        });
      }
      
      // Update password
      user.password = newPassword;
      user.security.passwordChangedAt = new Date();
      await user.save();
      
      // Invalidate all existing sessions except current one
      await redisConnection.del(`refresh:customer:${user._id}`);
      
      // Log password change
      logger.logSecurity('password_changed', {
        userId: user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'users.changePassword',
        userId: req.user._id,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to change password',
        code: 'PASSWORD_CHANGE_ERROR'
      });
    }
  },
  
  // Update notification preferences
  updateNotifications: async (req, res) => {
    try {
      const { email, push, sms, marketing } = req.body;
      
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      // Update notification preferences
      if (email !== undefined) user.preferences.notifications.email = email;
      if (push !== undefined) user.preferences.notifications.push = push;
      if (sms !== undefined) user.preferences.notifications.sms = sms;
      if (marketing !== undefined) user.preferences.notifications.marketing = marketing;
      
      await user.save();
      
      // Log notification preferences update
      logger.logUserActivity(user._id, 'notifications_updated', {
        preferences: { email, push, sms, marketing },
        ip: req.ip
      });
      
      res.json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: {
          notifications: user.preferences.notifications
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'users.updateNotifications',
        userId: req.user._id,
        body: req.body,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to update notification preferences',
        code: 'NOTIFICATIONS_UPDATE_ERROR'
      });
    }
  },
  
  // Connect social media account
  connectSocialAccount: async (req, res) => {
    try {
      const { platform, accessToken, refreshToken, accountId, accountName } = req.body;
      
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      // Check if platform is already connected
      const existingConnection = user.socialConnections.find(acc => acc.platform === platform);
      
      if (existingConnection) {
        // Update existing connection
        existingConnection.accessToken = accessToken;
        existingConnection.refreshToken = refreshToken;
        existingConnection.accountId = accountId;
        existingConnection.accountName = accountName;
        existingConnection.connectedAt = new Date();
        existingConnection.isActive = true;
      } else {
        // Add new connection
        user.socialConnections.push({
          platform,
          accessToken,
          refreshToken,
          accountId,
          accountName,
          connectedAt: new Date(),
          isActive: true
        });
      }
      
      await user.save();
      
      // Log social account connection
      logger.logUserActivity(user._id, 'social_account_connected', {
        platform,
        accountId,
        accountName,
        ip: req.ip
      });
      
      res.json({
        success: true,
        message: `${platform} account connected successfully`,
        data: {
          platform,
          accountId,
          accountName,
          connectedAt: new Date()
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'users.connectSocialAccount',
        userId: req.user._id,
        platform: req.body.platform,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to connect social media account',
        code: 'SOCIAL_CONNECT_ERROR'
      });
    }
  },
  
  // Disconnect social media account
  disconnectSocialAccount: async (req, res) => {
    try {
      const { platform } = req.params;
      
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      // Find and deactivate the social account
      const socialAccount = user.socialConnections.find(acc => acc.platform === platform);
      if (!socialAccount) {
        return res.status(404).json({
          success: false,
          message: 'Social media account not found',
          code: 'SOCIAL_ACCOUNT_NOT_FOUND'
        });
      }
      
      socialAccount.isActive = false;
      socialAccount.disconnectedAt = new Date();
      
      await user.save();
      
      // Log social account disconnection
      logger.logUserActivity(user._id, 'social_account_disconnected', {
        platform,
        accountId: socialAccount.accountId,
        ip: req.ip
      });
      
      res.json({
        success: true,
        message: `${platform} account disconnected successfully`
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'users.disconnectSocialAccount',
        userId: req.user._id,
        platform: req.params.platform,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to disconnect social media account',
        code: 'SOCIAL_DISCONNECT_ERROR'
      });
    }
  },
  
  // Get connected social media accounts
  getSocialAccounts: async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('socialConnections');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      const activeAccounts = user.socialConnections
        .filter(acc => acc.isActive)
        .map(acc => ({
          platform: acc.platform,
          accountId: acc.accountId,
          accountName: acc.accountName,
          connectedAt: acc.connectedAt,
          lastUsed: acc.lastUsed
        }));
      
      res.json({
        success: true,
        data: {
          socialAccounts: activeAccounts,
          totalConnected: activeAccounts.length
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'users.getSocialAccounts',
        userId: req.user._id,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get social media accounts',
        code: 'SOCIAL_ACCOUNTS_ERROR'
      });
    }
  },
  
  // Get user activity log
  getActivityLog: async (req, res) => {
    try {
      const { page = 1, limit = 20, type } = req.query;
      const skip = (page - 1) * limit;
      
      const user = await User.findById(req.user._id).select('auditLog');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      let activities = user.auditLog || [];
      
      // Filter by action if specified
      if (type) {
        activities = activities.filter(activity => activity.action === type);
      }
      
      // Sort by timestamp (newest first)
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Paginate
      const paginatedActivities = activities.slice(skip, skip + parseInt(limit));
      
      res.json({
        success: true,
        data: {
          activities: paginatedActivities,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(activities.length / limit),
            totalItems: activities.length,
            itemsPerPage: parseInt(limit)
          }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'users.getActivityLog',
        userId: req.user._id,
        query: req.query,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get activity log',
        code: 'ACTIVITY_LOG_ERROR'
      });
    }
  },
  
  // Delete user account
  deleteAccount: async (req, res) => {
    try {
      const { password, confirmDeletion } = req.body;
      
      if (!confirmDeletion) {
        return res.status(400).json({
          success: false,
          message: 'Account deletion must be confirmed',
          code: 'DELETION_NOT_CONFIRMED'
        });
      }
      
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      // Verify password
      const isPasswordValid = await user.verifyPassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Password is incorrect',
          code: 'INVALID_PASSWORD'
        });
      }
      
      // Check if user is organization owner
      const organization = await Organization.findById(user.organizationId);
      if (organization && organization.owner.toString() === user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Organization owner cannot delete account. Please transfer ownership first.',
          code: 'OWNER_CANNOT_DELETE'
        });
      }
      
      // Soft delete user
      user.isActive = false;
      user.deletedAt = new Date();
      user.email = `deleted_${Date.now()}_${user.email}`;
      await user.save();
      
      // Invalidate all sessions
      await redisConnection.del(`refresh:customer:${user._id}`);
      
      // Log account deletion
      logger.logSecurity('account_deleted', {
        userId: user._id,
        email: user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'users.deleteAccount',
        userId: req.user._id,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to delete account',
        code: 'ACCOUNT_DELETE_ERROR'
      });
    }
  },
  
  // Get user dashboard stats
  getDashboardStats: async (req, res) => {
    try {
      const userId = req.user._id;
      const organizationId = req.organization._id;
      
      // Get stats from Redis cache first
      const cacheKey = `dashboard_stats:${userId}`;
      const cachedStats = await redisConnection.get(cacheKey);
      
      if (cachedStats) {
        return res.json({
          success: true,
          data: JSON.parse(cachedStats),
          cached: true
        });
      }
      
      // Calculate stats (this would typically involve multiple model queries)
      const stats = {
        totalPosts: 0, // TODO: Count from Content model
        scheduledPosts: 0, // TODO: Count scheduled content
        totalEngagement: 0, // TODO: Sum from Analytics model
        connectedAccounts: req.user.socialConnections.filter(acc => acc.isActive).length,
        thisMonth: {
          posts: 0,
          engagement: 0,
          reach: 0
        },
        recentActivity: [] // TODO: Get recent activities
      };
      
      // Cache stats for 5 minutes
      await redisConnection.set(cacheKey, stats, 300);
      
      res.json({
        success: true,
        data: stats,
        cached: false
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'users.getDashboardStats',
        userId: req.user._id,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get dashboard stats',
        code: 'DASHBOARD_STATS_ERROR'
      });
    }
  }
};

module.exports = usersController;

