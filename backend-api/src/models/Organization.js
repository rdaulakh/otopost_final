const mongoose = require('mongoose');
const encryptionManager = require('../utils/encryption');

const organizationSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  description: {
    type: String,
    maxlength: 500,
    default: null
  },
  logo: {
    type: String,
    default: null
  },
  website: {
    type: String,
    default: null,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  
  // Business Information
  businessInfo: {
    industry: {
      type: String,
      enum: [
        'technology', 'healthcare', 'finance', 'education', 'retail', 
        'manufacturing', 'real-estate', 'food-beverage', 'travel', 
        'entertainment', 'other'
      ],
      default: 'other'
    },
    businessType: {
      type: String,
      enum: ['b2b', 'b2c', 'b2b2c', 'nonprofit', 'government'],
      default: 'b2b'
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
      default: '1-10'
    },
    foundedYear: {
      type: Number,
      min: 1800,
      max: new Date().getFullYear()
    },
    headquarters: {
      country: String,
      state: String,
      city: String,
      address: String,
      zipCode: String
    }
  },
  
  // Contact Information
  contactInfo: {
    primaryEmail: {
      type: String,
      required: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phoneNumber: {
      type: String,
      default: null
    },
    supportEmail: {
      type: String,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    }
  },
  
  // Subscription and Billing
  subscription: {
    planId: {
      type: String,
      enum: ['free', 'starter', 'professional', 'enterprise', 'custom'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'cancelled', 'past_due', 'trialing'],
      default: 'trialing'
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly'
    },
    currentPeriodStart: {
      type: Date,
      default: Date.now
    },
    currentPeriodEnd: {
      type: Date,
      default: function() {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        return date;
      }
    },
    nextBillingDate: {
      type: Date,
      default: function() {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        return date;
      }
    },
    trialEndsAt: {
      type: Date,
      default: function() {
        const date = new Date();
        date.setDate(date.getDate() + 14); // 14-day trial
        return date;
      }
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    }
  },
  
  // Usage Limits and Tracking
  limits: {
    users: {
      type: Number,
      default: 1
    },
    socialAccounts: {
      type: Number,
      default: 3
    },
    monthlyPosts: {
      type: Number,
      default: 30
    },
    aiGenerations: {
      type: Number,
      default: 100
    },
    storageGB: {
      type: Number,
      default: 1
    },
    analyticsRetentionDays: {
      type: Number,
      default: 30
    }
  },
  
  usage: {
    currentUsers: {
      type: Number,
      default: 1
    },
    currentSocialAccounts: {
      type: Number,
      default: 0
    },
    currentMonthPosts: {
      type: Number,
      default: 0
    },
    currentMonthAIGenerations: {
      type: Number,
      default: 0
    },
    currentStorageGB: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  
  // Brand Settings
  brandSettings: {
    primaryColor: {
      type: String,
      default: '#3B82F6',
      match: [/^#[0-9A-F]{6}$/i, 'Please enter a valid hex color']
    },
    secondaryColor: {
      type: String,
      default: '#10B981',
      match: [/^#[0-9A-F]{6}$/i, 'Please enter a valid hex color']
    },
    accentColor: {
      type: String,
      default: '#F59E0B',
      match: [/^#[0-9A-F]{6}$/i, 'Please enter a valid hex color']
    },
    brandVoice: {
      type: String,
      enum: ['professional', 'casual', 'friendly', 'authoritative', 'playful', 'inspirational'],
      default: 'professional'
    },
    contentStyle: {
      type: String,
      enum: ['minimalist', 'bold', 'elegant', 'modern', 'classic', 'creative'],
      default: 'modern'
    },
    logoUrl: {
      type: String,
      default: null
    },
    brandGuidelines: {
      type: String,
      maxlength: 2000,
      default: null
    }
  },
  
  // Marketing Strategy
  marketingStrategy: {
    targetAudience: {
      type: String,
      maxlength: 1000,
      default: null
    },
    businessObjectives: [{
      type: String,
      enum: [
        'brand_awareness', 'lead_generation', 'sales_growth', 
        'customer_engagement', 'thought_leadership', 'community_building',
        'product_promotion', 'customer_support'
      ]
    }],
    postingFrequency: {
      type: String,
      enum: ['daily', '3-times-week', 'weekly', '2-times-week', 'bi-weekly'],
      default: 'daily'
    },
    geographicReach: {
      type: String,
      enum: ['local', 'national', 'international', 'global'],
      default: 'national'
    },
    contentCategories: [{
      type: String,
      enum: [
        'educational', 'promotional', 'behind-the-scenes', 'user-generated',
        'industry-news', 'company-updates', 'thought-leadership', 'entertainment'
      ]
    }]
  },
  
  // AI Agent Configuration
  aiAgentConfig: {
    isEnabled: {
      type: Boolean,
      default: true
    },
    agentPersonality: {
      type: String,
      enum: ['professional', 'creative', 'analytical', 'balanced'],
      default: 'balanced'
    },
    contentApprovalRequired: {
      type: Boolean,
      default: true
    },
    autoPublishEnabled: {
      type: Boolean,
      default: false
    },
    learningEnabled: {
      type: Boolean,
      default: true
    },
    customInstructions: {
      type: String,
      maxlength: 2000,
      default: null
    }
  },
  
  // Integration Settings
  integrations: {
    stripe: {
      customerId: {
        type: String,
        default: null
      },
      subscriptionId: {
        type: String,
        default: null
      }
    },
    analytics: {
      googleAnalyticsId: {
        type: String,
        default: null
      },
      facebookPixelId: {
        type: String,
        default: null
      }
    },
    webhooks: [{
      url: String,
      events: [String],
      secret: String,
      isActive: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  
  // Security Settings
  security: {
    twoFactorRequired: {
      type: Boolean,
      default: false
    },
    passwordPolicy: {
      minLength: { type: Number, default: 8 },
      requireUppercase: { type: Boolean, default: true },
      requireLowercase: { type: Boolean, default: true },
      requireNumbers: { type: Boolean, default: true },
      requireSymbols: { type: Boolean, default: false },
      passwordExpireDays: { type: Number, default: 0 } // 0 = never expire
    },
    sessionTimeout: {
      type: Number,
      default: 24 // hours
    },
    ipWhitelist: [String],
    allowedDomains: [String]
  },
  
  // Status and Flags
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  features: {
    aiAgents: { type: Boolean, default: true },
    analytics: { type: Boolean, default: true },
    teamCollaboration: { type: Boolean, default: false },
    whiteLabel: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false }
  },
  
  // GDPR and Compliance
  compliance: {
    gdprCompliant: {
      type: Boolean,
      default: true
    },
    dataRetentionDays: {
      type: Number,
      default: 365
    },
    dataProcessingBasis: {
      type: String,
      enum: ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests'],
      default: 'contract'
    },
    privacyPolicyUrl: {
      type: String,
      default: null
    },
    termsOfServiceUrl: {
      type: String,
      default: null
    }
  },
  
  // Audit and Activity
  activity: {
    lastActiveAt: {
      type: Date,
      default: Date.now
    },
    totalUsers: {
      type: Number,
      default: 1
    },
    totalPosts: {
      type: Number,
      default: 0
    },
    totalAIGenerations: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
organizationSchema.index({ slug: 1 }, { unique: true });
organizationSchema.index({ 'subscription.status': 1 });
organizationSchema.index({ 'subscription.nextBillingDate': 1 });
organizationSchema.index({ isActive: 1 });
organizationSchema.index({ createdAt: -1 });
organizationSchema.index({ 'contactInfo.primaryEmail': 1 });

// Virtual for trial status
organizationSchema.virtual('isInTrial').get(function() {
  return this.subscription.status === 'trialing' && 
         this.subscription.trialEndsAt > new Date();
});

// Virtual for subscription expired
organizationSchema.virtual('isSubscriptionExpired').get(function() {
  return this.subscription.currentPeriodEnd < new Date() && 
         this.subscription.status !== 'active';
});

// Virtual for usage percentage
organizationSchema.virtual('usagePercentage').get(function() {
  return {
    users: (this.usage.currentUsers / this.limits.users) * 100,
    socialAccounts: (this.usage.currentSocialAccounts / this.limits.socialAccounts) * 100,
    monthlyPosts: (this.usage.currentMonthPosts / this.limits.monthlyPosts) * 100,
    aiGenerations: (this.usage.currentMonthAIGenerations / this.limits.aiGenerations) * 100,
    storage: (this.usage.currentStorageGB / this.limits.storageGB) * 100
  };
});

// Pre-save middleware to generate slug
organizationSchema.pre('save', async function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    // Ensure uniqueness
    let counter = 1;
    let originalSlug = this.slug;
    while (await this.constructor.findOne({ slug: this.slug, _id: { $ne: this._id } })) {
      this.slug = `${originalSlug}-${counter}`;
      counter++;
    }
  }
  next();
});

// Pre-save middleware to encrypt sensitive data
organizationSchema.pre('save', async function(next) {
  try {
    // Encrypt Stripe customer ID if modified
    if (this.isModified('integrations.stripe.customerId') && this.integrations.stripe.customerId) {
      this.integrations.stripe.customerId = encryptionManager.encryptPaymentInfo({
        customerId: this.integrations.stripe.customerId
      });
    }
    
    // Encrypt webhook secrets
    if (this.isModified('integrations.webhooks')) {
      for (let webhook of this.integrations.webhooks) {
        if (webhook.isModified('secret') || webhook.isNew) {
          webhook.secret = encryptionManager.encrypt(webhook.secret);
        }
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check if feature is enabled
organizationSchema.methods.hasFeature = function(feature) {
  return this.features[feature] === true;
};

// Instance method to check usage limits
organizationSchema.methods.canAddUser = function() {
  return this.usage.currentUsers < this.limits.users;
};

organizationSchema.methods.canAddSocialAccount = function() {
  return this.usage.currentSocialAccounts < this.limits.socialAccounts;
};

organizationSchema.methods.canCreatePost = function() {
  return this.usage.currentMonthPosts < this.limits.monthlyPosts;
};

organizationSchema.methods.canUseAI = function() {
  return this.usage.currentMonthAIGenerations < this.limits.aiGenerations;
};

// Instance method to increment usage
organizationSchema.methods.incrementUsage = async function(type, amount = 1) {
  const updateField = `usage.current${type.charAt(0).toUpperCase() + type.slice(1)}`;
  return this.updateOne({ $inc: { [updateField]: amount } });
};

// Instance method to reset monthly usage
organizationSchema.methods.resetMonthlyUsage = async function() {
  const updates = {
    'usage.currentMonthPosts': 0,
    'usage.currentMonthAIGenerations': 0,
    'usage.lastResetDate': new Date()
  };
  return this.updateOne({ $set: updates });
};

// Instance method to update subscription
organizationSchema.methods.updateSubscription = async function(subscriptionData) {
  Object.assign(this.subscription, subscriptionData);
  return this.save();
};

// Instance method to get decrypted Stripe customer ID
organizationSchema.methods.getDecryptedStripeCustomerId = function() {
  if (!this.integrations.stripe.customerId) {
    return null;
  }
  
  try {
    const decrypted = encryptionManager.decryptPaymentInfo(this.integrations.stripe.customerId);
    return decrypted ? decrypted.customerId : null;
  } catch (error) {
    return null;
  }
};

// Instance method to add webhook
organizationSchema.methods.addWebhook = async function(url, events, secret) {
  this.integrations.webhooks.push({
    url,
    events,
    secret: encryptionManager.encrypt(secret)
  });
  return this.save();
};

// Instance method to get decrypted webhook secret
organizationSchema.methods.getWebhookSecret = function(webhookId) {
  const webhook = this.integrations.webhooks.id(webhookId);
  if (!webhook) {
    return null;
  }
  
  try {
    return encryptionManager.decrypt(webhook.secret);
  } catch (error) {
    return null;
  }
};

// Static method to find by slug
organizationSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase() });
};

// Static method to find active organizations
organizationSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find organizations with expiring trials
organizationSchema.statics.findExpiringTrials = function(days = 3) {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);
  
  return this.find({
    'subscription.status': 'trialing',
    'subscription.trialEndsAt': { $lte: expirationDate, $gte: new Date() }
  });
};

// Static method to find organizations with expired subscriptions
organizationSchema.statics.findExpiredSubscriptions = function() {
  return this.find({
    'subscription.currentPeriodEnd': { $lt: new Date() },
    'subscription.status': { $in: ['active', 'past_due'] }
  });
};

module.exports = mongoose.model('Organization', organizationSchema);

