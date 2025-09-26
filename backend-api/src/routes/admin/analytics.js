const express = require('express');
const adminAnalyticsController = require('../../controllers/admin/analytics');
const { authenticateAdmin, requireAdminPermission } = require('../../middleware/auth');
const { 
  validateSystemAnalyticsQuery,
  validatePlatformUsageQuery,
  validateRevenueAnalyticsQuery,
  validateAISystemPerformanceQuery,
  validateCustomReportGeneration
} = require('../../middleware/validation');
const router = express.Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// System-wide analytics
router.get('/dashboard', requireAdminPermission('canViewAnalytics'), validateSystemAnalyticsQuery, adminAnalyticsController.getSystemDashboard);
router.get('/platform-usage', requireAdminPermission('canViewAnalytics'), validatePlatformUsageQuery, adminAnalyticsController.getPlatformUsage);
router.get('/revenue', requireAdminPermission('canViewAnalytics'), validateRevenueAnalyticsQuery, adminAnalyticsController.getRevenueAnalytics);
router.get('/ai-performance', requireAdminPermission('canViewAnalytics'), validateAISystemPerformanceQuery, adminAnalyticsController.getAISystemPerformance);

// Custom reporting
router.post('/custom-report', requireAdminPermission('canCreateReports'), validateCustomReportGeneration, adminAnalyticsController.generateCustomReport);

module.exports = router;

