const express = require('express');
const templateController = require('../controllers/templates');
const { authenticateCustomer, authenticateAdmin, requirePermission } = require('../middleware/auth');
// No validation functions available for templates yet

const router = express.Router();

// Public routes (no authentication required)
router.get('/public', templateController.getPublicTemplates);
router.get('/categories', templateController.getTemplateCategories);

// All other routes require customer authentication
router.use(authenticateCustomer);

// Customer template routes
router.get('/', templateController.getTemplates);
router.get('/stats', templateController.getTemplateStats);
router.get('/:id', templateController.getTemplateById);
router.post('/', templateController.createTemplate);
router.put('/:id', templateController.updateTemplate);
router.delete('/:id', templateController.deleteTemplate);
router.post('/:id/duplicate', templateController.duplicateTemplate);
router.post('/:id/use', templateController.useTemplate);
router.put('/:id/archive', templateController.archiveTemplate);
router.put('/:id/restore', templateController.restoreTemplate);

// Admin-only routes
router.use(authenticateAdmin);
router.use(requirePermission('manage_templates'));

// Additional admin routes can be added here if needed

module.exports = router;

