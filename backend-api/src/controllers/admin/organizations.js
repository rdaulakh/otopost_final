const Organization = require('../../models/Organization');
const User = require('../../models/User');
const Subscription = require('../../models/Subscription');
const Content = require('../../models/Content');
const Analytics = require('../../models/Analytics');
const logger = require('../../utils/logger');

const adminOrganizationsController = {
  // Create new organization
  createOrganization: async (req, res) => {
    try {
      const {
        name,
        slug,
        description,
        contactInfo,
        isActive = true,
        subscriptionStatus = 'inactive'
      } = req.body;

      // Validate required fields
      if (!name || !slug || !contactInfo?.primaryEmail) {
        return res.status(400).json({
          success: false,
          message: 'Name, slug, and primary email are required'
        });
      }

      // Check if organization with same slug already exists
      const existingOrg = await Organization.findOne({ slug });
      if (existingOrg) {
        return res.status(400).json({
          success: false,
          message: 'Organization with this slug already exists'
        });
      }

      const organization = new Organization({
        name,
        slug,
        description,
        contactInfo,
        isActive,
        subscriptionStatus
      });

      await organization.save();

      logger.info(`Organization created: ${name} (${organization._id})`);

      res.status(201).json({
        success: true,
        message: 'Organization created successfully',
        data: { organization }
      });
    } catch (error) {
      logger.error('Error creating organization:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create organization',
        error: error.message
      });
    }
  },

  // Get all organizations with pagination and filters
  getAllOrganizations: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        status,
        plan,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;
      
      const skip = (page - 1) * limit;
      
      // Build query
      const query = {};
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { 'contactInfo.primaryEmail': { $regex: search, $options: 'i' } }
        ];
      }
      
      if (status) {
        if (status === 'active') {
          query.isActive = true;
        } else if (status === 'inactive') {
          query.isActive = false;
        }
      }
      
      if (plan) {
        query['subscription.planId'] = plan;
      }
      
      // Execute query
      const [organizations, total] = await Promise.all([
        Organization.find(query)
          .populate('owner', 'firstName lastName email')
          .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Organization.countDocuments(query)
      ]);
      
      // Get user counts for each organization
      const orgIds = organizations.map(org => org._id);
      const userCounts = await User.aggregate([
        { $match: { organizationId: { $in: orgIds } } },
        { $group: { _id: '$organizationId', count: { $sum: 1 } } }
      ]);
      
      const userCountMap = userCounts.reduce((acc, item) => {
        acc[item._id.toString()] = item.count;
        return acc;
      }, {});
      
      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'organizations_viewed', 'organization', null, {
        query: req.query,
        resultCount: organizations.length,
        ip: req.ip
      });
      
      res.json({
        success: true,
        data: {
          organizations: organizations.map(org => ({
            id: org._id,
            name: org.name,
            isActive: org.isActive,
            owner: org.owner,
            contactInfo: org.contactInfo,
            subscription: {
              planId: org.subscription.planId,
              status: org.subscription.status,
              trialEnd: org.subscription.trialEnd,
              billingCycle: org.subscription.billingCycle
            },
            usage: org.subscription.usage,
            userCount: userCountMap[org._id.toString()] || 0,
            createdAt: org.createdAt,
            updatedAt: org.updatedAt
          })),
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'adminOrganizations.getAllOrganizations',
        adminId: req.admin._id,
        query: req.query,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get organizations',
        code: 'ADMIN_ORGANIZATIONS_GET_ERROR'
      });
    }
  },
  
  // Get single organization details
  getOrganizationById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const organization = await Organization.findById(id)
        .populate('owner', 'firstName lastName email profilePicture');
      
      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found',
          code: 'ORGANIZATION_NOT_FOUND'
        });
      }
      
      // Get additional organization data
      const [users, contentCount, recentActivity] = await Promise.all([
        User.find({ organizationId: id })
          .select('firstName lastName email role isActive createdAt')
          .sort({ createdAt: -1 }),
        Content.countDocuments({ organizationId: id }),
        Analytics.find({ organizationId: id })
          .sort({ date: -1 })
          .limit(10)
          .select('type date')
      ]);
      
      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'organization_viewed', 'organization', id, {
        organizationName: organization.name,
        ip: req.ip
      });
      
      res.json({
        success: true,
        data: {
          organization: {
            ...organization.toObject(),
            users,
            stats: {
              userCount: users.length,
              activeUsers: users.filter(u => u.isActive).length,
              contentCount,
              recentActivityCount: recentActivity.length
            },
            recentActivity
          }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'adminOrganizations.getOrganizationById',
        adminId: req.admin._id,
        organizationId: req.params.id,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get organization details',
        code: 'ADMIN_ORGANIZATION_GET_ERROR'
      });
    }
  },
  
  // Update organization status
  updateOrganizationStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive, reason } = req.body;
      
      const organization = await Organization.findById(id);
      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found',
          code: 'ORGANIZATION_NOT_FOUND'
        });
      }
      
      const previousStatus = organization.isActive;
      organization.isActive = isActive;
      
      if (!isActive) {
        organization.deactivatedAt = new Date();
        organization.deactivationReason = reason;
        
        // Also deactivate all users in the organization
        await User.updateMany(
          { organizationId: id },
          { 
            isActive: false,
            deactivatedAt: new Date(),
            deactivationReason: 'Organization deactivated'
          }
        );
      } else {
        organization.deactivatedAt = null;
        organization.deactivationReason = null;
        
        // Reactivate users (they can be individually managed later)
        await User.updateMany(
          { organizationId: id },
          { 
            isActive: true,
            $unset: { deactivatedAt: 1, deactivationReason: 1 }
          }
        );
      }
      
      await organization.save();
      
      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'organization_status_updated', 'organization', id, {
        previousStatus,
        newStatus: isActive,
        reason,
        organizationName: organization.name,
        ip: req.ip
      });
      
      res.json({
        success: true,
        message: `Organization ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: {
          organizationId: organization._id,
          isActive: organization.isActive,
          updatedAt: organization.updatedAt
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'adminOrganizations.updateOrganizationStatus',
        adminId: req.admin._id,
        organizationId: req.params.id,
        body: req.body,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to update organization status',
        code: 'ADMIN_ORGANIZATION_STATUS_ERROR'
      });
    }
  },
  
  // Update organization subscription
  updateSubscription: async (req, res) => {
    try {
      const { id } = req.params;
      const { planId, status, trialEnd, billingCycle, features } = req.body;
      
      const organization = await Organization.findById(id);
      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found',
          code: 'ORGANIZATION_NOT_FOUND'
        });
      }
      
      const previousSubscription = { ...organization.subscription };
      
      // Update subscription details
      if (planId) organization.subscription.planId = planId;
      if (status) organization.subscription.status = status;
      if (trialEnd) organization.subscription.trialEnd = new Date(trialEnd);
      if (billingCycle) organization.subscription.billingCycle = billingCycle;
      if (features) organization.subscription.features = { ...organization.subscription.features, ...features };
      
      await organization.save();
      
      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'organization_subscription_updated', 'organization', id, {
        previousSubscription,
        newSubscription: organization.subscription,
        organizationName: organization.name,
        ip: req.ip
      });
      
      res.json({
        success: true,
        message: 'Organization subscription updated successfully',
        data: {
          organizationId: organization._id,
          subscription: organization.subscription,
          updatedAt: organization.updatedAt
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'adminOrganizations.updateSubscription',
        adminId: req.admin._id,
        organizationId: req.params.id,
        body: req.body,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to update organization subscription',
        code: 'ADMIN_ORGANIZATION_SUBSCRIPTION_ERROR'
      });
    }
  },
  
  // Get organization analytics
  getOrganizationAnalytics: async (req, res) => {
    try {
      const { id } = req.params;
      const { period = 'month', startDate, endDate } = req.query;
      
      const organization = await Organization.findById(id);
      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found',
          code: 'ORGANIZATION_NOT_FOUND'
        });
      }
      
      // Calculate date range
      let start, end;
      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
      } else {
        end = new Date();
        switch (period) {
          case 'week':
            start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            start = new Date(end.getFullYear(), end.getMonth(), 1);
            break;
          case 'quarter':
            start = new Date(end.getFullYear(), Math.floor(end.getMonth() / 3) * 3, 1);
            break;
          default:
            start = new Date(end.getFullYear(), end.getMonth(), 1);
        }
      }
      
      // Get analytics data
      const [
        contentMetrics,
        userActivity,
        subscriptionUsage
      ] = await Promise.all([
        Content.aggregate([
          {
            $match: {
              organizationId: organization._id,
              createdAt: { $gte: start, $lte: end }
            }
          },
          {
            $group: {
              _id: null,
              totalPosts: { $sum: 1 },
              publishedPosts: {
                $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
              },
              avgEngagement: { $avg: '$analytics.totalEngagement' }
            }
          }
        ]),
        User.aggregate([
          {
            $match: {
              organizationId: organization._id,
              'activity.lastActiveAt': { $gte: start, $lte: end }
            }
          },
          {
            $group: {
              _id: null,
              activeUsers: { $sum: 1 }
            }
          }
        ]),
        {
          currentUsage: organization.subscription.usage.currentPeriod,
          limits: organization.subscription.features
        }
      ]);
      
      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'organization_analytics_viewed', 'organization', id, {
        period,
        organizationName: organization.name,
        ip: req.ip
      });
      
      res.json({
        success: true,
        data: {
          organization: {
            id: organization._id,
            name: organization.name
          },
          analytics: {
            content: contentMetrics[0] || { totalPosts: 0, publishedPosts: 0, avgEngagement: 0 },
            users: userActivity[0] || { activeUsers: 0 },
            subscription: subscriptionUsage
          },
          period: { start, end }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'adminOrganizations.getOrganizationAnalytics',
        adminId: req.admin._id,
        organizationId: req.params.id,
        query: req.query,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get organization analytics',
        code: 'ADMIN_ORGANIZATION_ANALYTICS_ERROR'
      });
    }
  },
  
  // Get organization statistics
  getOrganizationStats: async (req, res) => {
    try {
      const { period = 'month' } = req.query;
      
      // Calculate date range
      const end = new Date();
      let start;
      switch (period) {
        case 'week':
          start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          start = new Date(end.getFullYear(), end.getMonth(), 1);
          break;
        case 'quarter':
          start = new Date(end.getFullYear(), Math.floor(end.getMonth() / 3) * 3, 1);
          break;
        case 'year':
          start = new Date(end.getFullYear(), 0, 1);
          break;
        default:
          start = new Date(end.getFullYear(), end.getMonth(), 1);
      }
      
      // Get organization statistics
      const [
        totalOrganizations,
        activeOrganizations,
        newOrganizations,
        organizationsByPlan,
        organizationsByStatus
      ] = await Promise.all([
        Organization.countDocuments({}),
        Organization.countDocuments({ isActive: true }),
        Organization.countDocuments({ createdAt: { $gte: start, $lte: end } }),
        Organization.aggregate([
          { $group: { _id: '$subscription.planId', count: { $sum: 1 } } }
        ]),
        Organization.aggregate([
          { $group: { _id: '$subscription.status', count: { $sum: 1 } } }
        ])
      ]);
      
      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'organization_stats_viewed', 'system', null, {
        period,
        ip: req.ip
      });
      
      res.json({
        success: true,
        data: {
          overview: {
            total: totalOrganizations,
            active: activeOrganizations,
            inactive: totalOrganizations - activeOrganizations,
            newThisPeriod: newOrganizations
          },
          byPlan: organizationsByPlan.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          byStatus: organizationsByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          period: { start, end }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'adminOrganizations.getOrganizationStats',
        adminId: req.admin._id,
        query: req.query,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get organization statistics',
        code: 'ADMIN_ORGANIZATION_STATS_ERROR'
      });
    }
  },
  
  // Reset organization usage limits
  resetUsageLimits: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const organization = await Organization.findById(id);
      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found',
          code: 'ORGANIZATION_NOT_FOUND'
        });
      }
      
      const previousUsage = { ...organization.subscription.usage.currentPeriod };
      
      // Reset usage limits
      organization.subscription.usage.currentPeriod = {
        posts: 0,
        aiGenerations: 0,
        teamMembers: organization.subscription.usage.currentPeriod.teamMembers, // Keep team members
        storage: 0,
        apiCalls: 0
      };
      
      organization.subscription.usage.lastReset = new Date();
      await organization.save();
      
      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'organization_usage_reset', 'organization', id, {
        previousUsage,
        reason,
        organizationName: organization.name,
        ip: req.ip
      });
      
      res.json({
        success: true,
        message: 'Organization usage limits reset successfully',
        data: {
          organizationId: organization._id,
          usage: organization.subscription.usage,
          resetAt: organization.subscription.usage.lastReset
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'adminOrganizations.resetUsageLimits',
        adminId: req.admin._id,
        organizationId: req.params.id,
        body: req.body,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to reset organization usage limits',
        code: 'ADMIN_ORGANIZATION_USAGE_RESET_ERROR'
      });
    }
  }
};

module.exports = adminOrganizationsController;

