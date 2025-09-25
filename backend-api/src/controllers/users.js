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
            jobTitle: user.jobTitle,
            website: user.website,
            bio: user.bio,
            location: user.location,
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
      const { 
        firstName, 
        lastName, 
        phoneNumber, 
        profilePicture, 
        timezone, 
        language,
        jobTitle,
        website,
        bio,
        location,
        phone
      } = req.body;
      
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      // Handle profile picture deletion
      if (profilePicture === null || profilePicture === '') {
        // Delete the existing profile picture file if it exists
        if (user.profilePicture) {
          try {
            const fs = require('fs');
            const path = require('path');
            
            // Extract filename from the URL
            const profilePicUrl = user.profilePicture;
            const filename = profilePicUrl.split('/').pop();
            
            if (filename) {
              // Delete from nginx web root
              const webPath = `/var/www/html/uploads/brand-assets/${filename}`;
              if (fs.existsSync(webPath)) {
                fs.unlinkSync(webPath);
                console.log(`Deleted profile picture file: ${webPath}`);
              }
              
              // Delete from uploads directory
              const uploadPath = path.join(__dirname, '../../uploads/brand-assets', filename);
              if (fs.existsSync(uploadPath)) {
                fs.unlinkSync(uploadPath);
                console.log(`Deleted profile picture file: ${uploadPath}`);
              }
            }
          } catch (fileError) {
            console.error('Error deleting profile picture file:', fileError);
            // Don't fail the request if file deletion fails
          }
        }
        user.profilePicture = null;
      } else if (profilePicture) {
        user.profilePicture = profilePicture;
      }

      // Update user fields
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phoneNumber) user.phoneNumber = phoneNumber;
      if (phone) user.phoneNumber = phone; // Handle both phoneNumber and phone
      if (timezone) user.preferences.timezone = timezone;
      if (language) user.preferences.language = language;
      if (jobTitle !== undefined) user.jobTitle = jobTitle;
      if (website !== undefined) user.website = website;
      if (bio !== undefined) user.bio = bio;
      if (location !== undefined) user.location = location;
      
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
            jobTitle: user.jobTitle,
            website: user.website,
            bio: user.bio,
            location: user.location,
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

  // Upload avatar
  uploadAvatar: async (req, res) => {
    try {
      console.log('Avatar upload request received:', {
        hasFile: !!req.file,
        fileInfo: req.file ? {
          originalname: req.file.originalname,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype
        } : null,
        userId: req.user?._id,
        body: req.body
      });

      if (!req.file) {
        console.log('No file uploaded in request');
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
          code: 'NO_FILE_UPLOADED'
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

      // Create the avatar URL using the uploaded file
      const avatarUrl = `/uploads/brand-assets/${req.file.filename}`;
      const fullAvatarUrl = `https://digiads.digiaeon.com${avatarUrl}`;

      // Copy file to nginx web root for serving
      const fs = require('fs');
      const path = require('path');
      const sourcePath = req.file.path;
      const destPath = `/var/www/html/uploads/brand-assets/${req.file.filename}`;
      
      try {
        // Ensure destination directory exists
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        
        // Copy file to nginx web root
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Avatar copied to nginx web root: ${destPath}`);
      } catch (copyError) {
        console.error('Error copying avatar to nginx web root:', copyError);
        // Continue with the response even if copy fails
      }

      // Update user's profile picture
      user.profilePicture = fullAvatarUrl;
      await user.save();

      // Log avatar upload
      logger.info('Avatar uploaded successfully', {
        controller: 'users.uploadAvatar',
        userId: user._id,
        avatarUrl: fullAvatarUrl,
        filename: req.file.filename,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            preferences: user.preferences
          },
          avatar: avatarUrl
        }
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'users.uploadAvatar',
        userId: req.user._id,
        file: req.file?.originalname,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to upload avatar',
        code: 'AVATAR_UPLOAD_ERROR'
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
      const { email, push, sms, marketing, weeklyReports, performanceAlerts } = req.body;
      
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
      if (weeklyReports !== undefined) user.preferences.notifications.weeklyReports = weeklyReports;
      if (performanceAlerts !== undefined) user.preferences.notifications.performanceAlerts = performanceAlerts;
      
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

  // Get notification preferences
  getNotifications: async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('preferences.notifications');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      res.json({
        success: true,
        data: user.preferences.notifications || {
          email: {
            contentApproval: false,
            publishingUpdates: false,
            analyticsReports: false,
            teamActivity: false,
            systemUpdates: false
          },
          push: {
            contentApproval: false,
            publishingUpdates: false,
            analyticsReports: false,
            teamActivity: false,
            systemUpdates: false
          },
          sms: false,
          marketing: false,
          weeklyReports: false,
          performanceAlerts: false
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'users.getNotifications',
        userId: req.user._id,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notification preferences',
        code: 'NOTIFICATIONS_FETCH_ERROR'
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
  },

  // Get user subscription information
  async getSubscription(req, res) {
    try {
      console.log('🔍 getSubscription called for user:', req.user.email);
      const userId = req.user._id;

      // Get user with organization data
      const user = await User.findById(userId).populate('organizationId', 'name subscription limits');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      const organization = user.organizationId;
      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found',
          code: 'ORGANIZATION_NOT_FOUND'
        });
      }

      // Map organization subscription to user subscription format
      const planId = organization.subscription?.planId || 'free';
      let frontendPlanName = mapPlanIdToFrontendName(planId);
      
      // Get actual plan pricing and features from database
      const Plan = require('../models/Plan');
      let actualPrice = getPlanPrice(planId); // fallback to hardcoded price
      let planFeatures = {
        postsLimit: organization.limits?.monthlyPosts || 10,
        socialAccountsLimit: organization.limits?.socialAccounts || 2,
        aiCredits: organization.limits?.aiGenerations || 50
      };
      
      // Try to find the actual plan in database for accurate pricing and features
      if (planId !== 'free') {
        // Look for the actual plan in database for any non-free plan
        const originalPlan = await Plan.findOne({ planId: planId });
        
        if (originalPlan) {
          // Use the actual plan name from database
          frontendPlanName = originalPlan.name || frontendPlanName;
          
          // Get accurate pricing
          if (originalPlan.pricing) {
            const billingCycle = organization.subscription?.billingCycle || 'monthly';
            if (billingCycle === 'monthly' && originalPlan.pricing.monthly) {
              actualPrice = `$${originalPlan.pricing.monthly.amount}/month`;
            } else if (billingCycle === 'yearly' && originalPlan.pricing.yearly) {
              actualPrice = `$${originalPlan.pricing.yearly.amount}/year`;
            } else if (billingCycle === 'quarterly' && originalPlan.pricing.quarterly) {
              actualPrice = `$${originalPlan.pricing.quarterly.amount}/quarter`;
            }
          }
          
          // Get accurate features from the plan
          if (originalPlan.features) {
            planFeatures = {
              // Basic limits
              postsLimit: originalPlan.features.monthlyPosts?.included || organization.limits?.monthlyPosts || 10,
              socialAccountsLimit: originalPlan.features.socialAccounts?.included || organization.limits?.socialAccounts || 2,
              aiCredits: originalPlan.features.aiGenerations?.included || organization.limits?.aiGenerations || 50,
              usersLimit: originalPlan.features.users?.included || organization.limits?.users || 1,
              storageGB: originalPlan.features.storageGB?.included || organization.limits?.storageGB || 1,
              analyticsRetentionDays: originalPlan.features.analyticsRetentionDays || organization.limits?.analyticsRetentionDays || 30,
              
              // Boolean features
              aiAgents: originalPlan.features.aiAgents || false,
              analytics: originalPlan.features.analytics || false,
              teamCollaboration: originalPlan.features.teamCollaboration || false,
              whiteLabel: originalPlan.features.whiteLabel || false,
              apiAccess: originalPlan.features.apiAccess || false,
              prioritySupport: originalPlan.features.prioritySupport || false,
              customBranding: originalPlan.features.customBranding || false,
              advancedAnalytics: originalPlan.features.advancedAnalytics || false,
              multipleWorkspaces: originalPlan.features.multipleWorkspaces || false,
              sso: originalPlan.features.sso || false,
              
              // Feature list from the plan
              featureList: originalPlan.featureList || []
            };
          }
        }
      }
      
      const subscription = {
        plan: frontendPlanName,
        status: organization.subscription?.status || 'active',
        billingCycle: organization.subscription?.billingCycle || 'monthly',
        nextBilling: organization.subscription?.nextBillingDate || null,
        trialEnd: organization.subscription?.trialEndsAt || null,
        price: actualPrice,
        features: planFeatures
      };

      console.log('📊 Returning subscription data:', subscription);
      res.json({
        success: true,
        data: subscription
      });

    } catch (error) {
      console.error('Get subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get subscription information',
        code: 'SUBSCRIPTION_ERROR'
      });
    }
  },

  // Get user usage statistics
  async getUsageStats(req, res) {
    try {
      const userId = req.user._id;
      
      // Get user with organization data
      const user = await User.findById(userId).populate('organizationId', 'limits usage');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      const organization = user.organizationId;
      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found',
          code: 'ORGANIZATION_NOT_FOUND'
        });
      }

      // Get usage stats (you may need to implement actual usage tracking)
      const usageStats = {
        postsUsed: organization.usage?.currentMonthPosts || 0,
        postsLimit: organization.limits?.monthlyPosts || 10,
        aiGenerationsUsed: organization.usage?.currentMonthAIGenerations || 0,
        aiGenerationsLimit: organization.limits?.aiGenerations || 50,
        socialAccountsUsed: organization.usage?.currentSocialAccounts || 0,
        socialAccountsLimit: organization.limits?.socialAccounts || 2
      };

      res.json({
        success: true,
        data: usageStats
      });

    } catch (error) {
      console.error('Get usage stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get usage statistics',
        code: 'USAGE_STATS_ERROR'
      });
    }
  },

  // Get user security information
  async getSecurityInfo(req, res) {
    try {
      const userId = req.user._id;
      
      // Get user data
      const user = await User.findById(userId).select('password lastLoginAt createdAt');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Calculate password age (assuming password was set at account creation)
      const passwordLastChanged = user.createdAt;
      const daysSincePasswordChange = Math.floor((new Date() - passwordLastChanged) / (1000 * 60 * 60 * 24));

      // Get recent login activity (you may want to implement a proper activity log)
      const recentLogins = [
        {
          timestamp: user.lastLoginAt || user.createdAt,
          ip: req.ip,
          userAgent: req.get('User-Agent') || 'Unknown',
          location: 'Unknown' // You could implement IP geolocation here
        }
      ];

      const securityInfo = {
        passwordLastChanged: passwordLastChanged.toISOString(),
        daysSincePasswordChange,
        twoFactorEnabled: false, // Implement 2FA if needed
        recentLogins,
        accountCreated: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString() || null,
        securityScore: calculateSecurityScore(daysSincePasswordChange, false, recentLogins.length)
      };

      res.json({
        success: true,
        data: securityInfo
      });

    } catch (error) {
      console.error('Get security info error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get security information',
        code: 'SECURITY_INFO_ERROR'
      });
    }
  }
};

// Helper function to calculate security score
function calculateSecurityScore(daysSincePasswordChange, twoFactorEnabled, recentLogins) {
  let score = 100;
  
  // Deduct points for old password
  if (daysSincePasswordChange > 365) score -= 30;
  else if (daysSincePasswordChange > 180) score -= 20;
  else if (daysSincePasswordChange > 90) score -= 10;
  
  // Add points for 2FA
  if (twoFactorEnabled) score += 20;
  
  // Deduct points for too many recent logins (potential security risk)
  if (recentLogins > 10) score -= 15;
  else if (recentLogins > 5) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

// Helper function to map plan ID to frontend plan name
function mapPlanIdToFrontendName(planId) {
  const mapping = {
    'free': 'Free Trial',
    'starter': 'Starter',
    'professional': 'Premium',
    'enterprise': 'Enterprise',
    'custom': 'Custom'
  };
  return mapping[planId] || 'Free Trial';
}

// Helper function to get plan price
function getPlanPrice(planId) {
  const prices = {
    'free': '$0/month',
    'starter': '$29/month',
    'professional': '$99/month',
    'enterprise': '$299/month',
    'custom': 'Contact Sales'
  };
  return prices[planId] || '$0/month';
}

// Update organization business profile
usersController.updateOrganizationProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const businessProfileData = req.body;

    // Get user with organization
    const user = await User.findById(userId).populate('organizationId');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const organization = user.organizationId;
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
        code: 'ORGANIZATION_NOT_FOUND'
      });
    }

    // Initialize businessInfo, marketingStrategy, brandSettings, aiPreferences, brandAssets, and platformConnections if they don't exist
    if (!organization.businessInfo) {
      organization.businessInfo = {};
    }
    if (!organization.marketingStrategy) {
      organization.marketingStrategy = {};
    }
    if (!organization.brandSettings) {
      organization.brandSettings = {};
    }
    if (!organization.aiPreferences) {
      organization.aiPreferences = {};
    }
    if (!organization.brandAssets) {
      organization.brandAssets = {};
    }
    if (!organization.platformConnections) {
      organization.platformConnections = {};
    }

    // Update organization business profile fields
    if (businessProfileData.name) organization.name = businessProfileData.name;
    if (businessProfileData.description) organization.description = businessProfileData.description;
    if (businessProfileData.website) organization.website = businessProfileData.website;
    
    // Update businessInfo fields
    if (businessProfileData.businessInfo) {
      if (businessProfileData.businessInfo.industry) organization.businessInfo.industry = businessProfileData.businessInfo.industry;
      if (businessProfileData.businessInfo.businessType) organization.businessInfo.businessType = businessProfileData.businessInfo.businessType;
      if (businessProfileData.businessInfo.companySize) organization.businessInfo.companySize = businessProfileData.businessInfo.companySize;
      if (businessProfileData.businessInfo.foundedYear) organization.businessInfo.foundedYear = businessProfileData.businessInfo.foundedYear;
      
      // Update headquarters address
      if (businessProfileData.businessInfo.headquarters) {
        if (!organization.businessInfo.headquarters) organization.businessInfo.headquarters = {};
        if (businessProfileData.businessInfo.headquarters.address) organization.businessInfo.headquarters.address = businessProfileData.businessInfo.headquarters.address;
      }
    }
    
    // Update marketingStrategy fields
    if (businessProfileData.marketingStrategy) {
      if (businessProfileData.marketingStrategy.targetAudience) organization.marketingStrategy.targetAudience = businessProfileData.marketingStrategy.targetAudience;
      if (businessProfileData.marketingStrategy.businessObjectives) organization.marketingStrategy.businessObjectives = businessProfileData.marketingStrategy.businessObjectives;
      if (businessProfileData.marketingStrategy.geographicReach) organization.marketingStrategy.geographicReach = businessProfileData.marketingStrategy.geographicReach;
      if (businessProfileData.marketingStrategy.postingFrequency) organization.marketingStrategy.postingFrequency = businessProfileData.marketingStrategy.postingFrequency;
      if (businessProfileData.marketingStrategy.primaryGoals) organization.marketingStrategy.primaryGoals = businessProfileData.marketingStrategy.primaryGoals;
    }
    
    // Update brandSettings fields
    if (businessProfileData.branding) {
      if (businessProfileData.branding.brandVoice) organization.brandSettings.brandVoice = businessProfileData.branding.brandVoice;
      if (businessProfileData.branding.contentStyle) organization.brandSettings.contentStyle = businessProfileData.branding.contentStyle;
      if (businessProfileData.branding.brandGuidelines) organization.brandSettings.brandGuidelines = businessProfileData.branding.brandGuidelines;
    }
    if (businessProfileData.brandSettings) {
      if (businessProfileData.brandSettings.brandVoice) organization.brandSettings.brandVoice = businessProfileData.brandSettings.brandVoice;
      if (businessProfileData.brandSettings.contentStyle) organization.brandSettings.contentStyle = businessProfileData.brandSettings.contentStyle;
      if (businessProfileData.brandSettings.brandGuidelines) organization.brandSettings.brandGuidelines = businessProfileData.brandSettings.brandGuidelines;
    }
    
    // Update contactInfo fields
    if (businessProfileData.contactInfo) {
      if (!organization.contactInfo) organization.contactInfo = {};
      if (businessProfileData.contactInfo.primaryEmail) organization.contactInfo.primaryEmail = businessProfileData.contactInfo.primaryEmail;
      if (businessProfileData.contactInfo.phoneNumber) organization.contactInfo.phoneNumber = businessProfileData.contactInfo.phoneNumber;
    }

    // Update AI preferences fields
    if (businessProfileData.aiPreferences) {
      if (businessProfileData.aiPreferences.creativityLevel) organization.aiPreferences.creativityLevel = businessProfileData.aiPreferences.creativityLevel;
      if (businessProfileData.aiPreferences.contentTone) organization.aiPreferences.contentTone = businessProfileData.aiPreferences.contentTone;
      if (businessProfileData.aiPreferences.autoApproval !== undefined) organization.aiPreferences.autoApproval = businessProfileData.aiPreferences.autoApproval;
      if (businessProfileData.aiPreferences.autoScheduling !== undefined) organization.aiPreferences.autoScheduling = businessProfileData.aiPreferences.autoScheduling;
      if (businessProfileData.aiPreferences.aiSuggestions !== undefined) organization.aiPreferences.aiSuggestions = businessProfileData.aiPreferences.aiSuggestions;
      if (businessProfileData.aiPreferences.learningMode !== undefined) organization.aiPreferences.learningMode = businessProfileData.aiPreferences.learningMode;
      if (businessProfileData.aiPreferences.contentTypes) organization.aiPreferences.contentTypes = businessProfileData.aiPreferences.contentTypes;
      if (businessProfileData.aiPreferences.platforms) organization.aiPreferences.platforms = businessProfileData.aiPreferences.platforms;
      if (businessProfileData.aiPreferences.optimization) organization.aiPreferences.optimization = businessProfileData.aiPreferences.optimization;
      if (businessProfileData.aiPreferences.notifications) organization.aiPreferences.notifications = businessProfileData.aiPreferences.notifications;
      if (businessProfileData.aiPreferences.dataRetention) organization.aiPreferences.dataRetention = businessProfileData.aiPreferences.dataRetention;
      if (businessProfileData.aiPreferences.privacyLevel) organization.aiPreferences.privacyLevel = businessProfileData.aiPreferences.privacyLevel;
      if (businessProfileData.aiPreferences.apiAccess !== undefined) organization.aiPreferences.apiAccess = businessProfileData.aiPreferences.apiAccess;
    }

    // Update brand assets fields
    if (businessProfileData.brandAssets) {
      // Handle colors object
      if (businessProfileData.brandAssets.colors) {
        if (!organization.brandAssets.colors) organization.brandAssets.colors = {};
        if (businessProfileData.brandAssets.colors.primary !== undefined) organization.brandAssets.colors.primary = businessProfileData.brandAssets.colors.primary;
        if (businessProfileData.brandAssets.colors.secondary !== undefined) organization.brandAssets.colors.secondary = businessProfileData.brandAssets.colors.secondary;
        if (businessProfileData.brandAssets.colors.accent !== undefined) organization.brandAssets.colors.accent = businessProfileData.brandAssets.colors.accent;
        if (businessProfileData.brandAssets.colors.background !== undefined) organization.brandAssets.colors.background = businessProfileData.brandAssets.colors.background;
        if (businessProfileData.brandAssets.colors.text !== undefined) organization.brandAssets.colors.text = businessProfileData.brandAssets.colors.text;
      }
      
      // Handle individual brand asset fields (including null values for deletions)
      if (businessProfileData.brandAssets.logo !== undefined) organization.brandAssets.logo = businessProfileData.brandAssets.logo;
      if (businessProfileData.brandAssets.primaryLogo !== undefined) organization.brandAssets.primaryLogo = businessProfileData.brandAssets.primaryLogo;
      if (businessProfileData.brandAssets.lightLogo !== undefined) organization.brandAssets.lightLogo = businessProfileData.brandAssets.lightLogo;
      if (businessProfileData.brandAssets.favicon !== undefined) organization.brandAssets.favicon = businessProfileData.brandAssets.favicon;
      if (businessProfileData.brandAssets.watermark !== undefined) organization.brandAssets.watermark = businessProfileData.brandAssets.watermark;
      if (businessProfileData.brandAssets.brandGuidelines !== undefined) organization.brandAssets.brandGuidelines = businessProfileData.brandAssets.brandGuidelines;
      if (businessProfileData.brandAssets.assets !== undefined) organization.brandAssets.assets = businessProfileData.brandAssets.assets;
    }

    // Update platform connections fields
    if (businessProfileData.platformConnections) {
      if (businessProfileData.platformConnections.instagram) organization.platformConnections.instagram = businessProfileData.platformConnections.instagram;
      if (businessProfileData.platformConnections.facebook) organization.platformConnections.facebook = businessProfileData.platformConnections.facebook;
      if (businessProfileData.platformConnections.linkedin) organization.platformConnections.linkedin = businessProfileData.platformConnections.linkedin;
      if (businessProfileData.platformConnections.twitter) organization.platformConnections.twitter = businessProfileData.platformConnections.twitter;
      if (businessProfileData.platformConnections.youtube) organization.platformConnections.youtube = businessProfileData.platformConnections.youtube;
      if (businessProfileData.platformConnections.tiktok) organization.platformConnections.tiktok = businessProfileData.platformConnections.tiktok;
    }

    await organization.save();

    res.json({
      success: true,
      message: 'Organization business profile updated successfully',
      data: {
        organization: {
          id: organization._id,
          name: organization.name,
          website: organization.website,
          description: organization.description,
          businessInfo: organization.businessInfo || {},
          contactInfo: organization.contactInfo || {},
          marketingStrategy: organization.marketingStrategy || {},
          branding: {
            brandVoice: organization.brandSettings?.brandVoice,
            contentStyle: organization.brandSettings?.contentStyle,
            brandGuidelines: organization.brandSettings?.brandGuidelines,
            logoUrl: organization.brandSettings?.logoUrl
          },
          aiPreferences: organization.aiPreferences || {},
          brandAssets: organization.brandAssets || {},
          platformConnections: organization.platformConnections || {}
        }
      }
    });

  } catch (error) {
    console.error('Update organization profile error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Failed to update organization business profile',
      code: 'ORGANIZATION_UPDATE_ERROR',
      error: error.message
    });
  }
};

// Get organization business profile
usersController.getOrganizationProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user with organization
    const user = await User.findById(userId).populate('organizationId');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const organization = user.organizationId;
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
        code: 'ORGANIZATION_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: {
        organization: {
          id: organization._id,
          name: organization.name,
          website: organization.website,
          description: organization.description,
          businessInfo: organization.businessInfo || {},
          contactInfo: organization.contactInfo || {},
          marketingStrategy: organization.marketingStrategy || {},
          branding: {
            brandVoice: organization.brandSettings?.brandVoice,
            contentStyle: organization.brandSettings?.contentStyle,
            brandGuidelines: organization.brandSettings?.brandGuidelines,
            logoUrl: organization.brandSettings?.logoUrl
          },
          aiPreferences: organization.aiPreferences || {},
          brandAssets: organization.brandAssets || {},
          platformConnections: organization.platformConnections || {}
        }
      }
    });

  } catch (error) {
    console.error('Get organization profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get organization business profile',
      code: 'ORGANIZATION_GET_ERROR'
    });
  }
};

// Upload brand asset
usersController.uploadBrandAsset = async (req, res) => {
  try {
    const userId = req.user._id;
    const { assetType } = req.body;

    // Validate asset type
    const validAssetTypes = ['primaryLogo', 'lightLogo', 'favicon', 'watermark', 'logo'];
    if (!assetType || !validAssetTypes.includes(assetType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid asset type. Must be one of: primaryLogo, lightLogo, favicon, watermark, logo',
        code: 'INVALID_ASSET_TYPE'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
        code: 'NO_FILE_UPLOADED'
      });
    }

    // Validate file type based on asset type
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    const allowedFaviconTypes = ['image/x-icon', 'image/vnd.microsoft.icon', 'image/png'];
    
    let allowedTypes = allowedImageTypes;
    if (assetType === 'favicon') {
      allowedTypes = allowedFaviconTypes;
    }

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type for ${assetType}. Allowed types: ${allowedTypes.join(', ')}`,
        code: 'INVALID_FILE_TYPE'
      });
    }

    // Validate file size (5MB max for logos, 1MB for favicon)
    const maxSize = assetType === 'favicon' ? 1024 * 1024 : 5 * 1024 * 1024; // 1MB for favicon, 5MB for others
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size for ${assetType}: ${maxSize / (1024 * 1024)}MB`,
        code: 'FILE_TOO_LARGE'
      });
    }

    // Get user with organization
    const user = await User.findById(userId).populate('organizationId');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const organization = user.organizationId;
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
        code: 'ORGANIZATION_NOT_FOUND'
      });
    }

    // Create the asset URL using the uploaded file
    const assetUrl = `/uploads/brand-assets/${req.file.filename}`;
    const fullAssetUrl = `https://digiads.digiaeon.com${assetUrl}`;

    // Copy file to nginx web root for serving
    const fs = require('fs');
    const path = require('path');
    const sourcePath = req.file.path;
    const destPath = `/var/www/html/uploads/brand-assets/${req.file.filename}`;
    
    try {
      // Ensure destination directory exists
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // Copy file to nginx web root
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Brand asset copied to nginx web root: ${destPath}`);
    } catch (copyError) {
      console.error('Error copying brand asset to nginx web root:', copyError);
      // Continue with the response even if copy fails
    }
    
    if (!organization.brandAssets) {
      organization.brandAssets = {};
    }
    
    // Update the specific brand asset in the organization
    organization.brandAssets[assetType] = fullAssetUrl;
    await organization.save();

    // Log brand asset upload
    logger.info('Brand asset uploaded successfully', {
      controller: 'users.uploadBrandAsset',
      userId: user._id,
      organizationId: organization._id,
      assetType: assetType,
      assetUrl: fullAssetUrl,
      filename: req.file.filename,
      fileSize: req.file.size,
      ip: req.ip
    });

    res.json({
      success: true,
      data: {
        url: fullAssetUrl,
        assetType: assetType,
        filename: req.file.filename,
        fileSize: req.file.size
      },
      message: 'Brand asset uploaded successfully'
    });

  } catch (error) {
    console.error('Upload brand asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload brand asset',
      code: 'UPLOAD_ERROR'
    });
  }
};

// Get brand assets
usersController.getBrandAssets = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user with organization
    const user = await User.findById(userId).populate('organizationId');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const organization = user.organizationId;
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
        code: 'ORGANIZATION_NOT_FOUND'
      });
    }

    // Return brand assets
    const brandAssets = organization.brandAssets || {};

    res.json({
      success: true,
      data: {
        brandAssets: {
          primaryLogo: brandAssets.primaryLogo || null,
          lightLogo: brandAssets.lightLogo || null,
          favicon: brandAssets.favicon || null,
          watermark: brandAssets.watermark || null,
          logo: brandAssets.logo || null,
          colors: brandAssets.colors || {
            primary: '#3B82F6',
            secondary: '#8B5CF6',
            accent: '#10B981',
            background: '#F8FAFC',
            text: '#1F2937'
          },
          brandGuidelines: brandAssets.brandGuidelines || null,
          assets: brandAssets.assets || []
        }
      },
      message: 'Brand assets retrieved successfully'
    });

  } catch (error) {
    console.error('Get brand assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get brand assets',
      code: 'GET_BRAND_ASSETS_ERROR'
    });
  }
};

// Delete brand asset
usersController.deleteBrandAsset = async (req, res) => {
  try {
    const { assetType } = req.params;
    const userId = req.user._id;

    // Get user with organization
    const user = await User.findById(userId).populate('organizationId');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const organization = user.organizationId;
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
        code: 'ORGANIZATION_NOT_FOUND'
      });
    }

    // Check if asset exists
    if (!organization.brandAssets || !organization.brandAssets[assetType]) {
      return res.status(404).json({
        success: false,
        message: 'Brand asset not found',
        code: 'BRAND_ASSET_NOT_FOUND'
      });
    }

    // Get the current asset URL
    const assetUrl = organization.brandAssets[assetType];
    
    // Extract filename from URL for file deletion
    const filename = assetUrl.split('/').pop();
    const filePath = `/var/www/html/uploads/brand-assets/${filename}`;
    
    // Delete physical file
    const fs = require('fs');
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Deleted brand asset file: ${filePath}`);
      } catch (fileError) {
        console.error('Error deleting brand asset file:', fileError);
        // Continue with database update even if file deletion fails
      }
    }

    // Remove asset from database
    organization.brandAssets[assetType] = null;
    await organization.save();

    // Log brand asset deletion
    console.log('Brand asset deleted successfully:', {
      userId: userId,
      assetType: assetType,
      assetUrl: assetUrl
    });

    res.json({
      success: true,
      message: 'Brand asset deleted successfully',
      data: {
        assetType: assetType,
        deleted: true
      }
    });

  } catch (error) {
    console.error('Delete brand asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete brand asset',
      code: 'BRAND_ASSET_DELETION_ERROR'
    });
  }
};

module.exports = usersController;

