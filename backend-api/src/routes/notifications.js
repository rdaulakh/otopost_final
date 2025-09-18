const express = require('express');
const notificationController = require('../controllers/notifications');
const { authenticateCustomer, authenticateAdmin, requirePermission } = require('../middleware/auth');
const { 
  validateNotificationUpdate
} = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateCustomer);

// Customer notification routes
router.get('/', notificationController.getNotifications);
router.get('/stats', notificationController.getNotificationStats);
router.get('/preferences', notificationController.getNotificationPreferences);
router.put('/preferences', validateNotificationUpdate, notificationController.updateNotificationPreferences);
router.get('/:id', notificationController.getNotificationById);
router.put('/:id/read', notificationController.markAsRead);
router.put('/:id/archive', notificationController.archiveNotification);
router.put('/mark-all-read', notificationController.markAllAsRead);

// Admin-only routes
router.use(authenticateAdmin);
router.use(requirePermission('manage_notifications'));

router.post('/custom', notificationController.createCustomNotification);
router.post('/bulk', notificationController.bulkCreateNotifications);
router.delete('/cleanup-expired', notificationController.cleanupExpiredNotifications);

module.exports = router;

