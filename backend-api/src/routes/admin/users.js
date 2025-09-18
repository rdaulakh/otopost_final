const express = require('express');
const adminUsersController = require('../../controllers/admin/users');
const { authenticateAdmin, requireAdminPermission } = require('../../middleware/auth');
const { 
  validateUserQuery,
  validateUserStatusUpdate,
  validateUserPermissionsUpdate,
  validateUserImpersonation,
  validateUserExport
} = require('../../middleware/validation');
const router = express.Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// User management
router.get('/', requireAdminPermission('canViewUsers'), validateUserQuery, adminUsersController.getAllUsers);
router.get('/stats', requireAdminPermission('canViewUsers'), adminUsersController.getUserStats);
router.get('/export', requireAdminPermission('canExportData'), validateUserExport, adminUsersController.exportUsers);
router.get('/:id', requireAdminPermission('canViewUsers'), adminUsersController.getUserById);
router.get('/:id/activity', requireAdminPermission('canViewUsers'), adminUsersController.getUserActivity);

// User status and permissions management
router.put('/:id/status', requireAdminPermission('canEditUsers'), validateUserStatusUpdate, adminUsersController.updateUserStatus);
router.put('/:id/permissions', requireAdminPermission('canEditUsers'), validateUserPermissionsUpdate, adminUsersController.updateUserPermissions);

// Advanced admin features
router.post('/:id/impersonate', requireAdminPermission('canViewUsers'), validateUserImpersonation, adminUsersController.impersonateUser);

module.exports = router;

