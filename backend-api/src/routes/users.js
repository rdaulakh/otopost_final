const express = require('express');
const multer = require('multer');
const path = require('path');
const usersController = require('../controllers/users');
const { authenticateCustomer } = require('../middleware/auth');
const { 
  validateProfileUpdate, 
  validatePasswordChange, 
  validateNotificationUpdate,
  validateSocialAccountConnection,
  validateAccountDeletion
} = require('../middleware/validation');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/brand-assets/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/png', 
      'image/jpeg', 
      'image/jpg', 
      'image/webp',        // Added WebP support
      'image/svg+xml', 
      'image/x-icon',
      'image/vnd.microsoft.icon',
      'image/ico',
      'image/icon'
    ];
    console.log('File upload attempt:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      fieldname: file.fieldname
    });
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.log('File type rejected:', file.mimetype);
      cb(new Error('Invalid file type. Only PNG, JPG, WebP, SVG, and ICO files are allowed.'));
    }
  }
});

const router = express.Router();

// All routes require customer authentication
router.use(authenticateCustomer);

// Profile management
router.get('/me', usersController.getProfile); // Alias for /profile
router.get('/profile', usersController.getProfile);
router.put('/profile', validateProfileUpdate, usersController.updateProfile);
router.post('/profile/avatar', upload.single('avatar'), usersController.uploadAvatar);
router.post('/avatar', upload.single('avatar'), usersController.uploadAvatar); // Direct avatar upload endpoint
router.put('/change-password', validatePasswordChange, usersController.changePassword);
router.get('/notifications', usersController.getNotifications);
router.put('/notifications', validateNotificationUpdate, usersController.updateNotifications);

// Social media account management
router.get('/social-accounts', usersController.getSocialAccounts);
router.post('/social-accounts', validateSocialAccountConnection, usersController.connectSocialAccount);
router.delete('/social-accounts/:platform', usersController.disconnectSocialAccount);

// Activity and dashboard
router.get('/activity', usersController.getActivityLog);
router.get('/dashboard-stats', usersController.getDashboardStats);

// Subscription management
router.get('/subscription', usersController.getSubscription);
router.get('/stats', usersController.getUsageStats);

// Organization business profile management
router.get('/organization/profile', usersController.getOrganizationProfile);
router.put('/organization/profile', usersController.updateOrganizationProfile);
router.get('/organization/brand-assets', usersController.getBrandAssets);
router.post('/organization/upload-asset', upload.single('file'), usersController.uploadBrandAsset);
router.delete('/organization/brand-assets/:assetType', usersController.deleteBrandAsset);

// Security management
router.get('/security', usersController.getSecurityInfo);

// Account management
router.delete('/account', validateAccountDeletion, usersController.deleteAccount);

module.exports = router;

