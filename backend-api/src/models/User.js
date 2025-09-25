const mongoose = require('mongoose');
const encryptionManager = require('../utils/encryption');

const userSchema = new mongoose.Schema({
  // Basic Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  profilePicture: {
    type: String,
    default: null
  },
  
  // Additional Profile Information
  jobTitle: {
    type: String,
    trim: true,
    maxlength: 100,
    default: null
  },
  phoneNumber: {
    type: String,
    trim: true,
    default: null
  },
  website: {
    type: String,
    trim: true,
    maxlength: 200,
    default: null
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
    default: null
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100,
    default: null
  },
  
  // Organization Association (Multi-tenant)
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  
  // Role and Permissions
  role: {
    type: String,
    enum: ['owner', 'admin', 'manager', 'editor', 'viewer'],
    default: 'owner'
  },
  permissions: {
    canCreateContent: { type: Boolean, default: true },
    canEditContent: { type: Boolean, default: true },
    canDeleteContent: { type: Boolean, default: false },
    canPublishContent: { type: Boolean, default: true },
    canManageTeam: { type: Boolean, default: false },
    canManageBilling: { type: Boolean, default: false },
    canManageSettings: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: true },
    canManageAIAgents: { type: Boolean, default: false }
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  
  // Authentication
  authentication: {
    lastLogin: {
      type: Date,
      default: null
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date,
      default: null
    },
    passwordResetToken: {
      type: String,
      default: null
    },
    passwordResetExpires: {
      type: Date,
      default: null
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: {
      type: String,
      default: null
    },
    refreshTokens: [{
      token: String,
      createdAt: { type: Date, default: Date.now },
      expiresAt: Date,
      deviceInfo: String
    }]
  },
  
  // Security (Password Reset)
  security: {
    passwordReset: {
      token: {
        type: String,
        default: null
      },
      expiresAt: {
        type: Date,
        default: null
      },
      requestedAt: {
        type: Date,
        default: null
      }
    },
    passwordChangedAt: {
      type: Date,
      default: null
    }
  },
  
  // User Preferences
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
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
      default: 'MM/DD/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
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
      },
      sms: {
        type: Boolean,
        default: false
      },
      marketing: {
        type: Boolean,
        default: false
      },
      weeklyReports: {
        type: Boolean,
        default: false
      },
      performanceAlerts: {
        type: Boolean,
        default: false
      }
    },
    dashboard: {
      defaultView: {
        type: String,
        enum: ['overview', 'content', 'analytics', 'calendar'],
        default: 'overview'
      },
      widgetPreferences: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: new Map()
      }
    }
  },
  
  // Social Media Connections
  socialConnections: [{
    platform: {
      type: String,
      enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest'],
      required: true
    },
    accountId: {
      type: String,
      required: true
    },
    accountName: {
      type: String,
      required: true
    },
    accessToken: {
      type: String,
      required: true
    },
    refreshToken: {
      type: String,
      default: null
    },
    tokenExpires: {
      type: Date,
      default: null
    },
    permissions: [String],
    isActive: {
      type: Boolean,
      default: true
    },
    connectedAt: {
      type: Date,
      default: Date.now
    },
    lastSync: {
      type: Date,
      default: null
    }
  }],
  
  // Activity Tracking
  activity: {
    lastActiveAt: {
      type: Date,
      default: Date.now
    },
    totalLogins: {
      type: Number,
      default: 0
    },
    contentCreated: {
      type: Number,
      default: 0
    },
    contentPublished: {
      type: Number,
      default: 0
    }
  },
  
  // GDPR Compliance
  gdprConsent: {
    hasConsented: {
      type: Boolean,
      default: false
    },
    consentDate: {
      type: Date,
      default: null
    },
    consentVersion: {
      type: String,
      default: null
    },
    dataProcessingPurposes: [String],
    marketingConsent: {
      type: Boolean,
      default: false
    }
  },
  
  // Audit Trail
  auditLog: [{
    action: String,
    timestamp: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
    details: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      if (ret.authentication) {
        delete ret.authentication.passwordResetToken;
        delete ret.authentication.twoFactorSecret;
        delete ret.authentication.refreshTokens;
      }
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ organizationId: 1, email: 1 });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'authentication.lastLogin': -1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1, organizationId: 1 });
userSchema.index({ role: 1, organizationId: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.authentication.lockUntil && this.authentication.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  try {
    // Only hash password if it's modified
    if (!this.isModified('password')) {
      return next();
    }
    
    // Hash the password
    this.password = await encryptionManager.hashPassword(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to encrypt social tokens
userSchema.pre('save', async function(next) {
  try {
    if (this.isModified('socialConnections')) {
      for (let connection of this.socialConnections) {
        if (connection.isModified('accessToken') || connection.isNew) {
          connection.accessToken = encryptionManager.encryptSocialToken(
            connection.accessToken, 
            connection.platform
          );
        }
        if (connection.refreshToken && (connection.isModified('refreshToken') || connection.isNew)) {
          connection.refreshToken = encryptionManager.encryptSocialToken(
            connection.refreshToken, 
            connection.platform
          );
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to verify password
userSchema.methods.verifyPassword = async function(password) {
  try {
    return await encryptionManager.verifyPassword(password, this.password);
  } catch (error) {
    return false;
  }
};

// Instance method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.authentication.lockUntil && this.authentication.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'authentication.lockUntil': 1 },
      $set: { 'authentication.loginAttempts': 1 }
    });
  }
  
  const updates = { $inc: { 'authentication.loginAttempts': 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.authentication.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { 'authentication.lockUntil': Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $unset: { 
      'authentication.loginAttempts': 1,
      'authentication.lockUntil': 1 
    }
  });
};

// Instance method to update last login
userSchema.methods.updateLastLogin = async function(ipAddress, userAgent) {
  const updates = {
    'authentication.lastLogin': new Date(),
    'activity.lastActiveAt': new Date(),
    $inc: { 'activity.totalLogins': 1 }
  };
  
  // Add to audit log
  this.auditLog.push({
    action: 'login',
    ipAddress,
    userAgent,
    details: { timestamp: new Date() }
  });
  
  return this.updateOne(updates);
};

// Instance method to get decrypted social tokens
userSchema.methods.getDecryptedSocialToken = function(platform) {
  const connection = this.socialConnections.find(conn => conn.platform === platform && conn.isActive);
  if (!connection) {
    return null;
  }
  
  try {
    const decryptedToken = encryptionManager.decryptSocialToken(connection.accessToken);
    return decryptedToken ? decryptedToken.token : null;
  } catch (error) {
    return null;
  }
};

// Instance method to add refresh token
userSchema.methods.addRefreshToken = async function(token, deviceInfo, expiresIn = '7d') {
  const expiresAt = new Date();
  if (expiresIn === '7d') {
    expiresAt.setDate(expiresAt.getDate() + 7);
  } else if (expiresIn === '30d') {
    expiresAt.setDate(expiresAt.getDate() + 30);
  }
  
  // Remove old refresh tokens (keep only last 5)
  if (this.authentication.refreshTokens.length >= 5) {
    this.authentication.refreshTokens = this.authentication.refreshTokens
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 4);
  }
  
  this.authentication.refreshTokens.push({
    token,
    expiresAt,
    deviceInfo
  });
  
  return this.save();
};

// Instance method to remove refresh token
userSchema.methods.removeRefreshToken = async function(token) {
  this.authentication.refreshTokens = this.authentication.refreshTokens.filter(
    rt => rt.token !== token
  );
  return this.save();
};

// Instance method to check permissions
userSchema.methods.hasPermission = function(permission) {
  // Handle both old dotted format and new flat format
  if (this.permissions[permission] === true) {
    return true;
  }
  
  // Map dotted permissions to flat permissions
  const permissionMap = {
    'content.create': 'canCreateContent',
    'content.read': 'canEditContent', // Assuming read is covered by edit
    'content.update': 'canEditContent',
    'content.delete': 'canDeleteContent',
    'content.schedule': 'canPublishContent',
    'content.approve': 'canPublishContent',
    'content.ai_generate': 'canManageAIAgents',
    'analytics.read': 'canViewAnalytics',
    'analytics.export': 'canViewAnalytics',
    'team.invite': 'canManageTeam',
    'team.manage': 'canManageTeam',
    'settings.read': 'canManageSettings',
    'settings.update': 'canManageSettings',
    'billing.read': 'canManageBilling',
    'billing.update': 'canManageBilling',
    'ai_agents.read': 'canManageAIAgents',
    'ai_agents.manage': 'canManageAIAgents'
  };
  
  const flatPermission = permissionMap[permission];
  if (flatPermission) {
    return this.permissions[flatPermission] === true;
  }
  
  return false;
};

// Instance method to log activity
userSchema.methods.logActivity = async function(action, details = {}, ipAddress = null, userAgent = null) {
  this.auditLog.push({
    action,
    ipAddress,
    userAgent,
    details
  });
  
  // Keep only last 100 audit log entries
  if (this.auditLog.length > 100) {
    this.auditLog = this.auditLog.slice(-100);
  }
  
  return this.save();
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users in organization
userSchema.statics.findActiveInOrganization = function(organizationId) {
  return this.find({ 
    organizationId, 
    isActive: true 
  }).populate('organizationId');
};

// Static method to find by role
userSchema.statics.findByRole = function(role, organizationId = null) {
  const query = { role };
  if (organizationId) {
    query.organizationId = organizationId;
  }
  return this.find(query);
};

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

module.exports = mongoose.model('User', userSchema);

