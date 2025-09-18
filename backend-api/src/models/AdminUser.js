const mongoose = require('mongoose');
const encryptionManager = require('../utils/encryption');

const adminUserSchema = new mongoose.Schema({
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
  
  // Role and Permissions
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'support_manager', 'financial_manager', 'technical_manager', 'content_manager'],
    required: true
  },
  permissions: {
    // User Management
    canViewUsers: { type: Boolean, default: false },
    canCreateUsers: { type: Boolean, default: false },
    canEditUsers: { type: Boolean, default: false },
    canDeleteUsers: { type: Boolean, default: false },
    canSuspendUsers: { type: Boolean, default: false },
    
    // Organization Management
    canViewOrganizations: { type: Boolean, default: false },
    canCreateOrganizations: { type: Boolean, default: false },
    canEditOrganizations: { type: Boolean, default: false },
    canDeleteOrganizations: { type: Boolean, default: false },
    canSuspendOrganizations: { type: Boolean, default: false },
    
    // Subscription Management
    canViewSubscriptions: { type: Boolean, default: false },
    canManageSubscriptions: { type: Boolean, default: false },
    canProcessRefunds: { type: Boolean, default: false },
    canViewBilling: { type: Boolean, default: false },
    
    // Content Management
    canViewContent: { type: Boolean, default: false },
    canModerateContent: { type: Boolean, default: false },
    canDeleteContent: { type: Boolean, default: false },
    
    // Notification Management
    canViewNotifications: { type: Boolean, default: false },
    canCreateNotifications: { type: Boolean, default: false },
    canEditNotifications: { type: Boolean, default: false },
    canDeleteNotifications: { type: Boolean, default: false },
    canModerateNotifications: { type: Boolean, default: false },
    
    // Analytics and Reporting
    canViewAnalytics: { type: Boolean, default: false },
    canExportData: { type: Boolean, default: false },
    canViewReports: { type: Boolean, default: false },
    canCreateReports: { type: Boolean, default: false },
    
    // System Management
    canViewSystemHealth: { type: Boolean, default: false },
    canManageSystem: { type: Boolean, default: false },
    canViewLogs: { type: Boolean, default: false },
    canManageIntegrations: { type: Boolean, default: false },
    
    // Team Management
    canViewTeam: { type: Boolean, default: false },
    canManageTeam: { type: Boolean, default: false },
    canAssignRoles: { type: Boolean, default: false },
    
    // Support Management
    canViewSupport: { type: Boolean, default: false },
    canManageSupport: { type: Boolean, default: false },
    canAccessCustomerData: { type: Boolean, default: false },
    
    // Platform Configuration
    canManageAPI: { type: Boolean, default: false },
    canManageSecurity: { type: Boolean, default: false },
    canManageWhiteLabel: { type: Boolean, default: false }
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
      deviceInfo: String,
      ipAddress: String
    }],
    sessionTimeout: {
      type: Number,
      default: 8 // hours
    }
  },
  
  // Admin Preferences
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
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    notifications: {
      email: {
        systemAlerts: { type: Boolean, default: true },
        userActivity: { type: Boolean, default: true },
        billingUpdates: { type: Boolean, default: true },
        securityEvents: { type: Boolean, default: true },
        supportTickets: { type: Boolean, default: true }
      },
      push: {
        systemAlerts: { type: Boolean, default: true },
        userActivity: { type: Boolean, default: false },
        billingUpdates: { type: Boolean, default: true },
        securityEvents: { type: Boolean, default: true },
        supportTickets: { type: Boolean, default: false }
      }
    },
    dashboard: {
      defaultView: {
        type: String,
        enum: ['overview', 'users', 'organizations', 'analytics', 'support'],
        default: 'overview'
      },
      widgetPreferences: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: new Map()
      },
      refreshInterval: {
        type: Number,
        default: 30 // seconds
      }
    }
  },
  
  // Department and Contact
  department: {
    type: String,
    enum: ['administration', 'support', 'finance', 'technical', 'content', 'marketing'],
    default: 'administration'
  },
  jobTitle: {
    type: String,
    maxlength: 100,
    default: null
  },
  phoneNumber: {
    type: String,
    default: null
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String,
    email: String
  },
  
  // Access Control
  accessControl: {
    allowedIPs: [String],
    restrictedIPs: [String],
    allowedCountries: [String],
    restrictedCountries: [String],
    requireVPN: {
      type: Boolean,
      default: false
    },
    maxConcurrentSessions: {
      type: Number,
      default: 3
    }
  },
  
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
    totalActions: {
      type: Number,
      default: 0
    },
    averageSessionDuration: {
      type: Number,
      default: 0 // minutes
    }
  },
  
  // Audit and Compliance
  auditLog: [{
    action: {
      type: String,
      required: true
    },
    targetType: {
      type: String,
      enum: ['user', 'organization', 'subscription', 'content', 'system', 'admin'],
      required: true
    },
    targetId: {
      type: String,
      default: null
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  }],
  
  // Employment Information
  employment: {
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: null
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'consultant'],
      default: 'full-time'
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
      default: null
    },
    directReports: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser'
    }]
  },
  
  // Security Settings
  security: {
    passwordLastChanged: {
      type: Date,
      default: Date.now
    },
    mustChangePassword: {
      type: Boolean,
      default: false
    },
    passwordHistory: [{
      hashedPassword: String,
      changedAt: { type: Date, default: Date.now }
    }],
    securityQuestions: [{
      question: String,
      hashedAnswer: String
    }],
    lastSecurityReview: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.authentication.passwordResetToken;
      delete ret.authentication.twoFactorSecret;
      delete ret.authentication.refreshTokens;
      delete ret.security.passwordHistory;
      delete ret.security.securityQuestions;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for performance
adminUserSchema.index({ email: 1 }, { unique: true });
adminUserSchema.index({ role: 1, isActive: 1 });
adminUserSchema.index({ department: 1 });
adminUserSchema.index({ 'authentication.lastLogin': -1 });
adminUserSchema.index({ createdAt: -1 });
adminUserSchema.index({ 'auditLog.timestamp': -1 });
adminUserSchema.index({ 'auditLog.targetType': 1, 'auditLog.targetId': 1 });

// Virtual for full name
adminUserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
adminUserSchema.virtual('isLocked').get(function() {
  return !!(this.authentication.lockUntil && this.authentication.lockUntil > Date.now());
});

// Virtual for role display name
adminUserSchema.virtual('roleDisplayName').get(function() {
  const roleNames = {
    'super_admin': 'Super Administrator',
    'admin': 'Administrator',
    'support_manager': 'Support Manager',
    'financial_manager': 'Financial Manager',
    'technical_manager': 'Technical Manager',
    'content_manager': 'Content Manager'
  };
  return roleNames[this.role] || this.role;
});

// Pre-save middleware to hash password
adminUserSchema.pre('save', async function(next) {
  try {
    // Only hash password if it's modified
    if (!this.isModified('password')) {
      return next();
    }
    
    // Store old password in history (keep last 5)
    if (this.password && !this.isNew) {
      this.security.passwordHistory.unshift({
        hashedPassword: this.password,
        changedAt: new Date()
      });
      
      if (this.security.passwordHistory.length > 5) {
        this.security.passwordHistory = this.security.passwordHistory.slice(0, 5);
      }
    }
    
    // Hash the new password
    this.password = await encryptionManager.hashPassword(this.password);
    this.security.passwordLastChanged = new Date();
    
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to set default permissions based on role
adminUserSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    this.setDefaultPermissions();
  }
  next();
});

// Instance method to set default permissions based on role
adminUserSchema.methods.setDefaultPermissions = function() {
  // Reset all permissions
  Object.keys(this.permissions.toObject()).forEach(key => {
    this.permissions[key] = false;
  });
  
  switch (this.role) {
    case 'super_admin':
      // Super admin has all permissions
      Object.keys(this.permissions.toObject()).forEach(key => {
        this.permissions[key] = true;
      });
      break;
      
    case 'admin':
      // Admin has most permissions except system management
      this.permissions.canViewUsers = true;
      this.permissions.canCreateUsers = true;
      this.permissions.canEditUsers = true;
      this.permissions.canSuspendUsers = true;
      this.permissions.canViewOrganizations = true;
      this.permissions.canEditOrganizations = true;
      this.permissions.canViewSubscriptions = true;
      this.permissions.canManageSubscriptions = true;
      this.permissions.canViewBilling = true;
      this.permissions.canViewContent = true;
      this.permissions.canModerateContent = true;
      this.permissions.canViewAnalytics = true;
      this.permissions.canViewReports = true;
      this.permissions.canViewTeam = true;
      this.permissions.canViewSupport = true;
      this.permissions.canManageSupport = true;
      break;
      
    case 'support_manager':
      this.permissions.canViewUsers = true;
      this.permissions.canEditUsers = true;
      this.permissions.canViewOrganizations = true;
      this.permissions.canViewSubscriptions = true;
      this.permissions.canViewContent = true;
      this.permissions.canViewSupport = true;
      this.permissions.canManageSupport = true;
      this.permissions.canAccessCustomerData = true;
      break;
      
    case 'financial_manager':
      this.permissions.canViewUsers = true;
      this.permissions.canViewOrganizations = true;
      this.permissions.canViewSubscriptions = true;
      this.permissions.canManageSubscriptions = true;
      this.permissions.canProcessRefunds = true;
      this.permissions.canViewBilling = true;
      this.permissions.canViewAnalytics = true;
      this.permissions.canViewReports = true;
      this.permissions.canCreateReports = true;
      this.permissions.canExportData = true;
      break;
      
    case 'technical_manager':
      this.permissions.canViewUsers = true;
      this.permissions.canViewOrganizations = true;
      this.permissions.canViewSystemHealth = true;
      this.permissions.canManageSystem = true;
      this.permissions.canViewLogs = true;
      this.permissions.canManageIntegrations = true;
      this.permissions.canManageAPI = true;
      this.permissions.canManageSecurity = true;
      break;
      
    case 'content_manager':
      this.permissions.canViewUsers = true;
      this.permissions.canViewOrganizations = true;
      this.permissions.canViewContent = true;
      this.permissions.canModerateContent = true;
      this.permissions.canDeleteContent = true;
      this.permissions.canViewAnalytics = true;
      this.permissions.canViewReports = true;
      break;
  }
};

// Instance method to verify password
adminUserSchema.methods.verifyPassword = async function(password) {
  try {
    return await encryptionManager.verifyPassword(password, this.password);
  } catch (error) {
    return false;
  }
};

// Instance method to check if password was used recently
adminUserSchema.methods.isPasswordRecentlyUsed = async function(password) {
  try {
    for (const historyEntry of this.security.passwordHistory) {
      const isMatch = await encryptionManager.verifyPassword(password, historyEntry.hashedPassword);
      if (isMatch) {
        return true;
      }
    }
    return false;
  } catch (error) {
    return false;
  }
};

// Instance method to increment login attempts
adminUserSchema.methods.incrementLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.authentication.lockUntil && this.authentication.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'authentication.lockUntil': 1 },
      $set: { 'authentication.loginAttempts': 1 }
    });
  }
  
  const updates = { $inc: { 'authentication.loginAttempts': 1 } };
  
  // Lock account after 3 failed attempts for 1 hour (more strict for admins)
  if (this.authentication.loginAttempts + 1 >= 3 && !this.isLocked) {
    updates.$set = { 'authentication.lockUntil': Date.now() + 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
adminUserSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $unset: { 
      'authentication.loginAttempts': 1,
      'authentication.lockUntil': 1 
    }
  });
};

// Instance method to update last login
adminUserSchema.methods.updateLastLogin = async function(ipAddress, userAgent) {
  const updates = {
    'authentication.lastLogin': new Date(),
    'activity.lastActiveAt': new Date(),
    $inc: { 'activity.totalLogins': 1 }
  };
  
  return this.updateOne(updates);
};

// Instance method to log admin activity
adminUserSchema.methods.logActivity = async function(action, targetType, targetId = null, details = {}, ipAddress = null, userAgent = null, severity = 'medium') {
  this.auditLog.unshift({
    action,
    targetType,
    targetId,
    details,
    ipAddress,
    userAgent,
    severity
  });
  
  // Keep only last 1000 audit log entries
  if (this.auditLog.length > 1000) {
    this.auditLog = this.auditLog.slice(0, 1000);
  }
  
  // Increment total actions
  this.activity.totalActions += 1;
  
  return this.save();
};

// Instance method to check permissions
adminUserSchema.methods.hasPermission = function(permission) {
  return this.permissions[permission] === true;
};

// Instance method to check multiple permissions
adminUserSchema.methods.hasAnyPermission = function(permissions) {
  return permissions.some(permission => this.hasPermission(permission));
};

// Instance method to check all permissions
adminUserSchema.methods.hasAllPermissions = function(permissions) {
  return permissions.every(permission => this.hasPermission(permission));
};

// Instance method to add refresh token
adminUserSchema.methods.addRefreshToken = async function(token, deviceInfo, ipAddress, expiresIn = '24h') {
  const expiresAt = new Date();
  if (expiresIn === '24h') {
    expiresAt.setHours(expiresAt.getHours() + 24);
  } else if (expiresIn === '8h') {
    expiresAt.setHours(expiresAt.getHours() + 8);
  }
  
  // Remove old refresh tokens (keep only last 3 for admins)
  if (this.authentication.refreshTokens.length >= 3) {
    this.authentication.refreshTokens = this.authentication.refreshTokens
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 2);
  }
  
  this.authentication.refreshTokens.push({
    token,
    expiresAt,
    deviceInfo,
    ipAddress
  });
  
  return this.save();
};

// Instance method to remove refresh token
adminUserSchema.methods.removeRefreshToken = async function(token) {
  this.authentication.refreshTokens = this.authentication.refreshTokens.filter(
    rt => rt.token !== token
  );
  return this.save();
};

// Static method to find by email
adminUserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active admins
adminUserSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find by role
adminUserSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

// Static method to find by department
adminUserSchema.statics.findByDepartment = function(department) {
  return this.find({ department, isActive: true });
};

module.exports = mongoose.model('AdminUser', adminUserSchema);

