const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userClaudeSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'Username is required'], 
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: { 
    type: String, 
    enum: ['customer', 'admin', 'moderator'], 
    default: 'customer' 
  },
  profile: {
    displayName: {
      type: String,
      trim: true,
      maxlength: [50, 'Display name cannot exceed 50 characters']
    },
    avatar: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    socialAccounts: [{
      platform: {
        type: String,
        enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube'],
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
        required: true,
        select: false
      },
      refreshToken: {
        type: String,
        select: false
      },
      expiresAt: {
        type: Date
      },
      isActive: {
        type: Boolean,
        default: true
      },
      connectedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  subscription: {
    plan: { 
      type: String, 
      enum: ['free', 'basic', 'pro', 'enterprise'], 
      default: 'free' 
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'past_due'],
      default: 'active'
    },
    features: {
      postsLimit: {
        type: Number,
        default: 10
      },
      aiCredits: {
        type: Number,
        default: 50
      },
      socialAccountsLimit: {
        type: Number,
        default: 2
      }
    }
  },
  stats: {
    totalPosts: {
      type: Number,
      default: 0
    },
    aiCreditsUsed: {
      type: Number,
      default: 0
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Pre-save middleware to hash password
userClaudeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method to check password
userClaudeSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('UserClaude', userClaudeSchema);
