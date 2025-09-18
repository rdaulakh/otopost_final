const express = require('express');
const plansController = require('../controllers/plans');
const { authenticateAdmin } = require('../middleware/auth');
const router = express.Router();

// Public routes (for customers to view available plans)
router.get('/test', plansController.testPlans);
router.get('/', plansController.getAllPlans);
router.get('/:id', plansController.getPlanById);

// Admin routes (for plan management)
router.use(authenticateAdmin);

router.post('/', plansController.createPlan);
router.put('/:id', plansController.updatePlan);
router.delete('/:id', plansController.deletePlan);
router.patch('/:id/toggle-status', plansController.togglePlanStatus);

module.exports = router;
