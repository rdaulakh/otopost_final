const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const socialMediaService = require('../services/socialMediaService');
const SocialProfile = require('../models/SocialProfile');
const Content = require('../models/Content');

// Rate limiting for social publishing endpoints
const publishingRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per windowMs
  message: 'Too many publishing requests from this IP'
});

// Apply rate limiting and auth to all routes
router.use(publishingRateLimit);
router.use(auth);

// @route   POST /api/social-publishing/publish
// @desc    Publish content to social media platforms
// @access  Private
router.post('/publish', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      content,
      platforms = [],
      scheduleTime = null,
      mediaUrls = [],
      hashtags = [],
      mentions = []
    } = req.body;

    if (!content || platforms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content and at least one platform are required'
      });
    }

    // Get user's connected social profiles
    const socialProfiles = await SocialProfile.find({
      userId,
      platform: { $in: platforms },
      isActive: true
    });

    if (socialProfiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No connected social profiles found for the specified platforms'
      });
    }

    const publishResults = [];
    const errors = [];

    // If scheduled, save for later processing
    if (scheduleTime && new Date(scheduleTime) > new Date()) {
      const scheduledContent = new Content({
        userId,
        title: content.substring(0, 100),
        content,
        platforms,
        mediaUrls,
        hashtags,
        mentions,
        scheduledAt: new Date(scheduleTime),
        status: 'scheduled',
        type: mediaUrls.length > 0 ? (mediaUrls[0].type || 'image') : 'text'
      });

      await scheduledContent.save();

      return res.json({
        success: true,
        message: 'Content scheduled successfully',
        data: {
          contentId: scheduledContent._id,
          scheduledAt: scheduleTime,
          platforms
        }
      });
    }

    // Publish immediately to each platform
    for (const profile of socialProfiles) {
      try {
        let publishResult;
        const platformContent = {
          text: content,
          mediaUrls,
          hashtags,
          mentions
        };

        switch (profile.platform.toLowerCase()) {
          case 'facebook':
            publishResult = await socialMediaService.publishToFacebook(
              profile.accessToken,
              profile.pageId,
              platformContent
            );
            break;

          case 'instagram':
            publishResult = await socialMediaService.publishToInstagram(
              profile.accessToken,
              profile.accountId,
              platformContent
            );
            break;

          case 'twitter':
            publishResult = await socialMediaService.publishToTwitter(
              profile.accessToken,
              profile.accessTokenSecret,
              platformContent
            );
            break;

          case 'linkedin':
            publishResult = await socialMediaService.publishToLinkedIn(
              profile.accessToken,
              profile.personId || profile.companyId,
              platformContent
            );
            break;

          case 'tiktok':
            publishResult = await socialMediaService.publishToTikTok(
              profile.accessToken,
              platformContent
            );
            break;

          case 'youtube':
            publishResult = await socialMediaService.publishToYouTube(
              profile.accessToken,
              platformContent
            );
            break;

          default:
            publishResult = {
              success: false,
              error: `Platform ${profile.platform} not supported`,
              platform: profile.platform
            };
        }

        if (publishResult.success) {
          publishResults.push({
            platform: profile.platform,
            postId: publishResult.postId,
            url: publishResult.url,
            success: true
          });

          // Update social profile with last post info
          profile.lastPostAt = new Date();
          profile.totalPosts = (profile.totalPosts || 0) + 1;
          await profile.save();
        } else {
          errors.push({
            platform: profile.platform,
            error: publishResult.error
          });
        }
      } catch (error) {
        console.error(`Publishing error for ${profile.platform}:`, error);
        errors.push({
          platform: profile.platform,
          error: error.message
        });
      }
    }

    // Save content record
    if (publishResults.length > 0) {
      const publishedContent = new Content({
        userId,
        title: content.substring(0, 100),
        content,
        platforms: publishResults.map(r => r.platform),
        mediaUrls,
        hashtags,
        mentions,
        publishedAt: new Date(),
        status: 'published',
        type: mediaUrls.length > 0 ? (mediaUrls[0].type || 'image') : 'text',
        socialPostIds: publishResults.reduce((acc, result) => {
          acc[result.platform] = result.postId;
          return acc;
        }, {})
      });

      await publishedContent.save();
    }

    const response = {
      success: publishResults.length > 0,
      message: publishResults.length > 0 
        ? `Content published to ${publishResults.length} platform(s)` 
        : 'Failed to publish to any platform',
      data: {
        published: publishResults,
        errors: errors,
        totalPlatforms: platforms.length,
        successfulPlatforms: publishResults.length
      }
    };

    res.status(publishResults.length > 0 ? 200 : 400).json(response);

  } catch (error) {
    console.error('Social publishing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish content',
      error: error.message
    });
  }
});

// @route   GET /api/social-publishing/analytics/:platform/:postId
// @desc    Get analytics for a specific post
// @access  Private
router.get('/analytics/:platform/:postId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { platform, postId } = req.params;

    // Get user's social profile for the platform
    const socialProfile = await SocialProfile.findOne({
      userId,
      platform: platform.toLowerCase(),
      isActive: true
    });

    if (!socialProfile) {
      return res.status(404).json({
        success: false,
        message: `No connected ${platform} profile found`
      });
    }

    let analytics;
    
    switch (platform.toLowerCase()) {
      case 'facebook':
        analytics = await socialMediaService.getFacebookAnalytics(
          socialProfile.accessToken,
          postId
        );
        break;

      case 'instagram':
        analytics = await socialMediaService.getInstagramAnalytics(
          socialProfile.accessToken,
          postId
        );
        break;

      case 'twitter':
        analytics = await socialMediaService.getTwitterAnalytics(
          socialProfile.accessToken,
          socialProfile.accessTokenSecret,
          postId
        );
        break;

      case 'linkedin':
        analytics = await socialMediaService.getLinkedInAnalytics(
          socialProfile.accessToken,
          postId
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: `Analytics not supported for ${platform}`
        });
    }

    if (!analytics.success) {
      return res.status(500).json({
        success: false,
        message: `Failed to fetch ${platform} analytics`,
        error: analytics.error
      });
    }

    res.json({
      success: true,
      data: {
        platform,
        postId,
        analytics: analytics.data,
        fetchedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
});

// @route   GET /api/social-publishing/scheduled
// @desc    Get scheduled posts
// @access  Private
router.get('/scheduled', async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 10,
      platform = 'all',
      startDate,
      endDate
    } = req.query;

    // Build query
    let query = {
      userId,
      status: 'scheduled',
      scheduledAt: { $gte: new Date() } // Only future scheduled posts
    };

    if (platform !== 'all') {
      query.platforms = { $in: [platform] };
    }

    if (startDate && endDate) {
      query.scheduledAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const scheduledPosts = await Content.find(query)
      .sort({ scheduledAt: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalCount = await Content.countDocuments(query);

    res.json({
      success: true,
      data: {
        posts: scheduledPosts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(totalCount / parseInt(limit)),
          total: totalCount,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Scheduled posts fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduled posts',
      error: error.message
    });
  }
});

// @route   PUT /api/social-publishing/scheduled/:id
// @desc    Update scheduled post
// @access  Private
router.put('/scheduled/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    const scheduledPost = await Content.findOne({
      _id: id,
      userId,
      status: 'scheduled'
    });

    if (!scheduledPost) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled post not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['content', 'scheduledAt', 'platforms', 'hashtags', 'mentions'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        scheduledPost[field] = updates[field];
      }
    });

    scheduledPost.updatedAt = new Date();
    await scheduledPost.save();

    res.json({
      success: true,
      message: 'Scheduled post updated successfully',
      data: scheduledPost
    });

  } catch (error) {
    console.error('Scheduled post update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update scheduled post',
      error: error.message
    });
  }
});

// @route   DELETE /api/social-publishing/scheduled/:id
// @desc    Cancel scheduled post
// @access  Private
router.delete('/scheduled/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const scheduledPost = await Content.findOneAndDelete({
      _id: id,
      userId,
      status: 'scheduled'
    });

    if (!scheduledPost) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled post not found'
      });
    }

    res.json({
      success: true,
      message: 'Scheduled post cancelled successfully'
    });

  } catch (error) {
    console.error('Scheduled post cancellation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel scheduled post',
      error: error.message
    });
  }
});

// @route   POST /api/social-publishing/test-connection/:platform
// @desc    Test social media platform connection
// @access  Private
router.post('/test-connection/:platform', async (req, res) => {
  try {
    const userId = req.user.id;
    const { platform } = req.params;

    const socialProfile = await SocialProfile.findOne({
      userId,
      platform: platform.toLowerCase(),
      isActive: true
    });

    if (!socialProfile) {
      return res.status(404).json({
        success: false,
        message: `No connected ${platform} profile found`
      });
    }

    let testResult;

    switch (platform.toLowerCase()) {
      case 'facebook':
        testResult = await socialMediaService.testFacebookConnection(
          socialProfile.accessToken,
          socialProfile.pageId
        );
        break;

      case 'instagram':
        testResult = await socialMediaService.testInstagramConnection(
          socialProfile.accessToken,
          socialProfile.accountId
        );
        break;

      case 'twitter':
        testResult = await socialMediaService.testTwitterConnection(
          socialProfile.accessToken,
          socialProfile.accessTokenSecret
        );
        break;

      case 'linkedin':
        testResult = await socialMediaService.testLinkedInConnection(
          socialProfile.accessToken
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: `Connection test not supported for ${platform}`
        });
    }

    // Update profile status based on test result
    socialProfile.isActive = testResult.success;
    socialProfile.lastTestedAt = new Date();
    if (!testResult.success) {
      socialProfile.errorMessage = testResult.error;
    } else {
      socialProfile.errorMessage = null;
    }
    await socialProfile.save();

    res.json({
      success: testResult.success,
      message: testResult.success 
        ? `${platform} connection is working` 
        : `${platform} connection failed`,
      data: {
        platform,
        connected: testResult.success,
        error: testResult.error,
        testedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Connection test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test connection',
      error: error.message
    });
  }
});

module.exports = router;
