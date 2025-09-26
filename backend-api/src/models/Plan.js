const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  // Plan Identification
  planId: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  
  // Pricing
  pricing: {
    monthly: {
      amount: { type: Number, required: true, min: 0 },
      currency: { type: String, default: 'USD', uppercase: true }
    },
    yearly: {
      amount: { type: Number, required: true, min: 0 },
      currency: { type: String, default: 'USD', uppercase: true },
      discount: { type: Number, default: 0, min: 0, max: 100 } // Percentage discount
    },
    quarterly: {
      amount: { type: Number, required: true, min: 0 },
      currency: { type: String, default: 'USD', uppercase: true },
      discount: { type: Number, default: 0, min: 0, max: 100 }
    }
  },
  
  // Features and Limits
  features: {
    users: {
      included: { type: Number, required: true, min: 0 },
      additionalCost: { type: Number, default: 0, min: 0 }
    },
    socialAccounts: {
      included: { type: Number, required: true, min: 0 },
      additionalCost: { type: Number, default: 0, min: 0 }
    },
    monthlyPosts: {
      included: { type: Number, required: true, min: 0 }
    },
    aiGenerations: {
      included: { type: Number, required: true, min: 0 }
    },
    storageGB: {
      included: { type: Number, required: true, min: 0 },
      additionalCost: { type: Number, default: 0, min: 0 }
    },
    analyticsRetentionDays: {
      type: Number,
      required: true,
      min: 1
    },
    
    // Feature Flags
    aiAgents: { type: Boolean, default: true },
    analytics: { type: Boolean, default: true },
    teamCollaboration: { type: Boolean, default: false },
    whiteLabel: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false },
    multipleWorkspaces: { type: Boolean, default: false },
    sso: { type: Boolean, default: false }
  },
  
  // Feature List for Display
  featureList: {
    type: [String],
    default: []
  },
  
  // Plan Status
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  
  // Trial Settings
  trial: {
    enabled: { type: Boolean, default: true },
    days: { type: Number, default: 14, min: 0, max: 90 }
  },
  
  // Metadata
  tags: [String],
  category: {
    type: String,
    enum: ['free', 'starter', 'professional', 'enterprise', 'custom'],
    default: 'custom'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for yearly savings
planSchema.virtual('yearlySavings').get(function() {
  const monthly = this.pricing.monthly.amount * 12;
  const yearly = this.pricing.yearly.amount;
  return Math.max(0, monthly - yearly);
});

// Virtual for yearly discount percentage
planSchema.virtual('yearlyDiscountPercentage').get(function() {
  const monthly = this.pricing.monthly.amount * 12;
  const yearly = this.pricing.yearly.amount;
  if (monthly === 0) return 0;
  return Math.round(((monthly - yearly) / monthly) * 100);
});

// Indexes
planSchema.index({ planId: 1 });
planSchema.index({ isActive: 1, sortOrder: 1 });
planSchema.index({ category: 1 });

module.exports = mongoose.model('Plan', planSchema);

