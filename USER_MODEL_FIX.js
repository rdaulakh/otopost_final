// ========================================
// USER MODEL FIX FOR PRODUCTION
// ========================================
// 
// This file contains the User model fields you need
// to ensure profile saving works correctly.
//
// LOCATION: Update this in your production server at:
// https://digiads.digiaeon.com/api/models/User.js
// ========================================

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic fields
  name: {
    type: String,
    required: true,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // ========================================
  // PROFILE FIELDS (INDIVIDUAL FIELDS)
  // ========================================
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  jobTitle: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  
  // Profile picture
  profilePicture: {
    type: String,
    default: null
  },
  
  // ========================================
  // PREFERENCES (ONLY FOR SETTINGS)
  // ========================================
  preferences: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      default: 'en'
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY'
    },
    timeFormat: {
      type: String,
      default: '12h'
    },
    notifications: {
      email: {
        contentApproval: { type: Boolean, default: true },
        publishingUpdates: { type: Boolean, default: true },
        analyticsReports: { type: Boolean, default: true },
        teamActivity: { type: Boolean, default: true },
        systemUpdates: { type: Boolean, default: true }
      },
      push: {
        contentApproval: { type: Boolean, default: true },
        publishingUpdates: { type: Boolean, default: true },
        analyticsReports: { type: Boolean, default: false },
        teamActivity: { type: Boolean, default: false },
        systemUpdates: { type: Boolean, default: true }
      }
    },
    dashboard: {
      defaultView: { type: String, default: 'overview' },
      widgetPreferences: { type: Object, default: {} }
    }
  },
  
  // Other existing fields...
  role: {
    type: String,
    enum: ['admin', 'owner', 'manager', 'member'],
    default: 'member'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ company: 1 });
userSchema.index({ role: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.name;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);

// ========================================
// DEPLOYMENT INSTRUCTIONS
// ========================================
//
// 1. Make sure your User model has all these fields
// 2. The key fields for profile saving are:
//    - firstName, lastName, phone, company, jobTitle, location, bio, website
// 3. These should be individual fields, NOT nested in preferences
// 4. Only timezone should be in preferences.timezone
//
// ========================================


