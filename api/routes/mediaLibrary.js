const express = require('express');
const { auth } = require('../middleware/auth');
const Media = require('../models/Media');
const s3Service = require('../services/s3Service');
const stripeService = require('../services/stripeService');
const { body, query, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/media-library
// @desc    Get user's media library with filtering and pagination
// @access  Private
router.get('/', [
  auth,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isIn(['image', 'video', 'document', 'audio']).withMessage('Invalid category'),
  query('tags').optional().isString().withMessage('Tags must be a string'),
  query('search').optional().isString().withMessage('Search must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { category, tags, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    let query = { user: req.user.id };
    
    if (category) {
      query.category = category;
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [media, totalCount] = await Promise.all([
      Media.find(query)
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .populate('user', 'name email'),
      Media.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      message: 'Media library retrieved successfully',
      media,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error retrieving media library:', error);
    res.status(500).json({
      message: 'Failed to retrieve media library',
      error: error.message
    });
  }
});

// @route   GET /api/media-library/:id
// @desc    Get specific media item
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const media = await Media.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('user', 'name email');

    if (!media) {
      return res.status(404).json({
        message: 'Media not found'
      });
    }

    // Increment view count
    await media.incrementViews();

    res.json({
      message: 'Media retrieved successfully',
      media
    });
  } catch (error) {
    console.error('Error retrieving media:', error);
    res.status(500).json({
      message: 'Failed to retrieve media',
      error: error.message
    });
  }
});

// @route   PUT /api/media-library/:id
// @desc    Update media metadata
// @access  Private
router.put('/:id', [
  auth,
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').isString().withMessage('Each tag must be a string'),
  body('altText').optional().isString().withMessage('Alt text must be a string'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { description, tags, altText, isPublic } = req.body;

    const media = await Media.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!media) {
      return res.status(404).json({
        message: 'Media not found'
      });
    }

    // Update fields
    if (description !== undefined) media.description = description;
    if (tags !== undefined) media.tags = tags.map(tag => tag.toLowerCase().trim());
    if (altText !== undefined) media.altText = altText;
    if (isPublic !== undefined) media.isPublic = isPublic;

    await media.save();

    res.json({
      message: 'Media updated successfully',
      media
    });
  } catch (error) {
    console.error('Error updating media:', error);
    res.status(500).json({
      message: 'Failed to update media',
      error: error.message
    });
  }
});

// @route   DELETE /api/media-library/:id
// @desc    Delete media item
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const media = await Media.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!media) {
      return res.status(404).json({
        message: 'Media not found'
      });
    }

    // Delete from S3 if using S3 storage
    if (media.s3Data && media.s3Data.uploads && media.s3Data.uploads.length > 0) {
      const keys = media.getS3Keys();
      if (keys.length > 0) {
        await s3Service.deleteMultipleFiles(keys);
      }
    }

    await media.remove();

    res.json({
      message: 'Media deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({
      message: 'Failed to delete media',
      error: error.message
    });
  }
});

// @route   DELETE /api/media-library/bulk
// @desc    Delete multiple media items
// @access  Private
router.delete('/bulk', [
  auth,
  body('mediaIds').isArray().withMessage('Media IDs must be an array'),
  body('mediaIds.*').isMongoId().withMessage('Each media ID must be valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { mediaIds } = req.body;

    // Find all media items belonging to the user
    const mediaItems = await Media.find({
      _id: { $in: mediaIds },
      user: req.user.id
    });

    if (mediaItems.length === 0) {
      return res.status(404).json({
        message: 'No media items found'
      });
    }

    // Collect all S3 keys for deletion
    const allS3Keys = [];
    mediaItems.forEach(media => {
      const keys = media.getS3Keys();
      allS3Keys.push(...keys);
    });

    // Delete from S3 if there are keys
    if (allS3Keys.length > 0) {
      await s3Service.deleteMultipleFiles(allS3Keys);
    }

    // Delete from database
    await Media.deleteMany({
      _id: { $in: mediaIds },
      user: req.user.id
    });

    res.json({
      message: `${mediaItems.length} media items deleted successfully`,
      deletedCount: mediaItems.length
    });
  } catch (error) {
    console.error('Error deleting media items:', error);
    res.status(500).json({
      message: 'Failed to delete media items',
      error: error.message
    });
  }
});

// @route   POST /api/media-library/:id/favorite
// @desc    Toggle favorite status
// @access  Private
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const media = await Media.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!media) {
      return res.status(404).json({
        message: 'Media not found'
      });
    }

    // Toggle favorite status (assuming we add this field to the model)
    media.isFavorite = !media.isFavorite;
    await media.save();

    res.json({
      message: `Media ${media.isFavorite ? 'added to' : 'removed from'} favorites`,
      media
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      message: 'Failed to toggle favorite',
      error: error.message
    });
  }
});

// @route   GET /api/media-library/stats
// @desc    Get media library statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Media.getStorageStats(req.user.id);
    
    res.json({
      message: 'Media library statistics retrieved successfully',
      stats: stats[0] || {
        categories: [],
        totalSize: 0,
        totalFiles: 0
      }
    });
  } catch (error) {
    console.error('Error retrieving media stats:', error);
    res.status(500).json({
      message: 'Failed to retrieve media statistics',
      error: error.message
    });
  }
});

// @route   GET /api/media-library/search/tags
// @desc    Get all unique tags for user's media
// @access  Private
router.get('/search/tags', auth, async (req, res) => {
  try {
    const tags = await Media.distinct('tags', { user: req.user.id });
    
    res.json({
      message: 'Tags retrieved successfully',
      tags: tags.sort()
    });
  } catch (error) {
    console.error('Error retrieving tags:', error);
    res.status(500).json({
      message: 'Failed to retrieve tags',
      error: error.message
    });
  }
});

// @route   POST /api/media-library/:id/download
// @desc    Generate download URL and track download
// @access  Private
router.post('/:id/download', auth, async (req, res) => {
  try {
    const media = await Media.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!media) {
      return res.status(404).json({
        message: 'Media not found'
      });
    }

    // Increment download count
    await media.incrementDownloads();

    // Get download URL (S3 or legacy)
    let downloadUrl;
    if (media.s3Data && media.s3Data.uploads && media.s3Data.uploads.length > 0) {
      const originalUpload = media.s3Data.uploads.find(upload => upload.size === 'original');
      downloadUrl = originalUpload ? originalUpload.url : media.s3Data.uploads[0].url;
    } else {
      downloadUrl = media.fullUrl;
    }

    res.json({
      message: 'Download URL generated successfully',
      downloadUrl,
      fileName: media.originalName
    });
  } catch (error) {
    console.error('Error generating download URL:', error);
    res.status(500).json({
      message: 'Failed to generate download URL',
      error: error.message
    });
  }
});

module.exports = router;
