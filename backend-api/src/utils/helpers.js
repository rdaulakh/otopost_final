const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

/**
 * Helper Utilities
 * Common helper functions used throughout the application
 */

// Generate random string
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate UUID
const generateUUID = () => {
  return uuidv4();
};

// Generate random number
const generateRandomNumber = (min = 0, max = 100) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate random password
const generateRandomPassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// Generate API key
const generateAPIKey = (prefix = 'sk') => {
  return `${prefix}_${generateRandomString(32)}`;
};

// Generate token
const generateToken = (length = 64) => {
  return crypto.randomBytes(length).toString('base64url');
};

// Hash string
const hashString = (str, algorithm = 'sha256') => {
  return crypto.createHash(algorithm).update(str).digest('hex');
};

// Compare hash
const compareHash = (str, hash, algorithm = 'sha256') => {
  return hashString(str, algorithm) === hash;
};

// Deep clone object
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

// Merge objects
const mergeObjects = (...objects) => {
  return Object.assign({}, ...objects);
};

// Pick properties from object
const pick = (obj, keys) => {
  const result = {};
  keys.forEach(key => {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
  });
  return result;
};

// Omit properties from object
const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

// Check if object is empty
const isEmpty = (obj) => {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

// Sleep function
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Retry function
const retry = async (fn, maxAttempts = 3, delay = 1000) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxAttempts - 1) throw error;
      await sleep(delay * Math.pow(2, i));
    }
  }
};

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Chunk array
const chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Unique array
const unique = (array) => {
  return [...new Set(array)];
};

// Group by property
const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

// Sort by property
const sortBy = (array, key, order = 'asc') => {
  return array.sort((a, b) => {
    if (order === 'desc') {
      return b[key] > a[key] ? 1 : -1;
    }
    return a[key] > b[key] ? 1 : -1;
  });
};

// Capitalize string
const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Camel case
const camelCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
};

// Snake case
const snakeCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map(word => word.toLowerCase())
    .join('_');
};

// Kebab case
const kebabCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

// Pascal case
const pascalCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => 
    word.toUpperCase()
  ).replace(/\s+/g, '');
};

// Truncate string
const truncate = (str, length = 100, suffix = '...') => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
};

// Strip HTML tags
const stripHtml = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '');
};

// Escape HTML
const escapeHtml = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Unescape HTML
const unescapeHtml = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
};

// Format bytes
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Format number
const formatNumber = (num, locale = 'en-US') => {
  if (typeof num !== 'number') return '';
  return new Intl.NumberFormat(locale).format(num);
};

// Format currency
const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (typeof amount !== 'number') return '';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format percentage
const formatPercentage = (value, decimals = 2) => {
  if (typeof value !== 'number') return '';
  return `${(value * 100).toFixed(decimals)}%`;
};

// Get file extension
const getFileExtension = (filename) => {
  if (!filename || typeof filename !== 'string') return '';
  return filename.split('.').pop().toLowerCase();
};

// Get file name without extension
const getFileName = (filename) => {
  if (!filename || typeof filename !== 'string') return '';
  return filename.split('.').slice(0, -1).join('.');
};

// Check if string is email
const isEmail = (str) => {
  if (!str || typeof str !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
};

// Check if string is URL
const isUrl = (str) => {
  if (!str || typeof str !== 'string') return false;
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

// Check if string is phone
const isPhone = (str) => {
  if (!str || typeof str !== 'string') return false;
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(str.replace(/\D/g, ''));
};

// Check if string is valid JSON
const isValidJSON = (str) => {
  if (!str || typeof str !== 'string') return false;
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

// Parse JSON safely
const parseJSON = (str, defaultValue = null) => {
  if (!str || typeof str !== 'string') return defaultValue;
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
};

// Stringify JSON safely
const stringifyJSON = (obj, defaultValue = '{}') => {
  try {
    return JSON.stringify(obj);
  } catch {
    return defaultValue;
  }
};

// Get current timestamp
const getCurrentTimestamp = () => {
  return Math.floor(Date.now() / 1000);
};

// Get current date
const getCurrentDate = () => {
  return new Date();
};

// Get current date string
const getCurrentDateString = (format = 'YYYY-MM-DD') => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`;
  }
  
  return date.toISOString();
};

// Get random item from array
const getRandomItem = (array) => {
  if (!Array.isArray(array) || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
};

// Shuffle array
const shuffle = (array) => {
  if (!Array.isArray(array)) return [];
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get environment variable
const getEnv = (key, defaultValue = null) => {
  return process.env[key] || defaultValue;
};

// Check if development
const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

// Check if production
const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

// Check if test
const isTest = () => {
  return process.env.NODE_ENV === 'test';
};

module.exports = {
  generateRandomString, generateUUID, generateRandomNumber, generateRandomPassword,
  generateAPIKey, generateToken, hashString, compareHash, deepClone, mergeObjects,
  pick, omit, isEmpty, sleep, retry, debounce, throttle, chunk, unique, groupBy,
  sortBy, capitalize, camelCase, snakeCase, kebabCase, pascalCase, truncate,
  stripHtml, escapeHtml, unescapeHtml, formatBytes, formatNumber, formatCurrency,
  formatPercentage, getFileExtension, getFileName, isEmail, isUrl, isPhone,
  isValidJSON, parseJSON, stringifyJSON, getCurrentTimestamp, getCurrentDate,
  getCurrentDateString, getRandomItem, shuffle, getEnv, isDevelopment,
  isProduction, isTest
};