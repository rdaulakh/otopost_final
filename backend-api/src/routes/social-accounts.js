const express = require('express');
const socialAccountController = require('../controllers/social-accounts');
const { authenticateCustomer, authenticateAdmin, requirePermission } = require('../middleware/auth');
const { 
  validateSocialAccountConnection
} = require('../middleware/validation');

const router = express.Router();

// OAuth flow routes (no authentication required) - MUST be first to avoid conflicts
router.get('/oauth/:platform', socialAccountController.initiateOAuth);
router.get('/oauth/:platform/callback', socialAccountController.handleOAuthCallback);

// Complete OAuth connection (requires authentication)
router.post('/oauth/complete', authenticateCustomer, socialAccountController.completeOAuthConnection);

// Debug OAuth session (requires authentication)
router.get('/oauth/debug', authenticateCustomer, socialAccountController.debugOAuthSession);

// All other routes require customer authentication
router.use(authenticateCustomer);

// Customer social account routes
router.get('/', socialAccountController.getSocialAccounts);
router.get('/stats', socialAccountController.getAccountStats);
router.get('/needing-sync', socialAccountController.getAccountsNeedingSync);
router.get('/:id', socialAccountController.getSocialAccountById);

// Direct connection (for testing or manual token input)
router.post('/connect', validateSocialAccountConnection, socialAccountController.connectSocialAccount);
router.put('/:id', socialAccountController.updateSocialAccount);
router.put('/:id/refresh-token', socialAccountController.refreshToken);
router.put('/:id/analytics', socialAccountController.updateAnalytics);
router.post('/:id/sync', socialAccountController.syncAccount);
router.delete('/:id', socialAccountController.disconnectSocialAccount);

// Admin-only routes
router.use(authenticateAdmin);
router.use(requirePermission('manage_social_accounts'));

// Additional admin routes can be added here if needed

module.exports = router;

