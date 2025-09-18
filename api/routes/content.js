const express = require('express');
const Content = require('../models/Content');
const { auth, checkSubscription } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/content
// @desc    Get all content for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, platform, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    const query = { user: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    if (platform) {
      query['platforms.platform'] = platform;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get content with pagination
    const content = await Content.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email')
      .populate('campaign', 'name');

    // Get total count for pagination
    const total = await Content.countDocuments(query);

    res.json({
      content,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   GET /api/content/:id
// @desc    Get specific content by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const content = await Content.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('user', 'name email')
      .populate('campaign', 'name');

    if (!content) {
      return res.status(404).json({
        message: 'Content not found'
      });
    }

    res.json(content);
  } catch (error) {
    console.error('Get content by ID error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   POST /api/content
// @desc    Create new content
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      content,
      media,
      platforms,
      postType,
      tags,
      campaign,
      scheduling,
      aiGenerated
    } = req.body;

    // Validation
    if (!title || !content?.text || !platforms || platforms.length === 0) {
      return res.status(400).json({
        message: 'Title, content text, and at least one platform are required'
      });
    }

    // Create new content
    const newContent = new Content({
      user: req.user.id,
      title,
      content,
      media: media || [],
      platforms: platforms.map(platform => ({
        ...platform,
        status: platform.scheduledFor ? 'scheduled' : 'draft'
      })),
      postType: postType || 'text',
      tags: tags || [],
      campaign,
      scheduling: scheduling || {},
      aiGenerated: aiGenerated || { isAIGenerated: false }
    });

    await newContent.save();

    res.status(201).json({
      message: 'Content created successfully',
      content: newContent
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   PUT /api/content/:id
// @desc    Update content
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      title,
      content,
      media,
      platforms,
      postType,
      tags,
      campaign,
      scheduling,
      status
    } = req.body;

    const existingContent = await Content.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!existingContent) {
      return res.status(404).json({
        message: 'Content not found'
      });
    }

    // Check if content is already published
    if (existingContent.status === 'published' && status !== 'archived') {
      return res.status(400).json({
        message: 'Cannot edit published content. You can only archive it.'
      });
    }

    // Update fields
    if (title) existingContent.title = title;
    if (content) existingContent.content = { ...existingContent.content, ...content };
    if (media) existingContent.media = media;
    if (platforms) existingContent.platforms = platforms;
    if (postType) existingContent.postType = postType;
    if (tags) existingContent.tags = tags;
    if (campaign !== undefined) existingContent.campaign = campaign;
    if (scheduling) existingContent.scheduling = { ...existingContent.scheduling, ...scheduling };
    if (status) existingContent.status = status;

    await existingContent.save();

    res.json({
      message: 'Content updated successfully',
      content: existingContent
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/content/:id
// @desc    Delete content
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const content = await Content.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!content) {
      return res.status(404).json({
        message: 'Content not found'
      });
    }

    // Check if content is published
    if (content.status === 'published') {
      return res.status(400).json({
        message: 'Cannot delete published content. Archive it instead.'
      });
    }

    await Content.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   POST /api/content/:id/approve
// @desc    Approve content for publishing
// @access  Private
router.post('/:id/approve', auth, async (req, res) => {
  try {
    const { feedback } = req.body;

    const content = await Content.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!content) {
      return res.status(404).json({
        message: 'Content not found'
      });
    }

    content.approval = {
      status: 'approved',
      approvedBy: req.user.id,
      approvedAt: new Date(),
      feedback: feedback || ''
    };

    await content.save();

    res.json({
      message: 'Content approved successfully',
      content
    });
  } catch (error) {
    console.error('Approve content error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   POST /api/content/:id/reject
// @desc    Reject content
// @access  Private
router.post('/:id/reject', auth, async (req, res) => {
  try {
    const { feedback } = req.body;

    if (!feedback) {
      return res.status(400).json({
        message: 'Feedback is required when rejecting content'
      });
    }

    const content = await Content.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!content) {
      return res.status(404).json({
        message: 'Content not found'
      });
    }

    content.approval = {
      status: 'rejected',
      approvedBy: req.user.id,
      approvedAt: new Date(),
      feedback
    };

    await content.save();

    res.json({
      message: 'Content rejected',
      content
    });
  } catch (error) {
    console.error('Reject content error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   GET /api/content/scheduled/upcoming
// @desc    Get upcoming scheduled content
// @access  Private
router.get('/scheduled/upcoming', auth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days));

    const scheduledContent = await Content.find({
      user: req.user.id,
      'platforms.status': 'scheduled',
      'platforms.scheduledFor': {
        $gte: new Date(),
        $lte: endDate
      }
    }).sort({ 'platforms.scheduledFor': 1 });

    res.json(scheduledContent);
  } catch (error) {
    console.error('Get scheduled content error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   GET /api/content/analytics/summary
// @desc    Get content analytics summary
// @access  Private
router.get('/analytics/summary', auth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const analytics = await Content.aggregate([
      {
        $match: {
          user: req.user.id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalViews: { $sum: '$analytics.views' },
          totalLikes: { $sum: '$analytics.likes' },
          totalShares: { $sum: '$analytics.shares' },
          totalComments: { $sum: '$analytics.comments' },
          totalReach: { $sum: '$analytics.reach' },
          totalImpressions: { $sum: '$analytics.impressions' },
          avgEngagementRate: { $avg: '$analytics.engagement.rate' }
        }
      }
    ]);

    const summary = analytics[0] || {
      totalPosts: 0,
      totalViews: 0,
      totalLikes: 0,
      totalShares: 0,
      totalComments: 0,
      totalReach: 0,
      totalImpressions: 0,
      avgEngagementRate: 0
    };

    res.json(summary);
  } catch (error) {
    console.error('Get analytics summary error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

module.exports = router;
