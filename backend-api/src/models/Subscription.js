const mongoose = require('mongoose');
const encryptionManager = require('../utils/encryption');

const subscriptionSchema = new mongoose.Schema({
  // Organization Association
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    unique: true,
    index: true
  },
  
  // Subscription Details
  planId: {
    type: String,
    enum: ['free', 'starter', 'professional', 'enterprise', 'custom'],
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  planDescription: {
    type: String,
    maxlength: 500
  },
  
  // Status and Lifecycle
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'cancelled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired'],
    required: true,
    default: 'trialing'
  },
  
  // Billing Information
  billing: {
    cycle: {
      type: String,
      enum: ['monthly', 'yearly', 'quarterly'],
      required: true,
      default: 'monthly'
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      minlength: 3,
      maxlength: 3
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    setupFee: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      rate: { type: Number, default: 0, min: 0, max: 100 },
      amount: { type: Number, default: 0, min: 0 }
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    
    // Billing Periods
    currentPeriodStart: {
      type: Date,
      required: true
    },
    currentPeriodEnd: {
      type: Date,
      required: true
    },
    nextBillingDate: {
      type: Date,
      required: true
    },
    lastBillingDate: {
      type: Date,
      default: null
    },
    
    // Payment Method
    paymentMethod: {
      type: {
        type: String,
        enum: ['card', 'bank_account', 'paypal', 'invoice'],
        default: 'card'
      },
      last4: String,
      brand: String,
      expiryMonth: Number,
      expiryYear: Number,
      fingerprint: String,
      isDefault: { type: Boolean, default: true }
    }
  },
  
  // Trial Information
  trial: {
    isTrialing: {
      type: Boolean,
      default: false
    },
    trialStart: {
      type: Date,
      default: null
    },
    trialEnd: {
      type: Date,
      default: null
    },
    trialDays: {
      type: Number,
      default: 14
    },
    hasUsedTrial: {
      type: Boolean,
      default: false
    }
  },
  
  // Plan Features and Limits
  features: {
    users: {
      included: { type: Number, required: true },
      used: { type: Number, default: 0 },
      additional: { type: Number, default: 0 },
      additionalCost: { type: Number, default: 0 }
    },
    socialAccounts: {
      included: { type: Number, required: true },
      used: { type: Number, default: 0 },
      additional: { type: Number, default: 0 },
      additionalCost: { type: Number, default: 0 }
    },
    monthlyPosts: {
      included: { type: Number, required: true },
      used: { type: Number, default: 0 },
      resetDate: { type: Date, default: Date.now }
    },
    aiGenerations: {
      included: { type: Number, required: true },
      used: { type: Number, default: 0 },
      resetDate: { type: Date, default: Date.now }
    },
    storageGB: {
      included: { type: Number, required: true },
      used: { type: Number, default: 0 },
      additional: { type: Number, default: 0 },
      additionalCost: { type: Number, default: 0 }
    },
    analyticsRetentionDays: {
      type: Number,
      required: true
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
  
  // Payment Provider Integration
  paymentProvider: {
    provider: {
      type: String,
      enum: ['stripe', 'paypal', 'manual'],
      default: 'stripe'
    },
    customerId: {
      type: String,
      required: true
    },
    subscriptionId: {
      type: String,
      default: null
    },
    paymentMethodId: {
      type: String,
      default: null
    },
    invoiceSettings: {
      defaultPaymentMethod: String,
      customFields: [{
        name: String,
        value: String
      }]
    }
  },
  
  // Usage Tracking
  usage: {
    currentPeriod: {
      posts: { type: Number, default: 0 },
      aiGenerations: { type: Number, default: 0 },
      apiCalls: { type: Number, default: 0 },
      storageUsed: { type: Number, default: 0 }
    },
    historical: [{
      period: {
        start: Date,
        end: Date
      },
      usage: {
        posts: Number,
        aiGenerations: Number,
        apiCalls: Number,
        storageUsed: Number
      },
      overage: {
        posts: { type: Number, default: 0 },
        storage: { type: Number, default: 0 },
        cost: { type: Number, default: 0 }
      }
    }],
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  
  // Invoices and Payments
  invoices: [{
    invoiceId: {
      type: String,
      required: true
    },
    number: String,
    status: {
      type: String,
      enum: ['draft', 'open', 'paid', 'void', 'uncollectible'],
      default: 'open'
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    tax: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    },
    dueDate: Date,
    paidAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    },
    description: String,
    lineItems: [{
      description: String,
      quantity: Number,
      unitPrice: Number,
      amount: Number
    }],
    paymentAttempts: [{
      attemptedAt: Date,
      status: String,
      failureReason: String
    }]
  }],
  
  // Discounts and Coupons
  discounts: [{
    couponId: String,
    couponCode: String,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed_amount'],
      required: true
    },
    discountValue: {
      type: Number,
      required: true
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    validUntil: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    maxRedemptions: Number,
    timesRedeemed: {
      type: Number,
      default: 0
    }
  }],
  
  // Subscription Changes and History
  changes: [{
    changeType: {
      type: String,
      enum: ['upgrade', 'downgrade', 'plan_change', 'addon', 'removal', 'pause', 'resume', 'cancel'],
      required: true
    },
    fromPlan: String,
    toPlan: String,
    effectiveDate: {
      type: Date,
      required: true
    },
    prorationAmount: Number,
    reason: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Cancellation Information
  cancellation: {
    isCancelled: {
      type: Boolean,
      default: false
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    cancellationReason: {
      type: String,
      enum: ['cost', 'features', 'service', 'competition', 'business_closure', 'other'],
      default: null
    },
    cancellationFeedback: {
      type: String,
      maxlength: 1000,
      default: null
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    },
    finalBillingDate: {
      type: Date,
      default: null
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    refundReason: String
  },
  
  // Add-ons and Extras
  addons: [{
    addonId: String,
    name: String,
    description: String,
    type: {
      type: String,
      enum: ['user', 'storage', 'posts', 'ai_generations', 'feature'],
      required: true
    },
    quantity: {
      type: Number,
      default: 1
    },
    unitPrice: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly', 'one_time'],
      default: 'monthly'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Notifications and Alerts
  notifications: {
    paymentFailed: {
      enabled: { type: Boolean, default: true },
      lastSent: Date,
      count: { type: Number, default: 0 }
    },
    trialEnding: {
      enabled: { type: Boolean, default: true },
      lastSent: Date,
      daysBefore: { type: Number, default: 3 }
    },
    usageLimits: {
      enabled: { type: Boolean, default: true },
      thresholds: {
        posts: { type: Number, default: 80 }, // percentage
        aiGenerations: { type: Number, default: 80 },
        storage: { type: Number, default: 90 }
      }
    },
    renewalReminder: {
      enabled: { type: Boolean, default: true },
      daysBefore: { type: Number, default: 7 },
      lastSent: Date
    }
  },
  
  // Compliance and Legal
  compliance: {
    termsAccepted: {
      version: String,
      acceptedAt: Date,
      acceptedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    privacyPolicyAccepted: {
      version: String,
      acceptedAt: Date,
      acceptedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    gdprConsent: {
      hasConsented: { type: Boolean, default: false },
      consentDate: Date,
      consentVersion: String
    },
    taxInformation: {
      taxId: String,
      taxExempt: { type: Boolean, default: false },
      taxExemptReason: String,
      billingAddress: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
      }
    }
  },
  
  // Metadata and Custom Fields
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  
  // Internal Notes
  internalNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['billing', 'support', 'sales', 'technical', 'general'],
      default: 'general'
    }
  }]
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Don't expose sensitive payment information
      if (ret.paymentProvider && ret.paymentProvider.customerId) {
        ret.paymentProvider.customerId = '***';
      }
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for performance
subscriptionSchema.index({ organizationId: 1 }, { unique: true });
subscriptionSchema.index({ status: 1, 'billing.nextBillingDate': 1 });
subscriptionSchema.index({ planId: 1 });
subscriptionSchema.index({ 'trial.trialEnd': 1 });
subscriptionSchema.index({ 'paymentProvider.customerId': 1 });
subscriptionSchema.index({ 'billing.currentPeriodEnd': 1 });

// Virtual for days remaining in trial
subscriptionSchema.virtual('trialDaysRemaining').get(function() {
  if (!this.trial.isTrialing || !this.trial.trialEnd) return 0;
  const now = new Date();
  const trialEnd = new Date(this.trial.trialEnd);
  const diffTime = trialEnd - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Virtual for days until next billing
subscriptionSchema.virtual('daysUntilNextBilling').get(function() {
  if (!this.billing.nextBillingDate) return 0;
  const now = new Date();
  const nextBilling = new Date(this.billing.nextBillingDate);
  const diffTime = nextBilling - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Virtual for usage percentage
subscriptionSchema.virtual('usagePercentage').get(function() {
  return {
    posts: this.features.monthlyPosts.included > 0 ? (this.features.monthlyPosts.used / this.features.monthlyPosts.included) * 100 : 0,
    aiGenerations: this.features.aiGenerations.included > 0 ? (this.features.aiGenerations.used / this.features.aiGenerations.included) * 100 : 0,
    storage: this.features.storageGB.included > 0 ? (this.features.storageGB.used / this.features.storageGB.included) * 100 : 0,
    users: this.features.users.included > 0 ? (this.features.users.used / this.features.users.included) * 100 : 0,
    socialAccounts: this.features.socialAccounts.included > 0 ? (this.features.socialAccounts.used / this.features.socialAccounts.included) * 100 : 0
  };
});

// Virtual for total monthly cost including addons
subscriptionSchema.virtual('totalMonthlyCost').get(function() {
  let total = this.billing.totalAmount;
  
  // Add monthly addons
  const monthlyAddons = this.addons.filter(addon => addon.isActive && addon.billingCycle === 'monthly');
  total += monthlyAddons.reduce((sum, addon) => sum + addon.totalPrice, 0);
  
  // Add yearly addons (prorated monthly)
  const yearlyAddons = this.addons.filter(addon => addon.isActive && addon.billingCycle === 'yearly');
  total += yearlyAddons.reduce((sum, addon) => sum + (addon.totalPrice / 12), 0);
  
  return total;
});

// Pre-save middleware to encrypt sensitive data
subscriptionSchema.pre('save', async function(next) {
  try {
    // Encrypt payment provider customer ID
    if (this.isModified('paymentProvider.customerId') && this.paymentProvider.customerId) {
      this.paymentProvider.customerId = encryptionManager.encryptPaymentInfo({
        customerId: this.paymentProvider.customerId,
        provider: this.paymentProvider.provider
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check if feature is available
subscriptionSchema.methods.hasFeature = function(feature) {
  return this.features[feature] === true;
};

// Instance method to check usage limits
subscriptionSchema.methods.canUseFeature = function(feature, amount = 1) {
  const featureConfig = this.features[feature];
  if (!featureConfig) return false;
  
  if (feature === 'monthlyPosts' || feature === 'aiGenerations') {
    return (featureConfig.used + amount) <= featureConfig.included;
  }
  
  if (feature === 'users' || feature === 'socialAccounts' || feature === 'storageGB') {
    return (featureConfig.used + amount) <= (featureConfig.included + featureConfig.additional);
  }
  
  return true;
};

// Instance method to increment usage
subscriptionSchema.methods.incrementUsage = async function(feature, amount = 1) {
  if (!this.features[feature]) return false;
  
  this.features[feature].used += amount;
  
  // Check if usage exceeds limits and calculate overage
  if (feature === 'storageGB' && this.features[feature].used > (this.features[feature].included + this.features[feature].additional)) {
    const overage = this.features[feature].used - (this.features[feature].included + this.features[feature].additional);
    this.features[feature].additional += overage;
    this.features[feature].additionalCost += overage * 5; // $5 per GB overage
  }
  
  return this.save();
};

// Instance method to reset monthly usage
subscriptionSchema.methods.resetMonthlyUsage = async function() {
  this.features.monthlyPosts.used = 0;
  this.features.monthlyPosts.resetDate = new Date();
  this.features.aiGenerations.used = 0;
  this.features.aiGenerations.resetDate = new Date();
  this.usage.lastResetDate = new Date();
  
  return this.save();
};

// Instance method to add invoice
subscriptionSchema.methods.addInvoice = function(invoiceData) {
  this.invoices.push(invoiceData);
  
  // Keep only last 100 invoices
  if (this.invoices.length > 100) {
    this.invoices = this.invoices.slice(-100);
  }
  
  return this.save();
};

// Instance method to add subscription change
subscriptionSchema.methods.addChange = function(changeType, fromPlan, toPlan, effectiveDate, changedBy, metadata = {}) {
  this.changes.push({
    changeType,
    fromPlan,
    toPlan,
    effectiveDate,
    changedBy,
    metadata
  });
  
  return this.save();
};

// Instance method to cancel subscription
subscriptionSchema.methods.cancel = function(cancelledBy, reason, feedback = null, cancelAtPeriodEnd = true) {
  this.cancellation.isCancelled = true;
  this.cancellation.cancelledAt = new Date();
  this.cancellation.cancelledBy = cancelledBy;
  this.cancellation.cancellationReason = reason;
  this.cancellation.cancellationFeedback = feedback;
  this.cancellation.cancelAtPeriodEnd = cancelAtPeriodEnd;
  
  if (!cancelAtPeriodEnd) {
    this.status = 'cancelled';
    this.cancellation.finalBillingDate = new Date();
  } else {
    this.cancellation.finalBillingDate = this.billing.currentPeriodEnd;
  }
  
  return this.save();
};

// Instance method to add addon
subscriptionSchema.methods.addAddon = function(addonData) {
  this.addons.push(addonData);
  return this.save();
};

// Instance method to remove addon
subscriptionSchema.methods.removeAddon = function(addonId) {
  const addon = this.addons.find(a => a.addonId === addonId);
  if (addon) {
    addon.isActive = false;
  }
  return this.save();
};

// Instance method to get decrypted customer ID
subscriptionSchema.methods.getDecryptedCustomerId = function() {
  if (!this.paymentProvider.customerId) return null;
  
  try {
    const decrypted = encryptionManager.decryptPaymentInfo(this.paymentProvider.customerId);
    return decrypted ? decrypted.customerId : null;
  } catch (error) {
    return null;
  }
};

// Instance method to add internal note
subscriptionSchema.methods.addInternalNote = function(note, addedBy, category = 'general') {
  this.internalNotes.push({
    note,
    addedBy,
    category
  });
  
  // Keep only last 50 notes
  if (this.internalNotes.length > 50) {
    this.internalNotes = this.internalNotes.slice(-50);
  }
  
  return this.save();
};

// Static method to find subscriptions by status
subscriptionSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('organizationId');
};

// Static method to find expiring trials
subscriptionSchema.statics.findExpiringTrials = function(days = 3) {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);
  
  return this.find({
    'trial.isTrialing': true,
    'trial.trialEnd': { $lte: expirationDate, $gte: new Date() }
  }).populate('organizationId');
};

// Static method to find subscriptions due for billing
subscriptionSchema.statics.findDueForBilling = function(hours = 24) {
  const billingDate = new Date();
  billingDate.setHours(billingDate.getHours() + hours);
  
  return this.find({
    status: 'active',
    'billing.nextBillingDate': { $lte: billingDate }
  }).populate('organizationId');
};

// Static method to find overdue subscriptions
subscriptionSchema.statics.findOverdue = function() {
  return this.find({
    status: 'past_due',
    'billing.nextBillingDate': { $lt: new Date() }
  }).populate('organizationId');
};

module.exports = mongoose.model('Subscription', subscriptionSchema);

