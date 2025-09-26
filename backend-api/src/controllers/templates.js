const Template = require('../models/Template');
const User = require('../models/User');
const Organization = require('../models/Organization');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

/**
 * Templates Controller
 * Handles content templates, email templates, and reusable content
 */

// Get all templates for a user/organization
const getTemplates = async (req, res) => {
  try {
    const { userId, organizationId } = req.user;
    const { page = 1, limit = 20, type, category, isPublic } = req.query;

    const query = {
      $or: [
        { user: userId },
        { organization: organizationId },
        { isPublic: true }
      ]
    };

    if (type) query.type = type;
    if (category) query.category = category;
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';

    const templates = await Template.find(query)
      .populate('user', 'firstName lastName email')
      .populate('organization', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Template.countDocuments(query);

    res.json({
      success: true,
      data: {
        templates,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      error: error.message
    });
  }
};

// Get a specific template
const getTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { userId, organizationId } = req.user;

    const template = await Template.findOne({
      _id: templateId,
      $or: [
        { user: userId },
        { organization: organizationId },
        { isPublic: true }
      ]
    }).populate('user', 'firstName lastName email')
      .populate('organization', 'name');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    logger.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch template',
      error: error.message
    });
  }
};

// Create a new template
const createTemplate = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId, organizationId } = req.user;
    const {
      name,
      description,
      type,
      category,
      content,
      variables,
      platforms,
      isPublic = false,
      tags = []
    } = req.body;

    const template = new Template({
      name,
      description,
      type,
      category,
      content,
      variables: variables || [],
      platforms: platforms || [],
      isPublic,
      tags,
      user: userId,
      organization: organizationId,
      usageCount: 0
    });

    await template.save();

    logger.info(`Template created: ${name} by user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template
    });
  } catch (error) {
    logger.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create template',
      error: error.message
    });
  }
};

// Update a template
const updateTemplate = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { templateId } = req.params;
    const { userId, organizationId } = req.user;
    const updateData = req.body;

    const template = await Template.findOne({
      _id: templateId,
      $or: [
        { user: userId },
        { organization: organizationId }
      ]
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or access denied'
      });
    }

    Object.assign(template, updateData);
    await template.save();

    logger.info(`Template updated: ${template.name} by user ${userId}`);

    res.json({
      success: true,
      message: 'Template updated successfully',
      data: template
    });
  } catch (error) {
    logger.error('Error updating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update template',
      error: error.message
    });
  }
};

// Delete a template
const deleteTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { userId, organizationId } = req.user;

    const template = await Template.findOneAndDelete({
      _id: templateId,
      $or: [
        { user: userId },
        { organization: organizationId }
      ]
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or access denied'
      });
    }

    logger.info(`Template deleted: ${template.name} by user ${userId}`);

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete template',
      error: error.message
    });
  }
};

// Use a template (increment usage count)
const useTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { variables } = req.body;

    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Increment usage count
    template.usageCount += 1;
    await template.save();

    // Process template with variables
    let processedContent = template.content;
    if (variables && template.variables) {
      template.variables.forEach(variable => {
        const value = variables[variable.name] || variable.defaultValue || `{{${variable.name}}}`;
        processedContent = processedContent.replace(
          new RegExp(`{{${variable.name}}}`, 'g'),
          value
        );
      });
    }

    logger.info(`Template used: ${template.name} (usage count: ${template.usageCount})`);

    res.json({
      success: true,
      message: 'Template processed successfully',
      data: {
        template: {
          ...template.toObject(),
          processedContent
        }
      }
    });
  } catch (error) {
    logger.error('Error using template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to use template',
      error: error.message
    });
  }
};

// Duplicate a template
const duplicateTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { userId, organizationId } = req.user;
    const { name } = req.body;

    const originalTemplate = await Template.findOne({
      _id: templateId,
      $or: [
        { user: userId },
        { organization: organizationId },
        { isPublic: true }
      ]
    });

    if (!originalTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or access denied'
      });
    }

    const duplicatedTemplate = new Template({
      ...originalTemplate.toObject(),
      _id: undefined,
      name: name || `${originalTemplate.name} (Copy)`,
      user: userId,
      organization: organizationId,
      isPublic: false,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await duplicatedTemplate.save();

    logger.info(`Template duplicated: ${originalTemplate.name} -> ${duplicatedTemplate.name} by user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Template duplicated successfully',
      data: duplicatedTemplate
    });
  } catch (error) {
    logger.error('Error duplicating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate template',
      error: error.message
    });
  }
};

// Get template categories
const getTemplateCategories = async (req, res) => {
  try {
    const { type } = req.query;

    const query = {};
    if (type) query.type = type;

    const categories = await Template.distinct('category', query);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('Error fetching template categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch template categories',
      error: error.message
    });
  }
};

// Get popular templates
const getPopularTemplates = async (req, res) => {
  try {
    const { limit = 10, type } = req.query;

    const query = { isPublic: true };
    if (type) query.type = type;

    const templates = await Template.find(query)
      .sort({ usageCount: -1 })
      .limit(parseInt(limit))
      .populate('user', 'firstName lastName email')
      .populate('organization', 'name');

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    logger.error('Error fetching popular templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular templates',
      error: error.message
    });
  }
};

// Search templates
const searchTemplates = async (req, res) => {
  try {
    const { q, type, category, tags, page = 1, limit = 20 } = req.query;
    const { userId, organizationId } = req.user;

    const query = {
      $or: [
        { user: userId },
        { organization: organizationId },
        { isPublic: true }
      ]
    };

    if (type) query.type = type;
    if (category) query.category = category;
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    if (q) {
      query.$text = { $search: q };
    }

    const templates = await Template.find(query)
      .populate('user', 'firstName lastName email')
      .populate('organization', 'name')
      .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Template.countDocuments(query);

    res.json({
      success: true,
      data: {
        templates,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    logger.error('Error searching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search templates',
      error: error.message
    });
  }
};

// Get template statistics
const getTemplateStats = async (req, res) => {
  try {
    const { userId, organizationId } = req.user;

    const stats = await Template.aggregate([
      {
        $match: {
          $or: [
            { user: userId },
            { organization: organizationId }
          ]
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' },
          byType: {
            $push: {
              type: '$type',
              usageCount: '$usageCount'
            }
          }
        }
      }
    ]);

    const typeStats = await Template.aggregate([
      {
        $match: {
          $or: [
            { user: userId },
            { organization: organizationId }
          ]
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        total: stats[0]?.total || 0,
        totalUsage: stats[0]?.totalUsage || 0,
        byType: typeStats
      }
    });
  } catch (error) {
    logger.error('Error fetching template stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch template statistics',
      error: error.message
    });
  }
};

// Get public templates (alias for getPopularTemplates)
const getPublicTemplates = getPopularTemplates;

// Get template by ID (alias for getTemplate)
const getTemplateById = getTemplate;

// Archive template
const archiveTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { userId, organizationId } = req.user;

    const template = await Template.findOne({
      _id: templateId,
      $or: [
        { user: userId },
        { organization: organizationId }
      ]
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or access denied'
      });
    }

    template.archived = true;
    template.archivedAt = new Date();
    await template.save();

    logger.info(`Template archived: ${template.name} by user ${userId}`);

    res.json({
      success: true,
      message: 'Template archived successfully',
      data: template
    });
  } catch (error) {
    logger.error('Error archiving template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive template',
      error: error.message
    });
  }
};

// Restore template
const restoreTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { userId, organizationId } = req.user;

    const template = await Template.findOne({
      _id: templateId,
      $or: [
        { user: userId },
        { organization: organizationId }
      ]
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or access denied'
      });
    }

    template.archived = false;
    template.archivedAt = undefined;
    await template.save();

    logger.info(`Template restored: ${template.name} by user ${userId}`);

    res.json({
      success: true,
      message: 'Template restored successfully',
      data: template
    });
  } catch (error) {
    logger.error('Error restoring template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore template',
      error: error.message
    });
  }
};

module.exports = {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  useTemplate,
  duplicateTemplate,
  getTemplateCategories,
  getPopularTemplates,
  searchTemplates,
  getTemplateStats,
  getPublicTemplates,
  getTemplateById,
  archiveTemplate,
  restoreTemplate
};