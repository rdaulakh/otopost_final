const logger = require('../utils/logger');

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE_ERROR');
  }
}

// MongoDB error handlers
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ValidationError(message);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new ConflictError(message);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => ({
    field: el.path,
    message: el.message,
    value: el.value
  }));
  
  const message = 'Invalid input data';
  return new ValidationError(message, errors);
};

// JWT error handlers
const handleJWTError = () =>
  new AuthenticationError('Invalid token. Please log in again!');

const handleJWTExpiredError = () =>
  new AuthenticationError('Your token has expired! Please log in again.');

// Redis error handler
const handleRedisError = (err) => {
  logger.logError(err, { context: 'Redis connection error' });
  return new ServiceUnavailableError('Cache service temporarily unavailable');
};

// Send error response in development
const sendErrorDev = (err, req, res) => {
  // API errors
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      success: false,
      error: err,
      message: err.message,
      code: err.code,
      stack: err.stack,
      ...(err.errors && { errors: err.errors })
    });
  }
  
  // Rendered website errors (if any)
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: err
  });
};

// Send error response in production
const sendErrorProd = (err, req, res) => {
  // API errors
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        code: err.code,
        ...(err.errors && { errors: err.errors })
      });
    }
    
    // Programming or other unknown error: don't leak error details
    logger.logError(err, {
      context: 'Unhandled error in production',
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    return res.status(500).json({
      success: false,
      message: 'Something went wrong!',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
  
  // Rendered website errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }
  
  // Programming or other unknown error
  logger.logError(err, {
    context: 'Unhandled error in production',
    url: req.originalUrl
  });
  
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
};

// Global error handling middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    
    // Handle specific error types
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (error.name === 'RedisError') error = handleRedisError(error);
    
    sendErrorProd(error, req, res);
  }
};

// Async error wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// 404 handler for non-API routes
const notFoundHandler = (req, res, next) => {
  const err = new NotFoundError(`Can't find ${req.originalUrl} on this server!`);
  next(err);
};

// Unhandled promise rejection handler
const handleUnhandledRejection = (err) => {
  logger.logError(err, { context: 'Unhandled Promise Rejection' });
  console.log('UNHANDLED PROMISE REJECTION! 💥 Shutting down...');
  process.exit(1);
};

// Uncaught exception handler
const handleUncaughtException = (err) => {
  logger.logError(err, { context: 'Uncaught Exception' });
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  process.exit(1);
};

// SIGTERM handler
const handleSIGTERM = () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  process.exit(0);
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
  globalErrorHandler,
  catchAsync,
  notFoundHandler,
  handleUnhandledRejection,
  handleUncaughtException,
  handleSIGTERM
};

