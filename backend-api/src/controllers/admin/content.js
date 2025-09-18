const Content = require('../../models/Content');
const User = require('../../models/User');
const Organization = require('../../models/Organization');
const logger = require('../../utils/logger');

const adminContentController = {
  // Get all content with pagination and filters
  getAllContent: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        type = '',
        status = '',
        platform = '',
        organizationId = '',
        authorId = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        startDate = '',
        endDate = ''
      } = req.query;

      // Build query
      const query = {};
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }
      
      if (type) query.type = type;
      if (status) query.status = status;
      if (platform) query.platform = platform;
      if (organizationId) query.organizationId = organizationId;
      if (authorId) query.authorId = authorId;
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [content, total] = await Promise.all([
        Content.find(query)
          .populate('authorId', 'firstName lastName email username')
          .populate('organizationId', 'name subscription')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Content.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'content_list_viewed', 'content', null, {
        query: req.query,
        ip: req.ip
      });

      res.json({
        success: true,
        data: {
          content,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages
          }
        }
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminContent.getAllContent',
        adminId: req.admin._id,
        query: req.query,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get content',
        code: 'ADMIN_CONTENT_LIST_ERROR'
      });
    }
  },

  // Get content statistics
  getContentStats: async (req, res) => {
    try {
      const { timeRange = '30d', startDate = '', endDate = '' } = req.query;

      // Calculate date range
      const end = new Date();
      let start;
      
      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
      } else {
        switch (timeRange) {
          case '7d':
            start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '90d':
            start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case '1y':
            start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
      }

      const [
        totalContent,
        publishedContent,
        draftContent,
        scheduledContent,
        contentByType,
        contentByPlatform,
        contentByStatus,
        engagementStats
      ] = await Promise.all([
        Content.countDocuments({ createdAt: { $gte: start, $lte: end } }),
        Content.countDocuments({ 
          createdAt: { $gte: start, $lte: end },
          status: 'published'
        }),
        Content.countDocuments({ 
          createdAt: { $gte: start, $lte: end },
          status: 'draft'
        }),
        Content.countDocuments({ 
          createdAt: { $gte: start, $lte: end },
          status: 'scheduled'
        }),
        Content.aggregate([
          {
            $match: { createdAt: { $gte: start, $lte: end } }
          },
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 }
            }
          }
        ]),
        Content.aggregate([
          {
            $match: { createdAt: { $gte: start, $lte: end } }
          },
          {
            $group: {
              _id: '$platform',
              count: { $sum: 1 }
            }
          }
        ]),
        Content.aggregate([
          {
            $match: { createdAt: { $gte: start, $lte: end } }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]),
        Content.aggregate([
          {
            $match: { 
              createdAt: { $gte: start, $lte: end },
              status: 'published'
            }
          },
          {
            $group: {
              _id: null,
              totalEngagement: { $sum: '$analytics.totalEngagement' },
              totalImpressions: { $sum: '$analytics.impressions' },
              totalLikes: { $sum: '$analytics.likes' },
              totalShares: { $sum: '$analytics.shares' },
              totalComments: { $sum: '$analytics.comments' }
            }
          }
        ])
      ]);

      const stats = {
        overview: {
          total: totalContent,
          published: publishedContent,
          draft: draftContent,
          scheduled: scheduledContent
        },
        byType: contentByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byPlatform: contentByPlatform.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byStatus: contentByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        engagement: engagementStats[0] || {
          totalEngagement: 0,
          totalImpressions: 0,
          totalLikes: 0,
          totalShares: 0,
          totalComments: 0
        },
        period: { start, end }
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminContent.getContentStats',
        adminId: req.admin._id,
        query: req.query,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get content statistics',
        code: 'ADMIN_CONTENT_STATS_ERROR'
      });
    }
  },

  // Get content by ID
  getContentById: async (req, res) => {
    try {
      const { id } = req.params;

      const content = await Content.findById(id)
        .populate('authorId', 'firstName lastName email username')
        .populate('organizationId', 'name subscription');

      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found',
          code: 'CONTENT_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        data: { content }
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminContent.getContentById',
        adminId: req.admin._id,
        contentId: req.params.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get content',
        code: 'ADMIN_CONTENT_GET_ERROR'
      });
    }
  },

  // Get content analytics
  getContentAnalytics: async (req, res) => {
    try {
      const { id } = req.params;
      const { timeRange = '30d' } = req.query;

      const content = await Content.findById(id);
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found',
          code: 'CONTENT_NOT_FOUND'
        });
      }

      // For now, return basic analytics
      // In a real implementation, you would have more detailed analytics
      const analytics = {
        views: content.analytics?.views || 0,
        likes: content.analytics?.likes || 0,
        shares: content.analytics?.shares || 0,
        comments: content.analytics?.comments || 0,
        engagement: content.analytics?.totalEngagement || 0,
        impressions: content.analytics?.impressions || 0
      };

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminContent.getContentAnalytics',
        adminId: req.admin._id,
        contentId: req.params.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get content analytics',
        code: 'ADMIN_CONTENT_ANALYTICS_ERROR'
      });
    }
  },

  // Update content status
  updateContentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const content = await Content.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).populate('authorId', 'firstName lastName email');

      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found',
          code: 'CONTENT_NOT_FOUND'
        });
      }

      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'content_status_updated', 'content', id, {
        status,
        ip: req.ip
      });

      res.json({
        success: true,
        data: { content }
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminContent.updateContentStatus',
        adminId: req.admin._id,
        contentId: req.params.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to update content status',
        code: 'ADMIN_CONTENT_STATUS_UPDATE_ERROR'
      });
    }
  },

  // Moderate content
  moderateContent: async (req, res) => {
    try {
      const { id } = req.params;
      const { action, reason, notes } = req.body;

      const content = await Content.findById(id);
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found',
          code: 'CONTENT_NOT_FOUND'
        });
      }

      // Update content based on moderation action
      const updateData = {
        moderation: {
          status: action,
          reason,
          notes,
          moderatedBy: req.admin._id,
          moderatedAt: new Date()
        }
      };

      if (action === 'approved') {
        updateData.status = 'published';
      } else if (action === 'rejected') {
        updateData.status = 'rejected';
      }

      const updatedContent = await Content.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).populate('authorId', 'firstName lastName email');

      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'content_moderated', 'content', id, {
        action,
        reason,
        ip: req.ip
      });

      res.json({
        success: true,
        data: { content: updatedContent }
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminContent.moderateContent',
        adminId: req.admin._id,
        contentId: req.params.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to moderate content',
        code: 'ADMIN_CONTENT_MODERATION_ERROR'
      });
    }
  },

  // Delete content
  deleteContent: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const content = await Content.findByIdAndDelete(id);
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found',
          code: 'CONTENT_NOT_FOUND'
        });
      }

      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'content_deleted', 'content', id, {
        reason,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Content deleted successfully'
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminContent.deleteContent',
        adminId: req.admin._id,
        contentId: req.params.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to delete content',
        code: 'ADMIN_CONTENT_DELETE_ERROR'
      });
    }
  },

  // Get content performance overview
  getContentPerformance: async (req, res) => {
    try {
      const { timeRange = '30d', platform = '', type = '' } = req.query;

      // Calculate date range
      const end = new Date();
      let start;
      switch (timeRange) {
        case '7d':
          start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const matchQuery = {
        createdAt: { $gte: start, $lte: end },
        status: 'published'
      };

      if (platform) matchQuery.platform = platform;
      if (type) matchQuery.type = type;

      const performance = await Content.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalContent: { $sum: 1 },
            totalEngagement: { $sum: '$analytics.totalEngagement' },
            totalImpressions: { $sum: '$analytics.impressions' },
            totalLikes: { $sum: '$analytics.likes' },
            totalShares: { $sum: '$analytics.shares' },
            totalComments: { $sum: '$analytics.comments' },
            avgEngagement: { $avg: '$analytics.totalEngagement' },
            avgImpressions: { $avg: '$analytics.impressions' }
          }
        }
      ]);

      res.json({
        success: true,
        data: performance[0] || {
          totalContent: 0,
          totalEngagement: 0,
          totalImpressions: 0,
          totalLikes: 0,
          totalShares: 0,
          totalComments: 0,
          avgEngagement: 0,
          avgImpressions: 0
        }
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminContent.getContentPerformance',
        adminId: req.admin._id,
        query: req.query,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get content performance',
        code: 'ADMIN_CONTENT_PERFORMANCE_ERROR'
      });
    }
  },

  // Get trending content
  getTrendingContent: async (req, res) => {
    try {
      const { timeRange = '7d', limit = 20, platform = '' } = req.query;

      // Calculate date range
      const end = new Date();
      let start;
      switch (timeRange) {
        case '24h':
          start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      const matchQuery = {
        createdAt: { $gte: start, $lte: end },
        status: 'published'
      };

      if (platform) matchQuery.platform = platform;

      const trending = await Content.find(matchQuery)
        .populate('authorId', 'firstName lastName username')
        .populate('organizationId', 'name')
        .sort({ 'analytics.totalEngagement': -1 })
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: trending
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminContent.getTrendingContent',
        adminId: req.admin._id,
        query: req.query,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get trending content',
        code: 'ADMIN_CONTENT_TRENDING_ERROR'
      });
    }
  },

  // Get content by platform
  getContentByPlatform: async (req, res) => {
    try {
      const { platform } = req.params;
      const { page = 1, limit = 10, status = '' } = req.query;

      const query = { platform };
      if (status) query.status = status;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [content, total] = await Promise.all([
        Content.find(query)
          .populate('authorId', 'firstName lastName email username')
          .populate('organizationId', 'name subscription')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Content.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: {
          content,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages
          }
        }
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminContent.getContentByPlatform',
        adminId: req.admin._id,
        platform: req.params.platform,
        query: req.query,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get platform content',
        code: 'ADMIN_CONTENT_PLATFORM_ERROR'
      });
    }
  },

  // Search content
  searchContent: async (req, res) => {
    try {
      const { q, limit = 20, type = '', platform = '' } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required',
          code: 'SEARCH_QUERY_REQUIRED'
        });
      }

      const query = {
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { content: { $regex: q, $options: 'i' } },
          { tags: { $in: [new RegExp(q, 'i')] } }
        ]
      };

      if (type) query.type = type;
      if (platform) query.platform = platform;

      const content = await Content.find(query)
        .populate('authorId', 'firstName lastName username')
        .populate('organizationId', 'name')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: { content }
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'adminContent.searchContent',
        adminId: req.admin._id,
        query: req.query,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to search content',
        code: 'ADMIN_CONTENT_SEARCH_ERROR'
      });
    }
  },

  // Export content
  exportContent: async (req, res) => {
    try {
      const { format = 'csv', filters = {} } = req.query;

      // Build query from filters
      const query = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) query[key] = value;
      });

      const content = await Content.find(query)
        .populate('authorId', 'firstName lastName email')
        .populate('organizationId', 'name')
        .sort({ createdAt: -1 });

      // Convert to CSV format
      const csvData = content.map(item => ({
        ID: item._id,
        Title: item.title,
        Type: item.type,
        Platform: item.platform,
        Status: item.status,
        Author: item.authorId ? `${item.authorId.firstName} ${item.authorId.lastName}` : 'N/A',
        Organization: item.organizationId?.name || 'N/A',
        CreatedAt: item.createdAt,
        PublishedAt: item.publishedAt,
        Views: item.analytics?.views || 0,
        Likes: item.analytics?.likes || 0,
        Shares: item.analytics?.shares || 0,
        Comments: item.analytics?.comments || 0
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=content-export.csv');
      
      // Simple CSV conversion
      const csv = [
        Object.keys(csvData[0] || {}).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      res.send(csv);

    } catch (error) {
      logger.logError(error, {
        controller: 'adminContent.exportContent',
        adminId: req.admin._id,
        query: req.query,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to export content',
        code: 'ADMIN_CONTENT_EXPORT_ERROR'
      });
    }
  }
};

module.exports = adminContentController;
