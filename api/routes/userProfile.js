const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { generalLimiter: rateLimit } = require('../middleware/rateLimiter');
const User = require('../models/User');

// Get user profile
router.get('/', auth, rateLimit, async (req, res) => {
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
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch user profile' 
    });
  }
});

// Update user profile
router.put('/', auth, rateLimit, async (req, res) => {
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
      avatar
    } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
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
    console.error('Update user profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update user profile' 
    });
  }
});

// Update notification preferences
router.put('/notifications', auth, rateLimit, async (req, res) => {
  try {
    const {
      emailNotifications,
      pushNotifications,
      smsNotifications,
      marketingEmails,
      weeklyReports
    } = req.body;

    // Mock notification preferences update
    const updatedPreferences = {
      emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
      pushNotifications: pushNotifications !== undefined ? pushNotifications : true,
      smsNotifications: smsNotifications !== undefined ? smsNotifications : false,
      marketingEmails: marketingEmails !== undefined ? marketingEmails : true,
      weeklyReports: weeklyReports !== undefined ? weeklyReports : true,
      updatedAt: new Date().toISOString()
    };

    res.json({ 
      message: 'Notification preferences updated successfully',
      preferences: updatedPreferences 
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ message: 'Failed to update notification preferences' });
  }
});

// Update user preferences
router.put('/preferences', auth, rateLimit, async (req, res) => {
  try {
    const {
      defaultPlatforms,
      autoSchedule,
      aiAssistance,
      contentSuggestions,
      performanceAlerts,
      weeklyDigest
    } = req.body;

    // Mock preferences update
    const updatedPreferences = {
      defaultPlatforms: defaultPlatforms || ['twitter', 'linkedin'],
      autoSchedule: autoSchedule !== undefined ? autoSchedule : true,
      aiAssistance: aiAssistance !== undefined ? aiAssistance : true,
      contentSuggestions: contentSuggestions !== undefined ? contentSuggestions : true,
      performanceAlerts: performanceAlerts !== undefined ? performanceAlerts : true,
      weeklyDigest: weeklyDigest !== undefined ? weeklyDigest : true,
      updatedAt: new Date().toISOString()
    };

    res.json({ 
      message: 'User preferences updated successfully',
      preferences: updatedPreferences 
    });
  } catch (error) {
    console.error('Update user preferences error:', error);
    res.status(500).json({ message: 'Failed to update user preferences' });
  }
});

// Upload avatar
router.post('/avatar', auth, rateLimit, async (req, res) => {
  try {
    // Mock avatar upload
    const avatarUrl = `/api/media/avatars/user-${req.user.id}-${Date.now()}.jpg`;

    res.json({ 
      message: 'Avatar uploaded successfully',
      avatarUrl 
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
});

// Delete user account
router.delete('/account', auth, rateLimit, async (req, res) => {
  try {
    const { confirmPassword } = req.body;

    if (!confirmPassword) {
      return res.status(400).json({ message: 'Password confirmation required' });
    }

    // Mock account deletion
    console.log(`Deleting account for user ${req.user.id}`);

    res.json({ 
      message: 'Account deletion initiated. You will receive a confirmation email.',
      deletionId: `del_${Date.now()}`
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

// Get user activity log
router.get('/activity', auth, rateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Mock activity log
    const activities = [
      {
        id: '1',
        type: 'login',
        description: 'Logged in from Chrome on Windows',
        ip: '192.168.1.100',
        location: 'San Francisco, CA',
        userAgent: 'Chrome/91.0.4472.124',
        timestamp: '2024-09-15T09:15:00Z'
      },
      {
        id: '2',
        type: 'post_created',
        description: 'Created new post "Social Media Strategy 2024"',
        metadata: { postId: 'post_123', platforms: ['twitter', 'linkedin'] },
        timestamp: '2024-09-15T08:30:00Z'
      },
      {
        id: '3',
        type: 'profile_updated',
        description: 'Updated profile information',
        metadata: { fields: ['bio', 'location'] },
        timestamp: '2024-09-14T16:45:00Z'
      },
      {
        id: '4',
        type: 'social_connected',
        description: 'Connected LinkedIn account',
        metadata: { platform: 'linkedin', username: 'john-doe-123' },
        timestamp: '2024-09-14T10:20:00Z'
      }
    ];

    const totalActivities = activities.length;
    const totalPages = Math.ceil(totalActivities / limit);
    const startIndex = (page - 1) * limit;
    const paginatedActivities = activities.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      activities: paginatedActivities,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalActivities,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get activity log error:', error);
    res.status(500).json({ message: 'Failed to fetch activity log' });
  }
});

module.exports = router;
