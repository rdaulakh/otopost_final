const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

// Rate limiting for content management endpoints
const contentMgmtRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 200, // limit each IP to 200 requests per 5 minutes
  message: 'Too many content management requests from this IP'
});

router.use(contentMgmtRateLimit);
router.use(auth);
router.use(adminAuth);

// Generate mock content data for admin management
const generateMockContent = async () => {
  try {
    const users = await User.find().limit(50);
    const contentTypes = ['text', 'image', 'video', 'carousel'];
    const platforms = ['instagram', 'facebook', 'linkedin', 'twitter', 'tiktok', 'youtube'];
    const statuses = ['draft', 'pending', 'approved', 'published', 'rejected', 'scheduled'];
    
    const sampleTitles = [
      'Summer Marketing Campaign Launch',
      'Product Feature Announcement',
      'Behind the Scenes Content',
      'Customer Success Story',
      'Industry Insights and Trends',
      'Team Spotlight Feature',
      'Educational Tutorial Series',
      'Brand Partnership Announcement',
      'Event Coverage and Highlights',
      'User Generated Content Showcase',
      'Seasonal Promotion Campaign',
      'Company Culture Spotlight',
      'Product Demo and Tutorial',
      'Customer Testimonial Video',
      'Industry News Commentary'
    ];

    const sampleDescriptions = [
      'Engaging content designed to drive brand awareness and customer engagement across multiple social media platforms.',
      'High-quality visual content showcasing our latest product features and benefits to our target audience.',
      'Educational content that provides value to our community while establishing thought leadership in the industry.',
      'Behind-the-scenes content that humanizes our brand and builds authentic connections with our audience.',
      'Customer-focused content highlighting real success stories and testimonials from satisfied clients.'
    ];

    const content = [];
    for (let i = 1; i <= 100; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const createdAt = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
      const publishedAt = Math.random() > 0.5 ? new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
      
      content.push({
        id: `content_${i}`,
        title: sampleTitles[Math.floor(Math.random() * sampleTitles.length)],
        description: sampleDescriptions[Math.floor(Math.random() * sampleDescriptions.length)],
        content_type: contentType,
        status: status,
        platforms: platforms.slice(0, Math.floor(Math.random() * 3) + 1),
        author: {
          id: user._id,
          name: user.name || `User ${i}`,
          email: user.email || `user${i}@example.com`,
          avatar: `/api/placeholder/40/40`
        },
        created_at: createdAt.toISOString(),
        updated_at: new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        published_at: publishedAt ? publishedAt.toISOString() : null,
        scheduled_at: status === 'scheduled' ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        media: {
          images: contentType === 'image' || contentType === 'carousel' ? 
            Array.from({ length: contentType === 'carousel' ? Math.floor(Math.random() * 5) + 2 : 1 }, (_, j) => ({
              id: `img_${i}_${j}`,
              url: `/api/placeholder/600/400`,
              alt: `Content image ${j + 1}`,
              size: Math.floor(Math.random() * 500000) + 100000
            })) : [],
          videos: contentType === 'video' ? [{
            id: `vid_${i}`,
            url: `/api/placeholder/video/600/400`,
            thumbnail: `/api/placeholder/600/400`,
            duration: Math.floor(Math.random() * 300) + 30,
            size: Math.floor(Math.random() * 50000000) + 5000000
          }] : []
        },
        engagement: {
          likes: Math.floor(Math.random() * 1000),
          comments: Math.floor(Math.random() * 100),
          shares: Math.floor(Math.random() * 50),
          views: Math.floor(Math.random() * 5000) + 100,
          clicks: Math.floor(Math.random() * 200),
          saves: Math.floor(Math.random() * 150)
        },
        hashtags: Array.from({ length: Math.floor(Math.random() * 8) + 2 }, (_, j) => 
          `#${['marketing', 'business', 'growth', 'success', 'innovation', 'digital', 'social', 'brand'][j] || 'content'}`
        ),
        mentions: [],
        moderation: {
          flagged: Math.random() > 0.9,
          reviewed: Math.random() > 0.3,
          reviewer: Math.random() > 0.5 ? 'admin@platform.com' : null,
          review_date: Math.random() > 0.5 ? new Date().toISOString() : null,
          flags: Math.random() > 0.9 ? ['inappropriate', 'spam'] : []
        },
        analytics: {
          reach: Math.floor(Math.random() * 10000) + 500,
          impressions: Math.floor(Math.random() * 15000) + 1000,
          engagement_rate: Math.random() * 10 + 1,
          click_through_rate: Math.random() * 5,
          conversion_rate: Math.random() * 2
        },
        ai_generated: Math.random() > 0.6,
        ai_score: Math.random() * 100,
        sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)],
        tags: ['campaign', 'organic', 'promoted', 'evergreen'].filter(() => Math.random() > 0.5),
        version: 1,
        parent_id: null,
        workflow_stage: ['ideation', 'creation', 'review', 'approval', 'publishing'][Math.floor(Math.random() * 5)]
      });
    }
    
    return content;
  } catch (error) {
    console.error('Error generating mock content:', error);
    return [];
  }
};

// @route   GET /api/content-management/stats
// @desc    Get content statistics and metrics for admin
// @access  Admin
router.get('/stats', async (req, res) => {
  try {
    const content = await generateMockContent();
    
    // Calculate comprehensive statistics
    const stats = {
      total: content.length,
      published: content.filter(c => c.status === 'published').length,
      draft: content.filter(c => c.status === 'draft').length,
      pending: content.filter(c => c.status === 'pending').length,
      approved: content.filter(c => c.status === 'approved').length,
      rejected: content.filter(c => c.status === 'rejected').length,
      scheduled: content.filter(c => c.status === 'scheduled').length,
      flagged: content.filter(c => c.moderation.flagged).length,
      ai_generated: content.filter(c => c.ai_generated).length,
      
      // Content type distribution
      content_types: {
        text: content.filter(c => c.content_type === 'text').length,
        image: content.filter(c => c.content_type === 'image').length,
        video: content.filter(c => c.content_type === 'video').length,
        carousel: content.filter(c => c.content_type === 'carousel').length
      },
      
      // Platform distribution
      platform_distribution: {
        instagram: content.filter(c => c.platforms.includes('instagram')).length,
        facebook: content.filter(c => c.platforms.includes('facebook')).length,
        linkedin: content.filter(c => c.platforms.includes('linkedin')).length,
        twitter: content.filter(c => c.platforms.includes('twitter')).length,
        tiktok: content.filter(c => c.platforms.includes('tiktok')).length,
        youtube: content.filter(c => c.platforms.includes('youtube')).length
      },
      
      // Engagement metrics
      total_engagement: {
        likes: content.reduce((sum, c) => sum + c.engagement.likes, 0),
        comments: content.reduce((sum, c) => sum + c.engagement.comments, 0),
        shares: content.reduce((sum, c) => sum + c.engagement.shares, 0),
        views: content.reduce((sum, c) => sum + c.engagement.views, 0),
        clicks: content.reduce((sum, c) => sum + c.engagement.clicks, 0)
      },
      
      // Performance metrics
      avg_engagement_rate: content.reduce((sum, c) => sum + c.analytics.engagement_rate, 0) / content.length,
      avg_reach: content.reduce((sum, c) => sum + c.analytics.reach, 0) / content.length,
      avg_impressions: content.reduce((sum, c) => sum + c.analytics.impressions, 0) / content.length,
      
      // Recent activity
      created_today: content.filter(c => {
        const today = new Date();
        const contentDate = new Date(c.created_at);
        return contentDate.toDateString() === today.toDateString();
      }).length,
      
      published_this_week: content.filter(c => {
        if (!c.published_at) return false;
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return new Date(c.published_at) > weekAgo;
      }).length,
      
      // Moderation stats
      moderation: {
        pending_review: content.filter(c => !c.moderation.reviewed && c.status === 'pending').length,
        flagged_content: content.filter(c => c.moderation.flagged).length,
        reviewed_today: content.filter(c => {
          if (!c.moderation.review_date) return false;
          const today = new Date();
          const reviewDate = new Date(c.moderation.review_date);
          return reviewDate.toDateString() === today.toDateString();
        }).length
      },
      
      last_updated: new Date()
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Content management stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content statistics',
      error: error.message
    });
  }
});

// @route   GET /api/content-management/list
// @desc    Get content list with admin filtering and pagination
// @access  Admin
router.get('/list', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'all',
      content_type = 'all',
      platform = 'all',
      author = 'all',
      search = '',
      sortBy = 'created_at',
      sortOrder = 'desc',
      date_from,
      date_to,
      flagged_only = false,
      ai_generated_only = false
    } = req.query;

    let content = await generateMockContent();

    // Apply filters
    if (status !== 'all') {
      content = content.filter(c => c.status === status);
    }
    
    if (content_type !== 'all') {
      content = content.filter(c => c.content_type === content_type);
    }
    
    if (platform !== 'all') {
      content = content.filter(c => c.platforms.includes(platform));
    }
    
    if (author !== 'all') {
      content = content.filter(c => c.author.id === author);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      content = content.filter(c => 
        c.title.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower) ||
        c.hashtags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        c.author.name.toLowerCase().includes(searchLower)
      );
    }
    
    if (flagged_only === 'true') {
      content = content.filter(c => c.moderation.flagged);
    }
    
    if (ai_generated_only === 'true') {
      content = content.filter(c => c.ai_generated);
    }
    
    if (date_from) {
      content = content.filter(c => new Date(c.created_at) >= new Date(date_from));
    }
    
    if (date_to) {
      content = content.filter(c => new Date(c.created_at) <= new Date(date_to));
    }

    // Sort content
    content.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'created_at' || sortBy === 'updated_at' || sortBy === 'published_at') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      
      if (sortBy === 'engagement') {
        aValue = a.engagement.likes + a.engagement.comments + a.engagement.shares;
        bValue = b.engagement.likes + b.engagement.comments + b.engagement.shares;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedContent = content.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        content: paginatedContent,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(content.length / limit),
          total: content.length,
          limit: parseInt(limit)
        },
        filters: {
          status,
          content_type,
          platform,
          author,
          search,
          sortBy,
          sortOrder,
          date_from,
          date_to,
          flagged_only,
          ai_generated_only
        }
      }
    });

  } catch (error) {
    console.error('Content management list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content list',
      error: error.message
    });
  }
});

// @route   GET /api/content-management/:id
// @desc    Get specific content details for admin
// @access  Admin
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const content = await generateMockContent();
    const contentItem = content.find(c => c.id === id);

    if (!contentItem) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Add additional admin details
    contentItem.revision_history = [
      {
        version: 1,
        created_at: contentItem.created_at,
        author: contentItem.author.name,
        changes: 'Initial creation',
        status: 'draft'
      }
    ];

    contentItem.admin_notes = [
      {
        id: 1,
        author: 'admin@platform.com',
        note: 'Content reviewed and approved for publication',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        type: 'approval'
      }
    ];

    contentItem.compliance_check = {
      passed: true,
      checks: [
        { name: 'Copyright', status: 'passed', details: 'No copyright violations detected' },
        { name: 'Brand Guidelines', status: 'passed', details: 'Follows brand guidelines' },
        { name: 'Content Policy', status: 'passed', details: 'Complies with content policy' }
      ],
      last_checked: new Date().toISOString()
    };

    res.json({
      success: true,
      data: contentItem
    });

  } catch (error) {
    console.error('Content management details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content details',
      error: error.message
    });
  }
});

// @route   PUT /api/content-management/:id/approve
// @desc    Approve content (admin action)
// @access  Admin
router.put('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Approved by admin' } = req.body;

    res.json({
      success: true,
      message: 'Content approved successfully',
      data: {
        id,
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: req.user.email,
        approval_reason: reason
      }
    });

  } catch (error) {
    console.error('Content approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve content',
      error: error.message
    });
  }
});

// @route   PUT /api/content-management/:id/reject
// @desc    Reject content (admin action)
// @access  Admin
router.put('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Rejected by admin' } = req.body;

    res.json({
      success: true,
      message: 'Content rejected successfully',
      data: {
        id,
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: req.user.email,
        rejection_reason: reason
      }
    });

  } catch (error) {
    console.error('Content rejection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject content',
      error: error.message
    });
  }
});

// @route   DELETE /api/content-management/:id
// @desc    Delete content (admin action)
// @access  Admin
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Deleted by admin' } = req.body;

    res.json({
      success: true,
      message: 'Content deleted successfully',
      data: {
        id,
        deleted_at: new Date().toISOString(),
        deleted_by: req.user.email,
        deletion_reason: reason
      }
    });

  } catch (error) {
    console.error('Content deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete content',
      error: error.message
    });
  }
});

// @route   POST /api/content-management/bulk-action
// @desc    Perform bulk actions on content (admin)
// @access  Admin
router.post('/bulk-action', async (req, res) => {
  try {
    const { content_ids, action, reason = 'Bulk action by admin' } = req.body;

    if (!content_ids || !Array.isArray(content_ids) || content_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content IDs are required'
      });
    }

    if (!['approve', 'reject', 'delete', 'publish', 'unpublish', 'flag', 'unflag'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }

    res.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      data: {
        action,
        content_ids,
        processed_count: content_ids.length,
        processed_at: new Date().toISOString(),
        processed_by: req.user.email,
        reason
      }
    });

  } catch (error) {
    console.error('Bulk content action error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk action',
      error: error.message
    });
  }
});

// @route   POST /api/content-management/export
// @desc    Export content data (admin)
// @access  Admin
router.post('/export', async (req, res) => {
  try {
    const { format = 'csv', filters = {} } = req.body;

    if (!['csv', 'json', 'xlsx'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid export format'
      });
    }

    res.json({
      success: true,
      message: 'Content export initiated',
      data: {
        export_id: `export_${Date.now()}`,
        format,
        filters,
        status: 'processing',
        created_at: new Date().toISOString(),
        estimated_completion: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        download_url: `/api/content-management/exports/export_${Date.now()}.${format}`
      }
    });

  } catch (error) {
    console.error('Content export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export content',
      error: error.message
    });
  }
});

// @route   PUT /api/content-management/:id/moderate
// @desc    Moderate content (admin action)
// @access  Admin
router.put('/:id/moderate', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason = 'Moderated by admin', flags = [] } = req.body;

    if (!['flag', 'unflag', 'review', 'escalate'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid moderation action'
      });
    }

    res.json({
      success: true,
      message: `Content ${action} completed successfully`,
      data: {
        id,
        moderation_action: action,
        moderated_at: new Date().toISOString(),
        moderated_by: req.user.email,
        reason,
        flags: action === 'flag' ? flags : [],
        flagged: action === 'flag',
        reviewed: action === 'review'
      }
    });

  } catch (error) {
    console.error('Content moderation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to moderate content',
      error: error.message
    });
  }
});

// @route   GET /api/content-management/analytics/overview
// @desc    Get content analytics overview for admin
// @access  Admin
router.get('/analytics/overview', async (req, res) => {
  try {
    const { timeRange = '30d', contentType = 'all', platform = 'all' } = req.query;
    
    const content = await generateMockContent();
    
    // Filter content based on parameters
    let filteredContent = content;
    
    if (contentType !== 'all') {
      filteredContent = filteredContent.filter(c => c.content_type === contentType);
    }
    
    if (platform !== 'all') {
      filteredContent = filteredContent.filter(c => c.platforms.includes(platform));
    }
    
    // Generate comprehensive analytics
    const analytics = {
      overview: {
        total_content: filteredContent.length,
        total_engagement: filteredContent.reduce((sum, c) => 
          sum + c.engagement.likes + c.engagement.comments + c.engagement.shares, 0),
        total_reach: filteredContent.reduce((sum, c) => sum + c.analytics.reach, 0),
        total_impressions: filteredContent.reduce((sum, c) => sum + c.analytics.impressions, 0),
        avg_engagement_rate: filteredContent.reduce((sum, c) => sum + c.analytics.engagement_rate, 0) / filteredContent.length
      },
      
      top_performing: filteredContent
        .sort((a, b) => (b.engagement.likes + b.engagement.comments + b.engagement.shares) - 
                       (a.engagement.likes + a.engagement.comments + a.engagement.shares))
        .slice(0, 10),
      
      content_type_performance: {
        text: {
          count: filteredContent.filter(c => c.content_type === 'text').length,
          avg_engagement: filteredContent.filter(c => c.content_type === 'text')
            .reduce((sum, c) => sum + c.analytics.engagement_rate, 0) / 
            filteredContent.filter(c => c.content_type === 'text').length || 0
        },
        image: {
          count: filteredContent.filter(c => c.content_type === 'image').length,
          avg_engagement: filteredContent.filter(c => c.content_type === 'image')
            .reduce((sum, c) => sum + c.analytics.engagement_rate, 0) / 
            filteredContent.filter(c => c.content_type === 'image').length || 0
        },
        video: {
          count: filteredContent.filter(c => c.content_type === 'video').length,
          avg_engagement: filteredContent.filter(c => c.content_type === 'video')
            .reduce((sum, c) => sum + c.analytics.engagement_rate, 0) / 
            filteredContent.filter(c => c.content_type === 'video').length || 0
        }
      },
      
      platform_performance: {
        instagram: {
          count: filteredContent.filter(c => c.platforms.includes('instagram')).length,
          avg_engagement: filteredContent.filter(c => c.platforms.includes('instagram'))
            .reduce((sum, c) => sum + c.analytics.engagement_rate, 0) / 
            filteredContent.filter(c => c.platforms.includes('instagram')).length || 0
        },
        facebook: {
          count: filteredContent.filter(c => c.platforms.includes('facebook')).length,
          avg_engagement: filteredContent.filter(c => c.platforms.includes('facebook'))
            .reduce((sum, c) => sum + c.analytics.engagement_rate, 0) / 
            filteredContent.filter(c => c.platforms.includes('facebook')).length || 0
        },
        linkedin: {
          count: filteredContent.filter(c => c.platforms.includes('linkedin')).length,
          avg_engagement: filteredContent.filter(c => c.platforms.includes('linkedin'))
            .reduce((sum, c) => sum + c.analytics.engagement_rate, 0) / 
            filteredContent.filter(c => c.platforms.includes('linkedin')).length || 0
        }
      },
      
      moderation_stats: {
        flagged_content: filteredContent.filter(c => c.moderation.flagged).length,
        pending_review: filteredContent.filter(c => !c.moderation.reviewed && c.status === 'pending').length,
        ai_generated: filteredContent.filter(c => c.ai_generated).length,
        avg_ai_score: filteredContent.filter(c => c.ai_generated)
          .reduce((sum, c) => sum + c.ai_score, 0) / 
          filteredContent.filter(c => c.ai_generated).length || 0
      },
      
      timeRange,
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Content analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content analytics',
      error: error.message
    });
  }
});

module.exports = router;
