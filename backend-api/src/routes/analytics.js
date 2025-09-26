const express = require('express');
const analyticsController = require('../controllers/analytics');
const { authenticateCustomer, requirePermission } = require('../middleware/auth');
const { 
  validateAnalyticsQuery,
  validateContentPerformanceQuery,
  validatePlatformAnalyticsQuery,
  validateAudienceInsightsQuery,
  validateAIPerformanceQuery,
  validateROIQuery,
  validateExportQuery
} = require('../middleware/validation');
const router = express.Router();

// All routes require customer authentication
router.use(authenticateCustomer);

// Dashboard and overview analytics
router.get('/dashboard', validateAnalyticsQuery, analyticsController.getDashboard);

// Content performance analytics
router.get('/content-performance', requirePermission('analytics.read'), validateContentPerformanceQuery, analyticsController.getContentPerformance);

// Platform-specific analytics
router.get('/platform', requirePermission('analytics.read'), validatePlatformAnalyticsQuery, analyticsController.getPlatformAnalytics);

// Audience insights
router.get('/audience', requirePermission('analytics.read'), validateAudienceInsightsQuery, analyticsController.getAudienceInsights);

// AI agent performance
router.get('/ai-performance', requirePermission('analytics.read'), validateAIPerformanceQuery, analyticsController.getAIPerformance);

// ROI and business metrics
router.get('/roi', requirePermission('analytics.read'), validateROIQuery, analyticsController.getROIMetrics);

// Data export
router.get('/export', requirePermission('analytics.export'), validateExportQuery, analyticsController.exportData);

module.exports = router;

