const logger = require('../utils/logger');

/**
 * Advanced permissions middleware for granular role-based access control
 */

// Define permission levels
const PERMISSION_LEVELS = {
  NONE: 0,
  READ: 1,
  WRITE: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4
};

// Define resource types
const RESOURCES = {
  USER: 'user',
  ORGANIZATION: 'organization',
  CONTENT: 'content',
  ANALYTICS: 'analytics',
  CAMPAIGNS: 'campaigns',
  AI_AGENTS: 'ai_agents',
  BILLING: 'billing',
  SETTINGS: 'settings',
  REPORTS: 'reports',
  INTEGRATIONS: 'integrations'
};

// Define actions
const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  PUBLISH: 'publish',
  SCHEDULE: 'schedule',
  ANALYZE: 'analyze',
  MANAGE: 'manage',
  CONFIGURE: 'configure',
  EXPORT: 'export'
};

// Permission matrix: [resource][action] = required permission level
const PERMISSION_MATRIX = {
  [RESOURCES.USER]: {
    [ACTIONS.CREATE]: PERMISSION_LEVELS.ADMIN,
    [ACTIONS.READ]: PERMISSION_LEVELS.READ,
    [ACTIONS.UPDATE]: PERMISSION_LEVELS.WRITE,
    [ACTIONS.DELETE]: PERMISSION_LEVELS.ADMIN
  },
  [RESOURCES.ORGANIZATION]: {
    [ACTIONS.CREATE]: PERMISSION_LEVELS.SUPER_ADMIN,
    [ACTIONS.READ]: PERMISSION_LEVELS.READ,
    [ACTIONS.UPDATE]: PERMISSION_LEVELS.ADMIN,
    [ACTIONS.DELETE]: PERMISSION_LEVELS.SUPER_ADMIN,
    [ACTIONS.MANAGE]: PERMISSION_LEVELS.ADMIN
  },
  [RESOURCES.CONTENT]: {
    [ACTIONS.CREATE]: PERMISSION_LEVELS.WRITE,
    [ACTIONS.READ]: PERMISSION_LEVELS.READ,
    [ACTIONS.UPDATE]: PERMISSION_LEVELS.WRITE,
    [ACTIONS.DELETE]: PERMISSION_LEVELS.WRITE,
    [ACTIONS.PUBLISH]: PERMISSION_LEVELS.WRITE,
    [ACTIONS.SCHEDULE]: PERMISSION_LEVELS.WRITE
  },
  [RESOURCES.ANALYTICS]: {
    [ACTIONS.READ]: PERMISSION_LEVELS.READ,
    [ACTIONS.ANALYZE]: PERMISSION_LEVELS.WRITE,
    [ACTIONS.EXPORT]: PERMISSION_LEVELS.WRITE
  },
  [RESOURCES.CAMPAIGNS]: {
    [ACTIONS.CREATE]: PERMISSION_LEVELS.WRITE,
    [ACTIONS.READ]: PERMISSION_LEVELS.READ,
    [ACTIONS.UPDATE]: PERMISSION_LEVELS.WRITE,
    [ACTIONS.DELETE]: PERMISSION_LEVELS.WRITE,
    [ACTIONS.MANAGE]: PERMISSION_LEVELS.ADMIN
  },
  [RESOURCES.AI_AGENTS]: {
    [ACTIONS.CREATE]: PERMISSION_LEVELS.ADMIN,
    [ACTIONS.READ]: PERMISSION_LEVELS.READ,
    [ACTIONS.UPDATE]: PERMISSION_LEVELS.ADMIN,
    [ACTIONS.DELETE]: PERMISSION_LEVELS.ADMIN,
    [ACTIONS.CONFIGURE]: PERMISSION_LEVELS.ADMIN
  },
  [RESOURCES.BILLING]: {
    [ACTIONS.READ]: PERMISSION_LEVELS.ADMIN,
    [ACTIONS.UPDATE]: PERMISSION_LEVELS.ADMIN,
    [ACTIONS.MANAGE]: PERMISSION_LEVELS.ADMIN
  },
  [RESOURCES.SETTINGS]: {
    [ACTIONS.READ]: PERMISSION_LEVELS.READ,
    [ACTIONS.UPDATE]: PERMISSION_LEVELS.ADMIN,
    [ACTIONS.CONFIGURE]: PERMISSION_LEVELS.ADMIN
  },
  [RESOURCES.REPORTS]: {
    [ACTIONS.CREATE]: PERMISSION_LEVELS.WRITE,
    [ACTIONS.READ]: PERMISSION_LEVELS.READ,
    [ACTIONS.UPDATE]: PERMISSION_LEVELS.WRITE,
    [ACTIONS.DELETE]: PERMISSION_LEVELS.WRITE,
    [ACTIONS.EXPORT]: PERMISSION_LEVELS.WRITE
  },
  [RESOURCES.INTEGRATIONS]: {
    [ACTIONS.CREATE]: PERMISSION_LEVELS.ADMIN,
    [ACTIONS.READ]: PERMISSION_LEVELS.READ,
    [ACTIONS.UPDATE]: PERMISSION_LEVELS.ADMIN,
    [ACTIONS.DELETE]: PERMISSION_LEVELS.ADMIN,
    [ACTIONS.CONFIGURE]: PERMISSION_LEVELS.ADMIN
  }
};

/**
 * Check if user has permission for specific resource and action
 */
const hasPermission = (user, resource, action) => {
  try {
    // Super admin has all permissions
    if (user.role === 'superadmin') {
      return true;
    }

    // Check if resource and action exist in matrix
    if (!PERMISSION_MATRIX[resource] || !PERMISSION_MATRIX[resource][action]) {
      logger.warn(`Permission not defined for resource: ${resource}, action: ${action}`);
      return false;
    }

    // Get required permission level
    const requiredLevel = PERMISSION_MATRIX[resource][action];
    
    // Get user's permission level for this resource
    const userLevel = getUserPermissionLevel(user, resource);
    
    // Check if user has sufficient permission level
    return userLevel >= requiredLevel;
  } catch (error) {
    logger.error('Error checking permission:', error);
    return false;
  }
};

/**
 * Get user's permission level for a specific resource
 */
const getUserPermissionLevel = (user, resource) => {
  try {
    // Check if user has specific permissions for this resource
    if (user.permissions && user.permissions[resource]) {
      return user.permissions[resource].level || PERMISSION_LEVELS.NONE;
    }

    // Fall back to role-based permissions
    const rolePermissions = {
      'owner': PERMISSION_LEVELS.ADMIN,
      'admin': PERMISSION_LEVELS.ADMIN,
      'manager': PERMISSION_LEVELS.WRITE,
      'editor': PERMISSION_LEVELS.WRITE,
      'viewer': PERMISSION_LEVELS.READ,
      'member': PERMISSION_LEVELS.READ
    };

    return rolePermissions[user.role] || PERMISSION_LEVELS.NONE;
  } catch (error) {
    logger.error('Error getting user permission level:', error);
    return PERMISSION_LEVELS.NONE;
  }
};

/**
 * Middleware to check permissions
 */
const checkPermission = (resource, action) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      if (!hasPermission(user, resource, action)) {
        logger.warn(`Permission denied for user ${user._id} on ${resource}:${action}`);
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          code: 'PERMISSION_DENIED',
          required: {
            resource,
            action,
            level: PERMISSION_MATRIX[resource]?.[action] || 'unknown'
          }
        });
      }

      // Add permission info to request
      req.permission = {
        resource,
        action,
        level: getUserPermissionLevel(user, resource)
      };

      next();
    } catch (error) {
      logger.error('Error in permission middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check failed',
        code: 'PERMISSION_ERROR'
      });
    }
  };
};

/**
 * Middleware to check multiple permissions (user needs ALL)
 */
const checkMultiplePermissions = (permissions) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Check all permissions
      for (const { resource, action } of permissions) {
        if (!hasPermission(user, resource, action)) {
          logger.warn(`Permission denied for user ${user._id} on ${resource}:${action}`);
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions',
            code: 'PERMISSION_DENIED',
            required: permissions
          });
        }
      }

      next();
    } catch (error) {
      logger.error('Error in multiple permission middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check failed',
        code: 'PERMISSION_ERROR'
      });
    }
  };
};

/**
 * Middleware to check any of multiple permissions (user needs ANY)
 */
const checkAnyPermission = (permissions) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Check if user has any of the permissions
      const hasAnyPermission = permissions.some(({ resource, action }) => 
        hasPermission(user, resource, action)
      );

      if (!hasAnyPermission) {
        logger.warn(`No permissions found for user ${user._id} in any of:`, permissions);
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          code: 'PERMISSION_DENIED',
          required: permissions
        });
      }

      next();
    } catch (error) {
      logger.error('Error in any permission middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check failed',
        code: 'PERMISSION_ERROR'
      });
    }
  };
};

/**
 * Middleware to check organization-level permissions
 */
const checkOrganizationPermission = (action) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      const organization = req.organization;
      
      if (!user || !organization) {
        return res.status(401).json({
          success: false,
          message: 'Authentication and organization required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Check if user belongs to the organization
      if (user.organizationId.toString() !== organization._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this organization',
          code: 'ORG_ACCESS_DENIED'
        });
      }

      // Check permission for organization resource
      if (!hasPermission(user, RESOURCES.ORGANIZATION, action)) {
        logger.warn(`Organization permission denied for user ${user._id} on ${action}`);
        return res.status(403).json({
          success: false,
          message: 'Insufficient organization permissions',
          code: 'ORG_PERMISSION_DENIED'
        });
      }

      next();
    } catch (error) {
      logger.error('Error in organization permission middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Organization permission check failed',
        code: 'ORG_PERMISSION_ERROR'
      });
    }
  };
};

/**
 * Middleware to check resource ownership
 */
const checkResourceOwnership = (resourceParam = 'id') => {
  return (req, res, next) => {
    try {
      const user = req.user;
      const resourceId = req.params[resourceParam];
      
      if (!user || !resourceId) {
        return res.status(400).json({
          success: false,
          message: 'User and resource ID required',
          code: 'INVALID_REQUEST'
        });
      }

      // Check if user owns the resource or has admin permissions
      if (user.role === 'admin' || user.role === 'owner') {
        return next();
      }

      // For specific resources, check ownership
      const resource = req.resource; // Should be populated by previous middleware
      if (resource && resource.userId && resource.userId.toString() !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this resource',
          code: 'RESOURCE_ACCESS_DENIED'
        });
      }

      next();
    } catch (error) {
      logger.error('Error in resource ownership middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Resource ownership check failed',
        code: 'OWNERSHIP_ERROR'
      });
    }
  };
};

/**
 * Get user's effective permissions
 */
const getUserPermissions = (user) => {
  try {
    const permissions = {};
    
    // Get permissions for each resource
    Object.values(RESOURCES).forEach(resource => {
      permissions[resource] = {
        level: getUserPermissionLevel(user, resource),
        actions: getAvailableActions(user, resource)
      };
    });

    return permissions;
  } catch (error) {
    logger.error('Error getting user permissions:', error);
    return {};
  }
};

/**
 * Get available actions for user on a resource
 */
const getAvailableActions = (user, resource) => {
  try {
    const userLevel = getUserPermissionLevel(user, resource);
    const actions = [];

    if (PERMISSION_MATRIX[resource]) {
      Object.entries(PERMISSION_MATRIX[resource]).forEach(([action, requiredLevel]) => {
        if (userLevel >= requiredLevel) {
          actions.push(action);
        }
      });
    }

    return actions;
  } catch (error) {
    logger.error('Error getting available actions:', error);
    return [];
  }
};

module.exports = {
  PERMISSION_LEVELS,
  RESOURCES,
  ACTIONS,
  PERMISSION_MATRIX,
  hasPermission,
  getUserPermissionLevel,
  checkPermission,
  checkMultiplePermissions,
  checkAnyPermission,
  checkOrganizationPermission,
  checkResourceOwnership,
  getUserPermissions,
  getAvailableActions
};

