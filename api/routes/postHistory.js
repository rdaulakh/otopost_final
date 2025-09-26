const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { generalLimiter: rateLimit } = require('../middleware/rateLimiter');

// Get post history with filtering and pagination
router.get('/', auth, rateLimit, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      platform, 
      dateFrom, 
      dateTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filter = { userId: req.user.id };
    if (status) filter.status = status;
    if (platform) filter.platforms = { $in: [platform] };
    if (search) {
      filter.$or = [
        { content: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Mock data for now - replace with actual database query
    const mockPosts = [
      {
        id: '1',
        title: 'Social Media Strategy 2024',
        content: 'Comprehensive guide to social media marketing...',
        platforms: ['twitter', 'linkedin', 'facebook'],
        status: 'published',
        publishedAt: '2024-09-15T10:00:00Z',
        createdAt: '2024-09-15T09:30:00Z',
        updatedAt: '2024-09-15T10:00:00Z',
        metrics: {
          views: 1247,
          likes: 89,
          shares: 23,
          comments: 12,
          engagement: 9.8
        },
        aiGenerated: true,
        aiModel: 'GPT-4',
        hashtags: ['#socialmedia', '#marketing', '#strategy'],
        mediaCount: 2
      },
      {
        id: '2',
        title: 'Product Launch Announcement',
        content: 'Excited to announce our latest product features...',
        platforms: ['twitter', 'instagram'],
        status: 'scheduled',
        scheduledFor: '2024-09-16T14:00:00Z',
        createdAt: '2024-09-15T08:15:00Z',
        updatedAt: '2024-09-15T08:15:00Z',
        metrics: {
          views: 0,
          likes: 0,
          shares: 0,
          comments: 0,
          engagement: 0
        },
        aiGenerated: false,
        hashtags: ['#product', '#launch', '#innovation'],
        mediaCount: 1
      }
    ];

    // Apply filtering and sorting
    let filteredPosts = mockPosts.filter(post => {
      if (status && post.status !== status) return false;
      if (platform && !post.platforms.includes(platform)) return false;
      if (search && !post.content.toLowerCase().includes(search.toLowerCase()) && 
          !post.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    // Sort posts
    filteredPosts.sort((a, b) => {
      const aVal = a[sortBy] || a.createdAt;
      const bVal = b[sortBy] || b.createdAt;
      return sortOrder === 'desc' ? new Date(bVal) - new Date(aVal) : new Date(aVal) - new Date(bVal);
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

    const totalPosts = filteredPosts.length;
    const totalPages = Math.ceil(totalPosts / limit);

    res.json({
      posts: paginatedPosts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      filters: {
        status,
        platform,
        dateFrom,
        dateTo,
        search
      }
    });
  } catch (error) {
    console.error('Get post history error:', error);
    res.status(500).json({ message: 'Failed to fetch post history' });
  }
});

// Get post history analytics
router.get('/analytics', auth, rateLimit, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;

    // Mock analytics data
    const analytics = {
      totalPosts: 156,
      publishedPosts: 134,
      scheduledPosts: 18,
      draftPosts: 4,
      totalViews: 45678,
      totalEngagement: 3456,
      avgEngagementRate: 7.6,
      topPlatforms: [
        { platform: 'twitter', posts: 67, engagement: 8.2 },
        { platform: 'linkedin', posts: 45, engagement: 9.1 },
        { platform: 'facebook', posts: 32, engagement: 6.8 },
        { platform: 'instagram', posts: 12, engagement: 12.3 }
      ],
      performanceTrends: [
        { date: '2024-09-09', posts: 5, views: 1234, engagement: 89 },
        { date: '2024-09-10', posts: 7, views: 1567, engagement: 123 },
        { date: '2024-09-11', posts: 4, views: 987, engagement: 67 },
        { date: '2024-09-12', posts: 6, views: 1456, engagement: 98 },
        { date: '2024-09-13', posts: 8, views: 1789, engagement: 145 },
        { date: '2024-09-14', posts: 5, views: 1234, engagement: 87 },
        { date: '2024-09-15', posts: 3, views: 876, engagement: 56 }
      ],
      contentTypes: [
        { type: 'text', count: 89, percentage: 57.1 },
        { type: 'image', count: 45, percentage: 28.8 },
        { type: 'video', count: 15, percentage: 9.6 },
        { type: 'carousel', count: 7, percentage: 4.5 }
      ]
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Get post analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch post analytics' });
  }
});

// Get single post details
router.get('/:postId', auth, rateLimit, async (req, res) => {
  try {
    const { postId } = req.params;

    // Mock post details
    const post = {
      id: postId,
      title: 'Social Media Strategy 2024',
      content: 'Comprehensive guide to social media marketing strategies for 2024...',
      platforms: ['twitter', 'linkedin', 'facebook'],
      status: 'published',
      publishedAt: '2024-09-15T10:00:00Z',
      createdAt: '2024-09-15T09:30:00Z',
      updatedAt: '2024-09-15T10:00:00Z',
      metrics: {
        views: 1247,
        likes: 89,
        shares: 23,
        comments: 12,
        engagement: 9.8,
        clickThroughRate: 3.2,
        reachRate: 15.6
      },
      aiGenerated: true,
      aiModel: 'GPT-4',
      aiPrompt: 'Create a comprehensive social media strategy post',
      hashtags: ['#socialmedia', '#marketing', '#strategy', '#2024'],
      mentions: ['@socialmediaexpert', '@marketingpro'],
      media: [
        {
          id: '1',
          type: 'image',
          url: '/api/media/strategy-infographic.jpg',
          altText: 'Social Media Strategy Infographic'
        },
        {
          id: '2',
          type: 'image', 
          url: '/api/media/engagement-chart.jpg',
          altText: 'Engagement Rate Chart'
        }
      ],
      platformSpecific: {
        twitter: {
          tweetId: '1234567890',
          retweets: 23,
          replies: 12
        },
        linkedin: {
          postId: 'abc123def456',
          reactions: 67,
          comments: 8
        },
        facebook: {
          postId: 'fb_987654321',
          reactions: 45,
          shares: 12
        }
      }
    };

    res.json({ post });
  } catch (error) {
    console.error('Get post details error:', error);
    res.status(500).json({ message: 'Failed to fetch post details' });
  }
});

// Delete post from history
router.delete('/:postId', auth, rateLimit, async (req, res) => {
  try {
    const { postId } = req.params;

    // Mock deletion - replace with actual database operation
    console.log(`Deleting post ${postId} for user ${req.user.id}`);

    res.json({ 
      message: 'Post deleted successfully',
      postId 
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

// Bulk delete posts
router.delete('/bulk', auth, rateLimit, async (req, res) => {
  try {
    const { postIds } = req.body;

    if (!postIds || !Array.isArray(postIds)) {
      return res.status(400).json({ message: 'Invalid post IDs provided' });
    }

    // Mock bulk deletion
    console.log(`Bulk deleting posts ${postIds.join(', ')} for user ${req.user.id}`);

    res.json({ 
      message: `Successfully deleted ${postIds.length} posts`,
      deletedCount: postIds.length
    });
  } catch (error) {
    console.error('Bulk delete posts error:', error);
    res.status(500).json({ message: 'Failed to delete posts' });
  }
});

// Export post history
router.get('/export/:format', auth, rateLimit, async (req, res) => {
  try {
    const { format } = req.params;
    const { dateFrom, dateTo, status, platform } = req.query;

    if (!['csv', 'json', 'xlsx'].includes(format)) {
      return res.status(400).json({ message: 'Invalid export format' });
    }

    // Mock export data
    const exportData = {
      exportId: `export_${Date.now()}`,
      format,
      filters: { dateFrom, dateTo, status, platform },
      recordCount: 156,
      downloadUrl: `/api/downloads/post-history-${Date.now()}.${format}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    res.json({ export: exportData });
  } catch (error) {
    console.error('Export post history error:', error);
    res.status(500).json({ message: 'Failed to export post history' });
  }
});

module.exports = router;
