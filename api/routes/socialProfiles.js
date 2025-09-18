const express = require('express');
const SocialProfile = require('../models/SocialProfile');
const { auth, checkSubscription } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/social-profiles
// @desc    Get all social profiles for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { platform, status } = req.query;

    // Build query
    const query = { user: req.user.id };
    
    if (platform) {
      query.platform = platform;
    }
    
    if (status) {
      query.connectionStatus = status;
    }

    const profiles = await SocialProfile.find(query)
      .sort({ createdAt: -1 })
      .select('-accessToken -refreshToken'); // Don't send sensitive tokens

    res.json({
      profiles,
      total: profiles.length
    });
  } catch (error) {
    console.error('Get social profiles error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   GET /api/social-profiles/:id
// @desc    Get specific social profile by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const profile = await SocialProfile.findOne({
      _id: req.params.id,
      user: req.user.id
    }).select('-accessToken -refreshToken');

    if (!profile) {
      return res.status(404).json({
        message: 'Social profile not found'
      });
    }

    res.json(profile);
  } catch (error) {
    console.error('Get social profile by ID error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   POST /api/social-profiles
// @desc    Connect a new social media account
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      platform,
      platformId,
      username,
      displayName,
      profilePicture,
      bio,
      followerCount,
      followingCount,
      postCount,
      isVerified,
      accessToken,
      refreshToken,
      tokenExpiry,
      permissions,
      platformData
    } = req.body;

    // Validation
    if (!platform || !platformId || !username || !displayName || !accessToken) {
      return res.status(400).json({
        message: 'Platform, platformId, username, displayName, and accessToken are required'
      });
    }

    // Check if profile already exists
    const existingProfile = await SocialProfile.findOne({
      user: req.user.id,
      platform,
      platformId
    });

    if (existingProfile) {
      return res.status(400).json({
        message: 'This social media account is already connected'
      });
    }

    // Create new social profile
    const newProfile = new SocialProfile({
      user: req.user.id,
      platform,
      platformId,
      username,
      displayName,
      profilePicture: profilePicture || '',
      bio: bio || '',
      followerCount: followerCount || 0,
      followingCount: followingCount || 0,
      postCount: postCount || 0,
      isVerified: isVerified || false,
      accessToken,
      refreshToken,
      tokenExpiry: tokenExpiry ? new Date(tokenExpiry) : null,
      permissions: permissions || [],
      platformData: platformData || {}
    });

    await newProfile.save();

    // Return profile without sensitive tokens
    const profileResponse = newProfile.toObject();
    delete profileResponse.accessToken;
    delete profileResponse.refreshToken;

    res.status(201).json({
      message: 'Social media account connected successfully',
      profile: profileResponse
    });
  } catch (error) {
    console.error('Connect social profile error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   PUT /api/social-profiles/:id
// @desc    Update social profile settings
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      displayName,
      profilePicture,
      bio,
      settings,
      isActive
    } = req.body;

    const profile = await SocialProfile.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!profile) {
      return res.status(404).json({
        message: 'Social profile not found'
      });
    }

    // Update fields
    if (displayName) profile.displayName = displayName;
    if (profilePicture !== undefined) profile.profilePicture = profilePicture;
    if (bio !== undefined) profile.bio = bio;
    if (settings) profile.settings = { ...profile.settings, ...settings };
    if (isActive !== undefined) profile.isActive = isActive;

    await profile.save();

    // Return profile without sensitive tokens
    const profileResponse = profile.toObject();
    delete profileResponse.accessToken;
    delete profileResponse.refreshToken;

    res.json({
      message: 'Social profile updated successfully',
      profile: profileResponse
    });
  } catch (error) {
    console.error('Update social profile error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/social-profiles/:id
// @desc    Disconnect social media account
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const profile = await SocialProfile.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!profile) {
      return res.status(404).json({
        message: 'Social profile not found'
      });
    }

    await SocialProfile.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Social media account disconnected successfully'
    });
  } catch (error) {
    console.error('Disconnect social profile error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   POST /api/social-profiles/:id/refresh-token
// @desc    Refresh access token for social profile
// @access  Private
router.post('/:id/refresh-token', auth, async (req, res) => {
  try {
    const { accessToken, refreshToken, tokenExpiry } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        message: 'New access token is required'
      });
    }

    const profile = await SocialProfile.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!profile) {
      return res.status(404).json({
        message: 'Social profile not found'
      });
    }

    // Update tokens
    profile.accessToken = accessToken;
    if (refreshToken) profile.refreshToken = refreshToken;
    if (tokenExpiry) profile.tokenExpiry = new Date(tokenExpiry);
    profile.connectionStatus = 'connected';
    profile.errorMessage = '';

    await profile.save();

    res.json({
      message: 'Token refreshed successfully',
      connectionStatus: profile.connectionStatus
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   GET /api/social-profiles/:id/analytics
// @desc    Get analytics for specific social profile
// @access  Private
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    const profile = await SocialProfile.findOne({
      _id: req.params.id,
      user: req.user.id
    }).select('analytics platform username displayName');

    if (!profile) {
      return res.status(404).json({
        message: 'Social profile not found'
      });
    }

    res.json({
      platform: profile.platform,
      username: profile.username,
      displayName: profile.displayName,
      analytics: profile.analytics
    });
  } catch (error) {
    console.error('Get profile analytics error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   PUT /api/social-profiles/:id/analytics
// @desc    Update analytics for social profile
// @access  Private
router.put('/:id/analytics', auth, async (req, res) => {
  try {
    const { analyticsData } = req.body;

    if (!analyticsData) {
      return res.status(400).json({
        message: 'Analytics data is required'
      });
    }

    const profile = await SocialProfile.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!profile) {
      return res.status(404).json({
        message: 'Social profile not found'
      });
    }

    profile.updateAnalytics(analyticsData);
    await profile.save();

    res.json({
      message: 'Analytics updated successfully',
      analytics: profile.analytics
    });
  } catch (error) {
    console.error('Update analytics error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   GET /api/social-profiles/summary/stats
// @desc    Get summary statistics for all connected profiles
// @access  Private
router.get('/summary/stats', auth, async (req, res) => {
  try {
    const profiles = await SocialProfile.find({
      user: req.user.id,
      isActive: true
    });

    const stats = {
      totalProfiles: profiles.length,
      connectedProfiles: profiles.filter(p => p.connectionStatus === 'connected').length,
      totalFollowers: profiles.reduce((sum, p) => sum + (p.followerCount || 0), 0),
      totalReach: profiles.reduce((sum, p) => sum + (p.analytics.totalReach || 0), 0),
      totalEngagement: profiles.reduce((sum, p) => sum + (p.analytics.totalEngagement || 0), 0),
      averageEngagementRate: profiles.length > 0 
        ? profiles.reduce((sum, p) => sum + (p.analytics.averageEngagementRate || 0), 0) / profiles.length 
        : 0,
      platformBreakdown: {}
    };

    // Platform breakdown
    profiles.forEach(profile => {
      if (!stats.platformBreakdown[profile.platform]) {
        stats.platformBreakdown[profile.platform] = {
          count: 0,
          followers: 0,
          reach: 0,
          engagement: 0
        };
      }
      
      stats.platformBreakdown[profile.platform].count += 1;
      stats.platformBreakdown[profile.platform].followers += profile.followerCount || 0;
      stats.platformBreakdown[profile.platform].reach += profile.analytics.totalReach || 0;
      stats.platformBreakdown[profile.platform].engagement += profile.analytics.totalEngagement || 0;
    });

    res.json(stats);
  } catch (error) {
    console.error('Get profile stats error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

module.exports = router;
