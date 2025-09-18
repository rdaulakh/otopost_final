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
        message: 'User not found'
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        subscription: user.subscription,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        preferences: user.preferences,
        businessProfile: user.businessProfile,
        socialAccounts: user.socialAccounts,
        aiSettings: user.aiSettings,
        profileCompletion: user.profileCompletion,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      message: 'Server error'
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
      company,
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
    if (company !== undefined) user.company = company;
    if (avatar !== undefined) user.avatar = avatar;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (businessProfile) user.businessProfile = { ...user.businessProfile, ...businessProfile };
    if (aiSettings) user.aiSettings = { ...user.aiSettings, ...aiSettings };

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        subscription: user.subscription,
        avatar: user.avatar,
        preferences: user.preferences,
        businessProfile: user.businessProfile,
        aiSettings: user.aiSettings,
        profileCompletion: user.profileCompletion,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/password
// @desc    Change user password
// @access  Private
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Please provide current password and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/business-profile
// @desc    Update business profile
// @access  Private
router.put('/business-profile', auth, async (req, res) => {
  try {
    const {
      industry,
      businessType,
      companySize,
      website,
      foundedYear,
      description,
      contactInfo,
      marketingStrategy
    } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Update business profile
    const businessProfile = {
      ...user.businessProfile,
      ...(industry && { industry }),
      ...(businessType && { businessType }),
      ...(companySize && { companySize }),
      ...(website && { website }),
      ...(foundedYear && { foundedYear }),
      ...(description && { description }),
      ...(contactInfo && { contactInfo: { ...user.businessProfile?.contactInfo, ...contactInfo } }),
      ...(marketingStrategy && { marketingStrategy: { ...user.businessProfile?.marketingStrategy, ...marketingStrategy } })
    };

    user.businessProfile = businessProfile;
    await user.save();

    res.json({
      message: 'Business profile updated successfully',
      businessProfile: user.businessProfile,
      profileCompletion: user.profileCompletion
    });
  } catch (error) {
    console.error('Update business profile error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Calculate user statistics
    const stats = {
      profileCompletion: user.profileCompletion,
      connectedAccounts: user.socialAccounts?.length || 0,
      activeAccounts: user.getActiveSocialAccounts()?.length || 0,
      subscription: user.subscription,
      memberSince: user.createdAt,
      lastLogin: user.lastLogin
    };

    res.json(stats);
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/users/me
// @desc    Delete user account
// @access  Private
router.delete('/me', auth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: 'Password is required to delete account'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Incorrect password'
      });
    }

    // Soft delete - deactivate account
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save();

    res.json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

module.exports = router;
