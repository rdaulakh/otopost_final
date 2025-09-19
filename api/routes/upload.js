const express = require('express');
const multer = require('multer');
const { auth } = require('../middleware/auth');
const s3Service = require('../services/s3Service');
const stripeService = require('../services/stripeService');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Apply upload-specific rate limiting
router.use(uploadLimiter);

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
    files: 10 // Max 10 files per request
  },
  fileFilter: (req, file, cb) => {
    // Basic file type validation (more detailed validation in s3Service)
    const allowedMimes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
  }
});

// @route   POST /api/upload/single
// @desc    Upload single file
// @access  Private
router.post('/single', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No file provided',
        error: 'FILE_REQUIRED'
      });
    }

    // Check feature access
    const featureAccess = await stripeService.checkFeatureAccess(req.user.id, 'fileUpload');
    if (!featureAccess.allowed) {
      return res.status(403).json({
        message: 'File upload limit reached',
        error: 'FEATURE_LIMIT_EXCEEDED',
        reason: featureAccess.reason
      });
    }

    const options = {
      folder: req.body.folder || 'uploads',
      generateThumbnails: req.body.generateThumbnails !== 'false',
      optimize: req.body.optimize !== 'false'
    };

    const result = await s3Service.uploadFile(req.file, req.user.id, options);

    // Create media library entry if requested
    let mediaEntry = null;
    if (req.body.addToLibrary === 'true') {
      mediaEntry = await s3Service.createMediaLibraryEntry(
        result,
        req.user.id,
        req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
        req.body.description || ''
      );
    }

    res.json({
      message: 'File uploaded successfully',
      file: result,
      mediaEntry
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      message: 'File upload failed',
      error: error.message
    });
  }
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple files
// @access  Private
router.post('/multiple', auth, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: 'No files provided',
        error: 'FILES_REQUIRED'
      });
    }

    // Check feature access
    const featureAccess = await stripeService.checkFeatureAccess(req.user.id, 'fileUpload');
    if (!featureAccess.allowed) {
      return res.status(403).json({
        message: 'File upload limit reached',
        error: 'FEATURE_LIMIT_EXCEEDED',
        reason: featureAccess.reason
      });
    }

    const options = {
      folder: req.body.folder || 'uploads',
      generateThumbnails: req.body.generateThumbnails !== 'false',
      optimize: req.body.optimize !== 'false'
    };

    const result = await s3Service.uploadMultipleFiles(req.files, req.user.id, options);

    // Create media library entries if requested
    let mediaEntries = [];
    if (req.body.addToLibrary === 'true') {
      const tags = req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [];
      const description = req.body.description || '';

      for (const uploadedFile of result.uploaded) {
        const mediaEntry = await s3Service.createMediaLibraryEntry(
          uploadedFile,
          req.user.id,
          tags,
          description
        );
        mediaEntries.push(mediaEntry);
      }
    }

    res.json({
      message: `${result.successCount} files uploaded successfully`,
      result,
      mediaEntries
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({
      message: 'File upload failed',
      error: error.message
    });
  }
});

// @route   DELETE /api/upload/file/:key
// @desc    Delete file from S3
// @access  Private
router.delete('/file/:key', auth, async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key); // Get the file key
    
    if (!key) {
      return res.status(400).json({
        message: 'File key is required',
        error: 'KEY_REQUIRED'
      });
    }

    // Verify the file belongs to the user (check if key starts with user's folder)
    const userPrefix = `uploads/${req.user.id}/`;
    if (!key.startsWith(userPrefix)) {
      return res.status(403).json({
        message: 'Access denied',
        error: 'UNAUTHORIZED_ACCESS'
      });
    }

    const result = await s3Service.deleteFile(key);

    res.json({
      message: 'File deleted successfully',
      result
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      message: 'File deletion failed',
      error: error.message
    });
  }
});

// @route   DELETE /api/upload/files
// @desc    Delete multiple files from S3
// @access  Private
router.delete('/files', [
  auth,
  body('keys').isArray().withMessage('Keys must be an array'),
  body('keys.*').notEmpty().withMessage('Each key must be non-empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { keys } = req.body;
    const userPrefix = `uploads/${req.user.id}/`;

    // Verify all files belong to the user
    const unauthorizedKeys = keys.filter(key => !key.startsWith(userPrefix));
    if (unauthorizedKeys.length > 0) {
      return res.status(403).json({
        message: 'Access denied to some files',
        error: 'UNAUTHORIZED_ACCESS',
        unauthorizedKeys
      });
    }

    const result = await s3Service.deleteMultipleFiles(keys);

    res.json({
      message: `${result.deleted.length} files deleted successfully`,
      result
    });
  } catch (error) {
    console.error('Error deleting files:', error);
    res.status(500).json({
      message: 'File deletion failed',
      error: error.message
    });
  }
});

// @route   GET /api/upload/files
// @desc    List user's uploaded files
// @access  Private
router.get('/files', auth, async (req, res) => {
  try {
    const folder = req.query.folder || 'uploads';
    const limit = parseInt(req.query.limit) || 100;

    const result = await s3Service.listUserFiles(req.user.id, folder, limit);

    res.json({
      message: 'Files retrieved successfully',
      ...result
    });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({
      message: 'Failed to retrieve files',
      error: error.message
    });
  }
});

// @route   GET /api/upload/file/:key/metadata
// @desc    Get file metadata
// @access  Private
router.get('/file/:key/metadata', auth, async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);
    
    if (!key) {
      return res.status(400).json({
        message: 'File key is required',
        error: 'KEY_REQUIRED'
      });
    }

    // Verify the file belongs to the user
    const userPrefix = `uploads/${req.user.id}/`;
    if (!key.startsWith(userPrefix)) {
      return res.status(403).json({
        message: 'Access denied',
        error: 'UNAUTHORIZED_ACCESS'
      });
    }

    const result = await s3Service.getFileMetadata(key);

    res.json({
      message: 'File metadata retrieved successfully',
      ...result
    });
  } catch (error) {
    console.error('Error getting file metadata:', error);
    res.status(500).json({
      message: 'Failed to retrieve file metadata',
      error: error.message
    });
  }
});

// @route   GET /api/upload/file/:key/signed-url
// @desc    Get signed URL for private file access
// @access  Private
router.get('/file/:key/signed-url', auth, async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);
    const expires = parseInt(req.query.expires) || 3600; // 1 hour default
    
    if (!key) {
      return res.status(400).json({
        message: 'File key is required',
        error: 'KEY_REQUIRED'
      });
    }

    // Verify the file belongs to the user
    const userPrefix = `uploads/${req.user.id}/`;
    if (!key.startsWith(userPrefix)) {
      return res.status(403).json({
        message: 'Access denied',
        error: 'UNAUTHORIZED_ACCESS'
      });
    }

    const signedUrl = await s3Service.getSignedUrl(key, expires);

    res.json({
      message: 'Signed URL generated successfully',
      signedUrl,
      expires: new Date(Date.now() + expires * 1000)
    });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({
      message: 'Failed to generate signed URL',
      error: error.message
    });
  }
});

// @route   POST /api/upload/process-image
// @desc    Process existing image with different settings
// @access  Private
router.post('/process-image', [
  auth,
  body('key').notEmpty().withMessage('File key is required'),
  body('operations').isArray().withMessage('Operations must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { key, operations } = req.body;
    
    // Verify the file belongs to the user
    const userPrefix = `uploads/${req.user.id}/`;
    if (!key.startsWith(userPrefix)) {
      return res.status(403).json({
        message: 'Access denied',
        error: 'UNAUTHORIZED_ACCESS'
      });
    }

    // This would implement image processing operations
    // For now, return a placeholder response
    res.json({
      message: 'Image processing feature coming soon',
      key,
      operations,
      status: 'pending'
    });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({
      message: 'Image processing failed',
      error: error.message
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large',
        error: 'FILE_TOO_LARGE',
        limit: '100MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files',
        error: 'TOO_MANY_FILES',
        limit: '10 files'
      });
    }
  }
  
  if (error.message.includes('Unsupported file type')) {
    return res.status(400).json({
      message: error.message,
      error: 'UNSUPPORTED_FILE_TYPE'
    });
  }

  next(error);
});

module.exports = router;
