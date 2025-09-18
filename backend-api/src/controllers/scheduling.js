const Content = require('../models/Content');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

/**
 * Content Scheduling Controller
 * Handles content scheduling, automation, and publishing
 */

// Get all scheduled content for a user
const getScheduledContent = async (req, res) => {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 10, status, platform, startDate, endDate } = req.query;

    const query = { 
      user: userId,
      status: { $in: ['scheduled', 'draft'] }
    };

    if (status) query.status = status;
    if (platform) query.platforms = { $in: [platform] };
    if (startDate || endDate) {
      query.scheduledAt = {};
      if (startDate) query.scheduledAt.$gte = new Date(startDate);
      if (endDate) query.scheduledAt.$lte = new Date(endDate);
    }

    const content = await Content.find(query)
      .populate('user', 'firstName lastName email')
      .populate('campaign', 'name status')
      .sort({ scheduledAt: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Content.countDocuments(query);

    res.json({
      success: true,
      data: {
        content,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching scheduled content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduled content',
      error: error.message
    });
  }
};

// Schedule content for publishing
const scheduleContent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId } = req.user;
    const { contentId, scheduledAt, platforms, campaignId } = req.body;

    const content = await Content.findOne({ _id: contentId, user: userId });
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Validate scheduled time is in the future
    const scheduleTime = new Date(scheduledAt);
    if (scheduleTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled time must be in the future'
      });
    }

    // Update content with scheduling information
    content.scheduledAt = scheduleTime;
    content.status = 'scheduled';
    content.platforms = platforms || content.platforms;
    if (campaignId) content.campaign = campaignId;

    await content.save();

    // Add to campaign if specified
    if (campaignId) {
      await Campaign.findByIdAndUpdate(campaignId, {
        $addToSet: { content: contentId }
      });
    }

    logger.info(`Content ${contentId} scheduled for ${scheduleTime} by user ${userId}`);

    res.json({
      success: true,
      message: 'Content scheduled successfully',
      data: content
    });
  } catch (error) {
    logger.error('Error scheduling content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule content',
      error: error.message
    });
  }
};

// Reschedule content
const rescheduleContent = async (req, res) => {
  try {
    const { userId } = req.user;
    const { contentId } = req.params;
    const { scheduledAt } = req.body;

    const content = await Content.findOne({ _id: contentId, user: userId });
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    if (content.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Only scheduled content can be rescheduled'
      });
    }

    const scheduleTime = new Date(scheduledAt);
    if (scheduleTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled time must be in the future'
      });
    }

    content.scheduledAt = scheduleTime;
    await content.save();

    logger.info(`Content ${contentId} rescheduled to ${scheduleTime} by user ${userId}`);

    res.json({
      success: true,
      message: 'Content rescheduled successfully',
      data: content
    });
  } catch (error) {
    logger.error('Error rescheduling content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule content',
      error: error.message
    });
  }
};

// Cancel scheduled content
const cancelScheduledContent = async (req, res) => {
  try {
    const { userId } = req.user;
    const { contentId } = req.params;

    const content = await Content.findOne({ _id: contentId, user: userId });
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    if (content.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Only scheduled content can be cancelled'
      });
    }

    content.status = 'draft';
    content.scheduledAt = null;
    await content.save();

    logger.info(`Scheduled content ${contentId} cancelled by user ${userId}`);

    res.json({
      success: true,
      message: 'Scheduled content cancelled successfully',
      data: content
    });
  } catch (error) {
    logger.error('Error cancelling scheduled content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel scheduled content',
      error: error.message
    });
  }
};

// Publish content immediately
const publishNow = async (req, res) => {
  try {
    const { userId } = req.user;
    const { contentId } = req.params;

    const content = await Content.findOne({ _id: contentId, user: userId });
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    if (content.status === 'published') {
      return res.status(400).json({
        success: false,
        message: 'Content is already published'
      });
    }

    // Update content status
    content.status = 'published';
    content.publishedAt = new Date();
    content.scheduledAt = null;
    await content.save();

    // TODO: Integrate with social media APIs to actually publish
    // This would involve calling the respective platform APIs

    logger.info(`Content ${contentId} published immediately by user ${userId}`);

    res.json({
      success: true,
      message: 'Content published successfully',
      data: content
    });
  } catch (error) {
    logger.error('Error publishing content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish content',
      error: error.message
    });
  }
};

// Get scheduling analytics
const getSchedulingAnalytics = async (req, res) => {
  try {
    const { userId } = req.user;
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const analytics = await Content.aggregate([
      { $match: { user: userId, ...dateFilter } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgEngagement: { $avg: '$metrics.engagementRate' }
        }
      }
    ]);

    const totalScheduled = await Content.countDocuments({
      user: userId,
      status: 'scheduled',
      ...dateFilter
    });

    const upcomingPosts = await Content.find({
      user: userId,
      status: 'scheduled',
      scheduledAt: { $gte: new Date() },
      ...dateFilter
    })
      .sort({ scheduledAt: 1 })
      .limit(5)
      .select('title scheduledAt platforms');

    res.json({
      success: true,
      data: {
        analytics,
        totalScheduled,
        upcomingPosts
      }
    });
  } catch (error) {
    logger.error('Error fetching scheduling analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduling analytics',
      error: error.message
    });
  }
};

// Bulk schedule content
const bulkSchedule = async (req, res) => {
  try {
    const { userId } = req.user;
    const { contentIds, scheduledAt, platforms } = req.body;

    if (!Array.isArray(contentIds) || contentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content IDs array is required'
      });
    }

    const scheduleTime = new Date(scheduledAt);
    if (scheduleTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled time must be in the future'
      });
    }

    const updateResult = await Content.updateMany(
      { _id: { $in: contentIds }, user: userId, status: { $in: ['draft', 'scheduled'] } },
      {
        $set: {
          scheduledAt: scheduleTime,
          status: 'scheduled',
          platforms: platforms || []
        }
      }
    );

    logger.info(`Bulk scheduled ${updateResult.modifiedCount} content items by user ${userId}`);

    res.json({
      success: true,
      message: `Successfully scheduled ${updateResult.modifiedCount} content items`,
      data: {
        modifiedCount: updateResult.modifiedCount,
        scheduledAt: scheduleTime
      }
    });
  } catch (error) {
    logger.error('Error bulk scheduling content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk schedule content',
      error: error.message
    });
  }
};

module.exports = {
  getScheduledContent,
  scheduleContent,
  rescheduleContent,
  cancelScheduledContent,
  publishNow,
  getSchedulingAnalytics,
  bulkSchedule
};