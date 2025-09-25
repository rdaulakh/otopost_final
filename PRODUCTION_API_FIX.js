// ========================================
// PRODUCTION API FIX FOR PROFILE SAVING
// ========================================
// 
// This file contains the exact code you need to update
// in your production API server to fix profile saving.
//
// LOCATION: Update this in your production server at:
// https://digiads.digiaeon.com/api/routes/users.js
// ========================================

const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// ========================================
// FIXED PROFILE UPDATE ENDPOINT
// ========================================
// 
// Replace your existing PUT /profile route with this code
// This will save all fields individually instead of in preferences
// ========================================

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

    // ========================================
    // SAVE INDIVIDUAL FIELDS (NOT IN PREFERENCES)
    // ========================================
    
    // Update individual profile fields
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

    // Save to database
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

    // ========================================
    // RETURN ALL FIELDS IN RESPONSE
    // ========================================
    
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

module.exports = router;

// ========================================
// DEPLOYMENT INSTRUCTIONS
// ========================================
//
// 1. Copy this code to your production server
// 2. Replace the existing PUT /profile route in your users.js file
// 3. Make sure your User model has these fields:
//    - firstName, lastName, phone, company, jobTitle, location, bio, website
// 4. Restart your production API server
// 5. Test the profile update functionality
//
// ========================================


