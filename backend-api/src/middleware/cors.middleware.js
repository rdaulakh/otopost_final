/**
 * CORS Middleware
 * Configures Cross-Origin Resource Sharing for the API
 */

const cors = require('cors');
const logger = require('../utils/logger');

// Allowed origins based on environment
const getAllowedOrigins = () => {
  const origins = [
    'http://localhost:3000', // Customer frontend
    'http://localhost:3001', // Admin panel
    'http://localhost:5173', // Vite dev server
    'http://localhost:4173', // Vite preview
  ];

  // Add production origins
  if (process.env.NODE_ENV === 'production') {
    origins.push(
      process.env.CUSTOMER_FRONTEND_URL,
      process.env.ADMIN_PANEL_URL,
      process.env.API_URL
    );
  }

  // Add staging origins
  if (process.env.NODE_ENV === 'staging') {
    origins.push(
      process.env.STAGING_CUSTOMER_FRONTEND_URL,
      process.env.STAGING_ADMIN_PANEL_URL,
      process.env.STAGING_API_URL
    );
  }

  return origins.filter(Boolean);
};

// CORS options
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Log blocked origins
    logger.warn(`CORS blocked origin: ${origin}`);
    
    // Block the request
    return callback(new Error('Not allowed by CORS'), false);
  },
  
  credentials: true, // Allow cookies and authorization headers
  
  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
    'HEAD'
  ],
  
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-Request-ID',
    'X-Client-Version',
    'X-Platform',
    'X-Device-ID',
    'X-Session-ID',
    'X-Timezone',
    'X-Language',
    'X-Currency',
    'X-User-Agent',
    'X-Forwarded-For',
    'X-Real-IP',
    'X-Forwarded-Proto',
    'X-Forwarded-Host',
    'X-Forwarded-Port'
  ],
  
  exposedHeaders: [
    'X-Request-ID',
    'X-Rate-Limit-Limit',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset',
    'X-API-Version',
    'X-Response-Time',
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Per-Page'
  ],
  
  maxAge: 86400, // 24 hours
  
  preflightContinue: false,
  
  optionsSuccessStatus: 200
};

// CORS middleware for API routes
const apiCors = cors(corsOptions);

// CORS middleware for webhook routes (more permissive)
const webhookCorsOptions = {
  ...corsOptions,
  origin: true, // Allow all origins for webhooks
  credentials: false, // No credentials for webhooks
  methods: ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Webhook-Signature',
    'X-Webhook-Event',
    'X-Webhook-Delivery',
    'X-Webhook-Id',
    'X-Webhook-Timestamp',
    'User-Agent'
  ]
};

const webhookCors = cors(webhookCorsOptions);

// CORS middleware for static files
const staticCorsOptions = {
  origin: getAllowedOrigins(),
  credentials: false,
  methods: ['GET', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
  maxAge: 31536000 // 1 year
};

const staticCors = cors(staticCorsOptions);

// CORS middleware for admin routes (stricter)
const adminCorsOptions = {
  ...corsOptions,
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins().filter(origin => 
      origin.includes('admin') || origin.includes('localhost:3001')
    );
    
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    logger.warn(`Admin CORS blocked origin: ${origin}`);
    return callback(new Error('Not allowed by admin CORS'), false);
  }
};

const adminCors = cors(adminCorsOptions);

// CORS middleware for public routes (more permissive)
const publicCorsOptions = {
  origin: true, // Allow all origins for public routes
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization'
  ],
  maxAge: 3600 // 1 hour
};

const publicCors = cors(publicCorsOptions);

// CORS error handler
const corsErrorHandler = (err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    logger.warn(`CORS error: ${err.message} from ${req.ip} to ${req.path}`);
    return res.status(403).json({
      success: false,
      error: 'CORS policy violation',
      message: 'The request origin is not allowed by CORS policy',
      origin: req.get('Origin') || 'unknown'
    });
  }
  
  next(err);
};

// CORS preflight handler
const corsPreflightHandler = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    // Handle preflight requests
    res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
    res.header('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
    res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
    res.header('Access-Control-Max-Age', corsOptions.maxAge);
    
    if (corsOptions.credentials) {
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    
    return res.status(200).end();
  }
  
  next();
};

// CORS middleware factory
const createCorsMiddleware = (options = {}) => {
  const mergedOptions = { ...corsOptions, ...options };
  return cors(mergedOptions);
};

// CORS middleware for different route types
const corsMiddleware = {
  // Default API CORS
  api: apiCors,
  
  // Webhook CORS (more permissive)
  webhook: webhookCors,
  
  // Static files CORS
  static: staticCors,
  
  // Admin routes CORS (stricter)
  admin: adminCors,
  
  // Public routes CORS (more permissive)
  public: publicCors,
  
  // Custom CORS
  custom: createCorsMiddleware,
  
  // Error handler
  errorHandler: corsErrorHandler,
  
  // Preflight handler
  preflight: corsPreflightHandler
};

module.exports = corsMiddleware;

