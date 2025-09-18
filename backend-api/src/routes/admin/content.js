const express = require('express');
const adminContentController = require('../../controllers/admin/content');
const { authenticateAdmin, requireAdminPermission } = require('../../middleware/auth');
const {
  validateContentQuery,
  validateContentModeration,
  validateContentStatusUpdate
} = require('../../middleware/validation');
const router = express.Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// Content management
router.get('/', requireAdminPermission('canViewContent'), validateContentQuery, adminContentController.getContents);
router.get('/stats', requireAdminPermission('canViewContent'), adminContentController.getContentStats);
router.get('/:id', requireAdminPermission('canViewContent'), adminContentController.getContentById);
router.get('/:id/analytics', requireAdminPermission('canViewContent'), adminContentController.getContentAnalytics);

// Content moderation
router.put('/:id/status', requireAdminPermission('canModerateContent'), validateContentStatusUpdate, adminContentController.updateContentStatus);
router.post('/:id/moderate', requireAdminPermission('canModerateContent'), validateContentModeration, adminContentController.moderateContent);

// Content management
router.delete('/:id', requireAdminPermission('canDeleteContent'), adminContentController.deleteContent);

// Content performance and analytics
router.get('/performance/overview', requireAdminPermission('canViewAnalytics'), adminContentController.getContentPerformance);
router.get('/trending', requireAdminPermission('canViewContent'), adminContentController.getTrendingContent);
router.get('/platform/:platform', requireAdminPermission('canViewContent'), adminContentController.getContentByPlatform);

// Content search and export
router.get('/search', requireAdminPermission('canViewContent'), adminContentController.searchContent);
router.get('/export', requireAdminPermission('canExportData'), adminContentController.exportContent);

module.exports = router;
