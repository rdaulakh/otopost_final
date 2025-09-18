const express = require('express');
const adminNotificationController = require('../../controllers/admin/notifications');
const { authenticateAdmin, requireAdminPermission } = require('../../middleware/auth');
const {
  validateNotificationQuery,
  validateNotificationCreation,
  validateNotificationDataUpdate,
  validateNotificationModeration
} = require('../../middleware/validation');
const router = express.Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// Notification management
router.get('/', requireAdminPermission('canViewNotifications'), validateNotificationQuery, adminNotificationController.getAllNotifications);
router.get('/stats', requireAdminPermission('canViewNotifications'), adminNotificationController.getNotificationStats);
router.get('/:id', requireAdminPermission('canViewNotifications'), adminNotificationController.getNotificationById);
router.get('/:id/analytics', requireAdminPermission('canViewNotifications'), adminNotificationController.getNotificationAnalytics);

// Notification creation and management
router.post('/', requireAdminPermission('canCreateNotifications'), validateNotificationCreation, adminNotificationController.createNotification);
router.put('/:id', requireAdminPermission('canEditNotifications'), validateNotificationDataUpdate, adminNotificationController.updateNotification);
router.delete('/:id', requireAdminPermission('canDeleteNotifications'), adminNotificationController.deleteNotification);

// Notification moderation
router.put('/:id/moderate', requireAdminPermission('canModerateNotifications'), validateNotificationModeration, adminNotificationController.moderateNotification);
router.put('/:id/status', requireAdminPermission('canEditNotifications'), adminNotificationController.updateNotificationStatus);

// Notification templates
router.get('/templates', requireAdminPermission('canViewNotifications'), adminNotificationController.getNotificationTemplates);
router.post('/templates', requireAdminPermission('canCreateNotifications'), adminNotificationController.createNotificationTemplate);
router.put('/templates/:id', requireAdminPermission('canEditNotifications'), adminNotificationController.updateNotificationTemplate);
router.delete('/templates/:id', requireAdminPermission('canDeleteNotifications'), adminNotificationController.deleteNotificationTemplate);

// Bulk operations
router.post('/send-bulk', requireAdminPermission('canCreateNotifications'), adminNotificationController.sendBulkNotification);
router.post('/export', requireAdminPermission('canExportData'), adminNotificationController.exportNotifications);

// Search and analytics
router.get('/search', requireAdminPermission('canViewNotifications'), adminNotificationController.searchNotifications);
router.get('/analytics/overview', requireAdminPermission('canViewAnalytics'), adminNotificationController.getNotificationAnalyticsOverview);

module.exports = router;
