const { body, param, query } = require('express-validator');

// Validation for creating custom notifications
const validateNotificationCreation = [
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  
  body('organizationId')
    .isMongoId()
    .withMessage('Valid organization ID is required'),
  
  body('type')
    .isIn([
      'content_approved',
      'content_rejected',
      'content_published',
      'content_scheduled',
      'campaign_started',
      'campaign_completed',
      'campaign_paused',
      'analytics_ready',
      'ai_agent_completed',
      'ai_agent_failed',
      'subscription_expiring',
      'subscription_expired',
      'payment_successful',
      'payment_failed',
      'social_account_connected',
      'social_account_disconnected',
      'system_alert',
      'crisis_detected',
      'trend_alert',
      'competitor_alert',
      'performance_alert',
      'custom'
    ])
    .withMessage('Valid notification type is required'),
  
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('message')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expires at must be a valid date'),
  
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object')
];

// Validation for updating notification preferences
const validateNotificationPreferences = [
  body('preferences')
    .isObject()
    .withMessage('Preferences must be an object'),
  
  body('preferences.email')
    .optional()
    .isBoolean()
    .withMessage('Email preference must be a boolean'),
  
  body('preferences.push')
    .optional()
    .isBoolean()
    .withMessage('Push preference must be a boolean'),
  
  body('preferences.inApp')
    .optional()
    .isBoolean()
    .withMessage('In-app preference must be a boolean'),
  
  body('preferences.types')
    .optional()
    .isObject()
    .withMessage('Types preference must be an object')
];

// Validation for notification ID parameter
const validateNotificationId = [
  param('id')
    .isMongoId()
    .withMessage('Valid notification ID is required')
];

// Validation for notification query parameters
const validateNotificationQuery = [
  query('status')
    .optional()
    .isIn(['unread', 'read', 'archived', 'all'])
    .withMessage('Status must be unread, read, archived, or all'),
  
  query('type')
    .optional()
    .isIn([
      'content_approved',
      'content_rejected',
      'content_published',
      'content_scheduled',
      'campaign_started',
      'campaign_completed',
      'campaign_paused',
      'analytics_ready',
      'ai_agent_completed',
      'ai_agent_failed',
      'subscription_expiring',
      'subscription_expired',
      'payment_successful',
      'payment_failed',
      'social_account_connected',
      'social_account_disconnected',
      'system_alert',
      'crisis_detected',
      'trend_alert',
      'competitor_alert',
      'performance_alert',
      'custom'
    ])
    .withMessage('Invalid notification type'),
  
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('skip')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Skip must be a non-negative integer'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'priority', 'status'])
    .withMessage('Sort by must be createdAt, updatedAt, priority, or status'),
  
  query('sortOrder')
    .optional()
    .isIn(['1', '-1'])
    .withMessage('Sort order must be 1 or -1')
];

module.exports = {
  validateNotificationCreation,
  validateNotificationPreferences,
  validateNotificationId,
  validateNotificationQuery
};

