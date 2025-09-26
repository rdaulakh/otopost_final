const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}` +
    (info.splat !== undefined ? `${info.splat}` : " ") +
    (info.stack !== undefined ? `\n${info.stack}` : " ")
  )
);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    level: level(),
    format: format
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Add request logging middleware
logger.requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id || 'anonymous'
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.http('HTTP Request', logData);
    }
  });
  
  next();
};

// Add error logging helper
logger.logError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context
  };
  
  logger.error('Application Error', errorInfo);
};

// Add performance logging helper
logger.logPerformance = (operation, duration, metadata = {}) => {
  logger.info('Performance', {
    operation,
    duration: `${duration}ms`,
    ...metadata
  });
};

// Add security logging helper
logger.logSecurity = (event, details = {}) => {
  logger.warn('Security Event', {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Add database logging helper
logger.logDatabase = (operation, collection, duration, metadata = {}) => {
  logger.debug('Database Operation', {
    operation,
    collection,
    duration: `${duration}ms`,
    ...metadata
  });
};

// Add API logging helper
logger.logAPI = (endpoint, method, statusCode, duration, metadata = {}) => {
  const logLevel = statusCode >= 400 ? 'warn' : 'info';
  logger[logLevel]('API Call', {
    endpoint,
    method,
    statusCode,
    duration: `${duration}ms`,
    ...metadata
  });
};

// Add admin activity logging helper
logger.logAdminActivity = (adminId, action, target, details = {}) => {
  logger.info('Admin Activity', {
    adminId,
    action,
    target,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Add user activity logging helper
logger.logUserActivity = (userId, action, details = {}) => {
  logger.info('User Activity', {
    userId,
    action,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Add AI agent logging helper
logger.logAIAgent = (agentType, action, duration, success, metadata = {}) => {
  const logLevel = success ? 'info' : 'warn';
  logger[logLevel]('AI Agent', {
    agentType,
    action,
    duration: `${duration}ms`,
    success,
    timestamp: new Date().toISOString(),
    ...metadata
  });
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    message: error.message,
    stack: error.stack,
    name: error.name
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise: promise.toString()
  });
});

module.exports = logger;

