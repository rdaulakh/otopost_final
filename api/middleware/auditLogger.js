const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Create different loggers for different types of events
const createLogger = (filename, level = 'info') => {
  return winston.createLogger({
    level,
    format: logFormat,
    transports: [
      new winston.transports.DailyRotateFile({
        filename: path.join(logsDir, `${filename}-%DATE%.log`),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30d',
        zippedArchive: true
      }),
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
        silent: process.env.NODE_ENV === 'production'
      })
    ]
  });
};

// Different loggers for different purposes
const loggers = {
  audit: createLogger('audit'),
  security: createLogger('security', 'warn'),
  api: createLogger('api'),
  auth: createLogger('auth'),
  error: createLogger('error', 'error'),
  performance: createLogger('performance'),
  user: createLogger('user-activity')
};

// Audit event types
const AUDIT_EVENTS = {
  // Authentication events
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  PASSWORD_RESET: 'PASSWORD_RESET',
  
  // User management events
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  USER_SUSPENDED: 'USER_SUSPENDED',
  USER_ACTIVATED: 'USER_ACTIVATED',
  
  // Content events
  CONTENT_CREATED: 'CONTENT_CREATED',
  CONTENT_UPDATED: 'CONTENT_UPDATED',
  CONTENT_DELETED: 'CONTENT_DELETED',
  CONTENT_PUBLISHED: 'CONTENT_PUBLISHED',
  CONTENT_SCHEDULED: 'CONTENT_SCHEDULED',
  
  // Social media events
  SOCIAL_ACCOUNT_CONNECTED: 'SOCIAL_ACCOUNT_CONNECTED',
  SOCIAL_ACCOUNT_DISCONNECTED: 'SOCIAL_ACCOUNT_DISCONNECTED',
  SOCIAL_POST_PUBLISHED: 'SOCIAL_POST_PUBLISHED',
  SOCIAL_POST_FAILED: 'SOCIAL_POST_FAILED',
  
  // File events
  FILE_UPLOADED: 'FILE_UPLOADED',
  FILE_DELETED: 'FILE_DELETED',
  FILE_ACCESSED: 'FILE_ACCESSED',
  
  // AI events
  AI_CONTENT_GENERATED: 'AI_CONTENT_GENERATED',
  AI_HASHTAGS_GENERATED: 'AI_HASHTAGS_GENERATED',
  AI_ANALYSIS_PERFORMED: 'AI_ANALYSIS_PERFORMED',
  
  // Security events
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // System events
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  SYSTEM_WARNING: 'SYSTEM_WARNING',
  SYSTEM_INFO: 'SYSTEM_INFO',
  
  // Admin events
  ADMIN_ACTION: 'ADMIN_ACTION',
  SETTINGS_CHANGED: 'SETTINGS_CHANGED',
  SUBSCRIPTION_CHANGED: 'SUBSCRIPTION_CHANGED'
};

// Risk levels
const RISK_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

class AuditLogger {
  constructor() {
    this.loggers = loggers;
    this.events = AUDIT_EVENTS;
    this.riskLevels = RISK_LEVELS;
  }

  // Main audit logging method
  log(eventType, data, req = null, riskLevel = RISK_LEVELS.LOW) {
    const auditEntry = this.createAuditEntry(eventType, data, req, riskLevel);
    
    // Log to appropriate logger based on event type and risk level
    if (riskLevel === RISK_LEVELS.CRITICAL || riskLevel === RISK_LEVELS.HIGH) {
      this.loggers.security.warn('Security Event', auditEntry);
    }
    
    if (eventType.includes('AUTH') || eventType.includes('LOGIN') || eventType.includes('PASSWORD')) {
      this.loggers.auth.info('Authentication Event', auditEntry);
    }
    
    if (eventType.includes('USER')) {
      this.loggers.user.info('User Activity', auditEntry);
    }
    
    if (eventType.includes('ERROR') || eventType.includes('FAILED')) {
      this.loggers.error.error('Error Event', auditEntry);
    }
    
    // Always log to main audit log
    this.loggers.audit.info('Audit Event', auditEntry);
    
    // Store in database for querying (implement as needed)
    this.storeInDatabase(auditEntry);
  }

  createAuditEntry(eventType, data, req, riskLevel) {
    const entry = {
      eventType,
      timestamp: new Date().toISOString(),
      riskLevel,
      data: this.sanitizeData(data),
      metadata: {}
    };

    // Add request information if available
    if (req) {
      entry.metadata = {
        userId: req.user?.id || null,
        userEmail: req.user?.email || null,
        userRole: req.user?.role || null,
        ip: this.getClientIP(req),
        userAgent: req.get('User-Agent') || null,
        method: req.method,
        url: req.originalUrl,
        referer: req.get('Referer') || null,
        sessionId: req.sessionID || null,
        requestId: req.id || null
      };
    }

    // Add additional context based on event type
    entry.context = this.getEventContext(eventType, data);

    return entry;
  }

  sanitizeData(data) {
    // Remove sensitive information from log data
    const sensitiveFields = ['password', 'token', 'accessToken', 'refreshToken', 'secret', 'key'];
    const sanitized = JSON.parse(JSON.stringify(data));
    
    const sanitizeObject = (obj) => {
      for (const key in obj) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };

    if (typeof sanitized === 'object' && sanitized !== null) {
      sanitizeObject(sanitized);
    }

    return sanitized;
  }

  getClientIP(req) {
    return req.ip || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           req.headers['x-forwarded-for']?.split(',')[0] || 
           'unknown';
  }

  getEventContext(eventType, data) {
    const context = {};

    switch (eventType) {
      case AUDIT_EVENTS.LOGIN_SUCCESS:
      case AUDIT_EVENTS.LOGIN_FAILED:
        context.loginMethod = data.method || 'email';
        context.rememberMe = data.rememberMe || false;
        break;
      
      case AUDIT_EVENTS.CONTENT_CREATED:
      case AUDIT_EVENTS.CONTENT_UPDATED:
        context.contentType = data.type || 'post';
        context.platforms = data.platforms || [];
        context.scheduled = !!data.scheduledFor;
        break;
      
      case AUDIT_EVENTS.FILE_UPLOADED:
        context.fileType = data.mimetype || 'unknown';
        context.fileSize = data.size || 0;
        context.fileName = data.originalName || 'unknown';
        break;
      
      case AUDIT_EVENTS.AI_CONTENT_GENERATED:
        context.aiModel = data.model || 'unknown';
        context.platform = data.platform || 'unknown';
        context.promptLength = data.prompt?.length || 0;
        break;
      
      case AUDIT_EVENTS.RATE_LIMIT_EXCEEDED:
        context.endpoint = data.endpoint || 'unknown';
        context.limit = data.limit || 0;
        context.attempts = data.attempts || 0;
        break;
    }

    return context;
  }

  async storeInDatabase(auditEntry) {
    // Implement database storage for audit logs
    // This could be MongoDB, PostgreSQL, or a specialized audit database
    try {
      // Example: await AuditLog.create(auditEntry);
      console.log('Audit entry stored:', auditEntry.eventType);
    } catch (error) {
      console.error('Failed to store audit entry in database:', error);
    }
  }

  // Convenience methods for common events
  logLogin(success, userData, req, additionalData = {}) {
    const eventType = success ? AUDIT_EVENTS.LOGIN_SUCCESS : AUDIT_EVENTS.LOGIN_FAILED;
    const riskLevel = success ? RISK_LEVELS.LOW : RISK_LEVELS.MEDIUM;
    
    this.log(eventType, {
      email: userData.email,
      success,
      ...additionalData
    }, req, riskLevel);
  }

  logUserAction(action, userId, data, req) {
    this.log(action, {
      userId,
      ...data
    }, req, RISK_LEVELS.LOW);
  }

  logSecurityEvent(eventType, data, req, riskLevel = RISK_LEVELS.HIGH) {
    this.log(eventType, data, req, riskLevel);
  }

  logAPIAccess(req, res, responseTime) {
    const entry = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: req.user?.id || null,
      ip: this.getClientIP(req),
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };

    this.loggers.api.info('API Access', entry);
  }

  logError(error, req, additionalData = {}) {
    const entry = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      userId: req?.user?.id || null,
      url: req?.originalUrl || null,
      method: req?.method || null,
      ip: req ? this.getClientIP(req) : null,
      ...additionalData,
      timestamp: new Date().toISOString()
    };

    this.loggers.error.error('Application Error', entry);
    this.log(AUDIT_EVENTS.SYSTEM_ERROR, entry, req, RISK_LEVELS.MEDIUM);
  }

  logPerformance(operation, duration, metadata = {}) {
    const entry = {
      operation,
      duration: `${duration}ms`,
      metadata,
      timestamp: new Date().toISOString()
    };

    this.loggers.performance.info('Performance Metric', entry);
  }

  // Query methods for audit logs
  async getAuditLogs(filters = {}) {
    // Implement querying of audit logs
    // This would typically query your database
    const {
      eventType,
      userId,
      startDate,
      endDate,
      riskLevel,
      limit = 100,
      offset = 0
    } = filters;

    // Example implementation would query database
    // return await AuditLog.find(query).limit(limit).skip(offset);
    
    return {
      logs: [],
      total: 0,
      message: 'Audit log querying not yet implemented'
    };
  }

  async getSecurityEvents(timeframe = '24h') {
    // Get security-related events within timeframe
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - (timeframe === '24h' ? 24 : 168));

    return this.getAuditLogs({
      riskLevel: [RISK_LEVELS.HIGH, RISK_LEVELS.CRITICAL],
      startDate,
      endDate: new Date()
    });
  }

  async getUserActivity(userId, timeframe = '7d') {
    // Get user activity within timeframe
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (timeframe === '7d' ? 7 : 30));

    return this.getAuditLogs({
      userId,
      startDate,
      endDate: new Date()
    });
  }
}

// Create singleton instance
const auditLogger = new AuditLogger();

// Express middleware for automatic API logging
const auditMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Log API access after response
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    auditLogger.logAPIAccess(req, res, responseTime);
  });

  next();
};

// Error logging middleware
const errorAuditMiddleware = (error, req, res, next) => {
  auditLogger.logError(error, req);
  next(error);
};

module.exports = {
  auditLogger,
  auditMiddleware,
  errorAuditMiddleware,
  AUDIT_EVENTS,
  RISK_LEVELS
};
