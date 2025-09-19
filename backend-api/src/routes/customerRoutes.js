const express = require('express');
const jwt = require('jsonwebtoken');
const UserClaude = require('../models/UserClaude');
const PostClaude = require('../models/PostClaude');
const router = express.Router();

// Middleware to authenticate requests
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await UserClaude.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Get dashboard overview
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    // Get post statistics
    const totalPosts = await PostClaude.countDocuments({ userId: user._id });
    const publishedPosts = await PostClaude.countDocuments({ 
      userId: user._id, 
      status: 'published' 
    });
    const scheduledPosts = await PostClaude.countDocuments({ 
      userId: user._id, 
      status: 'scheduled' 
    });
    const draftPosts = await PostClaude.countDocuments({ 
      userId: user._id, 
      status: 'draft' 
    });

    // Get recent posts
    const recentPosts = await PostClaude.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'username profile.displayName');

    // Calculate engagement metrics
    const posts = await PostClaude.find({ userId: user._id, status: 'published' });
    const totalEngagement = posts.reduce((sum, post) => {
      return sum + post.analytics.likes + post.analytics.comments + post.analytics.shares;
    }, 0);
    const totalImpressions = posts.reduce((sum, post) => sum + post.analytics.impressions, 0);
    const avgEngagementRate = posts.length > 0 ? 
      posts.reduce((sum, post) => sum + post.calculateEngagementRate(), 0) / posts.length : 0;

    // Get connected social accounts
    const connectedAccounts = user.profile.socialAccounts.filter(account => account.isActive);

    res.json({
      success: true,
      data: {
        user: {
          username: user.username,
          displayName: user.profile.displayName,
          avatar: user.profile.avatar,
          subscription: user.subscription
        },
        stats: {
          totalPosts,
          publishedPosts,
          scheduledPosts,
          draftPosts,
          totalEngagement,
          totalImpressions,
          avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
          connectedAccounts: connectedAccounts.length,
          aiCreditsUsed: user.stats.aiCreditsUsed,
          aiCreditsRemaining: user.subscription.features.aiCredits - user.stats.aiCreditsUsed
        },
        recentPosts,
        connectedAccounts: connectedAccounts.map(account => ({
          platform: account.platform,
          accountName: account.accountName,
          connectedAt: account.connectedAt
        }))
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load dashboard'
    });
  }
});

// Get all posts
router.get('/posts', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, platform } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { userId: req.user._id };
    if (status) query.status = status;
    if (platform) query['platforms.name'] = platform;

    const posts = await PostClaude.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'username profile.displayName');

    const total = await PostClaude.countDocuments(query);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get posts'
    });
  }
});

// Create new post
router.post('/posts', authenticate, async (req, res) => {
  try {
    const { content, platforms, scheduledFor, aiGenerated = false, aiPrompt } = req.body;

    if (!content || !content.text) {
      return res.status(400).json({
        success: false,
        error: 'Post content is required'
      });
    }

    if (!platforms || platforms.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one platform must be selected'
      });
    }

    // Check post limit
    const userPostCount = await PostClaude.countDocuments({ userId: req.user._id });
    if (userPostCount >= req.user.subscription.features.postsLimit && 
        req.user.subscription.features.postsLimit !== -1) {
      return res.status(403).json({
        success: false,
        error: 'Post limit reached. Please upgrade your plan.'
      });
    }

    // Create post
    const post = new PostClaude({
      userId: req.user._id,
      content,
      platforms: platforms.map(platform => ({
        name: platform,
        status: scheduledFor ? 'scheduled' : 'draft',
        scheduledTime: scheduledFor ? new Date(scheduledFor) : null
      })),
      status: scheduledFor ? 'scheduled' : 'draft',
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      aiGenerated,
      aiPrompt
    });

    await post.save();

    // Update user stats
    req.user.stats.totalPosts += 1;
    await req.user.save();

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post }
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create post'
    });
  }
});

// Get single post
router.get('/posts/:id', authenticate, async (req, res) => {
  try {
    const post = await PostClaude.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    }).populate('userId', 'username profile.displayName');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    res.json({
      success: true,
      data: { post }
    });

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get post'
    });
  }
});

// Update post
router.put('/posts/:id', authenticate, async (req, res) => {
  try {
    const post = await PostClaude.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['content', 'platforms', 'scheduledFor', 'status'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    Object.assign(post, updates);
    post.updatedAt = new Date();
    await post.save();

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: { post }
    });

  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update post'
    });
  }
});

// Delete post
router.delete('/posts/:id', authenticate, async (req, res) => {
  try {
    const post = await PostClaude.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Update user stats
    req.user.stats.totalPosts = Math.max(0, req.user.stats.totalPosts - 1);
    await req.user.save();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete post'
    });
  }
});

// Get analytics
router.get('/analytics', authenticate, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch(period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get posts in date range
    const posts = await PostClaude.find({
      userId: req.user._id,
      publishedAt: { $gte: startDate, $lte: now }
    });

    // Calculate metrics
    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum, post) => sum + post.analytics.likes, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.analytics.comments, 0);
    const totalShares = posts.reduce((sum, post) => sum + post.analytics.shares, 0);
    const totalImpressions = posts.reduce((sum, post) => sum + post.analytics.impressions, 0);
    const totalEngagement = totalLikes + totalComments + totalShares;
    const avgEngagementRate = totalImpressions > 0 ? (totalEngagement / totalImpressions) * 100 : 0;

    // Platform breakdown
    const platformStats = {};
    posts.forEach(post => {
      post.platforms.forEach(platform => {
        if (!platformStats[platform.name]) {
          platformStats[platform.name] = {
            posts: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            impressions: 0
          };
        }
        platformStats[platform.name].posts += 1;
        platformStats[platform.name].likes += post.analytics.likes;
        platformStats[platform.name].comments += post.analytics.comments;
        platformStats[platform.name].shares += post.analytics.shares;
        platformStats[platform.name].impressions += post.analytics.impressions;
      });
    });

    res.json({
      success: true,
      data: {
        period,
        dateRange: { startDate, endDate: now },
        overview: {
          totalPosts,
          totalLikes,
          totalComments,
          totalShares,
          totalImpressions,
          totalEngagement,
          avgEngagementRate: Math.round(avgEngagementRate * 100) / 100
        },
        platformStats,
        topPosts: posts
          .sort((a, b) => b.totalEngagement - a.totalEngagement)
          .slice(0, 5)
          .map(post => ({
            id: post._id,
            content: post.content.text.substring(0, 100) + '...',
            engagement: post.totalEngagement,
            publishedAt: post.publishedAt
          }))
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics'
    });
  }
});

module.exports = router;
