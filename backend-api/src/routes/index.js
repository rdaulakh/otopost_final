const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const auth = require('./auth');
const userRoutes = require('./users');
const contentRoutes = require('./content');
const analyticsRoutes = require('./analytics');
const notificationRoutes = require('./notifications');
const socialAccountRoutes = require('./social-accounts');
const templateRoutes = require('./templates');
const subscriptionRoutes = require('./subscriptions');
const planRoutes = require('./plans');
const aiAgentRoutes = require('./aiAgents');
const agentManagementRoutes = require('./agentManagement');
const campaignRoutes = require('./campaigns');

// Admin routes
const adminUserRoutes = require('./admin/users');
const adminOrganizationRoutes = require('./admin/organizations');
const adminAnalyticsRoutes = require('./admin/analytics');
const adminContentRoutes = require('./admin/content');
const adminNotificationRoutes = require('./admin/notifications');
const adminDashboardRoutes = require('./admin/dashboard');
const adminSubscriptionRoutes = require('./admin/subscriptions');
const adminUserSubscriptionRoutes = require('./admin/user-subscriptions');

// API versioning
const API_VERSION = '/api/v1';

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Social Media Platform API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API health check endpoint (for frontend compatibility)
router.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Social Media Platform API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Socket.IO is handled by the Socket.IO server directly, not through Express routes

// API health check endpoint
router.get(`${API_VERSION}/health`, (req, res) => {
  res.json({
    success: true,
    message: 'AI Social Media Platform API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Versioned API routes
router.use(`${API_VERSION}/users`, userRoutes);
router.use(`${API_VERSION}/realtime`, require('./notifications'));
router.use(`${API_VERSION}/campaigns`, campaignRoutes);
router.use(`${API_VERSION}/content`, contentRoutes);
router.use(`${API_VERSION}/analytics`, require('./analytics-mock'));
router.use(`${API_VERSION}/social-accounts`, socialAccountRoutes);
router.use(`${API_VERSION}/ai`, aiAgentRoutes);
router.use(`${API_VERSION}/agents`, agentManagementRoutes);
router.use(`${API_VERSION}/ai-strategy`, require('./ai-strategy'));
router.use(`${API_VERSION}/boosts`, require('./boosts'));
router.use(`${API_VERSION}/media`, require('./media'));
router.use(`${API_VERSION}/ab-tests`, require('./ab-tests'));
router.use(`${API_VERSION}/admin-dashboard`, adminDashboardRoutes);
router.use(`${API_VERSION}/user-management`, adminDashboardRoutes);
router.use(`${API_VERSION}/advanced-analytics`, adminDashboardRoutes);
router.use(`${API_VERSION}/revenue-dashboard`, adminDashboardRoutes);

// Legacy API routes (without version prefix) for frontend compatibility
router.use('/api/auth', authRoutes);
router.use('/api/simple-auth', require('./simple-auth'));
router.use('/api/users', userRoutes);
router.use('/api/profile', userRoutes);
router.use('/users', userRoutes);

// Direct avatar upload endpoint for frontend compatibility
const multer = require('multer');
const path = require('path');
const usersController = require('../controllers/users');
const { authenticateCustomer } = require('../middleware/auth');

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/brand-assets/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const avatarUpload = multer({ 
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/png', 
      'image/jpeg', 
      'image/jpg', 
      'image/webp',        // Added WebP support
      'image/svg+xml', 
      'image/x-icon',
      'image/vnd.microsoft.icon',
      'image/ico',
      'image/icon'
    ];
    console.log('Avatar upload attempt:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      fieldname: file.fieldname
    });
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.log('Avatar file type rejected:', file.mimetype);
      cb(new Error('Invalid file type. Only PNG, JPG, WebP, SVG, and ICO files are allowed.'));
    }
  }
});

// Direct avatar upload endpoint
router.post('/api/profile/avatar', authenticateCustomer, avatarUpload.single('avatar'), usersController.uploadAvatar);
router.use('/api/realtime', require('./notifications'));
router.use('/api/campaigns', campaignRoutes);
// Admin panel routes
router.use('/api/admin-dashboard', adminDashboardRoutes);
router.use('/api/user-management', adminDashboardRoutes);
router.use('/api/advanced-analytics', adminDashboardRoutes);
router.use('/api/revenue-dashboard', adminDashboardRoutes);
router.use('/api/content', contentRoutes);
router.use('/api/analytics', require('./analytics-mock'));
router.use('/api/social-accounts', socialAccountRoutes);
router.use('/api/ai', aiAgentRoutes);
router.use('/api/ai-strategy', require('./ai-strategy'));
router.use('/api/boosts', require('./boosts'));
router.use('/api/media', require('./media'));
router.use('/api/ab-tests', require('./ab-tests'));
router.use('/api/plans', planRoutes);
router.use('/api/subscriptions', subscriptionRoutes);
router.use('/api/ai-agents', aiAgentRoutes);
router.use('/api/admin/subscriptions', adminSubscriptionRoutes);
router.use('/api/admin/user-subscriptions', adminUserSubscriptionRoutes);
router.use('/api/admin-dashboard', adminDashboardRoutes);
router.use('/api/user-management', adminDashboardRoutes);
router.use('/api/advanced-analytics', adminDashboardRoutes);
router.use('/api/revenue-dashboard', adminDashboardRoutes);

// Customer API routes
router.use(`${API_VERSION}/auth`, auth);
router.use(`${API_VERSION}/users`, userRoutes);
router.use(`${API_VERSION}/content`, contentRoutes);
router.use(`${API_VERSION}/analytics`, analyticsRoutes);
router.use(`${API_VERSION}/notifications`, notificationRoutes);
router.use(`${API_VERSION}/social-accounts`, socialAccountRoutes);
router.use(`${API_VERSION}/templates`, templateRoutes);
router.use(`${API_VERSION}/plans`, planRoutes);
router.use(`${API_VERSION}/ai-agents`, aiAgentRoutes);
router.use(`${API_VERSION}/ai-strategy`, require('./ai-strategy'));
router.use(`${API_VERSION}/campaigns`, campaignRoutes);
router.use(`${API_VERSION}`, subscriptionRoutes);

// Admin API routes
router.use(`${API_VERSION}/admin/users`, adminUserRoutes);
router.use(`${API_VERSION}/admin/organizations`, adminOrganizationRoutes);
router.use(`${API_VERSION}/admin/analytics`, adminAnalyticsRoutes);
router.use(`${API_VERSION}/admin/content`, adminContentRoutes);
router.use(`${API_VERSION}/admin/notifications`, adminNotificationRoutes);
router.use(`${API_VERSION}/admin/subscriptions`, adminSubscriptionRoutes);
router.use(`${API_VERSION}/admin/user-subscriptions`, adminUserSubscriptionRoutes);
router.use(`${API_VERSION}/admin-dashboard`, adminDashboardRoutes);

// API documentation endpoint
router.get(`${API_VERSION}/docs`, (req, res) => {
  res.json({
    success: true,
    message: 'API Documentation',
    version: '1.0.0',
    endpoints: {
      customer: {
        auth: `${API_VERSION}/auth`,
        users: `${API_VERSION}/users`,
        content: `${API_VERSION}/content`,
        analytics: `${API_VERSION}/analytics`
      },
      admin: {
        users: `${API_VERSION}/admin/users`,
        organizations: `${API_VERSION}/admin/organizations`,
        analytics: `${API_VERSION}/admin/analytics`
      }
    },
    documentation: 'https://docs.example.com/api' // TODO: Replace with actual docs URL
  });
});

// 404 handler for API routes
router.use(`${API_VERSION}/*`, (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    code: 'ENDPOINT_NOT_FOUND',
    path: req.originalUrl,
    method: req.method
  });
});

module.exports = router;

