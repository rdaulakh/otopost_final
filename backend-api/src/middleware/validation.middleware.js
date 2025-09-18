const { body, param, query, validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Validation Middleware
 * Centralized validation rules and error handling
 */

// Common validation rules
const commonRules = {
  // ObjectId validation
  objectId: (field) => param(field).isMongoId().withMessage(`${field} must be a valid MongoDB ObjectId`),
  
  // Email validation
  email: (field = 'email') => body(field)
    .isEmail()
    .normalizeEmail()
    .withMessage(`${field} must be a valid email address`),
  
  // Password validation
  password: (field = 'password') => body(field)
    .isLength({ min: 8 })
    .withMessage(`${field} must be at least 8 characters long`)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(`${field} must contain at least one uppercase letter, one lowercase letter, one number, and one special character`),
  
  // Username validation
  username: (field = 'username') => body(field)
    .isLength({ min: 3, max: 30 })
    .withMessage(`${field} must be between 3 and 30 characters`)
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(`${field} can only contain letters, numbers, and underscores`),
  
  // Name validation
  name: (field) => body(field)
    .isLength({ min: 2, max: 50 })
    .withMessage(`${field} must be between 2 and 50 characters`)
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage(`${field} can only contain letters and spaces`),
  
  // Phone validation
  phone: (field = 'phone') => body(field)
    .optional()
    .isMobilePhone()
    .withMessage(`${field} must be a valid phone number`),
  
  // URL validation
  url: (field) => body(field)
    .optional()
    .isURL()
    .withMessage(`${field} must be a valid URL`),
  
  // Date validation
  date: (field) => body(field)
    .optional()
    .isISO8601()
    .withMessage(`${field} must be a valid date in ISO 8601 format`),
  
  // Positive number validation
  positiveNumber: (field) => body(field)
    .optional()
    .isFloat({ min: 0 })
    .withMessage(`${field} must be a positive number`),
  
  // Integer validation
  integer: (field) => body(field)
    .optional()
    .isInt()
    .withMessage(`${field} must be an integer`),
  
  // Boolean validation
  boolean: (field) => body(field)
    .optional()
    .isBoolean()
    .withMessage(`${field} must be a boolean value`),
  
  // Array validation
  array: (field) => body(field)
    .optional()
    .isArray()
    .withMessage(`${field} must be an array`),
  
  // String length validation
  stringLength: (field, min = 1, max = 255) => body(field)
    .optional()
    .isLength({ min, max })
    .withMessage(`${field} must be between ${min} and ${max} characters`),
  
  // Enum validation
  enum: (field, values) => body(field)
    .optional()
    .isIn(values)
    .withMessage(`${field} must be one of: ${values.join(', ')}`),
  
  // Required field validation
  required: (field) => body(field)
    .notEmpty()
    .withMessage(`${field} is required`),
  
  // Optional field validation
  optional: (field) => body(field)
    .optional()
};

// User validation rules
const userValidation = {
  // Create user
  createUser: [
    commonRules.required('firstName'),
    commonRules.name('firstName'),
    commonRules.required('lastName'),
    commonRules.name('lastName'),
    commonRules.required('email'),
    commonRules.email('email'),
    commonRules.required('password'),
    commonRules.password('password'),
    commonRules.optional('username'),
    commonRules.username('username'),
    commonRules.optional('phone'),
    commonRules.phone('phone'),
    commonRules.optional('organization'),
    commonRules.objectId('organization'),
    commonRules.optional('role'),
    commonRules.enum('role', ['admin', 'member', 'viewer']),
    commonRules.optional('isActive'),
    commonRules.boolean('isActive')
  ],
  
  // Update user
  updateUser: [
    commonRules.optional('firstName'),
    commonRules.name('firstName'),
    commonRules.optional('lastName'),
    commonRules.name('lastName'),
    commonRules.optional('email'),
    commonRules.email('email'),
    commonRules.optional('phone'),
    commonRules.phone('phone'),
    commonRules.optional('role'),
    commonRules.enum('role', ['admin', 'member', 'viewer']),
    commonRules.optional('isActive'),
    commonRules.boolean('isActive')
  ],
  
  // Change password
  changePassword: [
    commonRules.required('currentPassword'),
    commonRules.required('newPassword'),
    commonRules.password('newPassword'),
    commonRules.required('confirmPassword'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
  ]
};

// Content validation rules
const contentValidation = {
  // Create content
  createContent: [
    commonRules.required('title'),
    commonRules.stringLength('title', 1, 200),
    commonRules.required('content'),
    commonRules.stringLength('content', 1, 5000),
    commonRules.optional('description'),
    commonRules.stringLength('description', 0, 500),
    commonRules.optional('platforms'),
    commonRules.array('platforms'),
    commonRules.optional('scheduledAt'),
    commonRules.date('scheduledAt'),
    commonRules.optional('tags'),
    commonRules.array('tags'),
    commonRules.optional('media'),
    commonRules.array('media'),
    commonRules.optional('status'),
    commonRules.enum('status', ['draft', 'scheduled', 'published', 'archived'])
  ],
  
  // Update content
  updateContent: [
    commonRules.optional('title'),
    commonRules.stringLength('title', 1, 200),
    commonRules.optional('content'),
    commonRules.stringLength('content', 1, 5000),
    commonRules.optional('description'),
    commonRules.stringLength('description', 0, 500),
    commonRules.optional('platforms'),
    commonRules.array('platforms'),
    commonRules.optional('scheduledAt'),
    commonRules.date('scheduledAt'),
    commonRules.optional('tags'),
    commonRules.array('tags'),
    commonRules.optional('media'),
    commonRules.array('media'),
    commonRules.optional('status'),
    commonRules.enum('status', ['draft', 'scheduled', 'published', 'archived'])
  ]
};

// Campaign validation rules
const campaignValidation = {
  // Create campaign
  createCampaign: [
    commonRules.required('name'),
    commonRules.stringLength('name', 1, 100),
    commonRules.optional('description'),
    commonRules.stringLength('description', 0, 1000),
    commonRules.required('startDate'),
    commonRules.date('startDate'),
    commonRules.required('endDate'),
    commonRules.date('endDate'),
    commonRules.optional('budget'),
    commonRules.positiveNumber('budget'),
    commonRules.optional('platforms'),
    commonRules.array('platforms'),
    commonRules.optional('status'),
    commonRules.enum('status', ['draft', 'active', 'paused', 'completed', 'cancelled'])
  ],
  
  // Update campaign
  updateCampaign: [
    commonRules.optional('name'),
    commonRules.stringLength('name', 1, 100),
    commonRules.optional('description'),
    commonRules.stringLength('description', 0, 1000),
    commonRules.optional('startDate'),
    commonRules.date('startDate'),
    commonRules.optional('endDate'),
    commonRules.date('endDate'),
    commonRules.optional('budget'),
    commonRules.positiveNumber('budget'),
    commonRules.optional('platforms'),
    commonRules.array('platforms'),
    commonRules.optional('status'),
    commonRules.enum('status', ['draft', 'active', 'paused', 'completed', 'cancelled'])
  ]
};

// Analytics validation rules
const analyticsValidation = {
  // Get analytics
  getAnalytics: [
    commonRules.optional('startDate'),
    commonRules.date('startDate'),
    commonRules.optional('endDate'),
    commonRules.date('endDate'),
    commonRules.optional('platform'),
    commonRules.enum('platform', ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest']),
    commonRules.optional('metric'),
    commonRules.enum('metric', ['engagement', 'reach', 'impressions', 'clicks', 'conversions']),
    commonRules.optional('groupBy'),
    commonRules.enum('groupBy', ['day', 'week', 'month', 'year']),
    commonRules.optional('limit'),
    commonRules.integer('limit')
  ]
};

// Subscription validation rules
const subscriptionValidation = {
  // Create subscription
  createSubscription: [
    commonRules.required('plan'),
    commonRules.enum('plan', ['starter', 'professional', 'enterprise']),
    commonRules.required('billingCycle'),
    commonRules.enum('billingCycle', ['monthly', 'quarterly', 'yearly']),
    commonRules.required('price'),
    commonRules.positiveNumber('price'),
    commonRules.optional('currency'),
    commonRules.enum('currency', ['USD', 'EUR', 'GBP', 'CAD', 'AUD']),
    commonRules.optional('startDate'),
    commonRules.date('startDate'),
    commonRules.optional('endDate'),
    commonRules.date('endDate'),
    commonRules.optional('trialEndsAt'),
    commonRules.date('trialEndsAt')
  ],
  
  // Update subscription
  updateSubscription: [
    commonRules.optional('plan'),
    commonRules.enum('plan', ['starter', 'professional', 'enterprise']),
    commonRules.optional('billingCycle'),
    commonRules.enum('billingCycle', ['monthly', 'quarterly', 'yearly']),
    commonRules.optional('price'),
    commonRules.positiveNumber('price'),
    commonRules.optional('currency'),
    commonRules.enum('currency', ['USD', 'EUR', 'GBP', 'CAD', 'AUD']),
    commonRules.optional('status'),
    commonRules.enum('status', ['active', 'cancelled', 'paused', 'expired'])
  ]
};

// Notification validation rules
const notificationValidation = {
  // Create notification
  createNotification: [
    commonRules.required('title'),
    commonRules.stringLength('title', 1, 200),
    commonRules.required('message'),
    commonRules.stringLength('message', 1, 1000),
    commonRules.required('type'),
    commonRules.enum('type', ['info', 'warning', 'error', 'success', 'engagement', 'system', 'subscription', 'payment']),
    commonRules.optional('priority'),
    commonRules.enum('priority', ['low', 'medium', 'high', 'urgent']),
    commonRules.optional('relatedUser'),
    commonRules.objectId('relatedUser'),
    commonRules.optional('metadata'),
    commonRules.optional('scheduledAt'),
    commonRules.date('scheduledAt')
  ]
};

// Template validation rules
const templateValidation = {
  // Create template
  createTemplate: [
    commonRules.required('name'),
    commonRules.stringLength('name', 1, 100),
    commonRules.optional('description'),
    commonRules.stringLength('description', 0, 500),
    commonRules.required('type'),
    commonRules.enum('type', ['content', 'email', 'notification', 'report']),
    commonRules.optional('category'),
    commonRules.stringLength('category', 0, 50),
    commonRules.required('content'),
    commonRules.stringLength('content', 1, 10000),
    commonRules.optional('variables'),
    commonRules.array('variables'),
    commonRules.optional('platforms'),
    commonRules.array('platforms'),
    commonRules.optional('isPublic'),
    commonRules.boolean('isPublic'),
    commonRules.optional('tags'),
    commonRules.array('tags')
  ],
  
  // Update template
  updateTemplate: [
    commonRules.optional('name'),
    commonRules.stringLength('name', 1, 100),
    commonRules.optional('description'),
    commonRules.stringLength('description', 0, 500),
    commonRules.optional('type'),
    commonRules.enum('type', ['content', 'email', 'notification', 'report']),
    commonRules.optional('category'),
    commonRules.stringLength('category', 0, 50),
    commonRules.optional('content'),
    commonRules.stringLength('content', 1, 10000),
    commonRules.optional('variables'),
    commonRules.array('variables'),
    commonRules.optional('platforms'),
    commonRules.array('platforms'),
    commonRules.optional('isPublic'),
    commonRules.boolean('isPublic'),
    commonRules.optional('tags'),
    commonRules.array('tags')
  ]
};

// Social account validation rules
const socialAccountValidation = {
  // Connect social account
  connectSocialAccount: [
    commonRules.required('platform'),
    commonRules.enum('platform', ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest']),
    commonRules.required('accountId'),
    commonRules.stringLength('accountId', 1, 100),
    commonRules.required('accountName'),
    commonRules.stringLength('accountName', 1, 100),
    commonRules.required('accessToken'),
    commonRules.stringLength('accessToken', 1, 1000),
    commonRules.optional('refreshToken'),
    commonRules.stringLength('refreshToken', 0, 1000),
    commonRules.optional('tokenExpiresAt'),
    commonRules.date('tokenExpiresAt'),
    commonRules.optional('accountData')
  ],
  
  // Update social account
  updateSocialAccount: [
    commonRules.optional('accountName'),
    commonRules.stringLength('accountName', 1, 100),
    commonRules.optional('accessToken'),
    commonRules.stringLength('accessToken', 1, 1000),
    commonRules.optional('refreshToken'),
    commonRules.stringLength('refreshToken', 0, 1000),
    commonRules.optional('tokenExpiresAt'),
    commonRules.date('tokenExpiresAt'),
    commonRules.optional('accountData'),
    commonRules.optional('status'),
    commonRules.enum('status', ['active', 'inactive', 'error', 'expired'])
  ]
};

// AI content validation rules
const aiContentValidation = {
  // Generate content
  generateContent: [
    commonRules.required('prompt'),
    commonRules.stringLength('prompt', 1, 2000),
    commonRules.optional('type'),
    commonRules.enum('type', ['text', 'caption', 'hashtags', 'post']),
    commonRules.optional('provider'),
    commonRules.enum('provider', ['openai', 'claude', 'gemini', 'azure-openai']),
    commonRules.optional('maxTokens'),
    commonRules.integer('maxTokens'),
    commonRules.optional('temperature'),
    commonRules.positiveNumber('temperature'),
    commonRules.optional('platform'),
    commonRules.enum('platform', ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest']),
    commonRules.optional('tone'),
    commonRules.enum('tone', ['professional', 'casual', 'friendly', 'authoritative', 'playful', 'serious']),
    commonRules.optional('length'),
    commonRules.enum('length', ['short', 'medium', 'long'])
  ]
};

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    logger.warn('Validation errors:', errorMessages);
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

// Custom validation functions
const customValidations = {
  // Check if end date is after start date
  endDateAfterStartDate: (endDateField, startDateField) => 
    body(endDateField).custom((value, { req }) => {
      const startDate = req.body[startDateField];
      if (startDate && value && new Date(value) <= new Date(startDate)) {
        throw new Error(`${endDateField} must be after ${startDateField}`);
      }
      return true;
    }),
  
  // Check if password confirmation matches
  passwordConfirmation: (passwordField, confirmField) =>
    body(confirmField).custom((value, { req }) => {
      if (value !== req.body[passwordField]) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),
  
  // Check if array contains valid values
  arrayContains: (field, validValues) =>
    body(field).custom((value) => {
      if (Array.isArray(value)) {
        const invalidValues = value.filter(item => !validValues.includes(item));
        if (invalidValues.length > 0) {
          throw new Error(`${field} contains invalid values: ${invalidValues.join(', ')}`);
        }
      }
      return true;
    }),
  
  // Check if string is not empty when provided
  notEmptyWhenProvided: (field) =>
    body(field).custom((value) => {
      if (value !== undefined && value !== null && value.toString().trim() === '') {
        throw new Error(`${field} cannot be empty`);
      }
      return true;
    })
};

module.exports = {
  commonRules,
  userValidation,
  contentValidation,
  campaignValidation,
  analyticsValidation,
  subscriptionValidation,
  notificationValidation,
  templateValidation,
  socialAccountValidation,
  aiContentValidation,
  handleValidationErrors,
  customValidations
};

