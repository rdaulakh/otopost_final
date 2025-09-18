const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const Redis = require('ioredis');

// Redis client for rate limiting
let redisClient;
try {
  redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
} catch (error) {
  console.warn('Redis not available for rate limiting, using memory store');
}

// Redis store for rate limiting
let redisStore;
try {
  if (redisClient) {
    const RedisStore = require('rate-limit-redis');
    redisStore = new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    });
  }
} catch (error) {
  console.warn('Redis store for rate limiting not available, using memory store');
  redisStore = undefined;
}

// Custom key generator based on user ID or IP
const generateKey = (req) => {
  if (req.user && req.user.id) {
    return `user:${req.user.id}`;
  }
  return `ip:${req.ip}`;
};

// Custom skip function for different user tiers
const skipBasedOnTier = (req) => {
  if (req.user) {
    // Premium users get higher limits
    if (req.user.subscription === 'premium' || req.user.subscription === 'enterprise') {
      return false; // Don't skip, but they'll have higher limits
    }
  }
  return false;
};

// General API rate limiter
const generalLimiter = rateLimit({
  store: redisStore,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    if (req.user) {
      switch (req.user.subscription) {
        case 'enterprise': return 2000;
        case 'premium': return 1000;
        case 'basic': return 500;
        default: return 100;
      }
    }
    return 100; // Anonymous users
  },
  keyGenerator: generateKey,
  skip: skipBasedOnTier,
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this user/IP, please try again later.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining
    });
  }
});

// Strict limiter for sensitive operations
const strictLimiter = rateLimit({
  store: redisStore,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => {
    if (req.user) {
      switch (req.user.subscription) {
        case 'enterprise': return 100;
        case 'premium': return 50;
        case 'basic': return 20;
        default: return 5;
      }
    }
    return 5;
  },
  keyGenerator: generateKey,
  message: {
    error: 'Strict rate limit exceeded',
    message: 'Too many sensitive operations. Please wait before trying again.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Authentication rate limiter
const authLimiter = rateLimit({
  store: redisStore,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  keyGenerator: (req) => `auth:${req.ip}`,
  message: {
    error: 'Too many authentication attempts',
    message: 'Too many login attempts from this IP, please try again after 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful logins
});

// File upload rate limiter
const uploadLimiter = rateLimit({
  store: redisStore,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => {
    if (req.user) {
      switch (req.user.subscription) {
        case 'enterprise': return 500;
        case 'premium': return 200;
        case 'basic': return 50;
        default: return 10;
      }
    }
    return 5;
  },
  keyGenerator: generateKey,
  message: {
    error: 'Upload rate limit exceeded',
    message: 'Too many file uploads. Please upgrade your plan for higher limits.',
    retryAfter: '1 hour'
  }
});

// API key rate limiter (for external API usage)
const apiKeyLimiter = rateLimit({
  store: redisStore,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => {
    // Check API key tier from database
    const apiKey = req.headers['x-api-key'];
    if (apiKey) {
      // This would be looked up from database
      return 10000; // High limit for API keys
    }
    return 100;
  },
  keyGenerator: (req) => {
    const apiKey = req.headers['x-api-key'];
    return apiKey ? `api:${apiKey}` : `ip:${req.ip}`;
  },
  message: {
    error: 'API rate limit exceeded',
    message: 'API rate limit exceeded. Check your API key tier or upgrade your plan.'
  }
});

// Speed limiter (slows down requests instead of blocking)
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: (req) => {
    if (req.user) {
      switch (req.user.subscription) {
        case 'enterprise': return 100;
        case 'premium': return 50;
        case 'basic': return 25;
        default: return 10;
      }
    }
    return 10;
  },
  delayMs: () => 500, // Fixed delay function
  maxDelayMs: 20000, // Maximum 20 second delay
  validate: { delayMs: false } // Disable warning
});

// Content publishing rate limiter
const publishLimiter = rateLimit({
  store: redisStore,
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: (req) => {
    if (req.user) {
      switch (req.user.subscription) {
        case 'enterprise': return 1000;
        case 'premium': return 500;
        case 'basic': return 100;
        default: return 10;
      }
    }
    return 5;
  },
  keyGenerator: generateKey,
  message: {
    error: 'Daily publishing limit exceeded',
    message: 'You have reached your daily content publishing limit. Upgrade your plan for higher limits.',
    retryAfter: '24 hours'
  }
});

// AI request rate limiter
const aiLimiter = rateLimit({
  store: redisStore,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => {
    if (req.user) {
      switch (req.user.subscription) {
        case 'enterprise': return 1000;
        case 'premium': return 500;
        case 'basic': return 100;
        default: return 20;
      }
    }
    return 10;
  },
  keyGenerator: generateKey,
  message: {
    error: 'AI request limit exceeded',
    message: 'You have exceeded your hourly AI request limit. Upgrade your plan for higher limits.',
    retryAfter: '1 hour'
  }
});

// Analytics request limiter
const analyticsLimiter = rateLimit({
  store: redisStore,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => {
    if (req.user) {
      switch (req.user.subscription) {
        case 'enterprise': return 10000;
        case 'premium': return 5000;
        case 'basic': return 1000;
        default: return 100;
      }
    }
    return 50;
  },
  keyGenerator: generateKey,
  message: {
    error: 'Analytics request limit exceeded',
    message: 'Too many analytics requests. Please wait before requesting more data.'
  }
});

// Custom rate limiter factory
const createCustomLimiter = (options) => {
  const {
    windowMs = 15 * 60 * 1000,
    maxRequests = 100,
    keyPrefix = 'custom',
    message = 'Rate limit exceeded'
  } = options;

  return rateLimit({
    store: redisStore,
    windowMs,
    max: maxRequests,
    keyGenerator: (req) => `${keyPrefix}:${generateKey(req)}`,
    message: {
      error: 'Custom rate limit exceeded',
      message
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Rate limit info middleware
const rateLimitInfo = (req, res, next) => {
  // Add rate limit info to response headers
  res.setHeader('X-RateLimit-Policy', 'dynamic-based-on-subscription');
  
  if (req.user) {
    res.setHeader('X-RateLimit-Tier', req.user.subscription || 'free');
  }
  
  next();
};

// Rate limit bypass for admin users
const adminBypass = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    // Skip rate limiting for admin users
    return next();
  }
  next();
};

// Progressive rate limiting (increases limits for good behavior)
const progressiveLimiter = (req, res, next) => {
  // This would track user behavior and adjust limits accordingly
  // For now, it's a placeholder for future implementation
  next();
};

// Rate limit monitoring
const rateLimitMonitor = {
  async getStats(userId) {
    if (!redisClient) return null;
    
    try {
      const keys = await redisClient.keys(`*${userId}*`);
      const stats = {};
      
      for (const key of keys) {
        const ttl = await redisClient.ttl(key);
        const value = await redisClient.get(key);
        stats[key] = { value, ttl };
      }
      
      return stats;
    } catch (error) {
      console.error('Rate limit stats error:', error);
      return null;
    }
  },

  async resetUserLimits(userId) {
    if (!redisClient) return false;
    
    try {
      const keys = await redisClient.keys(`*${userId}*`);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Reset rate limits error:', error);
      return false;
    }
  }
};

module.exports = {
  generalLimiter,
  strictLimiter,
  authLimiter,
  uploadLimiter,
  apiKeyLimiter,
  speedLimiter,
  publishLimiter,
  aiLimiter,
  analyticsLimiter,
  createCustomLimiter,
  rateLimitInfo,
  adminBypass,
  progressiveLimiter,
  rateLimitMonitor
};
