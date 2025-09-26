const express = require('express');
const { customerAuth, adminAuth } = require('../controllers/auth');
const { userValidations, adminValidations, commonValidations } = require('../middleware/validation');
const router = express.Router();

// Customer Authentication Routes
router.post('/customer/register', userValidations.register, customerAuth.register);
router.post('/customer/login', userValidations.login, customerAuth.login);
router.post('/customer/logout', customerAuth.logout);
router.post('/customer/refresh-token', commonValidations.objectId, customerAuth.refreshToken);
router.post('/customer/forgot-password', userValidations.forgotPassword, customerAuth.forgotPassword);
router.post('/customer/reset-password', userValidations.resetPassword, customerAuth.resetPassword);
router.get('/customer/me', customerAuth.getProfile);

// Admin Authentication Routes
router.post('/admin/login', adminValidations.login, adminAuth.login);
router.post('/admin/logout', adminAuth.logout);
router.post('/admin/refresh-token', commonValidations.objectId, adminAuth.refreshToken);

module.exports = router;