const logger = require('../utils/logger');

/**
 * Error Handling Middleware
 * Comprehensive error handling and logging
 */

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400);
    this.field = field;
    this.type = 'validation';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.type = 'authentication';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
    this.type = 'authorization';
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
    this.type = 'not_found';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
    this.type = 'conflict';
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
    this.type = 'rate_limit';
  }
}

class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 503);
    this.type = 'service_unavailable';
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    userId: req.user?.id
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid ID format';
    error = new ValidationError(message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = new ConflictError(message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ValidationError(message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AuthenticationError(message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AuthenticationError(message);
  }

  // Rate limit errors
  if (err.type === 'rate_limit') {
    error = new RateLimitError(err.message);
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = new ValidationError(message);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = new ValidationError(message);
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files';
    error = new ValidationError(message);
  }

  // Database connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    const message = 'Database connection error';
    error = new ServiceUnavailableError(message);
  }

  // Send error response
  sendErrorResponse(error, req, res);
};

// Send error response
const sendErrorResponse = (err, req, res) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Don't leak error details in production
  if (isProduction && !err.isOperational) {
    statusCode = 500;
    message = 'Something went wrong';
  }

  // Error response object
  const errorResponse = {
    success: false,
    message,
    ...(isDevelopment && { stack: err.stack }),
    ...(isDevelopment && { error: err }),
    ...(err.field && { field: err.field }),
    ...(err.type && { type: err.type }),
    ...(err.retryAfter && { retryAfter: err.retryAfter })
  };

  // Add request ID for tracking
  if (req.requestId) {
    errorResponse.requestId = req.requestId;
  }

  // Add timestamp
  errorResponse.timestamp = new Date().toISOString();

  // Send response
  res.status(statusCode).json(errorResponse);
};

// Async error handler wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

// Unhandled promise rejection handler
const unhandledRejectionHandler = (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', {
    reason: reason.message,
    stack: reason.stack,
    promise
  });
  
  // Close server gracefully
  process.exit(1);
};

// Uncaught exception handler
const uncaughtExceptionHandler = (err) => {
  logger.error('Uncaught Exception:', {
    message: err.message,
    stack: err.stack
  });
  
  // Close server gracefully
  process.exit(1);
};

// Graceful shutdown handler
const gracefulShutdownHandler = (server) => {
  return (signal) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    
    server.close((err) => {
      if (err) {
        logger.error('Error during server shutdown:', err);
        process.exit(1);
      }
      
      logger.info('Server closed successfully');
      process.exit(0);
    });
    
    // Force close after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };
};

// Error logging middleware
const errorLoggingMiddleware = (err, req, res, next) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    level: 'error',
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    userId: req.user?.id,
    requestId: req.requestId,
    statusCode: err.statusCode || 500,
    type: err.type || 'unknown'
  };

  // Log to different levels based on error type
  if (err.statusCode >= 500) {
    logger.error('Server error:', errorLog);
  } else if (err.statusCode >= 400) {
    logger.warn('Client error:', errorLog);
  } else {
    logger.info('Error:', errorLog);
  }

  next(err);
};

// Error metrics middleware
const errorMetricsMiddleware = (err, req, res, next) => {
  // Increment error counters
  const errorType = err.type || 'unknown';
  const statusCode = err.statusCode || 500;
  
  // Log error metrics (you can integrate with monitoring services)
  logger.info('Error metrics:', {
    type: errorType,
    statusCode,
    endpoint: req.path,
    method: req.method
  });

  next(err);
};

// Error recovery middleware
const errorRecoveryMiddleware = (err, req, res, next) => {
  // Attempt to recover from certain errors
  if (err.name === 'MongoNetworkError') {
    // Retry database operations
    logger.info('Attempting to recover from database network error');
    // Add retry logic here
  }

  if (err.name === 'RedisConnectionError') {
    // Fallback to memory cache
    logger.info('Attempting to recover from Redis connection error');
    // Add fallback logic here
  }

  next(err);
};

// Error context middleware
const errorContextMiddleware = (err, req, res, next) => {
  // Add additional context to error
  err.context = {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  next(err);
};

// Error sanitization middleware
const errorSanitizationMiddleware = (err, req, res, next) => {
  // Remove sensitive information from error messages
  if (err.message) {
    err.message = err.message.replace(/password[^,]*/gi, 'password: [REDACTED]');
    err.message = err.message.replace(/token[^,]*/gi, 'token: [REDACTED]');
    err.message = err.message.replace(/secret[^,]*/gi, 'secret: [REDACTED]');
    err.message = err.message.replace(/key[^,]*/gi, 'key: [REDACTED]');
  }

  next(err);
};

// Error response formatting middleware
const errorResponseFormattingMiddleware = (err, req, res, next) => {
  // Format error response based on request type
  if (req.headers.accept?.includes('application/json')) {
    // JSON response
    next(err);
  } else if (req.headers.accept?.includes('text/html')) {
    // HTML response
    res.status(err.statusCode || 500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error ${err.statusCode || 500}</title>
        </head>
        <body>
          <h1>Error ${err.statusCode || 500}</h1>
          <p>${err.message || 'Internal server error'}</p>
          ${process.env.NODE_ENV === 'development' ? `<pre>${err.stack}</pre>` : ''}
        </body>
      </html>
    `);
  } else {
    // Plain text response
    res.status(err.statusCode || 500).send(err.message || 'Internal server error');
  }
};

// Error handler setup
const setupErrorHandlers = (app) => {
  // Global error handlers
  process.on('unhandledRejection', unhandledRejectionHandler);
  process.on('uncaughtException', uncaughtExceptionHandler);

  // Error middleware stack
  app.use(errorContextMiddleware);
  app.use(errorSanitizationMiddleware);
  app.use(errorLoggingMiddleware);
  app.use(errorMetricsMiddleware);
  app.use(errorRecoveryMiddleware);
  app.use(errorHandler);
  app.use(errorResponseFormattingMiddleware);
};

// Error statistics
const getErrorStats = () => {
  return {
    totalErrors: 0, // This would be tracked in a real implementation
    errorsByType: {},
    errorsByStatusCode: {},
    recentErrors: []
  };
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServiceUnavailableError,
  errorHandler,
  asyncHandler,
  notFoundHandler,
  unhandledRejectionHandler,
  uncaughtExceptionHandler,
  gracefulShutdownHandler,
  errorLoggingMiddleware,
  errorMetricsMiddleware,
  errorRecoveryMiddleware,
  errorContextMiddleware,
  errorSanitizationMiddleware,
  errorResponseFormattingMiddleware,
  setupErrorHandlers,
  getErrorStats
};

