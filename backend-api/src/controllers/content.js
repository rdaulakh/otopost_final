const Content = require('../models/Content');
const AIAgent = require('../models/AIAgent');
const logger = require('../utils/logger');
const redisConnection = require('../config/redis');

const contentController = {
  // Create new content
  create: async (req, res) => {
    try {
      const {
        title,
        description,
        type,
        category,
        content,
        platforms,
        scheduledAt,
        campaign,
        tags
      } = req.body;
      
      // Check subscription limits
      const organization = req.organization;
      const currentUsage = await Content.countDocuments({
        organizationId: organization._id,
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      });
      
      if (currentUsage >= organization.subscription.features.monthlyPosts.included) {
        return res.status(402).json({
          success: false,
          message: 'Monthly post limit reached',
          code: 'POST_LIMIT_REACHED',
          limit: organization.subscription.features.monthlyPosts.included,
          current: currentUsage
        });
      }
      
      // Create content
      const newContent = new Content({
        title,
        description,
        type,
        category,
        content,
        organizationId: organization._id,
        userId: req.user._id,
        platforms: platforms.map(platform => ({
          platform,
          status: scheduledAt ? 'scheduled' : 'draft',
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null
        })),
        campaign,
        tags,
        status: 'draft'
      });
      
      await newContent.save();
      
      // Update organization usage
      organization.subscription.usage.currentPeriod.posts += 1;
      await organization.save();
      
      // Log content creation
      logger.logUserActivity(req.user._id, 'content_created', {
        contentId: newContent._id,
        type,
        platforms,
        ip: req.ip
      });
      
      res.status(201).json({
        success: true,
        message: 'Content created successfully',
        data: {
          content: newContent
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'content.create',
        userId: req.user._id,
        body: req.body,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to create content',
        code: 'CONTENT_CREATE_ERROR'
      });
    }
  },
  
  // Get content list with filters and pagination
  getList: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        type,
        category,
        platform,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;
      
      const skip = (page - 1) * limit;
      const organizationId = req.organization._id;
      
      // Build query
      const query = { organizationId };
      
      if (status) query.status = status;
      if (type) query.type = type;
      if (category) query.category = category;
      if (platform) query['platforms.platform'] = platform;
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'content.text': { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }
      
      // Execute query
      const [contents, total] = await Promise.all([
        Content.find(query)
          .populate('userId', 'firstName lastName email')
          .populate('approval.approvedBy', 'firstName lastName')
          .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Content.countDocuments(query)
      ]);
      
      res.json({
        success: true,
        data: {
          contents,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'content.getList',
        userId: req.user._id,
        query: req.query,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get content list',
        code: 'CONTENT_LIST_ERROR'
      });
    }
  },
  
  // Get single content by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const content = await Content.findOne({
        _id: id,
        organizationId: req.organization._id
      })
        .populate('userId', 'firstName lastName email profilePicture')
        .populate('approval.approvedBy', 'firstName lastName')
        .populate('approval.rejectedBy', 'firstName lastName')
        .populate('collaboration.assignedTo.userId', 'firstName lastName email')
        .populate('collaboration.comments.userId', 'firstName lastName profilePicture');
      
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found',
          code: 'CONTENT_NOT_FOUND'
        });
      }
      
      res.json({
        success: true,
        data: {
          content
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'content.getById',
        userId: req.user._id,
        contentId: req.params.id,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get content',
        code: 'CONTENT_GET_ERROR'
      });
    }
  },
  
  // Update content
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const content = await Content.findOne({
        _id: id,
        organizationId: req.organization._id
      });
      
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found',
          code: 'CONTENT_NOT_FOUND'
        });
      }
      
      // Check permissions
      if (content.userId.toString() !== req.user._id.toString() && 
          !req.user.hasPermission('content.update')) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to update this content',
          code: 'PERMISSION_DENIED'
        });
      }
      
      // Create version if content is being modified
      if (updates.content || updates.title) {
        await content.addVersion(
          { title: content.title, content: content.content },
          req.user._id,
          'Content updated'
        );
      }
      
      // Update content
      Object.assign(content, updates);
      await content.save();
      
      // Log content update
      logger.logUserActivity(req.user._id, 'content_updated', {
        contentId: content._id,
        updatedFields: Object.keys(updates),
        ip: req.ip
      });
      
      res.json({
        success: true,
        message: 'Content updated successfully',
        data: {
          content
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'content.update',
        userId: req.user._id,
        contentId: req.params.id,
        body: req.body,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to update content',
        code: 'CONTENT_UPDATE_ERROR'
      });
    }
  },
  
  // Delete content
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      const content = await Content.findOne({
        _id: id,
        organizationId: req.organization._id
      });
      
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found',
          code: 'CONTENT_NOT_FOUND'
        });
      }
      
      // Check permissions
      if (content.userId.toString() !== req.user._id.toString() && 
          !req.user.hasPermission('content.delete')) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to delete this content',
          code: 'PERMISSION_DENIED'
        });
      }
      
      // Soft delete
      content.status = 'deleted';
      content.deletedAt = new Date();
      await content.save();
      
      // Log content deletion
      logger.logUserActivity(req.user._id, 'content_deleted', {
        contentId: content._id,
        title: content.title,
        ip: req.ip
      });
      
      res.json({
        success: true,
        message: 'Content deleted successfully'
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'content.delete',
        userId: req.user._id,
        contentId: req.params.id,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to delete content',
        code: 'CONTENT_DELETE_ERROR'
      });
    }
  },
  
  // Schedule content for publishing
  schedule: async (req, res) => {
    try {
      const { id } = req.params;
      const { scheduledAt, platforms, timezone = 'UTC' } = req.body;
      
      const content = await Content.findOne({
        _id: id,
        organizationId: req.organization._id
      });
      
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found',
          code: 'CONTENT_NOT_FOUND'
        });
      }
      
      // Check if content is approved
      if (content.approval.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Content must be approved before scheduling',
          code: 'CONTENT_NOT_APPROVED'
        });
      }
      
      // Update platform scheduling
      const scheduleDate = new Date(scheduledAt);
      platforms.forEach(platform => {
        const platformIndex = content.platforms.findIndex(p => p.platform === platform);
        if (platformIndex !== -1) {
          content.platforms[platformIndex].status = 'scheduled';
          content.platforms[platformIndex].scheduledAt = scheduleDate;
        }
      });
      
      content.scheduling.timezone = timezone;
      content.status = 'scheduled';
      
      await content.save();
      
      // Add to scheduling queue in Redis
      const scheduleKey = `schedule:${scheduleDate.getTime()}:${content._id}`;
      await redisConnection.setex(scheduleKey, 86400, JSON.stringify({
        contentId: content._id,
        platforms,
        scheduledAt: scheduleDate
      }));
      
      // Log content scheduling
      logger.logUserActivity(req.user._id, 'content_scheduled', {
        contentId: content._id,
        scheduledAt: scheduleDate,
        platforms,
        ip: req.ip
      });
      
      res.json({
        success: true,
        message: 'Content scheduled successfully',
        data: {
          scheduledAt: scheduleDate,
          platforms,
          timezone
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'content.schedule',
        userId: req.user._id,
        contentId: req.params.id,
        body: req.body,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to schedule content',
        code: 'CONTENT_SCHEDULE_ERROR'
      });
    }
  },
  
  // Approve or reject content
  approve: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      
      // Check approval permissions
      if (!req.user.hasPermission('content.approve')) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to approve content',
          code: 'PERMISSION_DENIED'
        });
      }
      
      const content = await Content.findOne({
        _id: id,
        organizationId: req.organization._id
      });
      
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found',
          code: 'CONTENT_NOT_FOUND'
        });
      }
      
      // Add approval history
      content.addApprovalHistory(status, req.user._id, notes);
      
      if (status === 'rejected' && notes) {
        content.approval.rejectionReason = notes;
      }
      
      if (status === 'revision_requested' && notes) {
        content.approval.revisionNotes = notes;
      }
      
      await content.save();
      
      // Log approval action
      logger.logUserActivity(req.user._id, 'content_approval', {
        contentId: content._id,
        action: status,
        notes,
        ip: req.ip
      });
      
      res.json({
        success: true,
        message: `Content ${status} successfully`,
        data: {
          approval: content.approval
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'content.approve',
        userId: req.user._id,
        contentId: req.params.id,
        body: req.body,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to process approval',
        code: 'CONTENT_APPROVAL_ERROR'
      });
    }
  },
  
  // Add comment to content
  addComment: async (req, res) => {
    try {
      const { id } = req.params;
      const { text } = req.body;
      
      const content = await Content.findOne({
        _id: id,
        organizationId: req.organization._id
      });
      
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found',
          code: 'CONTENT_NOT_FOUND'
        });
      }
      
      // Add comment
      await content.addComment(req.user._id, text);
      
      // Populate the new comment
      await content.populate('collaboration.comments.userId', 'firstName lastName profilePicture');
      
      const newComment = content.collaboration.comments[content.collaboration.comments.length - 1];
      
      // Log comment addition
      logger.logUserActivity(req.user._id, 'content_comment_added', {
        contentId: content._id,
        commentText: text,
        ip: req.ip
      });
      
      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: {
          comment: newComment
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'content.addComment',
        userId: req.user._id,
        contentId: req.params.id,
        body: req.body,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to add comment',
        code: 'COMMENT_ADD_ERROR'
      });
    }
  },
  
  // Generate content using AI
  generateWithAI: async (req, res) => {
    try {
      const {
        type,
        platform,
        topic,
        tone,
        length,
        keywords,
        targetAudience
      } = req.body;
      
      // Check AI generation limits
      const organization = req.organization;
      const currentUsage = organization.subscription.usage.currentPeriod.aiGenerations;
      
      if (currentUsage >= organization.subscription.features.aiGenerations.included) {
        return res.status(402).json({
          success: false,
          message: 'AI generation limit reached',
          code: 'AI_LIMIT_REACHED',
          limit: organization.subscription.features.aiGenerations.included,
          current: currentUsage
        });
      }
      
      // Find appropriate AI agent
      const contentAgent = await AIAgent.findOne({
        type: 'content_agent',
        $or: [
          { 'organizationSpecific.organizationId': organization._id },
          { 'organizationSpecific.organizationId': null }
        ],
        isEnabled: true,
        status: 'active'
      });
      
      if (!contentAgent) {
        return res.status(503).json({
          success: false,
          message: 'AI content generation service unavailable',
          code: 'AI_SERVICE_UNAVAILABLE'
        });
      }
      
      // Add task to AI agent queue
      const taskId = contentAgent.addTask('content_generation', {
        type,
        platform,
        topic,
        tone,
        length,
        keywords,
        targetAudience,
        organizationId: organization._id,
        userId: req.user._id
      }, 7); // High priority
      
      await contentAgent.save();
      
      // Update AI generation usage
      organization.subscription.usage.currentPeriod.aiGenerations += 1;
      await organization.save();
      
      // Log AI generation request
      logger.logUserActivity(req.user._id, 'ai_content_generated', {
        taskId,
        type,
        platform,
        topic,
        ip: req.ip
      });
      
      res.status(202).json({
        success: true,
        message: 'AI content generation started',
        data: {
          taskId,
          estimatedTime: '30-60 seconds',
          status: 'processing'
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'content.generateWithAI',
        userId: req.user._id,
        body: req.body,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to generate AI content',
        code: 'AI_GENERATION_ERROR'
      });
    }
  },
  
  // Get content calendar
  getCalendar: async (req, res) => {
    try {
      const { startDate, endDate, view = 'month' } = req.query;
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const contents = await Content.find({
        organizationId: req.organization._id,
        $or: [
          {
            'platforms.scheduledAt': {
              $gte: start,
              $lte: end
            }
          },
          {
            createdAt: {
              $gte: start,
              $lte: end
            }
          }
        ],
        status: { $ne: 'deleted' }
      })
        .populate('userId', 'firstName lastName')
        .select('title type platforms status createdAt')
        .sort({ 'platforms.scheduledAt': 1 });
      
      // Group by date
      const calendar = {};
      contents.forEach(content => {
        content.platforms.forEach(platform => {
          const date = platform.scheduledAt ? 
            platform.scheduledAt.toISOString().split('T')[0] :
            content.createdAt.toISOString().split('T')[0];
          
          if (!calendar[date]) {
            calendar[date] = [];
          }
          
          calendar[date].push({
            id: content._id,
            title: content.title,
            type: content.type,
            platform: platform.platform,
            status: platform.status,
            scheduledAt: platform.scheduledAt,
            author: content.userId
          });
        });
      });
      
      res.json({
        success: true,
        data: {
          calendar,
          view,
          dateRange: { startDate: start, endDate: end }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'content.getCalendar',
        userId: req.user._id,
        query: req.query,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get content calendar',
        code: 'CALENDAR_ERROR'
      });
    }
  }
};

module.exports = contentController;

