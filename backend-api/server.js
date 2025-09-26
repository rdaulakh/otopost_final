const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const http = require('http');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

// Import modules
const databaseConnection = require('./src/config/database');
const redisConnection = require('./src/config/redis');
const logger = require('./src/utils/logger');
const routes = require('./src/routes');
const WebSocketServer = require('./src/websocket');
const {
  globalErrorHandler,
  notFoundHandler,
  handleUnhandledRejection,
  handleUncaughtException,
  handleSIGTERM
} = require('./src/middleware/errorHandler');

// Handle uncaught exceptions
process.on('uncaughtException', handleUncaughtException);

// Create Express app
const app = express();
const server = http.createServer(app);

// Initialize WebSocket server
const wsServer = new WebSocketServer(server);

// Trust proxy (for deployment behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration - Allow all origins for maximum compatibility
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins for testing and maximum compatibility
    console.log(`CORS request from origin: ${origin || 'no-origin'}`);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Session configuration for OAuth flow
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Rate limiting with development bypass
const { bypassRateLimit } = require('./src/middleware/rate-limit.middleware');
app.use('/api/', bypassRateLimit);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['sort', 'fields', 'page', 'limit', 'platform', 'status', 'type']
}));

// Compression middleware
app.use(compression());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.requestLogger(req, res, () => {});
  });
  
  next();
});

// Add WebSocket server to request context
app.use((req, res, next) => {
  req.wsServer = wsServer;
  next();
});

// Routes
app.use('/', routes);

// Handle undefined routes
app.all('*', notFoundHandler);

// Global error handling middleware
app.use(globalErrorHandler);

// Database connection
const connectDatabase = async () => {
  try {
    await databaseConnection.connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.logError(error, { context: 'Database connection failed' });
    process.exit(1);
  }
};

// Redis connection
const connectRedis = async () => {
  try {
    await redisConnection.connect();
    logger.info('Redis connected successfully');
  } catch (error) {
    logger.logError(error, { context: 'Redis connection failed' });
    // Don't exit on Redis failure, app can work without it
  }
};

// Start server
const startServer = async () => {
  try {
    // Connect to databases
    await connectDatabase();
    await connectRedis();
    
    // Start HTTP server
    const PORT = process.env.PORT || 5001;
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Admin Panel WebSocket: ws://localhost:${PORT}/admin`);
      console.log(`👥 Customer WebSocket: ws://localhost:${PORT}/customer`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api/v1/docs`);
    });
    
    // Graceful shutdown handlers
    process.on('unhandledRejection', handleUnhandledRejection);
    process.on('SIGTERM', handleSIGTERM);
    process.on('SIGINT', () => {
      console.log('👋 SIGINT RECEIVED. Shutting down gracefully');
      server.close(() => {
        console.log('💥 Process terminated!');
        process.exit(0);
      });
    });
    
  } catch (error) {
    logger.logError(error, { context: 'Server startup failed' });
    process.exit(1);
  }
};

// Start the application
startServer();

module.exports = { app, server, wsServer };

