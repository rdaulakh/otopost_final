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
