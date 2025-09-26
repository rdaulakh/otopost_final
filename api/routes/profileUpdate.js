const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   PUT /api/profile-update
// @desc    Update user profile with all fields
// @access  Private
router.put('/', auth, async (req, res) => {
  try {
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

    // Update individual fields
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

    // Update name if firstName or lastName changed
    if (firstName !== undefined || lastName !== undefined) {
      user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }

    await user.save();

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
      message: 'Server error'
    });
  }
});

module.exports = router;


