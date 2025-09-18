const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
  company: {
    type: String,
    trim: true
  },
  subscription: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free'
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      marketing: {
        type: Boolean,
        default: false
      }
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  businessProfile: {
    industry: {
      type: String,
      enum: [
        'Technology',
        'Healthcare',
        'Finance',
        'Education',
        'Retail',
        'Manufacturing',
        'Real Estate',
        'Food & Beverage',
        'Travel & Tourism',
        'Entertainment',
        'Other'
      ]
    },
    businessType: {
      type: String,
      enum: ['B2B', 'B2C', 'B2B2C']
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+']
    },
    website: String,
    foundedYear: Number,
    description: String,
    contactInfo: {
      businessEmail: String,
      phone: String,
      address: String
    },
    marketingStrategy: {
      brandVoice: {
        type: String,
        enum: ['Professional', 'Casual', 'Friendly', 'Authoritative', 'Humorous', 'Inspirational']
      },
      contentStyle: {
        type: String,
        enum: ['Educational', 'Promotional', 'Entertainment', 'News', 'Behind-the-scenes', 'User-generated']
      },
      postingFrequency: {
        type: String,
        enum: ['Daily', '3-4 times/week', '2-3 times/week', 'Weekly', 'Bi-weekly']
      },
      geographicReach: String,
      targetAudience: String,
      businessObjectives: [{
        type: String,
        enum: [
          'Brand Awareness',
          'Lead Generation',
          'Sales Growth',
          'Customer Engagement',
          'Community Building',
          'Thought Leadership',
          'Customer Support',
          'Market Research'
        ]
      }]
    }
  },
  socialAccounts: [{
    platform: {
      type: String,
      enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube'],
      required: true
    },
    accountId: String,
    username: String,
    accessToken: String,
    refreshToken: String,
    isActive: {
      type: Boolean,
      default: true
    },
    connectedAt: {
      type: Date,
      default: Date.now
    }
  }],
  aiSettings: {
    preferredModel: {
      type: String,
      default: 'gpt-4'
    },
    contentTone: {
      type: String,
      enum: ['professional', 'casual', 'friendly', 'authoritative'],
      default: 'professional'
    },
    autoApprove: {
      type: Boolean,
      default: false
    },
    maxPostsPerDay: {
      type: Number,
      default: 5
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ subscription: 1 });
userSchema.index({ isActive: 1 });

// Virtual for user's full profile completion percentage
userSchema.virtual('profileCompletion').get(function() {
  let completion = 0;
  const fields = [
    this.name, this.email, this.company,
    this.businessProfile?.industry,
    this.businessProfile?.businessType,
    this.businessProfile?.marketingStrategy?.brandVoice,
    this.businessProfile?.targetAudience
  ];
  
  fields.forEach(field => {
    if (field) completion += 1;
  });
  
  return Math.round((completion / fields.length) * 100);
});

// Method to check if user has connected social accounts
userSchema.methods.hasConnectedAccounts = function() {
  return this.socialAccounts && this.socialAccounts.length > 0;
};

// Method to get active social accounts
userSchema.methods.getActiveSocialAccounts = function() {
  return this.socialAccounts.filter(account => account.isActive);
};

module.exports = mongoose.model('User', userSchema);
