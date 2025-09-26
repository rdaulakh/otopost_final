const jwtManager = require('../utils/jwt');
const redisConnection = require('../config/redis');
const User = require('../models/User');
const AdminUser = require('../models/AdminUser');
const logger = require('../utils/logger');

// Customer authentication middleware
const authenticateCustomer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtManager.extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
        code: 'TOKEN_MISSING'
      });
    }
    
    // Check if token is blacklisted
    const isBlacklisted = await redisConnection.exists(`blacklist:customer:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked',
        code: 'TOKEN_REVOKED'
      });
    }
    
    // Verify token
    const decoded = jwtManager.verifyCustomerToken(token);
    
    // Get user from database
    const user = await User.findById(decoded.userId)
      .populate('organizationId')
      .select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive',
        code: 'USER_INACTIVE'
      });
    }
    
    if (!user.organizationId || !user.organizationId.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Organization is inactive',
        code: 'ORGANIZATION_INACTIVE'
      });
    }
    
    // Add user and organization to request
    req.user = user;
    req.organization = user.organizationId;
    req.token = token;
    
    // Update last active time
    user.activity.lastActiveAt = new Date();
    await user.save();
    
    // Log successful authentication
    logger.logUserActivity(user._id, 'api_access', {
      endpoint: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    next();
  } catch (error) {
    logger.logError(error, {
      middleware: 'authenticateCustomer',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    if (error.message === 'Token expired') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.message === 'Invalid token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
};

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtManager.extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
        code: 'TOKEN_MISSING'
      });
    }
    
    // Check if token is blacklisted (skip if Redis is not available)
    try {
      const isBlacklisted = await redisConnection.exists(`blacklist:admin:${token}`);
      if (isBlacklisted) {
        return res.status(401).json({
          success: false,
          message: 'Token has been revoked',
          code: 'TOKEN_REVOKED'
        });
      }
    } catch (redisError) {
      // Skip Redis check if connection fails
      logger.warn('Redis not available for token blacklist check:', redisError.message);
    }
    
    // Verify admin token
    const decoded = jwtManager.verifyAdminToken(token);
    
    // Get admin user from database
    const admin = await AdminUser.findById(decoded.adminId)
      .select('-password');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found',
        code: 'ADMIN_NOT_FOUND'
      });
    }
    
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is inactive',
        code: 'ADMIN_INACTIVE'
      });
    }
    
    // Add admin to request
    req.admin = admin;
    req.token = token;
    
    // Update last active time (don't save to avoid pre-save hook conflicts)
    admin.activity.lastActiveAt = new Date();
    // await admin.save(); // Commented out to avoid pre-save hook conflicts
    
    // Log successful authentication
    logger.logAdminActivity(admin._id, 'api_access', 'system', null, {
      endpoint: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    next();
  } catch (error) {
    logger.logError(error, {
      middleware: 'authenticateAdmin',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    if (error.message === 'Admin token expired') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.message === 'Invalid admin token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
};

// Permission middleware for customers
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    if (!req.user.hasPermission(permission)) {
      logger.logSecurity('permission_denied', {
        userId: req.user._id,
        permission,
        endpoint: req.path,
        ip: req.ip
      });
      
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'PERMISSION_DENIED',
        required: permission
      });
    }
    
    next();
  };
};

// Permission middleware for admins
const requireAdminPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required',
        code: 'ADMIN_AUTH_REQUIRED'
      });
    }
    
    if (!req.admin.hasPermission(permission)) {
      logger.logSecurity('admin_permission_denied', {
        adminId: req.admin._id,
        permission,
        endpoint: req.path,
        ip: req.ip
      });
      
      return res.status(403).json({
        success: false,
        message: 'Insufficient admin permissions',
        code: 'ADMIN_PERMISSION_DENIED',
        required: permission
      });
    }
    
    next();
  };
};

// Role-based access control for customers
const requireRole = (roles) => {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    if (!roleArray.includes(req.user.role)) {
      logger.logSecurity('role_access_denied', {
        userId: req.user._id,
        userRole: req.user.role,
        requiredRoles: roleArray,
        endpoint: req.path,
        ip: req.ip
      });
      
      return res.status(403).json({
        success: false,
        message: 'Insufficient role permissions',
        code: 'ROLE_DENIED',
        required: roleArray,
        current: req.user.role
      });
    }
    
    next();
  };
};

// Role-based access control for admins
const requireAdminRole = (roles) => {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required',
        code: 'ADMIN_AUTH_REQUIRED'
      });
    }
    
    if (!roleArray.includes(req.admin.role)) {
      logger.logSecurity('admin_role_access_denied', {
        adminId: req.admin._id,
        adminRole: req.admin.role,
        requiredRoles: roleArray,
        endpoint: req.path,
        ip: req.ip
      });
      
      return res.status(403).json({
        success: false,
        message: 'Insufficient admin role permissions',
        code: 'ADMIN_ROLE_DENIED',
        required: roleArray,
        current: req.admin.role
      });
    }
    
    next();
  };
};

// Organization access middleware
const requireOrganizationAccess = (req, res, next) => {
  const organizationId = req.params.organizationId || req.body.organizationId || req.query.organizationId;
  
  if (!organizationId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required',
      code: 'ORGANIZATION_ID_REQUIRED'
    });
  }
  
  if (req.user && req.user.organizationId.toString() !== organizationId) {
    logger.logSecurity('organization_access_denied', {
      userId: req.user._id,
      userOrganization: req.user.organizationId,
      requestedOrganization: organizationId,
      endpoint: req.path,
      ip: req.ip
    });
    
    return res.status(403).json({
      success: false,
      message: 'Access denied to this organization',
      code: 'ORGANIZATION_ACCESS_DENIED'
    });
  }
  
  next();
};

// Optional authentication middleware (for public endpoints that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtManager.extractTokenFromHeader(authHeader);
    
    if (token) {
      // Check if token is blacklisted
      const isBlacklisted = await redisConnection.exists(`blacklist:customer:${token}`);
      if (!isBlacklisted) {
        try {
          const decoded = jwtManager.verifyCustomerToken(token);
          const user = await User.findById(decoded.userId)
            .populate('organizationId')
            .select('-password');
          
          if (user && user.isActive && user.organizationId && user.organizationId.isActive) {
            req.user = user;
            req.organization = user.organizationId;
            req.token = token;
          }
        } catch (error) {
          // Ignore token errors for optional auth
        }
      }
    }
    
    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
};

// Subscription status middleware
const requireActiveSubscription = (req, res, next) => {
  if (!req.organization) {
    return res.status(401).json({
      success: false,
      message: 'Organization context required',
      code: 'ORGANIZATION_REQUIRED'
    });
  }
  
  const subscription = req.organization.subscription;
  
  if (!subscription || !['active', 'trialing'].includes(subscription.status)) {
    return res.status(402).json({
      success: false,
      message: 'Active subscription required',
      code: 'SUBSCRIPTION_REQUIRED',
      subscriptionStatus: subscription ? subscription.status : 'none'
    });
  }
  
  next();
};

// Feature access middleware
const requireFeature = (feature) => {
  return (req, res, next) => {
    if (!req.organization) {
      return res.status(401).json({
        success: false,
        message: 'Organization context required',
        code: 'ORGANIZATION_REQUIRED'
      });
    }
    
    if (!req.organization.hasFeature(feature)) {
      return res.status(402).json({
        success: false,
        message: `Feature '${feature}' not available in current plan`,
        code: 'FEATURE_NOT_AVAILABLE',
        feature,
        currentPlan: req.organization.subscription.planId
      });
    }
    
    next();
  };
};

module.exports = {
  authenticateCustomer,
  authenticateAdmin,
  requirePermission,
  requireAdminPermission,
  requireRole,
  requireAdminRole,
  requireOrganizationAccess,
  optionalAuth,
  requireActiveSubscription,
  requireFeature
};

