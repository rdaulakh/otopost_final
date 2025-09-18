const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // Event identification
  event: {
    type: String,
    required: true,
    index: true
  },
  
  // Severity level
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
    index: true
  },
  
  // User and organization context
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    index: true
  },
  
  // Resource information
  resourceType: {
    type: String,
    index: true
  },
  
  resourceId: {
    type: String,
    index: true
  },
  
  // Action details
  action: {
    type: String,
    required: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Request context
  ipAddress: {
    type: String,
    index: true
  },
  
  userAgent: {
    type: String
  },
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Success status
  success: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // Error information
  errorMessage: {
    type: String
  },
  
  // Session information
  sessionId: {
    type: String,
    index: true
  },
  
  // Request ID for tracing
  requestId: {
    type: String,
    index: true
  },
  
  // Geographic information
  location: {
    country: String,
    region: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Device information
  device: {
    type: String, // mobile, desktop, tablet
    os: String,
    browser: String,
    version: String
  },
  
  // Risk assessment
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Compliance flags
  complianceFlags: [{
    type: String,
    enum: ['gdpr', 'ccpa', 'sox', 'hipaa', 'pci']
  }],
  
  // Data classification
  dataClassification: {
    type: String,
    enum: ['public', 'internal', 'confidential', 'restricted'],
    default: 'internal'
  },
  
  // Retention period
  retentionPeriod: {
    type: Number, // days
    default: 90
  },
  
  // Archive status
  archived: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Archive date
  archivedAt: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'auditlogs'
});

// Indexes for performance
auditLogSchema.index({ timestamp: -1, organizationId: 1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ event: 1, timestamp: -1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });
auditLogSchema.index({ success: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, timestamp: -1 });
auditLogSchema.index({ archived: 1, timestamp: -1 });

// Compound indexes for common queries
auditLogSchema.index({ 
  organizationId: 1, 
  event: 1, 
  timestamp: -1 
});

auditLogSchema.index({ 
  userId: 1, 
  resourceType: 1, 
  timestamp: -1 
});

auditLogSchema.index({ 
  severity: 1, 
  success: 1, 
  timestamp: -1 
});

// TTL index for automatic cleanup
auditLogSchema.index(
  { timestamp: 1 }, 
  { 
    expireAfterSeconds: 0, // Will be set dynamically based on retentionPeriod
    partialFilterExpression: { archived: true }
  }
);

// Virtual for formatted timestamp
auditLogSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toISOString();
});

// Virtual for duration (if applicable)
auditLogSchema.virtual('duration').get(function() {
  if (this.metadata && this.metadata.duration) {
    return this.metadata.duration;
  }
  return null;
});

// Pre-save middleware
auditLogSchema.pre('save', function(next) {
  // Set archive date if archived
  if (this.archived && !this.archivedAt) {
    this.archivedAt = new Date();
  }
  
  // Calculate risk score based on various factors
  this.riskScore = calculateRiskScore(this);
  
  next();
});

// Calculate risk score based on various factors
function calculateRiskScore(auditLog) {
  let score = 0;
  
  // Base score from severity
  const severityScores = {
    'low': 10,
    'medium': 30,
    'high': 60,
    'critical': 90
  };
  score += severityScores[auditLog.severity] || 0;
  
  // Add score for failed operations
  if (!auditLog.success) {
    score += 20;
  }
  
  // Add score for security events
  if (auditLog.event && auditLog.event.includes('security')) {
    score += 30;
  }
  
  // Add score for high-risk actions
  const highRiskActions = ['delete', 'deactivate', 'disconnect', 'cancel'];
  if (highRiskActions.includes(auditLog.action)) {
    score += 25;
  }
  
  // Add score for sensitive resource types
  const sensitiveResources = ['user', 'organization', 'billing', 'settings'];
  if (sensitiveResources.includes(auditLog.resourceType)) {
    score += 15;
  }
  
  // Add score for unusual IP patterns (simplified)
  if (auditLog.metadata && auditLog.metadata.unusualIP) {
    score += 20;
  }
  
  // Cap at 100
  return Math.min(score, 100);
}

// Static methods
auditLogSchema.statics.getUserActivity = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('organizationId', 'name')
    .lean();
};

auditLogSchema.statics.getSecurityEvents = function(organizationId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    organizationId,
    event: { $regex: /security|auth|permission/ },
    timestamp: { $gte: startDate }
  })
  .sort({ timestamp: -1 })
  .populate('userId', 'email firstName lastName')
  .lean();
};

auditLogSchema.statics.getFailedLogins = function(organizationId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    organizationId,
    event: 'user.login_failed',
    timestamp: { $gte: startDate }
  })
  .sort({ timestamp: -1 })
  .lean();
};

auditLogSchema.statics.getDataChanges = function(resourceType, resourceId, limit = 20) {
  return this.find({
    resourceType,
    resourceId,
    action: { $in: ['create', 'update', 'delete'] }
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .populate('userId', 'email firstName lastName')
  .lean();
};

auditLogSchema.statics.getHighRiskEvents = function(organizationId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    organizationId,
    $or: [
      { severity: 'critical' },
      { severity: 'high' },
      { riskScore: { $gte: 70 } }
    ],
    timestamp: { $gte: startDate }
  })
  .sort({ riskScore: -1, timestamp: -1 })
  .populate('userId', 'email firstName lastName')
  .lean();
};

auditLogSchema.statics.getComplianceReport = function(organizationId, complianceType, startDate, endDate) {
  return this.find({
    organizationId,
    complianceFlags: complianceType,
    timestamp: { $gte: startDate, $lte: endDate }
  })
  .sort({ timestamp: -1 })
  .populate('userId', 'email firstName lastName')
  .lean();
};

auditLogSchema.statics.cleanupOldLogs = function(retentionDays = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  return this.deleteMany({
    timestamp: { $lt: cutoffDate },
    severity: { $ne: 'critical' },
    archived: true
  });
};

auditLogSchema.statics.archiveOldLogs = function(archiveDays = 30) {
  const archiveDate = new Date();
  archiveDate.setDate(archiveDate.getDate() - archiveDays);
  
  return this.updateMany(
    {
      timestamp: { $lt: archiveDate },
      archived: false,
      severity: { $ne: 'critical' }
    },
    {
      $set: {
        archived: true,
        archivedAt: new Date()
      }
    }
  );
};

// Instance methods
auditLogSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  
  // Remove sensitive data
  if (obj.metadata) {
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    sensitiveFields.forEach(field => {
      if (obj.metadata[field]) {
        obj.metadata[field] = '[REDACTED]';
      }
    });
  }
  
  return obj;
};

auditLogSchema.methods.getRiskLevel = function() {
  if (this.riskScore >= 80) return 'critical';
  if (this.riskScore >= 60) return 'high';
  if (this.riskScore >= 40) return 'medium';
  return 'low';
};

auditLogSchema.methods.isSecurityEvent = function() {
  return this.event && this.event.includes('security');
};

auditLogSchema.methods.isDataChange = function() {
  return ['create', 'update', 'delete'].includes(this.action);
};

module.exports = mongoose.model('AuditLog', auditLogSchema);

