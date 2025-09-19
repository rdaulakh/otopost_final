const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimiter');

// Get user profile
router.get('/', auth, rateLimit, async (req, res) => {
  try {
    // Mock user profile data
    const profile = {
      id: req.user.id,
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      avatar: '/api/media/avatars/user-123.jpg',
      bio: 'Social media enthusiast and content creator',
      location: 'San Francisco, CA',
      website: 'https://johndoe.com',
      timezone: 'America/Los_Angeles',
      language: 'en',
      theme: 'light',
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      marketingEmails: true,
      weeklyReports: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-09-15T14:30:00Z',
      lastLoginAt: '2024-09-15T09:15:00Z',
      isVerified: true,
      subscription: {
        plan: 'Pro',
        status: 'active',
        expiresAt: '2024-12-15T00:00:00Z',
        features: ['unlimited_posts', 'analytics', 'scheduling', 'ai_content']
      },
      socialAccounts: [
        {
          platform: 'twitter',
          username: '@johndoe',
          connected: true,
          connectedAt: '2024-02-01T10:00:00Z',
          followers: 1247,
          isActive: true
        },
        {
          platform: 'linkedin',
          username: 'john-doe-123',
          connected: true,
          connectedAt: '2024-02-05T15:30:00Z',
          connections: 856,
          isActive: true
        },
        {
          platform: 'facebook',
          username: 'john.doe.page',
          connected: false,
          connectedAt: null,
          followers: 0,
          isActive: false
        }
      ],
      stats: {
        totalPosts: 156,
        totalViews: 45678,
        totalEngagement: 3456,
        avgEngagementRate: 7.6,
        followersGrowth: 12.3,
        postsThisMonth: 23
      },
      preferences: {
        defaultPlatforms: ['twitter', 'linkedin'],
        autoSchedule: true,
        aiAssistance: true,
        contentSuggestions: true,
        performanceAlerts: true,
        weeklyDigest: true
      }
    };

    res.json({ profile });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/', auth, rateLimit, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      bio,
      location,
      website,
      timezone,
      language,
      theme
    } = req.body;

    // Mock profile update
    const updatedProfile = {
      id: req.user.id,
      firstName: firstName || 'John',
      lastName: lastName || 'Doe',
      username: username || 'johndoe',
      bio: bio || 'Social media enthusiast and content creator',
      location: location || 'San Francisco, CA',
      website: website || 'https://johndoe.com',
      timezone: timezone || 'America/Los_Angeles',
      language: language || 'en',
      theme: theme || 'light',
      updatedAt: new Date().toISOString()
    };

    res.json({ 
      message: 'Profile updated successfully',
      profile: updatedProfile 
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Failed to update user profile' });
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
