const validator = require('validator');

// Email validation
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return validator.isEmail(email) && email.length <= 254;
};

// Password validation
const isValidPassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Username validation
const isValidUsername = (username) => {
  if (!username || typeof username !== 'string') return false;
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

// Name validation
const isValidName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  return nameRegex.test(name.trim());
};

// Phone validation
const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string' || phone.trim() === '') return true; // Allow empty values
  return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// URL validation
const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true });
};

// ObjectId validation
const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return validator.isMongoId(id);
};

// Date validation
const isValidDate = (date) => {
  if (!date) return false;
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

// Future date validation
const isFutureDate = (date) => {
  if (!isValidDate(date)) return false;
  return new Date(date) > new Date();
};

// Past date validation
const isPastDate = (date) => {
  if (!isValidDate(date)) return false;
  return new Date(date) < new Date();
};

// Number validation
const isValidNumber = (num) => {
  return typeof num === 'number' && !isNaN(num) && isFinite(num);
};

// Positive number validation
const isValidPositiveNumber = (num) => {
  return isValidNumber(num) && num > 0;
};

// Integer validation
const isValidInteger = (num) => {
  return Number.isInteger(num);
};

// Boolean validation
const isValidBoolean = (value) => {
  return typeof value === 'boolean';
};

// Array validation
const isValidArray = (arr) => {
  return Array.isArray(arr);
};

// Non-empty array validation
const isValidNonEmptyArray = (arr) => {
  return Array.isArray(arr) && arr.length > 0;
};

// String length validation
const isValidStringLength = (str, min = 1, max = 255) => {
  if (!str || typeof str !== 'string') return false;
  return str.length >= min && str.length <= max;
};

// Enum validation
const isValidEnum = (value, allowedValues) => {
  if (!Array.isArray(allowedValues)) return false;
  return allowedValues.includes(value);
};

// JSON validation
const isValidJSON = (str) => {
  if (!str || typeof str !== 'string') return false;
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
};

// UUID validation
const isValidUUID = (uuid) => {
  if (!uuid || typeof uuid !== 'string') return false;
  return validator.isUUID(uuid);
};

// Credit card validation
const isValidCreditCard = (cardNumber) => {
  if (!cardNumber || typeof cardNumber !== 'string') return false;
  return validator.isCreditCard(cardNumber);
};

// IP validation
const isValidIP = (ip) => {
  if (!ip || typeof ip !== 'string') return false;
  return validator.isIP(ip);
};

// IPv4 validation
const isValidIPv4 = (ip) => {
  if (!ip || typeof ip !== 'string') return false;
  return validator.isIP(ip, 4);
};

// IPv6 validation
const isValidIPv6 = (ip) => {
  if (!ip || typeof ip !== 'string') return false;
  return validator.isIP(ip, 6);
};

// Base64 validation
const isValidBase64 = (str) => {
  if (!str || typeof str !== 'string') return false;
  return validator.isBase64(str);
};

// Hexadecimal validation
const isValidHex = (str) => {
  if (!str || typeof str !== 'string') return false;
  return validator.isHexadecimal(str);
};

// Alphanumeric validation
const isAlphanumeric = (str) => {
  if (!str || typeof str !== 'string') return false;
  return validator.isAlphanumeric(str);
};

// Alpha validation
const isAlpha = (str) => {
  if (!str || typeof str !== 'string') return false;
  return validator.isAlpha(str);
};

// Numeric validation
const isNumeric = (str) => {
  if (!str || typeof str !== 'string') return false;
  return validator.isNumeric(str);
};

// Decimal validation
const isDecimal = (str) => {
  if (!str || typeof str !== 'string') return false;
  return validator.isDecimal(str);
};

// Currency validation
const isValidCurrency = (currency) => {
  if (!currency || typeof currency !== 'string') return false;
  const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'BRL'];
  return validCurrencies.includes(currency.toUpperCase());
};

// Timezone validation
const isValidTimezone = (timezone) => {
  if (!timezone || typeof timezone !== 'string') return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
};

// Language code validation
const isValidLanguageCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  return validator.isLocale(code);
};

// Color validation (hex)
const isValidHexColor = (color) => {
  if (!color || typeof color !== 'string') return false;
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// File extension validation
const isValidFileExtension = (filename, allowedExtensions) => {
  if (!filename || typeof filename !== 'string') return false;
  if (!Array.isArray(allowedExtensions)) return false;
  const extension = filename.split('.').pop().toLowerCase();
  return allowedExtensions.includes(extension);
};

// File size validation
const isValidFileSize = (size, maxSize) => {
  if (!isValidNumber(size) || !isValidNumber(maxSize)) return false;
  return size <= maxSize;
};

// Social media handle validation
const isValidSocialHandle = (handle, platform) => {
  if (!handle || typeof handle !== 'string') return false;
  const patterns = {
    twitter: /^@?[a-zA-Z0-9_]{1,15}$/,
    instagram: /^@?[a-zA-Z0-9._]{1,30}$/,
    facebook: /^[a-zA-Z0-9.]{1,50}$/,
    linkedin: /^[a-zA-Z0-9-]{1,100}$/,
    tiktok: /^@?[a-zA-Z0-9._]{1,24}$/,
    youtube: /^@?[a-zA-Z0-9_-]{1,100}$/
  };
  const pattern = patterns[platform];
  if (!pattern) return false;
  return pattern.test(handle);
};

// Hashtag validation
const isValidHashtag = (hashtag) => {
  if (!hashtag || typeof hashtag !== 'string') return false;
  const hashtagRegex = /^#[a-zA-Z0-9_]{1,100}$/;
  return hashtagRegex.test(hashtag);
};

// URL slug validation
const isValidSlug = (slug) => {
  if (!slug || typeof slug !== 'string') return false;
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) && slug.length >= 1 && slug.length <= 100;
};

// JWT token validation
const isValidJWT = (token) => {
  if (!token || typeof token !== 'string') return false;
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
  return jwtRegex.test(token);
};

// API key validation
const isValidAPIKey = (key) => {
  if (!key || typeof key !== 'string') return false;
  const apiKeyRegex = /^[a-zA-Z0-9_-]{20,100}$/;
  return apiKeyRegex.test(key);
};

// Coordinate validation
const isValidCoordinate = (lat, lng) => {
  if (!isValidNumber(lat) || !isValidNumber(lng)) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

// MAC address validation
const isValidMACAddress = (mac) => {
  if (!mac || typeof mac !== 'string') return false;
  return validator.isMACAddress(mac);
};

// ISBN validation
const isValidISBN = (isbn) => {
  if (!isbn || typeof isbn !== 'string') return false;
  return validator.isISBN(isbn);
};

// ISSN validation
const isValidISSN = (issn) => {
  if (!issn || typeof issn !== 'string') return false;
  return validator.isISSN(issn);
};

// Postal code validation
const isValidPostalCode = (postalCode, country = 'US') => {
  if (!postalCode || typeof postalCode !== 'string') return false;
  const patterns = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/,
    UK: /^[A-Za-z]{1,2}\d[A-Za-z\d]? \d[A-Za-z]{2}$/,
    DE: /^\d{5}$/,
    FR: /^\d{5}$/,
    AU: /^\d{4}$/
  };
  const pattern = patterns[country];
  if (!pattern) return false;
  return pattern.test(postalCode);
};

// Validation result class
class ValidationResult {
  constructor() {
    this.isValid = true;
    this.errors = [];
  }
  
  addError(field, message) {
    this.isValid = false;
    this.errors.push({ field, message });
  }
  
  getErrors() {
    return this.errors;
  }
  
  getFirstError() {
    return this.errors[0] || null;
  }
  
  hasErrors() {
    return this.errors.length > 0;
  }
}

// Comprehensive validation function
const validate = (data, rules) => {
  const result = new ValidationResult();
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    
    for (const rule of fieldRules) {
      if (rule.required && (value === undefined || value === null || value === '')) {
        result.addError(field, `${field} is required`);
        break;
      }
      
      if (value !== undefined && value !== null && value !== '') {
        if (rule.type && !rule.validator(value)) {
          result.addError(field, rule.message || `${field} is invalid`);
        }
      }
    }
  }
  
  return result;
};

// Common validation rules
const rules = {
  email: [{ required: true, validator: isValidEmail, message: 'Invalid email format' }],
  password: [{ required: true, validator: isValidPassword, message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' }],
  username: [{ required: true, validator: isValidUsername, message: 'Username must be 3-30 characters, alphanumeric and underscores only' }],
  name: [{ required: true, validator: isValidName, message: 'Name must be 2-50 characters, letters and spaces only' }],
  phone: [{ required: false, validator: isValidPhone, message: 'Invalid phone number format' }],
  url: [{ required: false, validator: isValidUrl, message: 'Invalid URL format' }],
  objectId: [{ required: true, validator: isValidObjectId, message: 'Invalid ID format' }],
  date: [{ required: true, validator: isValidDate, message: 'Invalid date format' }],
  futureDate: [{ required: true, validator: isFutureDate, message: 'Date must be in the future' }],
  pastDate: [{ required: true, validator: isPastDate, message: 'Date must be in the past' }],
  positiveNumber: [{ required: true, validator: isValidPositiveNumber, message: 'Must be a positive number' }],
  integer: [{ required: true, validator: isValidInteger, message: 'Must be an integer' }],
  boolean: [{ required: true, validator: isValidBoolean, message: 'Must be a boolean value' }],
  array: [{ required: true, validator: isValidArray, message: 'Must be an array' }],
  nonEmptyArray: [{ required: true, validator: isValidNonEmptyArray, message: 'Must be a non-empty array' }],
  stringLength: (min, max) => [{ required: true, validator: (str) => isValidStringLength(str, min, max), message: `Must be between ${min} and ${max} characters` }],
  enum: (values) => [{ required: true, validator: (value) => isValidEnum(value, values), message: `Must be one of: ${values.join(', ')}` }]
};

module.exports = {
  isValidEmail, isValidPassword, isValidUsername, isValidName, isValidPhone, isValidUrl,
  isValidObjectId, isValidDate, isFutureDate, isPastDate, isValidNumber, isValidPositiveNumber,
  isValidInteger, isValidBoolean, isValidArray, isValidNonEmptyArray, isValidStringLength,
  isValidEnum, isValidJSON, isValidUUID, isValidCreditCard, isValidIP, isValidIPv4,
  isValidIPv6, isValidBase64, isValidHex, isAlphanumeric, isAlpha, isNumeric, isDecimal,
  isValidCurrency, isValidTimezone, isValidLanguageCode, isValidHexColor, isValidFileExtension,
  isValidFileSize, isValidSocialHandle, isValidHashtag, isValidSlug, isValidJWT, isValidAPIKey,
  isValidCoordinate, isValidMACAddress, isValidISBN, isValidISSN, isValidPostalCode,
  ValidationResult, validate, rules
};