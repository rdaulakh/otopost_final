const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketService = require('./services/socketService');
const { applySecurity } = require('./middleware/security');
const { auditMiddleware, errorAuditMiddleware } = require('./middleware/auditLogger');
const { sanitizeInput } = require('./middleware/validation');
const { generalLimiter, rateLimitInfo } = require('./middleware/rateLimiter');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Apply security middleware first
applySecurity(app);

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security and monitoring middleware
app.use(rateLimitInfo);
app.use(generalLimiter);
app.use(auditMiddleware);
app.use(sanitizeInput);

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-social-media', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/content', require('./routes/content'));
app.use('/api/social-profiles', require('./routes/socialProfiles'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/media', require('./routes/media'));
app.use('/api/realtime', require('./routes/realtime'));
app.use('/api/security', require('./routes/security'));

// Error handling middleware
app.use(errorAuditMiddleware);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  
  // Initialize Socket.IO
  socketService.initialize(server);
  
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
    console.log(`Socket.IO server initialized`);
  });
};

startServer();

module.exports = app;
