const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const localStorage = require('../integrations/storage/local');
const cloudinaryStorage = require('../integrations/storage/cloudinary');
const logger = require('../utils/logger');

class FileUploadService {
  constructor() {
    this.providers = {
      local: localStorage,
      cloudinary: cloudinaryStorage
    };
    this.defaultProvider = process.env.STORAGE_PROVIDER || 'local';
    
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'application/pdf',
      'text/plain',
      'application/json'
    ];

    this.setupMulter();
  }

  /**
   * Setup multer for file uploads
   */
  setupMulter() {
    const storage = multer.memoryStorage();
    
    this.upload = multer({
      storage: storage,
      limits: {
        fileSize: this.maxFileSize,
        files: 10 // Maximum 10 files per request
      },
      fileFilter: (req, file, cb) => {
        if (this.allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`File type ${file.mimetype} is not allowed`), false);
        }
      }
    });
  }

  /**
   * Upload single file
   */
  async uploadFile(file, options = {}) {
    try {
      const {
        provider = this.defaultProvider,
        folder = 'general',
        generateUniqueName = true,
        preserveOriginalName = false,
        transformations = {},
        tags = [],
        context = {}
      } = options;

      const service = this.providers[provider];
      if (!service) {
        throw new Error(`Storage provider '${provider}' not supported`);
      }

      // Prepare upload options based on provider
      const uploadOptions = this.prepareUploadOptions(provider, {
        folder,
        generateUniqueName,
        preserveOriginalName,
        transformations,
        tags,
        context
      });

      const result = await service.uploadFile(file, uploadOptions);

      logger.info(`File uploaded successfully via ${provider}: ${result.fileName || result.publicId}`);

      return {
        success: true,
        ...result,
        provider: provider
      };

    } catch (error) {
      logger.error('File upload failed:', error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files, options = {}) {
    try {
      const {
        provider = this.defaultProvider,
        folder = 'general',
        generateUniqueName = true,
        preserveOriginalName = false,
        transformations = {},
        tags = [],
        context = {}
      } = options;

      const service = this.providers[provider];
      if (!service) {
        throw new Error(`Storage provider '${provider}' not supported`);
      }

      // Prepare upload options
      const uploadOptions = this.prepareUploadOptions(provider, {
        folder,
        generateUniqueName,
        preserveOriginalName,
        transformations,
        tags,
        context
      });

      const result = await service.uploadMultipleFiles(files, uploadOptions);

      logger.info(`Multiple files uploaded via ${provider}: ${result.totalUploaded} uploaded, ${result.totalFailed} failed`);

      return {
        success: true,
        ...result,
        provider: provider
      };

    } catch (error) {
      logger.error('Multiple file upload failed:', error);
      throw new Error(`Multiple file upload failed: ${error.message}`);
    }
  }

  /**
   * Upload image with transformations
   */
  async uploadImage(file, options = {}) {
    try {
      const {
        provider = this.defaultProvider,
        folder = 'images',
        transformations = {},
        quality = 'auto',
        format = 'auto',
        generateVariations = false
      } = options;

      // Validate image file
      if (!file.mimetype.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      const uploadOptions = {
        folder,
        transformations,
        quality,
        format,
        generateVariations
      };

      const result = await this.uploadFile(file, {
        ...options,
        ...uploadOptions
      });

      // Generate variations if requested
      if (generateVariations && provider === 'cloudinary') {
        const variations = await this.generateImageVariations(result.publicId, {
          thumbnail: { width: 150, height: 150, crop: 'fill' },
          medium: { width: 500, height: 500, crop: 'limit' },
          large: { width: 1200, height: 1200, crop: 'limit' }
        });

        result.variations = variations;
      }

      return result;

    } catch (error) {
      logger.error('Image upload failed:', error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  /**
   * Upload video file
   */
  async uploadVideo(file, options = {}) {
    try {
      const {
        provider = this.defaultProvider,
        folder = 'videos',
        transformations = {},
        quality = 'auto',
        format = 'auto'
      } = options;

      // Validate video file
      if (!file.mimetype.startsWith('video/')) {
        throw new Error('File must be a video');
      }

      const uploadOptions = {
        folder,
        transformations,
        quality,
        format
      };

      return await this.uploadFile(file, {
        ...options,
        ...uploadOptions
      });

    } catch (error) {
      logger.error('Video upload failed:', error);
      throw new Error(`Video upload failed: ${error.message}`);
    }
  }

  /**
   * Upload document file
   */
  async uploadDocument(file, options = {}) {
    try {
      const {
        provider = this.defaultProvider,
        folder = 'documents',
        generateUniqueName = true
      } = options;

      // Validate document file
      const allowedDocumentTypes = [
        'application/pdf',
        'text/plain',
        'application/json',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedDocumentTypes.includes(file.mimetype)) {
        throw new Error('File type not allowed for documents');
      }

      return await this.uploadFile(file, {
        ...options,
        folder,
        generateUniqueName
      });

    } catch (error) {
      logger.error('Document upload failed:', error);
      throw new Error(`Document upload failed: ${error.message}`);
    }
  }

  /**
   * Get file from storage
   */
  async getFile(filePath, provider = null) {
    try {
      const storageProvider = provider || this.defaultProvider;
      const service = this.providers[storageProvider];

      if (!service) {
        throw new Error(`Storage provider '${storageProvider}' not supported`);
      }

      return await service.getFile(filePath);

    } catch (error) {
      logger.error('File retrieval failed:', error);
      throw new Error(`File retrieval failed: ${error.message}`);
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(filePath, provider = null) {
    try {
      const storageProvider = provider || this.defaultProvider;
      const service = this.providers[storageProvider];

      if (!service) {
        throw new Error(`Storage provider '${storageProvider}' not supported`);
      }

      return await service.deleteFile(filePath);

    } catch (error) {
      logger.error('File deletion failed:', error);
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  /**
   * Delete multiple files
   */
  async deleteMultipleFiles(filePaths, provider = null) {
    try {
      const storageProvider = provider || this.defaultProvider;
      const service = this.providers[storageProvider];

      if (!service) {
        throw new Error(`Storage provider '${storageProvider}' not supported`);
      }

      if (typeof service.deleteMultipleFiles === 'function') {
        return await service.deleteMultipleFiles(filePaths);
      } else {
        // Fallback to individual deletions
        const results = [];
        for (const filePath of filePaths) {
          try {
            const result = await service.deleteFile(filePath);
            results.push({ success: true, filePath, ...result });
          } catch (error) {
            results.push({ success: false, filePath, error: error.message });
          }
        }
        return { success: true, results };
      }

    } catch (error) {
      logger.error('Multiple file deletion failed:', error);
      throw new Error(`Multiple file deletion failed: ${error.message}`);
    }
  }

  /**
   * Generate image variations
   */
  async generateImageVariations(publicId, variations, provider = 'cloudinary') {
    try {
      const service = this.providers[provider];

      if (!service || typeof service.generateVariations !== 'function') {
        throw new Error(`Image variations not supported for provider '${provider}'`);
      }

      const variationList = Object.entries(variations).map(([name, transformation]) => ({
        name,
        transformation
      }));

      return await service.generateVariations(publicId, variationList);

    } catch (error) {
      logger.error('Image variations generation failed:', error);
      throw new Error(`Image variations generation failed: ${error.message}`);
    }
  }

  /**
   * Transform image
   */
  async transformImage(publicId, transformation, provider = 'cloudinary') {
    try {
      const service = this.providers[provider];

      if (!service || typeof service.transformImage !== 'function') {
        throw new Error(`Image transformation not supported for provider '${provider}'`);
      }

      return await service.transformImage(publicId, transformation);

    } catch (error) {
      logger.error('Image transformation failed:', error);
      throw new Error(`Image transformation failed: ${error.message}`);
    }
  }

  /**
   * List files in directory
   */
  async listFiles(folder = '', options = {}) {
    try {
      const { provider = this.defaultProvider } = options;
      const service = this.providers[provider];

      if (!service || typeof service.listFiles !== 'function') {
        throw new Error(`File listing not supported for provider '${provider}'`);
      }

      return await service.listFiles(folder, options);

    } catch (error) {
      logger.error('File listing failed:', error);
      throw new Error(`File listing failed: ${error.message}`);
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(provider = null) {
    try {
      const storageProvider = provider || this.defaultProvider;
      const service = this.providers[storageProvider];

      if (!service || typeof service.getStorageStats !== 'function') {
        throw new Error(`Storage stats not supported for provider '${storageProvider}'`);
      }

      return await service.getStorageStats();

    } catch (error) {
      logger.error('Storage stats retrieval failed:', error);
      throw new Error(`Storage stats retrieval failed: ${error.message}`);
    }
  }

  /**
   * Prepare upload options based on provider
   */
  prepareUploadOptions(provider, options) {
    const { folder, generateUniqueName, preserveOriginalName, transformations, tags, context } = options;

    switch (provider) {
      case 'local':
        return {
          folder,
          generateUniqueName,
          preserveOriginalName
        };
      
      case 'cloudinary':
        return {
          folder,
          transformation: transformations,
          tags,
          context
        };
      
      default:
        return options;
    }
  }

  /**
   * Validate file
   */
  validateFile(file) {
    if (!file || !file.buffer) {
      throw new Error('Invalid file data');
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize} bytes`);
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} is not allowed`);
    }
  }

  /**
   * Get file info
   */
  getFileInfo(file) {
    return {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      encoding: file.encoding,
      fieldName: file.fieldname
    };
  }

  /**
   * Generate unique filename
   */
  generateUniqueFilename(originalName) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, extension);
    
    return `${nameWithoutExt}_${timestamp}_${randomString}${extension}`;
  }

  /**
   * Get multer middleware
   */
  getMulterMiddleware(fieldName = 'file', maxCount = 1) {
    if (maxCount === 1) {
      return this.upload.single(fieldName);
    } else {
      return this.upload.array(fieldName, maxCount);
    }
  }

  /**
   * Health check for file upload service
   */
  async healthCheck() {
    try {
      const results = {};

      for (const [provider, service] of Object.entries(this.providers)) {
        try {
          results[provider] = await service.healthCheck();
        } catch (error) {
          results[provider] = {
            success: false,
            error: error.message
          };
        }
      }

      const healthyProviders = Object.values(results).filter(r => r.success);
      
      return {
        success: healthyProviders.length > 0,
        providers: results,
        defaultProvider: this.defaultProvider,
        healthyProviders: healthyProviders.length,
        maxFileSize: this.maxFileSize,
        allowedMimeTypes: this.allowedMimeTypes
      };

    } catch (error) {
      logger.error('File upload service health check failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new FileUploadService();

