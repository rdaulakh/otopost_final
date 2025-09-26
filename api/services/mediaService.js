const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const mime = require('mime-types');

class MediaService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../uploads');
    this.tempDir = path.join(__dirname, '../temp');
    this.maxFileSize = 50 * 1024 * 1024; // 50MB
    this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    this.allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
    this.allowedDocumentTypes = ['application/pdf', 'text/plain', 'application/msword'];
    
    this.initializeDirectories();
  }

  async initializeDirectories() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(this.tempDir, { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'images'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'videos'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'documents'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'thumbnails'), { recursive: true });
    } catch (error) {
      console.error('Error creating upload directories:', error);
    }
  }

  generateFileName(originalName, userId) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    return `${userId}_${timestamp}_${random}${extension}`;
  }

  validateFile(file) {
    const errors = [];

    // Check file size
    if (file.size > this.maxFileSize) {
      errors.push(`File size exceeds maximum limit of ${this.maxFileSize / (1024 * 1024)}MB`);
    }

    // Check file type
    const allAllowedTypes = [
      ...this.allowedImageTypes,
      ...this.allowedVideoTypes,
      ...this.allowedDocumentTypes
    ];

    if (!allAllowedTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} is not allowed`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getFileCategory(mimetype) {
    if (this.allowedImageTypes.includes(mimetype)) return 'image';
    if (this.allowedVideoTypes.includes(mimetype)) return 'video';
    if (this.allowedDocumentTypes.includes(mimetype)) return 'document';
    return 'unknown';
  }

  async processImage(inputPath, outputPath, options = {}) {
    try {
      const {
        width = 1920,
        height = 1080,
        quality = 85,
        format = 'jpeg'
      } = options;

      let processor = sharp(inputPath);

      // Get original metadata
      const metadata = await processor.metadata();

      // Resize if needed
      if (metadata.width > width || metadata.height > height) {
        processor = processor.resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Convert and compress
      if (format === 'jpeg') {
        processor = processor.jpeg({ quality });
      } else if (format === 'png') {
        processor = processor.png({ quality });
      } else if (format === 'webp') {
        processor = processor.webp({ quality });
      }

      await processor.toFile(outputPath);

      return {
        success: true,
        originalSize: metadata.size,
        processedSize: (await fs.stat(outputPath)).size,
        dimensions: {
          width: metadata.width,
          height: metadata.height
        }
      };
    } catch (error) {
      console.error('Image processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateImageThumbnail(inputPath, outputPath, size = 300) {
    try {
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toFile(outputPath);

      return { success: true };
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      return { success: false, error: error.message };
    }
  }

  async processVideo(inputPath, outputPath, options = {}) {
    return new Promise((resolve, reject) => {
      const {
        width = 1280,
        height = 720,
        bitrate = '1000k',
        format = 'mp4'
      } = options;

      ffmpeg(inputPath)
        .size(`${width}x${height}`)
        .videoBitrate(bitrate)
        .format(format)
        .on('end', () => {
          resolve({ success: true });
        })
        .on('error', (error) => {
          console.error('Video processing error:', error);
          resolve({ success: false, error: error.message });
        })
        .save(outputPath);
    });
  }

  async generateVideoThumbnail(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .screenshots({
          timestamps: ['10%'],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: '300x300'
        })
        .on('end', () => {
          resolve({ success: true });
        })
        .on('error', (error) => {
          console.error('Video thumbnail error:', error);
          resolve({ success: false, error: error.message });
        });
    });
  }

  async getVideoMetadata(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (error, metadata) => {
        if (error) {
          console.error('Video metadata error:', error);
          resolve({ success: false, error: error.message });
        } else {
          const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
          resolve({
            success: true,
            duration: metadata.format.duration,
            size: metadata.format.size,
            bitrate: metadata.format.bit_rate,
            width: videoStream?.width,
            height: videoStream?.height,
            codec: videoStream?.codec_name
          });
        }
      });
    });
  }

  async uploadFile(file, userId, options = {}) {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      const category = this.getFileCategory(file.mimetype);
      const fileName = this.generateFileName(file.originalname, userId);
      const categoryDir = path.join(this.uploadDir, `${category}s`);
      const filePath = path.join(categoryDir, fileName);
      const thumbnailPath = path.join(this.uploadDir, 'thumbnails', `thumb_${fileName.replace(path.extname(fileName), '.jpg')}`);

      // Save original file
      await fs.writeFile(filePath, file.buffer);

      let processedData = {
        originalName: file.originalname,
        fileName,
        filePath,
        size: file.size,
        mimetype: file.mimetype,
        category,
        uploadedAt: new Date()
      };

      // Process based on file type
      if (category === 'image') {
        // Process image
        const processedPath = path.join(categoryDir, `processed_${fileName}`);
        const imageResult = await this.processImage(filePath, processedPath, options.image);
        
        if (imageResult.success) {
          // Replace original with processed
          await fs.unlink(filePath);
          await fs.rename(processedPath, filePath);
          processedData.processedSize = imageResult.processedSize;
          processedData.dimensions = imageResult.dimensions;
        }

        // Generate thumbnail
        const thumbnailResult = await this.generateImageThumbnail(filePath, thumbnailPath);
        if (thumbnailResult.success) {
          processedData.thumbnailPath = thumbnailPath;
        }

      } else if (category === 'video') {
        // Get video metadata
        const metadata = await this.getVideoMetadata(filePath);
        if (metadata.success) {
          processedData.duration = metadata.duration;
          processedData.dimensions = {
            width: metadata.width,
            height: metadata.height
          };
          processedData.bitrate = metadata.bitrate;
          processedData.codec = metadata.codec;
        }

        // Generate video thumbnail
        const thumbnailResult = await this.generateVideoThumbnail(filePath, thumbnailPath);
        if (thumbnailResult.success) {
          processedData.thumbnailPath = thumbnailPath;
        }

        // Process video if options provided
        if (options.video) {
          const processedPath = path.join(categoryDir, `processed_${fileName}`);
          const videoResult = await this.processVideo(filePath, processedPath, options.video);
          
          if (videoResult.success) {
            // Replace original with processed
            await fs.unlink(filePath);
            await fs.rename(processedPath, filePath);
          }
        }
      }

      return {
        success: true,
        data: processedData
      };

    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      
      // Also delete thumbnail if exists
      const thumbnailPath = path.join(
        this.uploadDir, 
        'thumbnails', 
        `thumb_${path.basename(filePath).replace(path.extname(filePath), '.jpg')}`
      );
      
      try {
        await fs.unlink(thumbnailPath);
      } catch (error) {
        // Thumbnail might not exist, ignore error
      }

      return { success: true };
    } catch (error) {
      console.error('File deletion error:', error);
      return { success: false, error: error.message };
    }
  }

  async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const mimetype = mime.lookup(filePath);
      
      return {
        success: true,
        data: {
          size: stats.size,
          mimetype,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async cleanupTempFiles(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    try {
      const files = await fs.readdir(this.tempDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
        }
      }

      return { success: true, cleaned: files.length };
    } catch (error) {
      console.error('Cleanup error:', error);
      return { success: false, error: error.message };
    }
  }

  getFileUrl(fileName, category) {
    return `/api/media/${category}s/${fileName}`;
  }

  getThumbnailUrl(fileName) {
    const thumbnailName = `thumb_${fileName.replace(path.extname(fileName), '.jpg')}`;
    return `/api/media/thumbnails/${thumbnailName}`;
  }
}

module.exports = new MediaService();
