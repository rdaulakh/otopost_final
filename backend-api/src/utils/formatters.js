const moment = require('moment-timezone');

// Date formatting
const formatDate = (date, format = 'YYYY-MM-DD', timezone = 'UTC') => {
  if (!date) return null;
  return moment(date).tz(timezone).format(format);
};

// Currency formatting
const formatCurrency = (amount, currency = 'USD') => {
  if (typeof amount !== 'number') return null;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// File size formatting
const formatFileSize = (bytes) => {
  if (typeof bytes !== 'number') return null;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// Phone formatting
const formatPhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') return null;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

// Email formatting
const formatEmail = (email) => {
  if (!email || typeof email !== 'string') return null;
  return email.toLowerCase().trim();
};

// Name formatting
const formatName = (name) => {
  if (!name || typeof name !== 'string') return null;
  return name.trim().replace(/\s+/g, ' ').split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

// URL formatting
const formatUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

// Slug formatting
const formatSlug = (text) => {
  if (!text || typeof text !== 'string') return null;
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

module.exports = {
  formatDate, formatCurrency, formatFileSize, formatPhoneNumber,
  formatEmail, formatName, formatUrl, formatSlug
};