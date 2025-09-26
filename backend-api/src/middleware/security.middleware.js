const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const logger = require('../utils/logger');

/**
 * Security Middleware
 * Comprehensive security middleware for API protection
 */

// Enhanced Helmet configuration
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://cdn.jsdelivr.net",
        "https://unpkg.com",
        "https://cdnjs.cloudflare.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net",
        "https://unpkg.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "*.cloudinary.com",
        "*.amazonaws.com",
        "*.googleusercontent.com"
      ],
      connectSrc: [
        "'self'",
        "https://api.openai.com",
        "https://api.anthropic.com",
        "https://generativelanguage.googleapis.com",
        "https://api.stripe.com",
        "https://api.sendgrid.com",
        "https://api.cloudinary.com",
        "https://api.facebook.com",
        "https://api.instagram.com",
        "https://api.twitter.com",
        "https://api.linkedin.com"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permittedCrossDomainPolicies: false,
  dnsPrefetchControl: false,
  ieNoOpen: true,
  hidePoweredBy: true
};

// Rate limiting configurations
const rateLimitConfigs = {
  // General API rate limit
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later',
      retryAfter: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip} on path: ${req.path}`);
      res.status(429).json({
        success: false,
        message: 'Too many requests from this IP, please try again later',
        retryAfter: 15 * 60
      });
    }
  }),

  // Authentication rate limit
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 auth requests per windowMs
    message: {
      success: false,
      message: 'Too many authentication attempts, please try again later',
      retryAfter: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Auth rate limit exceeded for IP: ${req.ip} on path: ${req.path}`);
      res.status(429).json({
        success: false,
        message: 'Too many authentication attempts, please try again later',
        retryAfter: 15 * 60
      });
    }
  }),

  // Password reset rate limit
  passwordReset: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 password reset requests per hour
    message: {
      success: false,
      message: 'Too many password reset attempts, please try again later',
      retryAfter: 60 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Password reset rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message: 'Too many password reset attempts, please try again later',
        retryAfter: 60 * 60
      });
    }
  }),

  // File upload rate limit
  fileUpload: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Limit each IP to 50 file uploads per hour
    message: {
      success: false,
      message: 'Too many file uploads, please try again later',
      retryAfter: 60 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`File upload rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message: 'Too many file uploads, please try again later',
        retryAfter: 60 * 60
      });
    }
  }),

  // AI content generation rate limit
  aiContent: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Limit each IP to 100 AI content generations per hour
    message: {
      success: false,
      message: 'Too many AI content generation requests, please try again later',
      retryAfter: 60 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`AI content rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message: 'Too many AI content generation requests, please try again later',
        retryAfter: 60 * 60
      });
    }
  })
};

// Speed limiting configurations
const speedLimitConfigs = {
  // General speed limit
  general: slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // Allow 50 requests per 15 minutes, then...
    delayMs: 500, // Add 500ms delay per request after delayAfter
    maxDelayMs: 20000, // Max delay of 20 seconds
    handler: (req, res) => {
      logger.warn(`Speed limit applied to IP: ${req.ip} on path: ${req.path}`);
    }
  }),

  // Authentication speed limit
  auth: slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 5, // Allow 5 requests per 15 minutes, then...
    delayMs: 1000, // Add 1 second delay per request after delayAfter
    maxDelayMs: 30000, // Max delay of 30 seconds
    handler: (req, res) => {
      logger.warn(`Auth speed limit applied to IP: ${req.ip} on path: ${req.path}`);
    }
  })
};

// IP whitelist middleware
const ipWhitelistMiddleware = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      logger.warn(`Blocked request from non-whitelisted IP: ${clientIP}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied from this IP address'
      });
    }
    
    next();
  };
};

// IP blacklist middleware
const ipBlacklistMiddleware = (blockedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (blockedIPs.includes(clientIP)) {
      logger.warn(`Blocked request from blacklisted IP: ${clientIP}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied from this IP address'
      });
    }
    
    next();
  };
};

// Request size limit middleware
const requestSizeLimitMiddleware = (limit = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length']);
    const limitBytes = parseSizeLimit(limit);
    
    if (contentLength && contentLength > limitBytes) {
      logger.warn(`Request size limit exceeded: ${contentLength} bytes from IP: ${req.ip}`);
      return res.status(413).json({
        success: false,
        message: 'Request entity too large',
        maxSize: limit
      });
    }
    
    next();
  };
};

// Parse size limit string to bytes
const parseSizeLimit = (limit) => {
  const units = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024
  };
  
  const match = limit.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/);
  if (!match) {
    return 10 * 1024 * 1024; // Default 10MB
  }
  
  const value = parseFloat(match[1]);
  const unit = match[2];
  
  return Math.floor(value * units[unit]);
};

// Security headers middleware
const securityHeadersMiddleware = (req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Add server information (optional)
  res.setHeader('Server', 'AI Social Media Platform API');
  
  next();
};

// Request logging middleware
const requestLoggingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const clientIP = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  
  // Log suspicious requests
  const suspiciousPatterns = [
    /\.\.\//, // Directory traversal
    /<script/i, // XSS attempts
    /union\s+select/i, // SQL injection
    /javascript:/i, // JavaScript injection
    /eval\(/i, // Code injection
    /document\.cookie/i // Cookie theft attempts
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(req.url) || pattern.test(req.body?.toString() || '')
  );
  
  if (isSuspicious) {
    logger.warn(`Suspicious request detected from IP: ${clientIP}`, {
      url: req.url,
      method: req.method,
      userAgent,
      body: req.body
    });
  }
  
  // Log response
  res.on('finish', () => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const statusCode = res.statusCode;
    
    logger.info(`Request completed: ${req.method} ${req.url} - ${statusCode} (${responseTime}ms)`, {
      ip: clientIP,
      userAgent,
      responseTime,
      statusCode
    });
  });
  
  next();
};

// Error handling middleware
const securityErrorMiddleware = (err, req, res, next) => {
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    logger.warn(`File size limit exceeded from IP: ${req.ip}`);
    return res.status(413).json({
      success: false,
      message: 'File too large',
      maxSize: '10MB'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    logger.warn(`Unexpected file field from IP: ${req.ip}`);
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field'
    });
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    logger.warn(`Too many files from IP: ${req.ip}`);
    return res.status(400).json({
      success: false,
      message: 'Too many files'
    });
  }
  
  // Generic error response
  logger.error('Security middleware error:', err);
  
  res.status(500).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
};

// Security middleware factory
const createSecurityMiddleware = (options = {}) => {
  const {
    helmet: helmetOptions = {},
    rateLimit: rateLimitOptions = {},
    speedLimit: speedLimitOptions = {},
    ipWhitelist = [],
    ipBlacklist = [],
    requestSizeLimit = '10mb'
  } = options;
  
  return [
    helmet({ ...helmetConfig, ...helmetOptions }),
    securityHeadersMiddleware,
    requestLoggingMiddleware,
    requestSizeLimitMiddleware(requestSizeLimit),
    ipWhitelistMiddleware(ipWhitelist),
    ipBlacklistMiddleware(ipBlacklist),
    rateLimitConfigs.general,
    speedLimitConfigs.general
  ];
};

// Get security statistics
const getSecurityStats = () => {
  return {
    helmet: {
      enabled: true,
      config: helmetConfig
    },
    rateLimits: {
      general: rateLimitConfigs.general,
      auth: rateLimitConfigs.auth,
      passwordReset: rateLimitConfigs.passwordReset,
      fileUpload: rateLimitConfigs.fileUpload,
      aiContent: rateLimitConfigs.aiContent
    },
    speedLimits: {
      general: speedLimitConfigs.general,
      auth: speedLimitConfigs.auth
    },
    requestSizeLimit: '10mb',
    securityHeaders: true,
    requestLogging: true
  };
};

module.exports = {
  helmetConfig,
  rateLimitConfigs,
  speedLimitConfigs,
  ipWhitelistMiddleware,
  ipBlacklistMiddleware,
  requestSizeLimitMiddleware,
  securityHeadersMiddleware,
  requestLoggingMiddleware,
  securityErrorMiddleware,
  createSecurityMiddleware,
  getSecurityStats,
  parseSizeLimit
};

