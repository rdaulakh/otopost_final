const User = require('../../models/User');
const Organization = require('../../models/Organization');
const Subscription = require('../../models/Subscription');
const logger = require('../../utils/logger');

const adminUsersController = {
  // Get all users with pagination and filters
  getAllUsers: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        status,
        role,
        organizationId,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;
      
      const skip = (page - 1) * limit;
      
      // Build query
      const query = {};
      
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (status) {
        if (status === 'active') {
          query.isActive = true;
        } else if (status === 'inactive') {
          query.isActive = false;
        }
      }
      
      if (role) {
        query.role = role;
      }
      
      if (organizationId) {
        query.organizationId = organizationId;
      }
      
      // Execute query
      const [users, total] = await Promise.all([
        User.find(query)
          .populate('organizationId', 'name subscription.planId subscription.status')
          .select('-password')
          .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
          .skip(skip)
          .limit(parseInt(limit)),
        User.countDocuments(query)
      ]);
      
      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'users_viewed', 'user', null, {
        query: req.query,
        resultCount: users.length,
        ip: req.ip
      });
      
      res.json({
        success: true,
        data: {
          users: users.map(user => ({
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isActive: user.isActive,
            organization: {
              id: user.organizationId._id,
              name: user.organizationId.name,
              plan: user.organizationId.subscription.planId,
              status: user.organizationId.subscription.status
            },
            activity: {
              lastLoginAt: user.activity.lastLoginAt,
              lastActiveAt: user.activity.lastActiveAt
            },
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
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
        controller: 'adminUsers.getAllUsers',
        adminId: req.admin._id,
        query: req.query,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get users',
        code: 'ADMIN_USERS_GET_ERROR'
      });
    }
  },
  
  // Get single user details
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const user = await User.findById(id)
        .populate('organizationId')
        .select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'user_viewed', 'user', id, {
        userEmail: user.email,
        ip: req.ip
      });
      
      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isActive: user.isActive,
            profilePicture: user.profilePicture,
            phoneNumber: user.phoneNumber,
            preferences: user.preferences,
            permissions: user.permissions,
            organization: user.organizationId,
            socialMediaAccounts: user.socialMediaAccounts.filter(acc => acc.isActive),
            activity: user.activity,
            security: {
              lastPasswordChange: user.security.passwordChangedAt,
              twoFactorEnabled: user.security.twoFactorEnabled
            },
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'adminUsers.getUserById',
        adminId: req.admin._id,
        userId: req.params.id,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get user details',
        code: 'ADMIN_USER_GET_ERROR'
      });
    }
  },
  
  // Update user status (activate/deactivate)
  updateUserStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive, reason } = req.body;
      
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      const previousStatus = user.isActive;
      user.isActive = isActive;
      
      if (!isActive) {
        user.deactivatedAt = new Date();
        user.deactivationReason = reason;
      } else {
        user.deactivatedAt = null;
        user.deactivationReason = null;
      }
      
      await user.save();
      
      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'user_status_updated', 'user', id, {
        previousStatus,
        newStatus: isActive,
        reason,
        userEmail: user.email,
        ip: req.ip
      });
      
      res.json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: {
          userId: user._id,
          isActive: user.isActive,
          updatedAt: user.updatedAt
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'adminUsers.updateUserStatus',
        adminId: req.admin._id,
        userId: req.params.id,
        body: req.body,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to update user status',
        code: 'ADMIN_USER_STATUS_ERROR'
      });
    }
  },
  
  // Update user permissions
  updateUserPermissions: async (req, res) => {
    try {
      const { id } = req.params;
      const { permissions } = req.body;
      
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      const previousPermissions = { ...user.permissions };
      user.permissions = { ...user.permissions, ...permissions };
      await user.save();
      
      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'user_permissions_updated', 'user', id, {
        previousPermissions,
        newPermissions: user.permissions,
        userEmail: user.email,
        ip: req.ip
      });
      
      res.json({
        success: true,
        message: 'User permissions updated successfully',
        data: {
          userId: user._id,
          permissions: user.permissions,
          updatedAt: user.updatedAt
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'adminUsers.updateUserPermissions',
        adminId: req.admin._id,
        userId: req.params.id,
        body: req.body,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to update user permissions',
        code: 'ADMIN_USER_PERMISSIONS_ERROR'
      });
    }
  },
  
  // Get user activity log
  getUserActivity: async (req, res) => {
    try {
      const { id } = req.params;
      const { page = 1, limit = 50, type } = req.query;
      const skip = (page - 1) * limit;
      
      const user = await User.findById(id).select('activity email');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      let activities = user.activity.log || [];
      
      // Filter by type if specified
      if (type) {
        activities = activities.filter(activity => activity.type === type);
      }
      
      // Sort by timestamp (newest first)
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Paginate
      const paginatedActivities = activities.slice(skip, skip + parseInt(limit));
      
      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'user_activity_viewed', 'user', id, {
        userEmail: user.email,
        activityType: type,
        ip: req.ip
      });
      
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
        controller: 'adminUsers.getUserActivity',
        adminId: req.admin._id,
        userId: req.params.id,
        query: req.query,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get user activity',
        code: 'ADMIN_USER_ACTIVITY_ERROR'
      });
    }
  },
  
  // Impersonate user (for support purposes)
  impersonateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      // Check if admin has impersonation permission
      if (!req.admin.hasPermission('users.impersonate')) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions for user impersonation',
          code: 'IMPERSONATION_DENIED'
        });
      }
      
      const user = await User.findById(id).populate('organizationId');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      if (!user.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Cannot impersonate inactive user',
          code: 'USER_INACTIVE'
        });
      }
      
      // Generate impersonation token (shorter expiry)
      const jwtManager = require('../../utils/jwt');
      const impersonationToken = jwtManager.generateCustomerToken(user._id, '2h');
      
      // Log impersonation activity
      logger.logAdminActivity(req.admin._id, 'user_impersonated', 'user', id, {
        userEmail: user.email,
        reason,
        ip: req.ip
      }, 'high');
      
      // Also log on user's activity
      logger.logUserActivity(user._id, 'impersonated_by_admin', {
        adminId: req.admin._id,
        adminEmail: req.admin.email,
        reason,
        ip: req.ip
      });
      
      res.json({
        success: true,
        message: 'User impersonation token generated',
        data: {
          impersonationToken,
          expiresIn: '2h',
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            organizationId: user.organizationId._id,
            organizationName: user.organizationId.name
          },
          warning: 'This token allows full access to the user account. Use responsibly.'
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'adminUsers.impersonateUser',
        adminId: req.admin._id,
        userId: req.params.id,
        body: req.body,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to generate impersonation token',
        code: 'IMPERSONATION_ERROR'
      });
    }
  },
  
  // Get user statistics
  getUserStats: async (req, res) => {
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
      
      // Get user statistics
      const [
        totalUsers,
        activeUsers,
        newUsers,
        usersByRole,
        usersByPlan
      ] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ createdAt: { $gte: start, $lte: end } }),
        User.aggregate([
          { $group: { _id: '$role', count: { $sum: 1 } } }
        ]),
        User.aggregate([
          {
            $lookup: {
              from: 'organizations',
              localField: 'organizationId',
              foreignField: '_id',
              as: 'organization'
            }
          },
          { $unwind: '$organization' },
          {
            $group: {
              _id: '$organization.subscription.planId',
              count: { $sum: 1 }
            }
          }
        ])
      ]);
      
      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'user_stats_viewed', 'system', null, {
        period,
        ip: req.ip
      });
      
      res.json({
        success: true,
        data: {
          overview: {
            total: totalUsers,
            active: activeUsers,
            inactive: totalUsers - activeUsers,
            newThisPeriod: newUsers
          },
          byRole: usersByRole.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          byPlan: usersByPlan.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          period: { start, end }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'adminUsers.getUserStats',
        adminId: req.admin._id,
        query: req.query,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get user statistics',
        code: 'ADMIN_USER_STATS_ERROR'
      });
    }
  },
  
  // Export users data
  exportUsers: async (req, res) => {
    try {
      const { format = 'json', status, role, organizationId } = req.query;
      
      // Build query
      const query = {};
      if (status === 'active') query.isActive = true;
      if (status === 'inactive') query.isActive = false;
      if (role) query.role = role;
      if (organizationId) query.organizationId = organizationId;
      
      // Get users data
      const users = await User.find(query)
        .populate('organizationId', 'name subscription.planId')
        .select('-password -security.passwordReset')
        .sort({ createdAt: -1 })
        .lean();
      
      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'users_exported', 'system', null, {
        format,
        query,
        userCount: users.length,
        ip: req.ip
      });
      
      if (format === 'csv') {
        // TODO: Convert to CSV format
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=users-${Date.now()}.csv`);
        res.json({ message: 'CSV export not implemented yet' });
      } else {
        res.json({
          success: true,
          data: users,
          meta: {
            totalRecords: users.length,
            exportedAt: new Date(),
            filters: { status, role, organizationId }
          }
        });
      }
      
    } catch (error) {
      logger.logError(error, {
        controller: 'adminUsers.exportUsers',
        adminId: req.admin._id,
        query: req.query,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to export users data',
        code: 'ADMIN_USERS_EXPORT_ERROR'
      });
    }
  }
};

module.exports = adminUsersController;

