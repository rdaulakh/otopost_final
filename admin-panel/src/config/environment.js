// Environment Configuration

// Get environment variables with defaults
const getEnvVar = (key, defaultValue = '') => {
  return import.meta.env[key] || defaultValue;
};

// Environment configuration object
export const env = {
  // Application
  APP_NAME: getEnvVar('VITE_APP_NAME', 'AI Social Media Admin Panel'),
  APP_VERSION: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  ENVIRONMENT: getEnvVar('VITE_ENVIRONMENT', 'development'),
  
  // API Configuration
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3001/api/v1'),
  API_TIMEOUT: parseInt(getEnvVar('VITE_API_TIMEOUT', '10000')),
  
  // Authentication
  JWT_STORAGE_KEY: getEnvVar('VITE_JWT_STORAGE_KEY', 'admin_token'),
  REFRESH_TOKEN_KEY: getEnvVar('VITE_REFRESH_TOKEN_KEY', 'admin_refresh_token'),
  
  // Features
  ENABLE_ANALYTICS: getEnvVar('VITE_ENABLE_ANALYTICS', 'true') === 'true',
  ENABLE_NOTIFICATIONS: getEnvVar('VITE_ENABLE_NOTIFICATIONS', 'true') === 'true',
  ENABLE_MULTI_TENANT: getEnvVar('VITE_ENABLE_MULTI_TENANT', 'true') === 'true',
  
  // Development
  DEBUG_MODE: getEnvVar('VITE_DEBUG_MODE', 'false') === 'true',
  LOG_LEVEL: getEnvVar('VITE_LOG_LEVEL', 'info'),
  
  // Security
  ENABLE_CSP: getEnvVar('VITE_ENABLE_CSP', 'true') === 'true',
  SECURE_COOKIES: getEnvVar('VITE_SECURE_COOKIES', 'false') === 'true',
  
  // External Services
  SENTRY_DSN: getEnvVar('VITE_SENTRY_DSN'),
  GOOGLE_ANALYTICS_ID: getEnvVar('VITE_GOOGLE_ANALYTICS_ID'),
};

// Environment checks
export const isDevelopment = () => env.ENVIRONMENT === 'development';
export const isProduction = () => env.ENVIRONMENT === 'production';
export const isStaging = () => env.ENVIRONMENT === 'staging';

// Validation function
export const validateEnvironment = () => {
  const requiredVars = [
    'VITE_API_BASE_URL',
  ];
  
  const missing = requiredVars.filter(key => !getEnvVar(key));
  
  if (missing.length > 0) {
    console.warn('Missing required environment variables:', missing);
    return false;
  }
  
  return true;
};

// Debug logging
export const debugLog = (...args) => {
  if (env.DEBUG_MODE) {
    console.log('[DEBUG]', ...args);
  }
};

// Environment info
export const getEnvironmentInfo = () => ({
  name: env.APP_NAME,
  version: env.APP_VERSION,
  environment: env.ENVIRONMENT,
  apiUrl: env.API_BASE_URL,
  features: {
    analytics: env.ENABLE_ANALYTICS,
    notifications: env.ENABLE_NOTIFICATIONS,
    multiTenant: env.ENABLE_MULTI_TENANT,
  },
  debug: env.DEBUG_MODE,
});

export default env;

