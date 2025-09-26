const { body, param, query } = require('express-validator');

// Validation for connecting social accounts
const validateSocialAccountConnection = [
  body('platform')
    .isIn(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'snapchat'])
    .withMessage('Valid platform is required'),
  
  body('accountId')
    .isLength({ min: 1, max: 100 })
    .withMessage('Account ID is required and must be less than 100 characters'),
  
  body('accountName')
    .isLength({ min: 1, max: 100 })
    .withMessage('Account name is required and must be less than 100 characters'),
  
  body('accountUsername')
    .isLength({ min: 1, max: 50 })
    .withMessage('Account username is required and must be less than 50 characters'),
  
  body('accountUrl')
    .optional()
    .isURL()
    .withMessage('Account URL must be a valid URL'),
  
  body('profilePicture')
    .optional()
    .isURL()
    .withMessage('Profile picture must be a valid URL'),
  
  body('accessToken')
    .isLength({ min: 1 })
    .withMessage('Access token is required'),
  
  body('refreshToken')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Refresh token must be a valid string'),
  
  body('tokenExpiresAt')
    .optional()
    .isISO8601()
    .withMessage('Token expires at must be a valid date'),
  
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
  
  body('permissions.*')
    .optional()
    .isIn([
      'read_insights',
      'publish_posts',
      'manage_posts',
      'read_audience',
      'manage_comments',
      'read_messages',
      'manage_ads',
      'read_analytics'
    ])
    .withMessage('Invalid permission type')
];

// Validation for updating social accounts
const validateSocialAccountUpdate = [
  body('accountName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Account name must be less than 100 characters'),
  
  body('accountUsername')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Account username must be less than 50 characters'),
  
  body('accountUrl')
    .optional()
    .isURL()
    .withMessage('Account URL must be a valid URL'),
  
  body('profilePicture')
    .optional()
    .isURL()
    .withMessage('Profile picture must be a valid URL'),
  
  body('followersCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Followers count must be a non-negative integer'),
  
  body('followingCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Following count must be a non-negative integer'),
  
  body('postsCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Posts count must be a non-negative integer'),
  
  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('Is verified must be a boolean'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Is active must be a boolean'),
  
  body('settings')
    .optional()
    .isObject()
    .withMessage('Settings must be an object'),
  
  body('settings.autoPost')
    .optional()
    .isBoolean()
    .withMessage('Auto post setting must be a boolean'),
  
  body('settings.autoRespond')
    .optional()
    .isBoolean()
    .withMessage('Auto respond setting must be a boolean'),
  
  body('settings.syncFrequency')
    .optional()
    .isIn(['realtime', 'hourly', 'daily', 'weekly'])
    .withMessage('Sync frequency must be realtime, hourly, daily, or weekly'),
  
  body('settings.timezone')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Timezone must be less than 50 characters'),
  
  body('settings.language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language must be 2-5 characters')
];

// Validation for token refresh
const validateTokenRefresh = [
  body('accessToken')
    .isLength({ min: 1 })
    .withMessage('Access token is required'),
  
  body('refreshToken')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Refresh token must be a valid string'),
  
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expires at must be a valid date')
];

// Validation for social account ID parameter
const validateSocialAccountId = [
  param('id')
    .isMongoId()
    .withMessage('Valid social account ID is required')
];

// Validation for social account query parameters
const validateSocialAccountQuery = [
  query('platform')
    .optional()
    .isIn(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'snapchat'])
    .withMessage('Invalid platform'),
  
  query('isActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Is active must be true or false'),
  
  query('isConnected')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Is connected must be true or false'),
  
  query('includeInactive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Include inactive must be true or false')
];

module.exports = {
  validateSocialAccountConnection,
  validateSocialAccountUpdate,
  validateTokenRefresh,
  validateSocialAccountId,
  validateSocialAccountQuery
};

