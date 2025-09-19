const AWS = require('aws-sdk');
const sharp = require('sharp');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class S3Service {
  constructor() {
    // Configure AWS
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });

    this.s3 = new AWS.S3();
    this.bucket = process.env.AWS_S3_BUCKET;
    
    // Supported file types
    this.supportedImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    this.supportedVideoTypes = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
    this.supportedDocumentTypes = ['pdf', 'doc', 'docx', 'txt'];
    
    // File size limits (in bytes)
    this.limits = {
      image: 10 * 1024 * 1024, // 10MB
      video: 100 * 1024 * 1024, // 100MB
      document: 5 * 1024 * 1024 // 5MB
    };

    // Image processing configurations
    this.imageConfigs = {
      thumbnail: { width: 150, height: 150, quality: 80 },
      small: { width: 400, height: 400, quality: 85 },
      medium: { width: 800, height: 800, quality: 90 },
      large: { width: 1200, height: 1200, quality: 95 },
      original: { quality: 100 }
    };
  }

  // Upload single file
  async uploadFile(file, userId, options = {}) {
    try {
      const { folder = 'uploads', generateThumbnails = true, optimize = true } = options;
      
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
      const fileName = `${uuidv4()}.${fileExtension}`;
      const key = `${folder}/${userId}/${fileName}`;

      let uploadResults = [];

      // Process image files
      if (this.supportedImageTypes.includes(fileExtension)) {
        uploadResults = await this.processAndUploadImage(file, key, generateThumbnails, optimize);
      } else {
        // Upload non-image files directly
        const result = await this.uploadToS3(file.buffer, key, file.mimetype);
        uploadResults.push({
          size: 'original',
          url: result.Location,
          key: result.Key,
          fileSize: file.size
        });
      }

      return {
        success: true,
        fileName,
        originalName: file.originalname,
        fileType: this.getFileType(fileExtension),
        fileSize: file.size,
        uploads: uploadResults,
        metadata: {
          userId,
          uploadedAt: new Date(),
          folder
        }
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  // Process and upload image with multiple sizes
  async processAndUploadImage(file, baseKey, generateThumbnails, optimize) {
    const uploads = [];
    const baseName = path.parse(baseKey).name;
    const folder = path.dirname(baseKey);

    try {
      // Process different sizes
      for (const [sizeName, config] of Object.entries(this.imageConfigs)) {
        if (!generateThumbnails && sizeName !== 'original') continue;

        let processedBuffer;
        let finalKey;

        if (sizeName === 'original' && !optimize) {
          processedBuffer = file.buffer;
          finalKey = baseKey;
        } else {
          // Process image with Sharp
          let sharpInstance = sharp(file.buffer);
          
          if (sizeName !== 'original') {
            sharpInstance = sharpInstance.resize(config.width, config.height, {
              fit: 'inside',
              withoutEnlargement: true
            });
          }

          // Apply compression
          const fileExtension = path.extname(baseKey).toLowerCase().substring(1);
          if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
            sharpInstance = sharpInstance.jpeg({ quality: config.quality });
          } else if (fileExtension === 'png') {
            sharpInstance = sharpInstance.png({ quality: config.quality });
          } else if (fileExtension === 'webp') {
            sharpInstance = sharpInstance.webp({ quality: config.quality });
          }

          processedBuffer = await sharpInstance.toBuffer();
          finalKey = sizeName === 'original' ? baseKey : `${folder}/${baseName}_${sizeName}.${fileExtension}`;
        }

        // Upload to S3
        const result = await this.uploadToS3(processedBuffer, finalKey, file.mimetype);
        
        uploads.push({
          size: sizeName,
          url: result.Location,
          key: result.Key,
          fileSize: processedBuffer.length,
          dimensions: sizeName !== 'original' ? `${config.width}x${config.height}` : null
        });
      }

      return uploads;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }

  // Upload buffer to S3
  async uploadToS3(buffer, key, contentType) {
    const params = {
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read',
      CacheControl: 'max-age=31536000', // 1 year cache
      Metadata: {
        uploadedAt: new Date().toISOString()
      }
    };

    return await this.s3.upload(params).promise();
  }

  // Upload multiple files
  async uploadMultipleFiles(files, userId, options = {}) {
    try {
      const results = [];
      const errors = [];

      for (const file of files) {
        try {
          const result = await this.uploadFile(file, userId, options);
          results.push(result);
        } catch (error) {
          errors.push({
            fileName: file.originalname,
            error: error.message
          });
        }
      }

      return {
        success: errors.length === 0,
        uploaded: results,
        errors,
        totalFiles: files.length,
        successCount: results.length,
        errorCount: errors.length
      };
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw error;
    }
  }

  // Delete file from S3
  async deleteFile(key) {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key
      };

      await this.s3.deleteObject(params).promise();
      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  // Delete multiple files
  async deleteMultipleFiles(keys) {
    try {
      if (keys.length === 0) return { success: true, deleted: [] };

      const params = {
        Bucket: this.bucket,
        Delete: {
          Objects: keys.map(key => ({ Key: key })),
          Quiet: false
        }
      };

      const result = await this.s3.deleteObjects(params).promise();
      
      return {
        success: true,
        deleted: result.Deleted || [],
        errors: result.Errors || []
      };
    } catch (error) {
      console.error('Error deleting multiple files:', error);
      throw error;
    }
  }

  // Get file URL
  getFileUrl(key) {
    return `https://${this.bucket}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  }

  // Generate signed URL for private files
  async getSignedUrl(key, expires = 3600) {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
        Expires: expires
      };

      return await this.s3.getSignedUrlPromise('getObject', params);
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw error;
    }
  }

  // Validate file
  validateFile(file) {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
    const fileType = this.getFileType(fileExtension);

    // Check if file type is supported
    const allSupportedTypes = [
      ...this.supportedImageTypes,
      ...this.supportedVideoTypes,
      ...this.supportedDocumentTypes
    ];

    if (!allSupportedTypes.includes(fileExtension)) {
      return { 
        valid: false, 
        error: `Unsupported file type: ${fileExtension}. Supported types: ${allSupportedTypes.join(', ')}` 
      };
    }

    // Check file size
    const sizeLimit = this.limits[fileType];
    if (file.size > sizeLimit) {
      return { 
        valid: false, 
        error: `File too large. Maximum size for ${fileType} files: ${this.formatFileSize(sizeLimit)}` 
      };
    }

    return { valid: true };
  }

  // Get file type category
  getFileType(extension) {
    if (this.supportedImageTypes.includes(extension)) return 'image';
    if (this.supportedVideoTypes.includes(extension)) return 'video';
    if (this.supportedDocumentTypes.includes(extension)) return 'document';
    return 'unknown';
  }

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // List user files
  async listUserFiles(userId, folder = 'uploads', limit = 100) {
    try {
      const params = {
        Bucket: this.bucket,
        Prefix: `${folder}/${userId}/`,
        MaxKeys: limit
      };

      const result = await this.s3.listObjectsV2(params).promise();
      
      const files = result.Contents.map(obj => ({
        key: obj.Key,
        url: this.getFileUrl(obj.Key),
        size: obj.Size,
        lastModified: obj.LastModified,
        fileName: path.basename(obj.Key)
      }));

      return {
        success: true,
        files,
        totalCount: result.KeyCount,
        isTruncated: result.IsTruncated
      };
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  // Get file metadata
  async getFileMetadata(key) {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key
      };

      const result = await this.s3.headObject(params).promise();
      
      return {
        success: true,
        metadata: {
          contentType: result.ContentType,
          contentLength: result.ContentLength,
          lastModified: result.LastModified,
          etag: result.ETag,
          metadata: result.Metadata
        }
      };
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw error;
    }
  }

  // Create media library entry
  async createMediaLibraryEntry(uploadResult, userId, tags = [], description = '') {
    return {
      id: uuidv4(),
      userId,
      fileName: uploadResult.fileName,
      originalName: uploadResult.originalName,
      fileType: uploadResult.fileType,
      fileSize: uploadResult.fileSize,
      uploads: uploadResult.uploads,
      tags,
      description,
      createdAt: new Date(),
      metadata: uploadResult.metadata
    };
  }
}

module.exports = new S3Service();
