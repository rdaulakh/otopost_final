const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true,
    unique: true
  },
  // S3 storage information
  s3Data: {
    bucket: {
      type: String,
      default: process.env.AWS_S3_BUCKET
    },
    uploads: [{
      size: {
        type: String,
        enum: ['thumbnail', 'small', 'medium', 'large', 'original'],
        required: true
      },
      url: {
        type: String,
        required: true
      },
      key: {
        type: String,
        required: true
      },
      fileSize: {
        type: Number,
        required: true
      },
      dimensions: {
        type: String,
        default: null
      }
    }]
  },
  // Legacy fields for backward compatibility
  filePath: {
    type: String
  },
  url: {
    type: String
  },
  thumbnailPath: {
    type: String
  },
  thumbnailUrl: {
    type: String
  },
  size: {
    type: Number,
    required: true
  },
  processedSize: {
    type: Number
  },
  mimetype: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['image', 'video', 'document', 'audio'],
    index: true
  },
  dimensions: {
    width: {
      type: Number
    },
    height: {
      type: Number
    }
  },
  duration: {
    type: Number // For videos and audio files
  },
  bitrate: {
    type: String // For videos and audio files
  },
  codec: {
    type: String // For videos and audio files
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  tags: [{
    type: String,
    index: true
  }],
  description: {
    type: String
  },
  altText: {
    type: String // For accessibility
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isProcessed: {
    type: Boolean,
    default: false
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingError: {
    type: String
  },
  usage: [{
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content'
    },
    platform: {
      type: String,
      enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube']
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    lastAccessed: {
      type: Date
    }
  },
  expiresAt: {
    type: Date // For temporary files
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
MediaSchema.index({ user: 1, category: 1 });
MediaSchema.index({ user: 1, createdAt: -1 });
MediaSchema.index({ fileName: 1 });
MediaSchema.index({ tags: 1 });
MediaSchema.index({ isPublic: 1 });
MediaSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Virtual for file URL (S3 or legacy)
MediaSchema.virtual('fullUrl').get(function() {
  if (this.s3Data && this.s3Data.uploads && this.s3Data.uploads.length > 0) {
    const originalUpload = this.s3Data.uploads.find(upload => upload.size === 'original');
    return originalUpload ? originalUpload.url : this.s3Data.uploads[0].url;
  }
  return this.url ? `${process.env.BASE_URL || 'http://localhost:5000'}${this.url}` : null;
});

MediaSchema.virtual('fullThumbnailUrl').get(function() {
  if (this.s3Data && this.s3Data.uploads && this.s3Data.uploads.length > 0) {
    const thumbnailUpload = this.s3Data.uploads.find(upload => upload.size === 'thumbnail');
    if (thumbnailUpload) return thumbnailUpload.url;
    // Fallback to smallest available size
    const smallUpload = this.s3Data.uploads.find(upload => upload.size === 'small');
    return smallUpload ? smallUpload.url : this.fullUrl;
  }
  if (this.thumbnailUrl) {
    return `${process.env.BASE_URL || 'http://localhost:5000'}${this.thumbnailUrl}`;
  }
  return null;
});

// Virtual for S3 primary URL
MediaSchema.virtual('s3PrimaryUrl').get(function() {
  if (this.s3Data && this.s3Data.uploads && this.s3Data.uploads.length > 0) {
    const originalUpload = this.s3Data.uploads.find(upload => upload.size === 'original');
    return originalUpload ? originalUpload.url : this.s3Data.uploads[0].url;
  }
  return null;
});

// Methods
MediaSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  this.analytics.lastAccessed = new Date();
  return this.save();
};

MediaSchema.methods.incrementDownloads = function() {
  this.analytics.downloads += 1;
  this.analytics.lastAccessed = new Date();
  return this.save();
};

MediaSchema.methods.addUsage = function(contentId, platform) {
  this.usage.push({
    contentId,
    platform,
    usedAt: new Date()
  });
  return this.save();
};

MediaSchema.methods.updateProcessingStatus = function(status, error = null) {
  this.processingStatus = status;
  if (error) {
    this.processingError = error;
  }
  if (status === 'completed') {
    this.isProcessed = true;
  }
  return this.save();
};

// S3-specific methods
MediaSchema.methods.getUrlBySize = function(size = 'original') {
  if (this.s3Data && this.s3Data.uploads && this.s3Data.uploads.length > 0) {
    const upload = this.s3Data.uploads.find(upload => upload.size === size);
    return upload ? upload.url : this.s3PrimaryUrl;
  }
  return this.fullUrl;
};

MediaSchema.methods.getAllSizes = function() {
  if (this.s3Data && this.s3Data.uploads && this.s3Data.uploads.length > 0) {
    return this.s3Data.uploads.map(upload => ({
      size: upload.size,
      url: upload.url,
      fileSize: upload.fileSize,
      dimensions: upload.dimensions
    }));
  }
  return [{
    size: 'original',
    url: this.fullUrl,
    fileSize: this.size,
    dimensions: this.dimensions ? `${this.dimensions.width}x${this.dimensions.height}` : null
  }];
};

MediaSchema.methods.getS3Keys = function() {
  if (this.s3Data && this.s3Data.uploads && this.s3Data.uploads.length > 0) {
    return this.s3Data.uploads.map(upload => upload.key);
  }
  return [];
};

// Static methods
MediaSchema.statics.findByUser = function(userId, options = {}) {
  const {
    category,
    tags,
    isPublic,
    limit = 20,
    skip = 0,
    sort = { createdAt: -1 }
  } = options;

  let query = { user: userId };
  
  if (category) {
    query.category = category;
  }
  
  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }
  
  if (typeof isPublic === 'boolean') {
    query.isPublic = isPublic;
  }

  return this.find(query)
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('user', 'name email');
};

MediaSchema.statics.findByCategory = function(category, options = {}) {
  const {
    isPublic = true,
    limit = 20,
    skip = 0,
    sort = { createdAt: -1 }
  } = options;

  return this.find({ category, isPublic })
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('user', 'name email');
};

MediaSchema.statics.getStorageStats = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$category',
        totalSize: { $sum: '$size' },
        count: { $sum: 1 },
        avgSize: { $avg: '$size' }
      }
    },
    {
      $group: {
        _id: null,
        categories: {
          $push: {
            category: '$_id',
            totalSize: '$totalSize',
            count: '$count',
            avgSize: '$avgSize'
          }
        },
        totalSize: { $sum: '$totalSize' },
        totalFiles: { $sum: '$count' }
      }
    }
  ]);
};

MediaSchema.statics.findExpiredFiles = function() {
  return this.find({
    expiresAt: { $lt: new Date() }
  });
};

MediaSchema.statics.findUnusedFiles = function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.find({
    createdAt: { $lt: cutoffDate },
    usage: { $size: 0 },
    'analytics.views': 0
  });
};

// Pre-save middleware
MediaSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-remove middleware to clean up files
MediaSchema.pre('remove', async function(next) {
  try {
    const fs = require('fs').promises;
    
    // Delete main file
    try {
      await fs.unlink(this.filePath);
    } catch (error) {
      console.error('Error deleting main file:', error);
    }
    
    // Delete thumbnail if exists
    if (this.thumbnailPath) {
      try {
        await fs.unlink(this.thumbnailPath);
      } catch (error) {
        console.error('Error deleting thumbnail:', error);
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Transform output
MediaSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    delete ret.filePath; // Don't expose internal file paths
    delete ret.thumbnailPath;
    return ret;
  }
});

module.exports = mongoose.model('Media', MediaSchema);
