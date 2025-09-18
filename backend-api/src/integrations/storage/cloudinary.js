const cloudinary = require('cloudinary').v2;
const logger = require('../../utils/logger');

class CloudinaryService {
  constructor() {
    this.config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    };

    if (this.config.cloud_name && this.config.api_key && this.config.api_secret) {
      cloudinary.config(this.config);
    } else {
      logger.warn('Cloudinary credentials not provided');
    }
  }

  /**
   * Upload file to Cloudinary
   */
  async uploadFile(file, options = {}) {
    try {
      if (!this.isConfigured()) {
        throw new Error('Cloudinary not configured');
      }

      const {
        folder = 'ai-social-media',
        publicId = null,
        transformation = {},
        resourceType = 'auto',
        quality = 'auto',
        format = 'auto',
        eager = [],
        tags = [],
        context = {}
      } = options;

      const uploadOptions = {
        folder: folder,
        resource_type: resourceType,
        quality: quality,
        format: format,
        transformation: transformation,
        eager: eager,
        tags: tags,
        context: context
      };

      if (publicId) {
        uploadOptions.public_id = publicId;
      }

      // Convert buffer to base64 for Cloudinary
      const base64String = file.buffer.toString('base64');
      const dataUri = `data:${file.mimetype};base64,${base64String}`;

      const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

      logger.info(`File uploaded to Cloudinary: ${result.public_id}`);

      return {
        success: true,
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        metadata: {
          originalName: file.originalname,
          mimeType: file.mimetype,
          uploadedAt: new Date().toISOString(),
          version: result.version,
          signature: result.signature
        },
        provider: 'cloudinary'
      };

    } catch (error) {
      logger.error('Cloudinary upload failed:', error);
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  /**
   * Upload multiple files to Cloudinary
   */
  async uploadMultipleFiles(files, options = {}) {
    try {
      const results = [];
      
      for (const file of files) {
        try {
          const result = await this.uploadFile(file, options);
          results.push({
            success: true,
            ...result
          });
        } catch (error) {
          results.push({
            success: false,
            originalName: file.originalname,
            error: error.message
          });
        }
      }

      return {
        success: true,
        results: results,
        totalUploaded: results.filter(r => r.success).length,
        totalFailed: results.filter(r => !r.success).length,
        provider: 'cloudinary'
      };

    } catch (error) {
      logger.error('Cloudinary multiple upload failed:', error);
      throw new Error(`Cloudinary multiple upload failed: ${error.message}`);
    }
  }

  /**
   * Get file from Cloudinary
   */
  async getFile(publicId, options = {}) {
    try {
      if (!this.isConfigured()) {
        throw new Error('Cloudinary not configured');
      }

      const {
        resourceType = 'image',
        transformation = {},
        format = 'auto'
      } = options;

      const url = cloudinary.url(publicId, {
        resource_type: resourceType,
        transformation: transformation,
        format: format,
        secure: true
      });

      // Get file details
      const details = await cloudinary.api.resource(publicId, {
        resource_type: resourceType
      });

      return {
        success: true,
        publicId: publicId,
        url: url,
        details: details,
        provider: 'cloudinary'
      };

    } catch (error) {
      logger.error('Cloudinary file retrieval failed:', error);
      throw new Error(`Cloudinary file retrieval failed: ${error.message}`);
    }
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(publicId, options = {}) {
    try {
      if (!this.isConfigured()) {
        throw new Error('Cloudinary not configured');
      }

      const {
        resourceType = 'image',
        invalidate = true
      } = options;

      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: invalidate
      });

      logger.info(`File deleted from Cloudinary: ${publicId}`);

      return {
        success: true,
        publicId: publicId,
        result: result,
        provider: 'cloudinary'
      };

    } catch (error) {
      logger.error('Cloudinary file deletion failed:', error);
      throw new Error(`Cloudinary file deletion failed: ${error.message}`);
    }
  }

  /**
   * Delete multiple files from Cloudinary
   */
  async deleteMultipleFiles(publicIds, options = {}) {
    try {
      const results = [];
      
      for (const publicId of publicIds) {
        try {
          const result = await this.deleteFile(publicId, options);
          results.push({
            success: true,
            ...result
          });
        } catch (error) {
          results.push({
            success: false,
            publicId: publicId,
            error: error.message
          });
        }
      }

      return {
        success: true,
        results: results,
        totalDeleted: results.filter(r => r.success).length,
        totalFailed: results.filter(r => !r.success).length,
        provider: 'cloudinary'
      };

    } catch (error) {
      logger.error('Cloudinary multiple deletion failed:', error);
      throw new Error(`Cloudinary multiple deletion failed: ${error.message}`);
    }
  }

  /**
   * Transform image using Cloudinary
   */
  async transformImage(publicId, transformation, options = {}) {
    try {
      if (!this.isConfigured()) {
        throw new Error('Cloudinary not configured');
      }

      const {
        resourceType = 'image',
        format = 'auto'
      } = options;

      const url = cloudinary.url(publicId, {
        resource_type: resourceType,
        transformation: transformation,
        format: format,
        secure: true
      });

      return {
        success: true,
        publicId: publicId,
        url: url,
        transformation: transformation,
        provider: 'cloudinary'
      };

    } catch (error) {
      logger.error('Cloudinary image transformation failed:', error);
      throw new Error(`Cloudinary image transformation failed: ${error.message}`);
    }
  }

  /**
   * Generate image variations
   */
  async generateVariations(publicId, variations, options = {}) {
    try {
      const results = [];

      for (const variation of variations) {
        try {
          const result = await this.transformImage(publicId, variation.transformation, options);
          results.push({
            success: true,
            name: variation.name,
            ...result
          });
        } catch (error) {
          results.push({
            success: false,
            name: variation.name,
            error: error.message
          });
        }
      }

      return {
        success: true,
        results: results,
        provider: 'cloudinary'
      };

    } catch (error) {
      logger.error('Cloudinary variations generation failed:', error);
      throw new Error(`Cloudinary variations generation failed: ${error.message}`);
    }
  }

  /**
   * Search files in Cloudinary
   */
  async searchFiles(options = {}) {
    try {
      if (!this.isConfigured()) {
        throw new Error('Cloudinary not configured');
      }

      const {
        expression = '',
        maxResults = 100,
        nextCursor = null,
        resourceType = 'image',
        sortBy = 'created_at',
        sortDirection = 'desc'
      } = options;

      const searchOptions = {
        expression: expression,
        max_results: maxResults,
        resource_type: resourceType,
        sort_by: [{ [sortBy]: sortDirection }]
      };

      if (nextCursor) {
        searchOptions.next_cursor = nextCursor;
      }

      const result = await cloudinary.search.execute(searchOptions);

      return {
        success: true,
        resources: result.resources,
        totalCount: result.total_count,
        nextCursor: result.next_cursor,
        provider: 'cloudinary'
      };

    } catch (error) {
      logger.error('Cloudinary search failed:', error);
      throw new Error(`Cloudinary search failed: ${error.message}`);
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats() {
    try {
      if (!this.isConfigured()) {
        throw new Error('Cloudinary not configured');
      }

      const result = await cloudinary.api.usage();

      return {
        success: true,
        stats: {
          plan: result.plan,
          objects: result.objects,
          bandwidth: result.bandwidth,
          storage: result.storage,
          requests: result.requests,
          resources: result.resources,
          derivedResources: result.derived_resources
        },
        provider: 'cloudinary'
      };

    } catch (error) {
      logger.error('Cloudinary usage stats failed:', error);
      throw new Error(`Cloudinary usage stats failed: ${error.message}`);
    }
  }

  /**
   * Create folder
   */
  async createFolder(folderName) {
    try {
      // Cloudinary doesn't have explicit folder creation
      // Folders are created automatically when uploading with folder parameter
      logger.info(`Folder creation requested: ${folderName}`);

      return {
        success: true,
        folderName: folderName,
        message: 'Folder will be created on first upload',
        provider: 'cloudinary'
      };

    } catch (error) {
      logger.error('Cloudinary folder creation failed:', error);
      throw new Error(`Cloudinary folder creation failed: ${error.message}`);
    }
  }

  /**
   * Delete folder
   */
  async deleteFolder(folderName) {
    try {
      if (!this.isConfigured()) {
        throw new Error('Cloudinary not configured');
      }

      // Delete all resources in folder
      const searchResult = await this.searchFiles({
        expression: `folder:${folderName}`,
        maxResults: 1000
      });

      if (searchResult.resources.length > 0) {
        const publicIds = searchResult.resources.map(resource => resource.public_id);
        await this.deleteMultipleFiles(publicIds);
      }

      logger.info(`Folder deleted: ${folderName}`);

      return {
        success: true,
        folderName: folderName,
        deletedResources: searchResult.resources.length,
        provider: 'cloudinary'
      };

    } catch (error) {
      logger.error('Cloudinary folder deletion failed:', error);
      throw new Error(`Cloudinary folder deletion failed: ${error.message}`);
    }
  }

  /**
   * Check if Cloudinary is configured
   */
  isConfigured() {
    return !!(this.config.cloud_name && this.config.api_key && this.config.api_secret);
  }

  /**
   * Health check for Cloudinary service
   */
  async healthCheck() {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          status: 'unhealthy',
          provider: 'cloudinary',
          error: 'Not configured'
        };
      }

      // Test API connection
      await cloudinary.api.ping();

      return {
        success: true,
        status: 'healthy',
        provider: 'cloudinary',
        cloudName: this.config.cloud_name
      };

    } catch (error) {
      logger.error('Cloudinary health check failed:', error);
      return {
        success: false,
        status: 'unhealthy',
        provider: 'cloudinary',
        error: error.message
      };
    }
  }
}

module.exports = new CloudinaryService();

