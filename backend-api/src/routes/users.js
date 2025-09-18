const express = require('express');
const usersController = require('../controllers/users');
const { authenticateCustomer } = require('../middleware/auth');
const { 
  validateProfileUpdate, 
  validatePasswordChange, 
  validateNotificationUpdate,
  validateSocialAccountConnection,
  validateAccountDeletion
} = require('../middleware/validation');
const router = express.Router();

// All routes require customer authentication
router.use(authenticateCustomer);

// Profile management
router.get('/profile', usersController.getProfile);
router.put('/profile', validateProfileUpdate, usersController.updateProfile);
router.put('/change-password', validatePasswordChange, usersController.changePassword);
router.put('/notifications', validateNotificationUpdate, usersController.updateNotifications);

// Social media account management
router.get('/social-accounts', usersController.getSocialAccounts);
router.post('/social-accounts', validateSocialAccountConnection, usersController.connectSocialAccount);
router.delete('/social-accounts/:platform', usersController.disconnectSocialAccount);

// Activity and dashboard
router.get('/activity', usersController.getActivityLog);
router.get('/dashboard-stats', usersController.getDashboardStats);

// Account management
router.delete('/account', validateAccountDeletion, usersController.deleteAccount);

module.exports = router;

