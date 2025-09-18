const express = require('express');
const adminOrganizationsController = require('../../controllers/admin/organizations');
const { authenticateAdmin, requireAdminPermission } = require('../../middleware/auth');
const { 
  validateOrganizationQuery,
  validateOrganizationStatusUpdate,
  validateSubscriptionUpdate,
  validateOrganizationAnalyticsQuery,
  validateUsageReset
} = require('../../middleware/validation');
const router = express.Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// Organization management
router.post('/', requireAdminPermission('canCreateOrganizations'), adminOrganizationsController.createOrganization);
router.get('/', requireAdminPermission('canViewOrganizations'), validateOrganizationQuery, adminOrganizationsController.getAllOrganizations);
router.get('/stats', requireAdminPermission('canViewOrganizations'), adminOrganizationsController.getOrganizationStats);
router.get('/:id', requireAdminPermission('canViewOrganizations'), adminOrganizationsController.getOrganizationById);
router.get('/:id/analytics', requireAdminPermission('canViewOrganizations'), validateOrganizationAnalyticsQuery, adminOrganizationsController.getOrganizationAnalytics);

// Organization status and subscription management
router.put('/:id/status', requireAdminPermission('canEditOrganizations'), validateOrganizationStatusUpdate, adminOrganizationsController.updateOrganizationStatus);
router.put('/:id/subscription', requireAdminPermission('canEditOrganizations'), validateSubscriptionUpdate, adminOrganizationsController.updateSubscription);

// Usage management
router.post('/:id/reset-usage', requireAdminPermission('canEditOrganizations'), validateUsageReset, adminOrganizationsController.resetUsageLimits);

module.exports = router;

