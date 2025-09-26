const express = require('express');
const subscriptionController = require('../controllers/subscriptions');
const { authenticateCustomer } = require('../middleware/auth');
const { authenticateAdmin } = require('../middleware/auth');
const { validateSubscriptionCreation, validateSubscriptionUpdate } = require('../middleware/validation');
const router = express.Router();

// Admin routes for subscription management
router.get('/admin/subscriptions', authenticateAdmin, subscriptionController.getSubscriptions);
router.get('/admin/subscriptions/stats', authenticateAdmin, subscriptionController.getSubscriptionStats);
router.get('/admin/subscriptions/analytics', authenticateAdmin, subscriptionController.getSubscriptionAnalytics);
router.get('/admin/subscriptions/plans', authenticateAdmin, subscriptionController.getSubscriptionPlans);
router.get('/admin/subscriptions/subscribed-plans', authenticateAdmin, subscriptionController.getSubscribedPlans);
router.get('/admin/subscriptions/:id', authenticateAdmin, subscriptionController.getSubscription);
router.post('/admin/subscriptions', authenticateAdmin, validateSubscriptionCreation, subscriptionController.createSubscription);
router.put('/admin/subscriptions/:id', authenticateAdmin, validateSubscriptionUpdate, subscriptionController.updateSubscription);
router.post('/admin/subscriptions/:id/cancel', authenticateAdmin, subscriptionController.cancelSubscription);
router.post('/admin/subscriptions/:id/reactivate', authenticateAdmin, subscriptionController.reactivateSubscription);
router.post('/admin/subscriptions/:id/renew', authenticateAdmin, subscriptionController.processSubscriptionRenewal);

// Customer routes for subscription management
router.get('/', authenticateCustomer, subscriptionController.getSubscriptions);
router.get('/plans', subscriptionController.getSubscriptionPlans);
router.get('/:id', authenticateCustomer, subscriptionController.getSubscription);
router.post('/', authenticateCustomer, validateSubscriptionCreation, subscriptionController.createSubscription);
router.put('/:id', authenticateCustomer, validateSubscriptionUpdate, subscriptionController.updateSubscription);
router.post('/:id/cancel', authenticateCustomer, subscriptionController.cancelSubscription);
router.post('/:id/reactivate', authenticateCustomer, subscriptionController.reactivateSubscription);

module.exports = router;
