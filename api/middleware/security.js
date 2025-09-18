const helmet = require('helmet');
const hpp = require('hpp');
const compression = require('compression');
const { auditLogger, AUDIT_EVENTS, RISK_LEVELS } = require('./auditLogger');

// Security configuration
const securityConfig = {
  // Content Security Policy
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "wss:", "ws:"],
      mediaSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"]
    },
    reportOnly: process.env.NODE_ENV !== 'production'
  },

  // HSTS configuration
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },

  // Referrer Policy
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin"
  }
};

// Basic security headers middleware
const basicSecurity = helmet({
  contentSecurityPolicy: securityConfig.csp,
  hsts: securityConfig.hsts,
  referrerPolicy: securityConfig.referrerPolicy,
  crossOriginEmbedderPolicy: false, // Disable for file uploads
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

// HTTP Parameter Pollution protection
const parameterPollutionProtection = hpp({
  whitelist: ['tags', 'platforms', 'categories'] // Allow arrays for these parameters
});

// Compression middleware
const compressionMiddleware = compression({
  filter: (req, res) => {
    // Don't compress if the request includes a cache-control no-transform directive
    if (req.headers['cache-control'] && req.headers['cache-control'].includes('no-transform')) {
      return false;
    }
    
    // Compress everything else
    return compression.filter(req, res);
  },
  level: 6, // Compression level (1-9)
  threshold: 1024 // Only compress responses larger than 1KB
});

// IP whitelist/blacklist middleware
const ipFilter = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // IP blacklist (could be loaded from database or config)
  const blacklistedIPs = process.env.BLACKLISTED_IPS ? 
    process.env.BLACKLISTED_IPS.split(',') : [];
  
  // IP whitelist for admin endpoints
  const adminWhitelistIPs = process.env.ADMIN_WHITELIST_IPS ? 
    process.env.ADMIN_WHITELIST_IPS.split(',') : [];
  
  // Check blacklist
  if (blacklistedIPs.includes(clientIP)) {
    auditLogger.logSecurityEvent(AUDIT_EVENTS.UNAUTHORIZED_ACCESS, {
      ip: clientIP,
      reason: 'IP blacklisted',
      url: req.originalUrl
    }, req, RISK_LEVELS.HIGH);
    
    return res.status(403).json({
      error: 'ACCESS_DENIED',
      message: 'Access denied from this IP address'
    });
  }
  
  // Check admin whitelist for admin routes
  if (req.originalUrl.startsWith('/api/admin') && adminWhitelistIPs.length > 0) {
    if (!adminWhitelistIPs.includes(clientIP)) {
      auditLogger.logSecurityEvent(AUDIT_EVENTS.UNAUTHORIZED_ACCESS, {
        ip: clientIP,
        reason: 'IP not in admin whitelist',
        url: req.originalUrl
      }, req, RISK_LEVELS.HIGH);
      
      return res.status(403).json({
        error: 'ACCESS_DENIED',
        message: 'Admin access not allowed from this IP address'
      });
    }
  }
  
  next();
};

// Suspicious activity detection
const suspiciousActivityDetector = (req, res, next) => {
  const suspiciousPatterns = [
    // SQL injection patterns
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
    // XSS patterns
    /<script[^>]*>.*?<\/script>/gi,
    // Path traversal patterns
    /\.\.[\/\\]/,
    // Command injection patterns
    /[;&|`$(){}[\]]/
  ];
  
  const checkForSuspiciousContent = (obj, path = '') => {
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key;
      const value = obj[key];
      
      if (typeof value === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            return {
              found: true,
              pattern: pattern.toString(),
              value: value.substring(0, 100), // Limit logged value length
              location: currentPath
            };
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        const result = checkForSuspiciousContent(value, currentPath);
        if (result.found) return result;
      }
    }
    return { found: false };
  };
  
  // Check request body, query, and params
  const bodyCheck = req.body ? checkForSuspiciousContent(req.body, 'body') : { found: false };
  const queryCheck = checkForSuspiciousContent(req.query, 'query');
  const paramsCheck = checkForSuspiciousContent(req.params, 'params');
  
  if (bodyCheck.found || queryCheck.found || paramsCheck.found) {
    const suspiciousData = bodyCheck.found ? bodyCheck : 
                          queryCheck.found ? queryCheck : paramsCheck;
    
    auditLogger.logSecurityEvent(AUDIT_EVENTS.SUSPICIOUS_ACTIVITY, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
      suspiciousPattern: suspiciousData.pattern,
      suspiciousValue: suspiciousData.value,
      location: suspiciousData.location
    }, req, RISK_LEVELS.HIGH);
    
    return res.status(400).json({
      error: 'SUSPICIOUS_CONTENT',
      message: 'Request contains potentially malicious content'
    });
  }
  
  next();
};

// Request size limiter
const requestSizeLimiter = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    const maxSizeBytes = parseSize(maxSize);
    
    if (contentLength > maxSizeBytes) {
      auditLogger.logSecurityEvent(AUDIT_EVENTS.SUSPICIOUS_ACTIVITY, {
        ip: req.ip,
        reason: 'Request size too large',
        contentLength,
        maxAllowed: maxSizeBytes,
        url: req.originalUrl
      }, req, RISK_LEVELS.MEDIUM);
      
      return res.status(413).json({
        error: 'REQUEST_TOO_LARGE',
        message: `Request size exceeds maximum allowed size of ${maxSize}`
      });
    }
    
    next();
  };
};

// Parse size string to bytes
const parseSize = (size) => {
  const units = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024
  };
  
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2] || 'b';
  
  return Math.floor(value * units[unit]);
};

// User agent validation
const userAgentValidator = (req, res, next) => {
  const userAgent = req.get('User-Agent');
  
  // Block requests without user agent (potential bots)
  if (!userAgent) {
    auditLogger.logSecurityEvent(AUDIT_EVENTS.SUSPICIOUS_ACTIVITY, {
      ip: req.ip,
      reason: 'Missing User-Agent header',
      url: req.originalUrl
    }, req, RISK_LEVELS.MEDIUM);
    
    return res.status(400).json({
      error: 'INVALID_REQUEST',
      message: 'User-Agent header is required'
    });
  }
  
  // Block known malicious user agents
  const maliciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nessus/i,
    /openvas/i,
    /nmap/i,
    /masscan/i,
    /zap/i,
    /burp/i
  ];
  
  for (const pattern of maliciousPatterns) {
    if (pattern.test(userAgent)) {
      auditLogger.logSecurityEvent(AUDIT_EVENTS.SUSPICIOUS_ACTIVITY, {
        ip: req.ip,
        reason: 'Malicious User-Agent detected',
        userAgent,
        url: req.originalUrl
      }, req, RISK_LEVELS.HIGH);
      
      return res.status(403).json({
        error: 'ACCESS_DENIED',
        message: 'Access denied'
      });
    }
  }
  
  next();
};

// Request method validation
const methodValidator = (allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']) => {
  return (req, res, next) => {
    if (!allowedMethods.includes(req.method)) {
      auditLogger.logSecurityEvent(AUDIT_EVENTS.SUSPICIOUS_ACTIVITY, {
        ip: req.ip,
        reason: 'Invalid HTTP method',
        method: req.method,
        url: req.originalUrl
      }, req, RISK_LEVELS.MEDIUM);
      
      return res.status(405).json({
        error: 'METHOD_NOT_ALLOWED',
        message: `HTTP method ${req.method} is not allowed for this endpoint`,
        allowedMethods
      });
    }
    
    next();
  };
};

// CORS security enhancement
const corsSecurityHeaders = (req, res, next) => {
  const origin = req.get('Origin');
  const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : 
    ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];
  
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Enhanced CORS validation
  if (origin && !allowedOrigins.includes(origin)) {
    auditLogger.logSecurityEvent(AUDIT_EVENTS.SUSPICIOUS_ACTIVITY, {
      ip: req.ip,
      reason: 'Invalid CORS origin',
      origin,
      url: req.originalUrl
    }, req, RISK_LEVELS.MEDIUM);
  }
  
  next();
};

// API key validation middleware
const apiKeyValidator = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (req.originalUrl.startsWith('/api/external') && !apiKey) {
    return res.status(401).json({
      error: 'API_KEY_REQUIRED',
      message: 'API key is required for external API access'
    });
  }
  
  if (apiKey) {
    // Validate API key format
    if (!/^[a-zA-Z0-9]{32,64}$/.test(apiKey)) {
      auditLogger.logSecurityEvent(AUDIT_EVENTS.SUSPICIOUS_ACTIVITY, {
        ip: req.ip,
        reason: 'Invalid API key format',
        url: req.originalUrl
      }, req, RISK_LEVELS.MEDIUM);
      
      return res.status(401).json({
        error: 'INVALID_API_KEY',
        message: 'Invalid API key format'
      });
    }
    
    // Here you would validate the API key against your database
    // For now, we'll just log the usage
    auditLogger.log(AUDIT_EVENTS.SYSTEM_INFO, {
      apiKeyUsed: true,
      apiKeyPrefix: apiKey.substring(0, 8) + '...',
      endpoint: req.originalUrl
    }, req, RISK_LEVELS.LOW);
  }
  
  next();
};

// Security headers for file uploads
const fileUploadSecurity = (req, res, next) => {
  // Additional security for file upload endpoints
  if (req.originalUrl.includes('/upload')) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', 'attachment');
  }
  
  next();
};

// Combine all security middleware
const applySecurity = (app) => {
  // Basic security headers
  app.use(basicSecurity);
  
  // Compression
  app.use(compressionMiddleware);
  
  // Parameter pollution protection
  app.use(parameterPollutionProtection);
  
  // CORS security headers
  app.use(corsSecurityHeaders);
  
  // IP filtering
  app.use(ipFilter);
  
  // User agent validation
  app.use(userAgentValidator);
  
  // Request size limiting
  app.use(requestSizeLimiter('50mb')); // Adjust based on your needs
  
  // Suspicious activity detection
  app.use(suspiciousActivityDetector);
  
  // API key validation
  app.use(apiKeyValidator);
  
  // File upload security
  app.use(fileUploadSecurity);
};

module.exports = {
  applySecurity,
  basicSecurity,
  compressionMiddleware,
  parameterPollutionProtection,
  ipFilter,
  suspiciousActivityDetector,
  requestSizeLimiter,
  userAgentValidator,
  methodValidator,
  corsSecurityHeaders,
  apiKeyValidator,
  fileUploadSecurity,
  securityConfig
};
