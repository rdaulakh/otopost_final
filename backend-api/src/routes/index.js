const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const contentRoutes = require('./content');
const analyticsRoutes = require('./analytics');
const notificationRoutes = require('./notifications');
const socialAccountRoutes = require('./social-accounts');
const templateRoutes = require('./templates');
const subscriptionRoutes = require('./subscriptions');
const planRoutes = require('./plans');

// Admin routes
const adminUserRoutes = require('./admin/users');
const adminOrganizationRoutes = require('./admin/organizations');
const adminAnalyticsRoutes = require('./admin/analytics');
const adminContentRoutes = require('./admin/content');
const adminNotificationRoutes = require('./admin/notifications');

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

// Customer API routes
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/users`, userRoutes);
router.use(`${API_VERSION}/content`, contentRoutes);
router.use(`${API_VERSION}/analytics`, analyticsRoutes);
router.use(`${API_VERSION}/notifications`, notificationRoutes);
router.use(`${API_VERSION}/social-accounts`, socialAccountRoutes);
router.use(`${API_VERSION}/templates`, templateRoutes);
router.use(`${API_VERSION}/plans`, planRoutes);
router.use(`${API_VERSION}`, subscriptionRoutes);

// Admin API routes
router.use(`${API_VERSION}/admin/users`, adminUserRoutes);
router.use(`${API_VERSION}/admin/organizations`, adminOrganizationRoutes);
router.use(`${API_VERSION}/admin/analytics`, adminAnalyticsRoutes);
router.use(`${API_VERSION}/admin/content`, adminContentRoutes);
router.use(`${API_VERSION}/admin/notifications`, adminNotificationRoutes);

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

