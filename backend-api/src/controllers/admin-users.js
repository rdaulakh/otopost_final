const AdminUser = require('../models/AdminUser');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

/**
 * Admin Users Controller
 * Handles admin user management, roles, and permissions
 */

// Get all admin users
const getAdminUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;

    const query = {};
    if (role) query.role = role;
    if (status) query.isActive = status === 'active';
    if (search) {
      query.$or: [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const adminUsers = await AdminUser.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AdminUser.countDocuments(query);

    res.json({
      success: true,
      data: {
        adminUsers,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching admin users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin users',
      error: error.message
    });
  }
};

// Get a specific admin user
const getAdminUser = async (req, res) => {
  try {
    const { adminUserId } = req.params;

    const adminUser = await AdminUser.findById(adminUserId).select('-password');

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    res.json({
      success: true,
      data: adminUser
    });
  } catch (error) {
    logger.error('Error fetching admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin user',
      error: error.message
    });
  }
};

// Create a new admin user
const createAdminUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      username,
      email,
      password,
      firstName,
      lastName,
      role = 'admin',
      permissions = [],
      isActive = true
    } = req.body;

    // Check if admin user already exists
    const existingAdmin = await AdminUser.findOne({
      $or: [{ email }, { username }]
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin user with this email or username already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const adminUser = new AdminUser({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      permissions,
      isActive,
      lastLoginAt: null,
      loginAttempts: 0,
      lockedUntil: null
    });

    await adminUser.save();

    logger.info(`Admin user created: ${email} with role ${role}`);

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        ...adminUser.toObject(),
        password: undefined
      }
    });
  } catch (error) {
    logger.error('Error creating admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user',
      error: error.message
    });
  }
};

// Update admin user
const updateAdminUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { adminUserId } = req.params;
    const updateData = req.body;

    // Remove password from update data if present
    delete updateData.password;

    const adminUser = await AdminUser.findByIdAndUpdate(
      adminUserId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    logger.info(`Admin user updated: ${adminUser.email}`);

    res.json({
      success: true,
      message: 'Admin user updated successfully',
      data: adminUser
    });
  } catch (error) {
    logger.error('Error updating admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin user',
      error: error.message
    });
  }
};

// Delete admin user
const deleteAdminUser = async (req, res) => {
  try {
    const { adminUserId } = req.params;

    const adminUser = await AdminUser.findById(adminUserId);
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    // Prevent deletion of super admin
    if (adminUser.role === 'superadmin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete super admin user'
      });
    }

    await AdminUser.findByIdAndDelete(adminUserId);

    logger.info(`Admin user deleted: ${adminUser.email}`);

    res.json({
      success: true,
      message: 'Admin user deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete admin user',
      error: error.message
    });
  }
};

// Change admin user password
const changeAdminUserPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { adminUserId } = req.params;
    const { currentPassword, newPassword } = req.body;

    const adminUser = await AdminUser.findById(adminUserId);
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, adminUser.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    adminUser.password = hashedNewPassword;
    await adminUser.save();

    logger.info(`Admin user password changed: ${adminUser.email}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Error changing admin user password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

// Reset admin user password
const resetAdminUserPassword = async (req, res) => {
  try {
    const { adminUserId } = req.params;
    const { newPassword } = req.body;

    const adminUser = await AdminUser.findById(adminUserId);
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    adminUser.password = hashedPassword;
    adminUser.loginAttempts = 0;
    adminUser.lockedUntil = null;
    await adminUser.save();

    logger.info(`Admin user password reset: ${adminUser.email}`);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    logger.error('Error resetting admin user password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
};

// Toggle admin user status
const toggleAdminUserStatus = async (req, res) => {
  try {
    const { adminUserId } = req.params;

    const adminUser = await AdminUser.findById(adminUserId);
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    // Prevent deactivating super admin
    if (adminUser.role === 'superadmin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate super admin user'
      });
    }

    adminUser.isActive = !adminUser.isActive;
    await adminUser.save();

    logger.info(`Admin user status toggled: ${adminUser.email} - ${adminUser.isActive ? 'active' : 'inactive'}`);

    res.json({
      success: true,
      message: `Admin user ${adminUser.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        isActive: adminUser.isActive
      }
    });
  } catch (error) {
    logger.error('Error toggling admin user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle admin user status',
      error: error.message
    });
  }
};

// Update admin user permissions
const updateAdminUserPermissions = async (req, res) => {
  try {
    const { adminUserId } = req.params;
    const { permissions } = req.body;

    const adminUser = await AdminUser.findById(adminUserId);
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    adminUser.permissions = permissions;
    await adminUser.save();

    logger.info(`Admin user permissions updated: ${adminUser.email}`);

    res.json({
      success: true,
      message: 'Permissions updated successfully',
      data: {
        permissions: adminUser.permissions
      }
    });
  } catch (error) {
    logger.error('Error updating admin user permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update permissions',
      error: error.message
    });
  }
};

// Get admin user activity
const getAdminUserActivity = async (req, res) => {
  try {
    const { adminUserId } = req.params;
    const { page = 1, limit = 20, startDate, endDate } = req.query;

    const adminUser = await AdminUser.findById(adminUserId);
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    // TODO: Implement activity logging and retrieval
    // This would involve querying an activity log collection

    const activity = []; // Placeholder

    res.json({
      success: true,
      data: {
        activity,
        pagination: {
          current: page,
          pages: 1,
          total: activity.length
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching admin user activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin user activity',
      error: error.message
    });
  }
};

// Get admin user statistics
const getAdminUserStats = async (req, res) => {
  try {
    const stats = await AdminUser.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          byRole: {
            $push: {
              role: '$role',
              isActive: '$isActive'
            }
          }
        }
      }
    ]);

    const roleStats = await AdminUser.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        total: stats[0]?.total || 0,
        active: stats[0]?.active || 0,
        byRole: roleStats
      }
    });
  } catch (error) {
    logger.error('Error fetching admin user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin user statistics',
      error: error.message
    });
  }
};

// Get available roles and permissions
const getRolesAndPermissions = async (req, res) => {
  try {
    const roles = [
      {
        name: 'superadmin',
        displayName: 'Super Administrator',
        description: 'Full system access with all permissions',
        permissions: ['all']
      },
      {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full administrative access',
        permissions: [
          'users.manage',
          'content.manage',
          'analytics.view',
          'settings.manage',
          'reports.generate'
        ]
      },
      {
        name: 'moderator',
        displayName: 'Moderator',
        description: 'Content and user moderation',
        permissions: [
          'users.view',
          'content.moderate',
          'analytics.view'
        ]
      },
      {
        name: 'support',
        displayName: 'Support Agent',
        description: 'Customer support access',
        permissions: [
          'users.view',
          'tickets.manage',
          'analytics.view'
        ]
      }
    ];

    const permissions = [
      'users.manage',
      'users.view',
      'content.manage',
      'content.moderate',
      'analytics.view',
      'analytics.manage',
      'settings.manage',
      'reports.generate',
      'tickets.manage',
      'system.monitor'
    ];

    res.json({
      success: true,
      data: {
        roles,
        permissions
      }
    });
  } catch (error) {
    logger.error('Error fetching roles and permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roles and permissions',
      error: error.message
    });
  }
};

module.exports = {
  getAdminUsers,
  getAdminUser,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  changeAdminUserPassword,
  resetAdminUserPassword,
  toggleAdminUserStatus,
  updateAdminUserPermissions,
  getAdminUserActivity,
  getAdminUserStats,
  getRolesAndPermissions
};

