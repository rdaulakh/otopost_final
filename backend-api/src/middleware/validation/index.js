// Import all validation modules
const notificationValidation = require('./notification.validation');
const socialAccountValidation = require('./social-account.validation');
const templateValidation = require('./template.validation');

// Re-export all validation functions
module.exports = {
  // Notification validations
  ...notificationValidation,
  
  // Social Account validations
  ...socialAccountValidation,
  
  // Template validations
  ...templateValidation
};

