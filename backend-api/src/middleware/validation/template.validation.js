const { body, param, query } = require('express-validator');

// Validation for creating templates
const validateTemplateCreation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Template name is required and must be less than 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('category')
    .isIn([
      'promotional',
      'educational',
      'entertainment',
      'news',
      'announcement',
      'question',
      'poll',
      'story',
      'behind_scenes',
      'user_generated',
      'seasonal',
      'trending',
      'custom'
    ])
    .withMessage('Valid category is required'),
  
  body('platforms')
    .isArray({ min: 1 })
    .withMessage('At least one platform is required'),
  
  body('platforms.*')
    .isIn(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'snapchat'])
    .withMessage('Invalid platform'),
  
  body('content')
    .isObject()
    .withMessage('Content must be an object'),
  
  body('content.text')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Content text is required and must be less than 2000 characters'),
  
  body('content.hashtags')
    .optional()
    .isArray()
    .withMessage('Hashtags must be an array'),
  
  body('content.hashtags.*')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each hashtag must be less than 50 characters'),
  
  body('content.mentions')
    .optional()
    .isArray()
    .withMessage('Mentions must be an array'),
  
  body('content.mentions.*')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each mention must be less than 50 characters'),
  
  body('content.callToAction')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Call to action must be less than 100 characters'),
  
  body('content.link')
    .optional()
    .isURL()
    .withMessage('Link must be a valid URL'),
  
  body('media')
    .optional()
    .isObject()
    .withMessage('Media must be an object'),
  
  body('media.images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('media.images.*.url')
    .optional()
    .isURL()
    .withMessage('Image URL must be valid'),
  
  body('media.images.*.alt')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Image alt text must be less than 200 characters'),
  
  body('media.videos')
    .optional()
    .isArray()
    .withMessage('Videos must be an array'),
  
  body('media.videos.*.url')
    .optional()
    .isURL()
    .withMessage('Video URL must be valid'),
  
  body('variables')
    .optional()
    .isArray()
    .withMessage('Variables must be an array'),
  
  body('variables.*.name')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Variable name must be less than 50 characters'),
  
  body('variables.*.type')
    .optional()
    .isIn(['text', 'number', 'date', 'url', 'hashtag', 'mention'])
    .withMessage('Variable type must be text, number, date, url, hashtag, or mention'),
  
  body('variables.*.required')
    .optional()
    .isBoolean()
    .withMessage('Variable required must be a boolean'),
  
  body('aiSettings')
    .optional()
    .isObject()
    .withMessage('AI settings must be an object'),
  
  body('aiSettings.useAI')
    .optional()
    .isBoolean()
    .withMessage('Use AI must be a boolean'),
  
  body('aiSettings.aiModel')
    .optional()
    .isIn(['gpt-3.5-turbo', 'gpt-4', 'claude-3', 'gemini-pro'])
    .withMessage('AI model must be gpt-3.5-turbo, gpt-4, claude-3, or gemini-pro'),
  
  body('aiSettings.aiTemperature')
    .optional()
    .isFloat({ min: 0, max: 2 })
    .withMessage('AI temperature must be between 0 and 2'),
  
  body('scheduling')
    .optional()
    .isObject()
    .withMessage('Scheduling must be an object'),
  
  body('scheduling.frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'custom'])
    .withMessage('Frequency must be daily, weekly, monthly, or custom'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be less than 30 characters'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('Is public must be a boolean')
];

// Validation for updating templates
const validateTemplateUpdate = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Template name must be less than 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('category')
    .optional()
    .isIn([
      'promotional',
      'educational',
      'entertainment',
      'news',
      'announcement',
      'question',
      'poll',
      'story',
      'behind_scenes',
      'user_generated',
      'seasonal',
      'trending',
      'custom'
    ])
    .withMessage('Invalid category'),
  
  body('platforms')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one platform is required'),
  
  body('platforms.*')
    .optional()
    .isIn(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'snapchat'])
    .withMessage('Invalid platform'),
  
  body('content')
    .optional()
    .isObject()
    .withMessage('Content must be an object'),
  
  body('content.text')
    .optional()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Content text must be less than 2000 characters'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('Is public must be a boolean'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Is active must be a boolean'),
  
  body('isArchived')
    .optional()
    .isBoolean()
    .withMessage('Is archived must be a boolean')
];

// Validation for template usage
const validateTemplateUsage = [
  body('variables')
    .optional()
    .isObject()
    .withMessage('Variables must be an object')
];

// Validation for template ID parameter
const validateTemplateId = [
  param('id')
    .isMongoId()
    .withMessage('Valid template ID is required')
];

// Validation for template query parameters
const validateTemplateQuery = [
  query('category')
    .optional()
    .isIn([
      'promotional',
      'educational',
      'entertainment',
      'news',
      'announcement',
      'question',
      'poll',
      'story',
      'behind_scenes',
      'user_generated',
      'seasonal',
      'trending',
      'custom'
    ])
    .withMessage('Invalid category'),
  
  query('platforms')
    .optional()
    .isString()
    .withMessage('Platforms must be a comma-separated string'),
  
  query('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a comma-separated string'),
  
  query('isPublic')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Is public must be true or false'),
  
  query('isActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Is active must be true or false'),
  
  query('isArchived')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Is archived must be true or false'),
  
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be less than 100 characters'),
  
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
    .isIn(['createdAt', 'updatedAt', 'performance.usageCount', 'name'])
    .withMessage('Sort by must be createdAt, updatedAt, performance.usageCount, or name'),
  
  query('sortOrder')
    .optional()
    .isIn(['1', '-1'])
    .withMessage('Sort order must be 1 or -1')
];

module.exports = {
  validateTemplateCreation,
  validateTemplateUpdate,
  validateTemplateUsage,
  validateTemplateId,
  validateTemplateQuery
};

