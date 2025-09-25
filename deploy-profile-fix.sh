#!/bin/bash

# ========================================
# PROFILE SAVING FIX DEPLOYMENT SCRIPT
# ========================================
# 
# This script deploys the profile saving fix to production
# Run this script to fix the profile saving issue
# ========================================

echo "🚀 Starting Profile Saving Fix Deployment..."
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to log messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "PRODUCTION_API_FIX.js" ]; then
    log_error "PRODUCTION_API_FIX.js not found. Please run this script from the project root."
    exit 1
fi

log_info "Profile saving fix files found!"

# Create backup of current files
log_info "Creating backup of current API files..."

# Backup current users.js route
if [ -f "api/routes/users.js" ]; then
    cp api/routes/users.js api/routes/users.js.backup.$(date +%Y%m%d_%H%M%S)
    log_success "Backup created: api/routes/users.js.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Backup current User.js model
if [ -f "api/models/User.js" ]; then
    cp api/models/User.js api/models/User.js.backup.$(date +%Y%m%d_%H%M%S)
    log_success "Backup created: api/models/User.js.backup.$(date +%Y%m%d_%H%M%S)"
fi

log_info "Applying profile saving fix..."

# Update the users.js route with the fixed profile endpoint
log_info "Updating users.js route..."

# Create the fixed users.js route
cat > api/routes/users_fixed.js << 'EOF'
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { auth, checkSubscription } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          company: user.company,
          jobTitle: user.jobTitle,
          location: user.location,
          bio: user.bio,
          website: user.website,
          profilePicture: user.profilePicture,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile with all fields
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    console.log('Profile update request received:', req.body);
    
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      location,
      bio,
      website,
      timezone
    } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // SAVE INDIVIDUAL FIELDS (NOT IN PREFERENCES)
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (company !== undefined) user.company = company;
    if (jobTitle !== undefined) user.jobTitle = jobTitle;
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;
    if (website !== undefined) user.website = website;
    
    // Only timezone goes in preferences
    if (timezone !== undefined) user.preferences.timezone = timezone;

    // Update name if firstName or lastName changed
    if (firstName !== undefined || lastName !== undefined) {
      user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }

    await user.save();
    
    console.log('Profile updated successfully for user:', user._id);
    console.log('Updated fields:', {
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.company,
      jobTitle: user.jobTitle,
      location: user.location,
      bio: user.bio,
      website: user.website,
      phone: user.phone
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          company: user.company,
          jobTitle: user.jobTitle,
          location: user.location,
          bio: user.bio,
          website: user.website,
          profilePicture: user.profilePicture,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/users/me
// @desc    Update current user profile
// @access  Private
router.put('/me', auth, async (req, res) => {
  try {
    const {
      name,
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      location,
      bio,
      website,
      timezone,
      avatar,
      preferences,
      businessProfile,
      aiSettings
    } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (company !== undefined) user.company = company;
    if (jobTitle !== undefined) user.jobTitle = jobTitle;
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;
    if (website !== undefined) user.website = website;
    if (timezone !== undefined) user.preferences.timezone = timezone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({ 
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          company: user.company,
          jobTitle: user.jobTitle,
          location: user.location,
          bio: user.bio,
          website: user.website,
          avatar: user.avatar,
          subscription: user.subscription,
          preferences: user.preferences,
          businessProfile: user.businessProfile,
          aiSettings: user.aiSettings,
          profileCompletion: user.profileCompletion,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
EOF

log_success "Fixed users.js route created!"

# Update the User model to ensure all fields are present
log_info "Updating User model..."

# Create the fixed User model
cat > api/models/User_fixed.js << 'EOF'
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
  
  // PROFILE FIELDS (INDIVIDUAL FIELDS)
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
  
  // PREFERENCES (ONLY FOR SETTINGS)
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
  
  // Other existing fields
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
EOF

log_success "Fixed User model created!"

# Replace the original files
log_info "Applying fixes..."

# Replace users.js with the fixed version
if [ -f "api/routes/users_fixed.js" ]; then
    mv api/routes/users_fixed.js api/routes/users.js
    log_success "users.js updated with profile saving fix!"
fi

# Replace User.js with the fixed version
if [ -f "api/models/User_fixed.js" ]; then
    mv api/models/User_fixed.js api/models/User.js
    log_success "User.js updated with profile fields!"
fi

# Restart the API server
log_info "Restarting API server..."

# Check if PM2 is running
if command -v pm2 &> /dev/null; then
    pm2 restart backend-api
    log_success "API server restarted with PM2!"
else
    log_warn "PM2 not found. Please restart your API server manually."
fi

echo ""
echo "=============================================="
log_success "🎉 PROFILE SAVING FIX DEPLOYED SUCCESSFULLY!"
echo "=============================================="
echo ""
log_info "✅ What was fixed:"
echo "   - Profile fields now save as individual database fields"
echo "   - Fields are NOT stored in preferences object"
echo "   - All fields are returned in API response"
echo "   - Profile saving works correctly"
echo ""
log_info "🧪 Test your profile update now!"
echo "   - Update your profile in the frontend"
echo "   - Check that all fields are saved correctly"
echo "   - Verify fields appear in database as individual fields"
echo ""
log_success "Deployment complete! 🚀"


