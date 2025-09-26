const express = require('express');
const router = express.Router();
const { authenticateCustomer } = require('../middleware/auth');

// All routes require customer authentication
router.use(authenticateCustomer);

// @route   GET /api/media
// @desc    Get user's media files
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { type = 'all', limit = 20, page = 1 } = req.query;

    // Mock media data
    const mockMedia = [
      {
        id: 1,
        filename: 'image_001.jpg',
        originalName: 'product_launch.jpg',
        type: 'image',
        size: 1024000,
        url: '/uploads/images/image_001.jpg',
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        tags: ['product', 'launch', 'marketing']
      },
      {
        id: 2,
        filename: 'video_001.mp4',
        originalName: 'tutorial_video.mp4',
        type: 'video',
        size: 15728640,
        url: '/uploads/videos/video_001.mp4',
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        tags: ['tutorial', 'how-to', 'education']
      }
    ];

    res.json({
      success: true,
      data: mockMedia,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mockMedia.length,
        pages: Math.ceil(mockMedia.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get media files',
      error: error.message
    });
  }
});

// @route   POST /api/media/upload/single
// @desc    Upload single media file
// @access  Private
router.post('/upload/single', async (req, res) => {
  try {
    // Mock file upload
    const mockFile = {
      id: Date.now(),
      filename: `file_${Date.now()}.jpg`,
      originalName: req.body.originalName || 'uploaded_file.jpg',
      type: 'image',
      size: 1024000,
      url: `/uploads/images/file_${Date.now()}.jpg`,
      uploadedAt: new Date(),
      tags: []
    };

    res.status(201).json({
      success: true,
      data: mockFile,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
});

// @route   POST /api/media/upload/multiple
// @desc    Upload multiple media files
// @access  Private
router.post('/upload/multiple', async (req, res) => {
  try {
    // Mock multiple file upload
    const mockFiles = [
      {
        id: Date.now(),
        filename: `file_${Date.now()}.jpg`,
        originalName: 'file1.jpg',
        type: 'image',
        size: 1024000,
        url: `/uploads/images/file_${Date.now()}.jpg`,
        uploadedAt: new Date(),
        tags: []
      },
      {
        id: Date.now() + 1,
        filename: `file_${Date.now() + 1}.png`,
        originalName: 'file2.png',
        type: 'image',
        size: 2048000,
        url: `/uploads/images/file_${Date.now() + 1}.png`,
        uploadedAt: new Date(),
        tags: []
      }
    ];

    res.status(201).json({
      success: true,
      data: mockFiles,
      message: 'Files uploaded successfully'
    });

  } catch (error) {
    console.error('Multiple file upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload files',
      error: error.message
    });
  }
});

// @route   DELETE /api/media/:filename
// @desc    Delete media file
// @access  Private
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message
    });
  }
});

module.exports = router;
