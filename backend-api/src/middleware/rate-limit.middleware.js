/**
 * Rate Limiting Middleware
 * Implements rate limiting for API endpoints
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('../config/redis');
const logger = require('../utils/logger');

// Create Redis store for rate limiting
const createRedisStore = () => {
  try {
    return new RedisStore({
      sendCommand: (...args) => redis.sendCommand(args),
    });
  } catch (error) {
    logger.warn('Redis not available for rate limiting, using memory store');
    return undefined;
  }
};

// General rate limiter - Increased limits for development
const generalLimiter = rateLimit({
  store: createRedisStore(),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased from 100 to 1000 requests per windowMs for development
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Strict rate limiter for sensitive endpoints
const strictLimiter = rateLimit({
  store: createRedisStore(),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too many attempts from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Strict rate limit exceeded for IP: ${req.ip} on endpoint: ${req.path}`);
    res.status(429).json({
      success: false,
      error: 'Too many attempts from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Auth rate limiter
const authLimiter = rateLimit({
  store: createRedisStore(),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Password reset rate limiter
const passwordResetLimiter = rateLimit({
  store: createRedisStore(),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    error: 'Too many password reset attempts, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Password reset rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many password reset attempts, please try again later.',
      retryAfter: '1 hour'
    });
  }
});

// API key rate limiter
const apiKeyLimiter = rateLimit({
  store: createRedisStore(),
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each API key to 60 requests per minute
  keyGenerator: (req) => {
    // Use API key from header or user ID
    return req.headers['x-api-key'] || req.user?.id || req.ip;
  },
  message: {
    success: false,
    error: 'API rate limit exceeded, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`API rate limit exceeded for key: ${req.headers['x-api-key'] || req.user?.id}`);
    res.status(429).json({
      success: false,
      error: 'API rate limit exceeded, please try again later.',
      retryAfter: '1 minute'
    });
  }
});

// Upload rate limiter
const uploadLimiter = rateLimit({
  store: createRedisStore(),
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 uploads per minute
  message: {
    success: false,
    error: 'Too many upload attempts, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Upload rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many upload attempts, please try again later.',
      retryAfter: '1 minute'
    });
  }
});

// AI content generation rate limiter
const aiContentLimiter = rateLimit({
  store: createRedisStore(),
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each user to 20 AI content generations per minute
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  message: {
    success: false,
    error: 'AI content generation rate limit exceeded, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`AI content rate limit exceeded for user: ${req.user?.id || req.ip}`);
    res.status(429).json({
      success: false,
      error: 'AI content generation rate limit exceeded, please try again later.',
      retryAfter: '1 minute'
    });
  }
});

// Dynamic rate limiter based on user tier
const createDynamicLimiter = (baseLimit) => {
  return rateLimit({
    store: createRedisStore(),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req) => {
      // Adjust limit based on user subscription tier
      const user = req.user;
      if (!user) return baseLimit;
      
      const subscription = user.subscription;
      if (!subscription) return baseLimit;
      
      switch (subscription.plan) {
        case 'basic':
          return baseLimit;
        case 'professional':
          return baseLimit * 2;
        case 'enterprise':
          return baseLimit * 5;
        default:
          return baseLimit;
      }
    },
    message: {
      success: false,
      error: 'Rate limit exceeded for your subscription tier.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Dynamic rate limit exceeded for user: ${req.user?.id}`);
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded for your subscription tier.',
        retryAfter: '15 minutes'
      });
    }
  });
};

// Rate limiter for different endpoints
const endpointLimiters = {
  // Auth endpoints
  '/api/auth/login': authLimiter,
  '/api/auth/register': authLimiter,
  '/api/auth/forgot-password': passwordResetLimiter,
  '/api/auth/reset-password': passwordResetLimiter,
  
  // Content endpoints
  '/api/content': createDynamicLimiter(50),
  '/api/content/ai-generate': aiContentLimiter,
  
  // Upload endpoints
  '/api/upload': uploadLimiter,
  
  // Analytics endpoints
  '/api/analytics': createDynamicLimiter(100),
  
  // Admin endpoints
  '/api/admin': strictLimiter,
  
  // Frequently called endpoints with higher limits for development
  '/api/users/me': rateLimit({
    store: createRedisStore(),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // High limit for user profile requests
    message: {
      success: false,
      error: 'Too many user profile requests, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
  }),
  
  '/api/realtime/notifications': rateLimit({
    store: createRedisStore(),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // High limit for notification requests
    message: {
      success: false,
      error: 'Too many notification requests, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
  })
};

// Get appropriate rate limiter for endpoint
const getRateLimiter = (path) => {
  // Check for exact match first
  if (endpointLimiters[path]) {
    return endpointLimiters[path];
  }
  
  // Check for pattern match
  for (const [pattern, limiter] of Object.entries(endpointLimiters)) {
    if (path.startsWith(pattern)) {
      return limiter;
    }
  }
  
  // Return general limiter as default
  return generalLimiter;
};

// Middleware to apply rate limiting
const applyRateLimit = (req, res, next) => {
  const path = req.path;
  const limiter = getRateLimiter(path);
  
  // Apply the rate limiter
  limiter(req, res, next);
};

// Bypass rate limiting for certain conditions
const bypassRateLimit = (req, res, next) => {
  // Bypass for development mode
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  // Bypass for admin users
  if (req.user && req.user.role === 'super_admin') {
    return next();
  }
  
  // Bypass for internal requests
  if (req.headers['x-internal-request'] === 'true') {
    return next();
  }
  
  // Apply rate limiting
  applyRateLimit(req, res, next);
};

module.exports = {
  generalLimiter,
  strictLimiter,
  authLimiter,
  passwordResetLimiter,
  apiKeyLimiter,
  uploadLimiter,
  aiContentLimiter,
  createDynamicLimiter,
  applyRateLimit,
  bypassRateLimit
};

