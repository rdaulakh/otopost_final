const logger = require('../utils/logger');
const AuditLog = require('../models/AuditLog');

/**
 * Advanced audit logging middleware for comprehensive activity tracking
 */

// Define audit event types
const AUDIT_EVENTS = {
  // Authentication events
  LOGIN: 'user.login',
  LOGOUT: 'user.logout',
  LOGIN_FAILED: 'user.login_failed',
  PASSWORD_CHANGE: 'user.password_change',
  PASSWORD_RESET: 'user.password_reset',
  
  // User management events
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_ACTIVATE: 'user.activate',
  USER_DEACTIVATE: 'user.deactivate',
  
  // Organization events
  ORG_CREATE: 'organization.create',
  ORG_UPDATE: 'organization.update',
  ORG_DELETE: 'organization.delete',
  ORG_MEMBER_ADD: 'organization.member_add',
  ORG_MEMBER_REMOVE: 'organization.member_remove',
  ORG_MEMBER_ROLE_CHANGE: 'organization.member_role_change',
  
  // Content events
  CONTENT_CREATE: 'content.create',
  CONTENT_UPDATE: 'content.update',
  CONTENT_DELETE: 'content.delete',
  CONTENT_PUBLISH: 'content.publish',
  CONTENT_SCHEDULE: 'content.schedule',
  CONTENT_UNSCHEDULE: 'content.unschedule',
  
  // Campaign events
  CAMPAIGN_CREATE: 'campaign.create',
  CAMPAIGN_UPDATE: 'campaign.update',
  CAMPAIGN_DELETE: 'campaign.delete',
  CAMPAIGN_START: 'campaign.start',
  CAMPAIGN_PAUSE: 'campaign.pause',
  CAMPAIGN_STOP: 'campaign.stop',
  
  // Analytics events
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_EXPORT: 'analytics.export',
  REPORT_CREATE: 'report.create',
  REPORT_UPDATE: 'report.update',
  REPORT_DELETE: 'report.delete',
  
  // AI Agent events
  AI_AGENT_CREATE: 'ai_agent.create',
  AI_AGENT_UPDATE: 'ai_agent.update',
  AI_AGENT_DELETE: 'ai_agent.delete',
  AI_AGENT_EXECUTE: 'ai_agent.execute',
  AI_AGENT_CONFIGURE: 'ai_agent.configure',
  
  // Billing events
  SUBSCRIPTION_CREATE: 'subscription.create',
  SUBSCRIPTION_UPDATE: 'subscription.update',
  SUBSCRIPTION_CANCEL: 'subscription.cancel',
  PAYMENT_SUCCESS: 'payment.success',
  PAYMENT_FAILED: 'payment.failed',
  INVOICE_GENERATE: 'invoice.generate',
  
  // Settings events
  SETTINGS_UPDATE: 'settings.update',
  INTEGRATION_CONFIGURE: 'integration.configure',
  INTEGRATION_DISCONNECT: 'integration.disconnect',
  
  // Security events
  PERMISSION_CHANGE: 'security.permission_change',
  ROLE_CHANGE: 'security.role_change',
  SUSPICIOUS_ACTIVITY: 'security.suspicious_activity',
  RATE_LIMIT_EXCEEDED: 'security.rate_limit_exceeded',
  UNAUTHORIZED_ACCESS: 'security.unauthorized_access',
  
  // System events
  SYSTEM_START: 'system.start',
  SYSTEM_STOP: 'system.stop',
  SYSTEM_ERROR: 'system.error',
  MAINTENANCE_START: 'system.maintenance_start',
  MAINTENANCE_END: 'system.maintenance_end'
};

// Define severity levels
const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Create audit log entry
 */
const createAuditLog = async (auditData) => {
  try {
    const auditLog = new AuditLog({
      event: auditData.event,
      severity: auditData.severity || SEVERITY_LEVELS.LOW,
      userId: auditData.userId,
      organizationId: auditData.organizationId,
      resourceType: auditData.resourceType,
      resourceId: auditData.resourceId,
      action: auditData.action,
      description: auditData.description,
      metadata: auditData.metadata || {},
      ipAddress: auditData.ipAddress,
      userAgent: auditData.userAgent,
      timestamp: new Date(),
      success: auditData.success !== false,
      errorMessage: auditData.errorMessage
    });

    await auditLog.save();
    logger.info(`Audit log created: ${auditData.event}`, { auditId: auditLog._id });
    
    return auditLog;
  } catch (error) {
    logger.error('Error creating audit log:', error);
    throw error;
  }
};

/**
 * Middleware to log API requests
 */
const logApiRequest = (event, options = {}) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.send;
    
    // Override res.send to capture response
    res.send = function(data) {
      const duration = Date.now() - startTime;
      
      // Log the request asynchronously
      setImmediate(async () => {
        try {
          await createAuditLog({
            event,
            severity: options.severity || SEVERITY_LEVELS.LOW,
            userId: req.user?._id,
            organizationId: req.organization?._id,
            resourceType: options.resourceType,
            resourceId: req.params.id || req.body.id,
            action: req.method,
            description: `${req.method} ${req.originalUrl}`,
            metadata: {
              url: req.originalUrl,
              method: req.method,
              statusCode: res.statusCode,
              duration,
              requestBody: sanitizeRequestBody(req.body),
              queryParams: req.query,
              responseSize: data ? data.length : 0
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            success: res.statusCode < 400
          });
        } catch (error) {
          logger.error('Error logging API request:', error);
        }
      });
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Middleware to log specific events
 */
const logEvent = (event, options = {}) => {
  return async (req, res, next) => {
    try {
      // Log the event
      await createAuditLog({
        event,
        severity: options.severity || SEVERITY_LEVELS.LOW,
        userId: req.user?._id,
        organizationId: req.organization?._id,
        resourceType: options.resourceType,
        resourceId: req.params.id || req.body.id,
        action: options.action || req.method,
        description: options.description || `${event} event`,
        metadata: {
          ...options.metadata,
          requestBody: sanitizeRequestBody(req.body),
          queryParams: req.query
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        success: true
      });
      
      next();
    } catch (error) {
      logger.error('Error logging event:', error);
      next(); // Continue even if logging fails
    }
  };
};

/**
 * Log security events
 */
const logSecurityEvent = (event, severity = SEVERITY_LEVELS.MEDIUM) => {
  return async (req, res, next) => {
    try {
      await createAuditLog({
        event,
        severity,
        userId: req.user?._id,
        organizationId: req.organization?._id,
        resourceType: 'security',
        action: 'security_event',
        description: `Security event: ${event}`,
        metadata: {
          url: req.originalUrl,
          method: req.method,
          requestBody: sanitizeRequestBody(req.body),
          queryParams: req.query,
          headers: sanitizeHeaders(req.headers)
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        success: false
      });
      
      next();
    } catch (error) {
      logger.error('Error logging security event:', error);
      next();
    }
  };
};

/**
 * Log data changes
 */
const logDataChange = (event, resourceType, options = {}) => {
  return async (req, res, next) => {
    try {
      const originalData = options.originalData || {};
      const newData = req.body;
      
      // Calculate changes
      const changes = calculateChanges(originalData, newData);
      
      if (Object.keys(changes).length > 0) {
        await createAuditLog({
          event,
          severity: options.severity || SEVERITY_LEVELS.LOW,
          userId: req.user?._id,
          organizationId: req.organization?._id,
          resourceType,
          resourceId: req.params.id || req.body.id,
          action: 'update',
          description: `Data changed in ${resourceType}`,
          metadata: {
            changes,
            originalData: sanitizeData(originalData),
            newData: sanitizeData(newData),
            changeCount: Object.keys(changes).length
          },
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          success: true
        });
      }
      
      next();
    } catch (error) {
      logger.error('Error logging data change:', error);
      next();
    }
  };
};

/**
 * Log user activity
 */
const logUserActivity = (event, description, options = {}) => {
  return async (req, res, next) => {
    try {
      await createAuditLog({
        event,
        severity: options.severity || SEVERITY_LEVELS.LOW,
        userId: req.user?._id,
        organizationId: req.organization?._id,
        resourceType: 'user_activity',
        action: 'activity',
        description,
        metadata: {
          ...options.metadata,
          url: req.originalUrl,
          method: req.method
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        success: true
      });
      
      next();
    } catch (error) {
      logger.error('Error logging user activity:', error);
      next();
    }
  };
};

/**
 * Calculate changes between two objects
 */
const calculateChanges = (original, updated) => {
  const changes = {};
  
  for (const key in updated) {
    if (original[key] !== updated[key]) {
      changes[key] = {
        from: original[key],
        to: updated[key]
      };
    }
  }
  
  return changes;
};

/**
 * Sanitize request body to remove sensitive data
 */
const sanitizeRequestBody = (body) => {
  if (!body || typeof body !== 'object') {
    return body;
  }
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'creditCard'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

/**
 * Sanitize headers to remove sensitive data
 */
const sanitizeHeaders = (headers) => {
  const sanitized = { ...headers };
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  
  sensitiveHeaders.forEach(header => {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

/**
 * Sanitize data object
 */
const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  return sanitizeRequestBody(data);
};

/**
 * Get audit logs with filtering
 */
const getAuditLogs = async (filters = {}, options = {}) => {
  try {
    const {
      userId,
      organizationId,
      event,
      severity,
      resourceType,
      resourceId,
      startDate,
      endDate,
      success,
      page = 1,
      limit = 50,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = filters;

    const query = {};
    
    if (userId) query.userId = userId;
    if (organizationId) query.organizationId = organizationId;
    if (event) query.event = event;
    if (severity) query.severity = severity;
    if (resourceType) query.resourceType = resourceType;
    if (resourceId) query.resourceId = resourceId;
    if (success !== undefined) query.success = success;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('userId', 'email firstName lastName')
        .populate('organizationId', 'name')
        .lean(),
      AuditLog.countDocuments(query)
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Error getting audit logs:', error);
    throw error;
  }
};

/**
 * Export audit logs
 */
const exportAuditLogs = async (filters = {}, format = 'json') => {
  try {
    const { logs } = await getAuditLogs(filters, { limit: 10000 });
    
    if (format === 'csv') {
      return convertToCSV(logs);
    } else if (format === 'excel') {
      return convertToExcel(logs);
    } else {
      return logs;
    }
  } catch (error) {
    logger.error('Error exporting audit logs:', error);
    throw error;
  }
};

/**
 * Convert logs to CSV format
 */
const convertToCSV = (logs) => {
  const headers = [
    'Timestamp',
    'Event',
    'Severity',
    'User',
    'Organization',
    'Resource Type',
    'Resource ID',
    'Action',
    'Description',
    'Success',
    'IP Address'
  ];
  
  const rows = logs.map(log => [
    log.timestamp,
    log.event,
    log.severity,
    log.userId?.email || 'N/A',
    log.organizationId?.name || 'N/A',
    log.resourceType,
    log.resourceId || 'N/A',
    log.action,
    log.description,
    log.success,
    log.ipAddress
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

/**
 * Convert logs to Excel format (simplified)
 */
const convertToExcel = (logs) => {
  // This would typically use a library like xlsx
  // For now, return JSON format
  return logs;
};

/**
 * Clean up old audit logs
 */
const cleanupAuditLogs = async (retentionDays = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    const result = await AuditLog.deleteMany({
      timestamp: { $lt: cutoffDate },
      severity: { $ne: SEVERITY_LEVELS.CRITICAL }
    });
    
    logger.info(`Cleaned up ${result.deletedCount} old audit logs`);
    return result.deletedCount;
  } catch (error) {
    logger.error('Error cleaning up audit logs:', error);
    throw error;
  }
};

module.exports = {
  AUDIT_EVENTS,
  SEVERITY_LEVELS,
  createAuditLog,
  logApiRequest,
  logEvent,
  logSecurityEvent,
  logDataChange,
  logUserActivity,
  getAuditLogs,
  exportAuditLogs,
  cleanupAuditLogs
};

