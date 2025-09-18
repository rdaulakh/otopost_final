/**
 * Security Headers Middleware
 * Implements security headers using Helmet.js
 */

const helmet = require('helmet');
const logger = require('../utils/logger');

// Security headers configuration
const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net",
        "https://unpkg.com"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'", // Required for development
        "https://cdn.jsdelivr.net",
        "https://unpkg.com",
        "https://www.google-analytics.com",
        "https://www.googletagmanager.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "http:",
        "blob:"
      ],
      connectSrc: [
        "'self'",
        "https://api.openai.com",
        "https://api.anthropic.com",
        "https://generativelanguage.googleapis.com",
        "https://api.azure.com",
        "https://api.stripe.com",
        "https://api.social-media-platforms.com",
        "wss:",
        "ws:"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdn.jsdelivr.net"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:", "blob:"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  
  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: false, // Disable for API compatibility
  
  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: { policy: "same-origin" },
  
  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: "cross-origin" },
  
  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },
  
  // Expect-CT
  expectCt: {
    maxAge: 86400,
    enforce: process.env.NODE_ENV === 'production'
  },
  
  // Feature Policy (deprecated, but kept for compatibility)
  featurePolicy: {
    camera: ["'none'"],
    microphone: ["'none'"],
    geolocation: ["'none'"],
    payment: ["'none'"],
    usb: ["'none'"],
    magnetometer: ["'none'"],
    gyroscope: ["'none'"],
    accelerometer: ["'none'"]
  },
  
  // Permissions Policy (newer replacement for Feature Policy)
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
    payment: [],
    usb: [],
    magnetometer: [],
    gyroscope: [],
    accelerometer: [],
    ambientLightSensor: [],
    autoplay: [],
    battery: [],
    displayCapture: [],
    documentDomain: [],
    encryptedMedia: [],
    executionWhileNotRendered: [],
    executionWhileOutOfViewport: [],
    fullscreen: [],
    pictureInPicture: [],
    publickeyCredentials: [],
    syncXhr: [],
    unoptimizedImages: [],
    unsizedMedia: [],
    verticalScroll: [],
    webShare: [],
    xrSpatialTracking: []
  },
  
  // Hide X-Powered-By header
  hidePoweredBy: true,
  
  // HSTS (HTTP Strict Transport Security)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: process.env.NODE_ENV === 'production'
  },
  
  // IE No Open
  ieNoOpen: true,
  
  // No Sniff
  noSniff: true,
  
  // Origin Agent Cluster
  originAgentCluster: true,
  
  // Referrer Policy
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  
  // X-DNS-Prefetch-Control
  xssFilter: true
});

// Additional security headers
const additionalSecurityHeaders = (req, res, next) => {
  // X-Request-ID for request tracking
  if (!req.headers['x-request-id']) {
    req.headers['x-request-id'] = require('crypto').randomUUID();
  }
  res.setHeader('X-Request-ID', req.headers['x-request-id']);
  
  // X-Response-Time
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', `${duration}ms`);
  });
  
  // X-API-Version
  res.setHeader('X-API-Version', process.env.API_VERSION || '1.0.0');
  
  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'DENY');
  
  // X-XSS-Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Cache-Control for API responses
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  // CORS headers (additional)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Expose-Headers', 'X-Request-ID, X-Response-Time, X-API-Version');
  
  next();
};

// Security headers for different environments
const getSecurityHeaders = () => {
  const baseHeaders = helmet({
    contentSecurityPolicy: false, // Disable CSP for API
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: { allow: false },
    hidePoweredBy: true,
    hsts: process.env.NODE_ENV === 'production' ? {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    } : false,
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true
  });
  
  return baseHeaders;
};

// Security headers for frontend routes
const frontendSecurityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://cdn.jsdelivr.net"
      ],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  hidePoweredBy: true,
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
});

// Security headers for admin routes
const adminSecurityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'"
      ],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  dnsPrefetchControl: { allow: false },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  referrerPolicy: { policy: "strict-origin" },
  xssFilter: true
});

// Security headers for webhook routes
const webhookSecurityHeaders = helmet({
  contentSecurityPolicy: false, // Disable CSP for webhooks
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  hidePoweredBy: true,
  hsts: false, // Disable HSTS for webhooks
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
});

// Security headers middleware
const securityHeadersMiddleware = {
  // Default security headers
  default: getSecurityHeaders(),
  
  // Frontend security headers
  frontend: frontendSecurityHeaders,
  
  // Admin security headers
  admin: adminSecurityHeaders,
  
  // Webhook security headers
  webhook: webhookSecurityHeaders,
  
  // Additional security headers
  additional: additionalSecurityHeaders,
  
  // Combined middleware
  combined: [getSecurityHeaders(), additionalSecurityHeaders]
};

module.exports = securityHeadersMiddleware;

