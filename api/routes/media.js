const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { auth } = require('../middleware/auth');
const { 
  uploadSingle, 
  uploadMultiple, 
  uploadFields,
  uploadProgress,
  validateImageOnly,
  validateVideoOnly,
  validateDocumentOnly
} = require('../middleware/upload');
const mediaService = require('../services/mediaService');

const router = express.Router();

// @route   POST /api/media/upload/single
// @desc    Upload a single file
// @access  Private
router.post('/upload/single', 
  auth, 
  uploadProgress,
  uploadSingle('file'), 
  async (req, res) => {
    try {
      const { file } = req;
      const userId = req.user.id;
      
      // Parse processing options from request body
      const options = {
        image: {
          width: parseInt(req.body.imageWidth) || 1920,
          height: parseInt(req.body.imageHeight) || 1080,
          quality: parseInt(req.body.imageQuality) || 85,
          format: req.body.imageFormat || 'jpeg'
        },
        video: req.body.processVideo === 'true' ? {
          width: parseInt(req.body.videoWidth) || 1280,
          height: parseInt(req.body.videoHeight) || 720,
          bitrate: req.body.videoBitrate || '1000k',
          format: req.body.videoFormat || 'mp4'
        } : null
      };

      const result = await mediaService.uploadFile(file, userId, options);

      if (!result.success) {
        return res.status(400).json({
          message: 'File upload failed',
          errors: result.errors || [result.error]
        });
      }

      // Add URLs to response
      result.data.url = mediaService.getFileUrl(result.data.fileName, result.data.category);
      if (result.data.thumbnailPath) {
        result.data.thumbnailUrl = mediaService.getThumbnailUrl(result.data.fileName);
      }

      res.status(201).json({
        message: 'File uploaded successfully',
        file: result.data,
        uploadProgress: req.uploadProgress || 100
      });

    } catch (error) {
      console.error('Single file upload error:', error);
      res.status(500).json({
        message: 'Server error during file upload',
        error: error.message
      });
    }
  }
);

// @route   POST /api/media/upload/multiple
// @desc    Upload multiple files
// @access  Private
router.post('/upload/multiple', 
  auth, 
  uploadProgress,
  uploadMultiple('files', 10), 
  async (req, res) => {
    try {
      const { files } = req;
      const userId = req.user.id;
      
      const options = {
        image: {
          width: parseInt(req.body.imageWidth) || 1920,
          height: parseInt(req.body.imageHeight) || 1080,
          quality: parseInt(req.body.imageQuality) || 85,
          format: req.body.imageFormat || 'jpeg'
        },
        video: req.body.processVideo === 'true' ? {
          width: parseInt(req.body.videoWidth) || 1280,
          height: parseInt(req.body.videoHeight) || 720,
          bitrate: req.body.videoBitrate || '1000k',
          format: req.body.videoFormat || 'mp4'
        } : null
      };

      const results = [];
      const errors = [];

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await mediaService.uploadFile(file, userId, options);

        if (result.success) {
          // Add URLs to response
          result.data.url = mediaService.getFileUrl(result.data.fileName, result.data.category);
          if (result.data.thumbnailPath) {
            result.data.thumbnailUrl = mediaService.getThumbnailUrl(result.data.fileName);
          }
          results.push(result.data);
        } else {
          errors.push({
            fileName: file.originalname,
            errors: result.errors || [result.error]
          });
        }
      }

      res.status(201).json({
        message: `${results.length} files uploaded successfully`,
        files: results,
        errors: errors.length > 0 ? errors : undefined,
        uploadProgress: req.uploadProgress || 100
      });

    } catch (error) {
      console.error('Multiple file upload error:', error);
      res.status(500).json({
        message: 'Server error during file upload',
        error: error.message
      });
    }
  }
);

// @route   POST /api/media/upload/images
// @desc    Upload images only
// @access  Private
router.post('/upload/images', 
  auth, 
  uploadMultiple('images', 5),
  validateImageOnly,
  async (req, res) => {
    try {
      const { files } = req;
      const userId = req.user.id;
      
      const options = {
        image: {
          width: parseInt(req.body.width) || 1920,
          height: parseInt(req.body.height) || 1080,
          quality: parseInt(req.body.quality) || 85,
          format: req.body.format || 'jpeg'
        }
      };

      const results = [];
      
      for (const file of files) {
        const result = await mediaService.uploadFile(file, userId, options);
        if (result.success) {
          result.data.url = mediaService.getFileUrl(result.data.fileName, result.data.category);
          result.data.thumbnailUrl = mediaService.getThumbnailUrl(result.data.fileName);
          results.push(result.data);
        }
      }

      res.status(201).json({
        message: `${results.length} images uploaded successfully`,
        images: results
      });

    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({
        message: 'Server error during image upload',
        error: error.message
      });
    }
  }
);

// @route   POST /api/media/upload/videos
// @desc    Upload videos only
// @access  Private
router.post('/upload/videos', 
  auth, 
  uploadMultiple('videos', 3),
  validateVideoOnly,
  async (req, res) => {
    try {
      const { files } = req;
      const userId = req.user.id;
      
      const options = {
        video: {
          width: parseInt(req.body.width) || 1280,
          height: parseInt(req.body.height) || 720,
          bitrate: req.body.bitrate || '1000k',
          format: req.body.format || 'mp4'
        }
      };

      const results = [];
      
      for (const file of files) {
        const result = await mediaService.uploadFile(file, userId, options);
        if (result.success) {
          result.data.url = mediaService.getFileUrl(result.data.fileName, result.data.category);
          result.data.thumbnailUrl = mediaService.getThumbnailUrl(result.data.fileName);
          results.push(result.data);
        }
      }

      res.status(201).json({
        message: `${results.length} videos uploaded successfully`,
        videos: results
      });

    } catch (error) {
      console.error('Video upload error:', error);
      res.status(500).json({
        message: 'Server error during video upload',
        error: error.message
      });
    }
  }
);

// @route   POST /api/media/upload/mixed
// @desc    Upload mixed file types with different fields
// @access  Private
router.post('/upload/mixed', 
  auth,
  uploadFields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 2 },
    { name: 'documents', maxCount: 3 }
  ]),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const results = {
        images: [],
        videos: [],
        documents: []
      };

      // Process images
      if (req.files.images) {
        for (const file of req.files.images) {
          const result = await mediaService.uploadFile(file, userId, {
            image: { quality: 85, format: 'jpeg' }
          });
          if (result.success) {
            result.data.url = mediaService.getFileUrl(result.data.fileName, result.data.category);
            result.data.thumbnailUrl = mediaService.getThumbnailUrl(result.data.fileName);
            results.images.push(result.data);
          }
        }
      }

      // Process videos
      if (req.files.videos) {
        for (const file of req.files.videos) {
          const result = await mediaService.uploadFile(file, userId);
          if (result.success) {
            result.data.url = mediaService.getFileUrl(result.data.fileName, result.data.category);
            result.data.thumbnailUrl = mediaService.getThumbnailUrl(result.data.fileName);
            results.videos.push(result.data);
          }
        }
      }

      // Process documents
      if (req.files.documents) {
        for (const file of req.files.documents) {
          const result = await mediaService.uploadFile(file, userId);
          if (result.success) {
            result.data.url = mediaService.getFileUrl(result.data.fileName, result.data.category);
            results.documents.push(result.data);
          }
        }
      }

      const totalFiles = results.images.length + results.videos.length + results.documents.length;

      res.status(201).json({
        message: `${totalFiles} files uploaded successfully`,
        files: results
      });

    } catch (error) {
      console.error('Mixed upload error:', error);
      res.status(500).json({
        message: 'Server error during file upload',
        error: error.message
      });
    }
  }
);

// @route   GET /api/media/images/:filename
// @desc    Serve image files
// @access  Public
router.get('/images/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/images', filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    
    res.sendFile(filePath);
  } catch (error) {
    console.error('Image serve error:', error);
    res.status(500).json({ message: 'Error serving image' });
  }
});

// @route   GET /api/media/videos/:filename
// @desc    Serve video files
// @access  Public
router.get('/videos/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/videos', filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Set appropriate headers for video streaming
    const stat = await fs.stat(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Support range requests for video streaming
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', chunksize);
      res.setHeader('Content-Type', 'video/mp4');
      
      const stream = require('fs').createReadStream(filePath, { start, end });
      stream.pipe(res);
    } else {
      res.setHeader('Content-Length', fileSize);
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      
      const stream = require('fs').createReadStream(filePath);
      stream.pipe(res);
    }
  } catch (error) {
    console.error('Video serve error:', error);
    res.status(500).json({ message: 'Error serving video' });
  }
});

// @route   GET /api/media/documents/:filename
// @desc    Serve document files
// @access  Private
router.get('/documents/:filename', auth, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/documents', filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
    res.sendFile(filePath);
  } catch (error) {
    console.error('Document serve error:', error);
    res.status(500).json({ message: 'Error serving document' });
  }
});

// @route   GET /api/media/thumbnails/:filename
// @desc    Serve thumbnail files
// @access  Public
router.get('/thumbnails/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/thumbnails', filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ message: 'Thumbnail not found' });
    }

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    res.sendFile(filePath);
  } catch (error) {
    console.error('Thumbnail serve error:', error);
    res.status(500).json({ message: 'Error serving thumbnail' });
  }
});

// @route   DELETE /api/media/:filename
// @desc    Delete a file
// @access  Private
router.delete('/:filename', auth, async (req, res) => {
  try {
    const { filename } = req.params;
    const { category } = req.query;
    
    if (!category) {
      return res.status(400).json({ message: 'File category is required' });
    }

    const filePath = path.join(__dirname, '../uploads', `${category}s`, filename);
    const result = await mediaService.deleteFile(filePath);

    if (!result.success) {
      return res.status(404).json({ message: 'File not found or could not be deleted' });
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
});

// @route   GET /api/media/info/:filename
// @desc    Get file information
// @access  Private
router.get('/info/:filename', auth, async (req, res) => {
  try {
    const { filename } = req.params;
    const { category } = req.query;
    
    if (!category) {
      return res.status(400).json({ message: 'File category is required' });
    }

    const filePath = path.join(__dirname, '../uploads', `${category}s`, filename);
    const result = await mediaService.getFileInfo(filePath);

    if (!result.success) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json({
      message: 'File information retrieved successfully',
      fileInfo: result.data
    });
  } catch (error) {
    console.error('File info error:', error);
    res.status(500).json({ message: 'Error retrieving file information' });
  }
});

// @route   POST /api/media/cleanup
// @desc    Cleanup temporary files
// @access  Private (Admin only)
router.post('/cleanup', auth, async (req, res) => {
  try {
    // Check if user is admin (you might want to add admin middleware)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { maxAge } = req.body;
    const result = await mediaService.cleanupTempFiles(maxAge);

    res.json({
      message: 'Cleanup completed successfully',
      result
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ message: 'Error during cleanup' });
  }
});

module.exports = router;
