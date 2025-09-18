const Campaign = require('../models/Campaign');
const Content = require('../models/Content');
const Organization = require('../models/Organization');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

/**
 * Campaign Management Controller
 * Handles all campaign-related operations
 */

// Get all campaigns for an organization
const getCampaigns = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const {
      page = 1,
      limit = 10,
      status,
      type,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { organizationId };
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const campaigns = await Campaign.find(filter)
      .populate('contentIds', 'title status platforms')
      .populate('createdBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Campaign.countDocuments(filter);

    res.json({
      success: true,
      data: {
        campaigns,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaigns',
      error: error.message
    });
  }
};

// Get campaign by ID
const getCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { organizationId } = req.user;

    const campaign = await Campaign.findOne({
      _id: campaignId,
      organizationId
    })
      .populate('contentIds', 'title status platforms scheduledAt')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      data: { campaign }
    });
  } catch (error) {
    logger.error('Get campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign',
      error: error.message
    });
  }
};

// Create new campaign
const createCampaign = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { organizationId, userId } = req.user;
    const campaignData = {
      ...req.body,
      organizationId,
      createdBy: userId,
      updatedBy: userId
    };

    // Validate content IDs if provided
    if (campaignData.contentIds && campaignData.contentIds.length > 0) {
      const contentExists = await Content.find({
        _id: { $in: campaignData.contentIds },
        organizationId
      });
      
      if (contentExists.length !== campaignData.contentIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Some content items not found or not accessible'
        });
      }
    }

    const campaign = new Campaign(campaignData);
    await campaign.save();

    // Populate the created campaign
    await campaign.populate([
      { path: 'contentIds', select: 'title status platforms' },
      { path: 'createdBy', select: 'name email' }
    ]);

    logger.info(`Campaign created: ${campaign._id}`, {
      organizationId,
      userId,
      campaignName: campaign.name
    });

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: { campaign }
    });
  } catch (error) {
    logger.error('Create campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create campaign',
      error: error.message
    });
  }
};

// Update campaign
const updateCampaign = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { campaignId } = req.params;
    const { organizationId, userId } = req.user;
    const updateData = {
      ...req.body,
      updatedBy: userId,
      updatedAt: new Date()
    };

    // Validate content IDs if provided
    if (updateData.contentIds && updateData.contentIds.length > 0) {
      const contentExists = await Content.find({
        _id: { $in: updateData.contentIds },
        organizationId
      });
      
      if (contentExists.length !== updateData.contentIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Some content items not found or not accessible'
        });
      }
    }

    const campaign = await Campaign.findOneAndUpdate(
      { _id: campaignId, organizationId },
      updateData,
      { new: true, runValidators: true }
    )
      .populate('contentIds', 'title status platforms')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    logger.info(`Campaign updated: ${campaign._id}`, {
      organizationId,
      userId,
      campaignName: campaign.name
    });

    res.json({
      success: true,
      message: 'Campaign updated successfully',
      data: { campaign }
    });
  } catch (error) {
    logger.error('Update campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update campaign',
      error: error.message
    });
  }
};

// Delete campaign
const deleteCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { organizationId } = req.user;

    const campaign = await Campaign.findOneAndDelete({
      _id: campaignId,
      organizationId
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    logger.info(`Campaign deleted: ${campaignId}`, {
      organizationId,
      campaignName: campaign.name
    });

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    logger.error('Delete campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete campaign',
      error: error.message
    });
  }
};

// Start campaign
const startCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { organizationId, userId } = req.user;

    const campaign = await Campaign.findOne({
      _id: campaignId,
      organizationId
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Campaign is already active'
      });
    }

    // Update campaign status
    campaign.status = 'active';
    campaign.startedAt = new Date();
    campaign.updatedBy = userId;
    await campaign.save();

    // Update content status to scheduled if not already
    if (campaign.contentIds && campaign.contentIds.length > 0) {
      await Content.updateMany(
        { _id: { $in: campaign.contentIds } },
        { 
          $set: { 
            'campaign.status': 'active',
            'campaign.startedAt': new Date()
          }
        }
      );
    }

    logger.info(`Campaign started: ${campaignId}`, {
      organizationId,
      userId,
      campaignName: campaign.name
    });

    res.json({
      success: true,
      message: 'Campaign started successfully',
      data: { campaign }
    });
  } catch (error) {
    logger.error('Start campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start campaign',
      error: error.message
    });
  }
};

// Pause campaign
const pauseCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { organizationId, userId } = req.user;

    const campaign = await Campaign.findOne({
      _id: campaignId,
      organizationId
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Campaign is not active'
      });
    }

    // Update campaign status
    campaign.status = 'paused';
    campaign.pausedAt = new Date();
    campaign.updatedBy = userId;
    await campaign.save();

    // Update content status to paused
    if (campaign.contentIds && campaign.contentIds.length > 0) {
      await Content.updateMany(
        { _id: { $in: campaign.contentIds } },
        { 
          $set: { 
            'campaign.status': 'paused',
            'campaign.pausedAt': new Date()
          }
        }
      );
    }

    logger.info(`Campaign paused: ${campaignId}`, {
      organizationId,
      userId,
      campaignName: campaign.name
    });

    res.json({
      success: true,
      message: 'Campaign paused successfully',
      data: { campaign }
    });
  } catch (error) {
    logger.error('Pause campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pause campaign',
      error: error.message
    });
  }
};

// Get campaign analytics
const getCampaignAnalytics = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { organizationId } = req.user;
    const { startDate, endDate } = req.query;

    const campaign = await Campaign.findOne({
      _id: campaignId,
      organizationId
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Get content analytics
    const contentAnalytics = await Content.aggregate([
      {
        $match: {
          _id: { $in: campaign.contentIds },
          organizationId
        }
      },
      {
        $unwind: '$platforms'
      },
      {
        $group: {
          _id: '$platforms.platform',
          totalPosts: { $sum: 1 },
          publishedPosts: {
            $sum: { $cond: [{ $eq: ['$platforms.status', 'published'] }, 1, 0] }
          },
          scheduledPosts: {
            $sum: { $cond: [{ $eq: ['$platforms.status', 'scheduled'] }, 1, 0] }
          },
          totalEngagement: { $sum: '$platforms.engagement.total' },
          totalReach: { $sum: '$platforms.reach.total' },
          totalClicks: { $sum: '$platforms.clicks.total' }
        }
      }
    ]);

    // Calculate campaign metrics
    const totalContent = campaign.contentIds.length;
    const publishedContent = await Content.countDocuments({
      _id: { $in: campaign.contentIds },
      'platforms.status': 'published'
    });

    const analytics = {
      campaignId: campaign._id,
      campaignName: campaign.name,
      status: campaign.status,
      totalContent,
      publishedContent,
      pendingContent: totalContent - publishedContent,
      platforms: contentAnalytics,
      createdAt: campaign.createdAt,
      startedAt: campaign.startedAt,
      completedAt: campaign.completedAt
    };

    res.json({
      success: true,
      data: { analytics }
    });
  } catch (error) {
    logger.error('Get campaign analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign analytics',
      error: error.message
    });
  }
};

// Duplicate campaign
const duplicateCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { organizationId, userId } = req.user;
    const { name } = req.body;

    const originalCampaign = await Campaign.findOne({
      _id: campaignId,
      organizationId
    });

    if (!originalCampaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Create duplicate campaign
    const duplicateData = {
      ...originalCampaign.toObject(),
      _id: undefined,
      name: name || `${originalCampaign.name} (Copy)`,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      updatedBy: userId,
      startedAt: undefined,
      completedAt: undefined,
      pausedAt: undefined
    };

    const duplicateCampaign = new Campaign(duplicateData);
    await duplicateCampaign.save();

    await duplicateCampaign.populate([
      { path: 'contentIds', select: 'title status platforms' },
      { path: 'createdBy', select: 'name email' }
    ]);

    logger.info(`Campaign duplicated: ${campaignId} -> ${duplicateCampaign._id}`, {
      organizationId,
      userId,
      originalName: originalCampaign.name,
      duplicateName: duplicateCampaign.name
    });

    res.status(201).json({
      success: true,
      message: 'Campaign duplicated successfully',
      data: { campaign: duplicateCampaign }
    });
  } catch (error) {
    logger.error('Duplicate campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate campaign',
      error: error.message
    });
  }
};

module.exports = {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  startCampaign,
  pauseCampaign,
  getCampaignAnalytics,
  duplicateCampaign
};

