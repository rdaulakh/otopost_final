const express = require('express');
const contentController = require('../controllers/content');
const { authenticateCustomer, requirePermission } = require('../middleware/auth');
const { 
  validateContentCreation,
  validateContentUpdate,
  validateContentScheduling,
  validateContentApproval,
  validateComment,
  validateAIGeneration,
  validateCalendarQuery
} = require('../middleware/validation');
const router = express.Router();

// All routes require customer authentication
router.use(authenticateCustomer);

// Content CRUD operations
router.get('/', contentController.getList);
router.post('/', requirePermission('content.create'), validateContentCreation, contentController.create);
router.get('/calendar', validateCalendarQuery, contentController.getCalendar);
router.get('/:id', contentController.getById);
router.put('/:id', requirePermission('content.update'), validateContentUpdate, contentController.update);
router.delete('/:id', requirePermission('content.delete'), contentController.delete);

// Content scheduling and approval
router.post('/:id/schedule', requirePermission('content.schedule'), validateContentScheduling, contentController.schedule);
router.post('/:id/approve', requirePermission('content.approve'), validateContentApproval, contentController.approve);

// Collaboration features
router.post('/:id/comments', validateComment, contentController.addComment);

// AI content generation
router.post('/generate', requirePermission('content.ai_generate'), validateAIGeneration, contentController.generateWithAI);

module.exports = router;

