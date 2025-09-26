const { body, param, query, validationResult } = require('express-validator');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');

// Custom validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      errors: formattedErrors,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  // MongoDB injection protection
  mongoSanitize.sanitize(req.body);
  mongoSanitize.sanitize(req.query);
  mongoSanitize.sanitize(req.params);

  // XSS protection for string fields
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = xss(obj[key], {
          whiteList: {}, // No HTML tags allowed
          stripIgnoreTag: true,
          stripIgnoreTagBody: ['script']
        });
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);

  next();
};

// User validation rules
const userValidation = {
  register: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
      .isLength({ max: 100 })
      .withMessage('Email must not exceed 100 characters'),
    
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    body('businessName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Business name must be between 2 and 100 characters'),
    
    body('industry')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Industry must not exceed 50 characters'),
    
    body('website')
      .optional()
      .isURL({ protocols: ['http', 'https'], require_protocol: true })
      .withMessage('Please provide a valid website URL'),
    
    handleValidationErrors
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    
    handleValidationErrors
  ],

  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    
    body('businessName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Business name must be between 2 and 100 characters'),
    
    body('industry')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Industry must not exceed 50 characters'),
    
    body('website')
      .optional()
      .isURL({ protocols: ['http', 'https'], require_protocol: true })
      .withMessage('Please provide a valid website URL'),
    
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio must not exceed 500 characters'),
    
    handleValidationErrors
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    
    body('newPassword')
      .isLength({ min: 8, max: 128 })
      .withMessage('New password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Password confirmation does not match new password');
        }
        return true;
      }),
    
    handleValidationErrors
  ]
};

// Content validation rules
const contentValidation = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    
    body('content')
      .trim()
      .isLength({ min: 1, max: 10000 })
      .withMessage('Content must be between 1 and 10,000 characters'),
    
    body('platforms')
      .isArray({ min: 1 })
      .withMessage('At least one platform must be selected')
      .custom((platforms) => {
        const validPlatforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube'];
        const invalidPlatforms = platforms.filter(p => !validPlatforms.includes(p));
        if (invalidPlatforms.length > 0) {
          throw new Error(`Invalid platforms: ${invalidPlatforms.join(', ')}`);
        }
        return true;
      }),
    
    body('scheduledFor')
      .optional()
      .isISO8601()
      .withMessage('Scheduled date must be a valid ISO 8601 date')
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error('Scheduled date must be in the future');
        }
        return true;
      }),
    
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array')
      .custom((tags) => {
        if (tags.length > 20) {
          throw new Error('Maximum 20 tags allowed');
        }
        const invalidTags = tags.filter(tag => typeof tag !== 'string' || tag.length > 50);
        if (invalidTags.length > 0) {
          throw new Error('Each tag must be a string with maximum 50 characters');
        }
        return true;
      }),
    
    body('mediaIds')
      .optional()
      .isArray()
      .withMessage('Media IDs must be an array')
      .custom((mediaIds) => {
        if (mediaIds.length > 10) {
          throw new Error('Maximum 10 media files allowed per post');
        }
        return true;
      }),
    
    handleValidationErrors
  ],

  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid content ID'),
    
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    
    body('content')
      .optional()
      .trim()
      .isLength({ min: 1, max: 10000 })
      .withMessage('Content must be between 1 and 10,000 characters'),
    
    body('platforms')
      .optional()
      .isArray({ min: 1 })
      .withMessage('At least one platform must be selected'),
    
    body('scheduledFor')
      .optional()
      .isISO8601()
      .withMessage('Scheduled date must be a valid ISO 8601 date'),
    
    handleValidationErrors
  ]
};

// Social profile validation rules
const socialProfileValidation = {
  connect: [
    body('platform')
      .isIn(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube'])
      .withMessage('Invalid social media platform'),
    
    body('accessToken')
      .notEmpty()
      .withMessage('Access token is required')
      .isLength({ max: 1000 })
      .withMessage('Access token too long'),
    
    body('refreshToken')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Refresh token too long'),
    
    body('profileData')
      .isObject()
      .withMessage('Profile data must be an object'),
    
    body('profileData.username')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Username must be between 1 and 100 characters'),
    
    body('profileData.displayName')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Display name must not exceed 200 characters'),
    
    handleValidationErrors
  ]
};

// Media validation rules
const mediaValidation = {
  upload: [
    body('imageWidth')
      .optional()
      .isInt({ min: 100, max: 4000 })
      .withMessage('Image width must be between 100 and 4000 pixels'),
    
    body('imageHeight')
      .optional()
      .isInt({ min: 100, max: 4000 })
      .withMessage('Image height must be between 100 and 4000 pixels'),
    
    body('imageQuality')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Image quality must be between 1 and 100'),
    
    body('imageFormat')
      .optional()
      .isIn(['jpeg', 'png', 'webp'])
      .withMessage('Image format must be jpeg, png, or webp'),
    
    body('videoWidth')
      .optional()
      .isInt({ min: 240, max: 4000 })
      .withMessage('Video width must be between 240 and 4000 pixels'),
    
    body('videoHeight')
      .optional()
      .isInt({ min: 240, max: 4000 })
      .withMessage('Video height must be between 240 and 4000 pixels'),
    
    body('videoBitrate')
      .optional()
      .matches(/^\d+k$/)
      .withMessage('Video bitrate must be in format like "1000k"'),
    
    body('videoFormat')
      .optional()
      .isIn(['mp4', 'avi', 'mov', 'webm'])
      .withMessage('Video format must be mp4, avi, mov, or webm'),
    
    handleValidationErrors
  ]
};

// Analytics validation rules
const analyticsValidation = {
  query: [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date')
      .custom((value, { req }) => {
        if (req.query.startDate && new Date(value) <= new Date(req.query.startDate)) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    
    query('platform')
      .optional()
      .isIn(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'all'])
      .withMessage('Invalid platform'),
    
    query('metric')
      .optional()
      .isIn(['engagement', 'reach', 'impressions', 'clicks', 'followers', 'all'])
      .withMessage('Invalid metric'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Limit must be between 1 and 1000'),
    
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be a non-negative integer'),
    
    handleValidationErrors
  ]
};

// AI validation rules
const aiValidation = {
  generateContent: [
    body('prompt')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Prompt must be between 10 and 1000 characters'),
    
    body('platform')
      .isIn(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube'])
      .withMessage('Invalid platform'),
    
    body('tone')
      .optional()
      .isIn(['professional', 'casual', 'friendly', 'authoritative', 'humorous'])
      .withMessage('Invalid tone'),
    
    body('length')
      .optional()
      .isIn(['short', 'medium', 'long'])
      .withMessage('Invalid length'),
    
    body('includeHashtags')
      .optional()
      .isBoolean()
      .withMessage('Include hashtags must be a boolean'),
    
    body('includeEmojis')
      .optional()
      .isBoolean()
      .withMessage('Include emojis must be a boolean'),
    
    handleValidationErrors
  ],

  generateHashtags: [
    body('content')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Content must be between 10 and 1000 characters'),
    
    body('platform')
      .isIn(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube'])
      .withMessage('Invalid platform'),
    
    body('count')
      .optional()
      .isInt({ min: 1, max: 30 })
      .withMessage('Hashtag count must be between 1 and 30'),
    
    handleValidationErrors
  ]
};

// Real-time validation rules
const realtimeValidation = {
  subscribeAnalytics: [
    body('type')
      .isIn(['overview', 'content', 'engagement', 'reach', 'followers'])
      .withMessage('Invalid analytics type'),
    
    body('contentId')
      .optional()
      .isMongoId()
      .withMessage('Invalid content ID'),
    
    body('platform')
      .optional()
      .isIn(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube'])
      .withMessage('Invalid platform'),
    
    body('updateInterval')
      .optional()
      .isInt({ min: 10000, max: 300000 })
      .withMessage('Update interval must be between 10 seconds and 5 minutes'),
    
    handleValidationErrors
  ],

  sendNotification: [
    body('targetUserId')
      .isMongoId()
      .withMessage('Invalid target user ID'),
    
    body('notification')
      .isObject()
      .withMessage('Notification must be an object'),
    
    body('notification.type')
      .notEmpty()
      .withMessage('Notification type is required'),
    
    body('notification.title')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Notification title must be between 1 and 100 characters'),
    
    body('notification.message')
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Notification message must be between 1 and 500 characters'),
    
    body('notification.priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid notification priority'),
    
    handleValidationErrors
  ]
};

// Common parameter validations
const commonValidation = {
  mongoId: [
    param('id')
      .isMongoId()
      .withMessage('Invalid ID format'),
    handleValidationErrors
  ],

  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('sort')
      .optional()
      .isIn(['createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'name', '-name'])
      .withMessage('Invalid sort field'),
    
    handleValidationErrors
  ]
};

// Custom validators
const customValidators = {
  isValidObjectId: (value) => {
    return /^[0-9a-fA-F]{24}$/.test(value);
  },

  isValidUrl: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  isValidTimezone: (value) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: value });
      return true;
    } catch {
      return false;
    }
  },

  isValidColor: (value) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
  },

  isValidPhoneNumber: (value) => {
    return /^\+?[1-9]\d{1,14}$/.test(value);
  }
};

module.exports = {
  sanitizeInput,
  handleValidationErrors,
  userValidation,
  contentValidation,
  socialProfileValidation,
  mediaValidation,
  analyticsValidation,
  aiValidation,
  realtimeValidation,
  commonValidation,
  customValidators
};
