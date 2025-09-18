const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const logger = require('../../utils/logger');

class LocalStorageService {
  constructor() {
    this.basePath = process.env.LOCAL_STORAGE_PATH || path.join(__dirname, '../../../uploads');
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
    this.initializeStorage();
  }

  /**
   * Initialize storage directory
   */
  async initializeStorage() {
    try {
      await fs.mkdir(this.basePath, { recursive: true });
      await fs.mkdir(path.join(this.basePath, 'images'), { recursive: true });
      await fs.mkdir(path.join(this.basePath, 'videos'), { recursive: true });
      await fs.mkdir(path.join(this.basePath, 'documents'), { recursive: true });
      await fs.mkdir(path.join(this.basePath, 'temp'), { recursive: true });
      
      logger.info(`Local storage initialized at: ${this.basePath}`);
    } catch (error) {
      logger.error('Failed to initialize local storage:', error);
    }
  }

  /**
   * Upload file to local storage
   */
  async uploadFile(file, options = {}) {
    try {
      const {
        folder = 'general',
        generateUniqueName = true,
        preserveOriginalName = false,
        allowedTypes = this.allowedMimeTypes
      } = options;

      // Validate file
      this.validateFile(file, allowedTypes);

      // Generate file path
      const fileName = this.generateFileName(file, generateUniqueName, preserveOriginalName);
      const folderPath = path.join(this.basePath, folder);
      const filePath = path.join(folderPath, fileName);

      // Ensure folder exists
      await fs.mkdir(folderPath, { recursive: true });

      // Save file
      await fs.writeFile(filePath, file.buffer);

      // Generate file metadata
      const metadata = await this.generateFileMetadata(filePath, file);

      logger.info(`File uploaded successfully: ${filePath}`);

      return {
        success: true,
        filePath: filePath,
        fileName: fileName,
        url: this.getFileUrl(folder, fileName),
        metadata: metadata,
        provider: 'local'
      };

    } catch (error) {
      logger.error('Local file upload failed:', error);
      throw new Error(`Local file upload failed: ${error.message}`);
    }
  }

  /**
   * Upload multiple files
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
        provider: 'local'
      };

    } catch (error) {
      logger.error('Local multiple file upload failed:', error);
      throw new Error(`Local multiple file upload failed: ${error.message}`);
    }
  }

  /**
   * Get file from storage
   */
  async getFile(filePath) {
    try {
      const fullPath = path.join(this.basePath, filePath);
      
      // Security check - ensure file is within base path
      if (!fullPath.startsWith(this.basePath)) {
        throw new Error('Invalid file path');
      }

      const fileBuffer = await fs.readFile(fullPath);
      const stats = await fs.stat(fullPath);

      return {
        success: true,
        buffer: fileBuffer,
        size: stats.size,
        lastModified: stats.mtime,
        provider: 'local'
      };

    } catch (error) {
      logger.error('Local file retrieval failed:', error);
      throw new Error(`Local file retrieval failed: ${error.message}`);
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(filePath) {
    try {
      const fullPath = path.join(this.basePath, filePath);
      
      // Security check - ensure file is within base path
      if (!fullPath.startsWith(this.basePath)) {
        throw new Error('Invalid file path');
      }

      await fs.unlink(fullPath);

      logger.info(`File deleted successfully: ${filePath}`);

      return {
        success: true,
        filePath: filePath,
        provider: 'local'
      };

    } catch (error) {
      logger.error('Local file deletion failed:', error);
      throw new Error(`Local file deletion failed: ${error.message}`);
    }
  }

  /**
   * List files in directory
   */
  async listFiles(folder = '', options = {}) {
    try {
      const {
        recursive = false,
        includeMetadata = true,
        filter = null
      } = options;

      const folderPath = path.join(this.basePath, folder);
      const files = [];

      await this.scanDirectory(folderPath, files, recursive, includeMetadata, filter);

      return {
        success: true,
        files: files,
        count: files.length,
        provider: 'local'
      };

    } catch (error) {
      logger.error('Local file listing failed:', error);
      throw new Error(`Local file listing failed: ${error.message}`);
    }
  }

  /**
   * Scan directory recursively
   */
  async scanDirectory(dirPath, files, recursive, includeMetadata, filter) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(this.basePath, fullPath);

        if (entry.isDirectory() && recursive) {
          await this.scanDirectory(fullPath, files, recursive, includeMetadata, filter);
        } else if (entry.isFile()) {
          // Apply filter if provided
          if (filter && !filter(entry.name)) {
            continue;
          }

          const fileInfo = {
            name: entry.name,
            path: relativePath,
            url: this.getFileUrl('', relativePath)
          };

          if (includeMetadata) {
            const stats = await fs.stat(fullPath);
            fileInfo.size = stats.size;
            fileInfo.lastModified = stats.mtime;
            fileInfo.created = stats.birthtime;
          }

          files.push(fileInfo);
        }
      }
    } catch (error) {
      logger.error('Error scanning directory:', error);
    }
  }

  /**
   * Create directory
   */
  async createDirectory(folderPath) {
    try {
      const fullPath = path.join(this.basePath, folderPath);
      await fs.mkdir(fullPath, { recursive: true });

      logger.info(`Directory created: ${folderPath}`);

      return {
        success: true,
        path: folderPath,
        provider: 'local'
      };

    } catch (error) {
      logger.error('Directory creation failed:', error);
      throw new Error(`Directory creation failed: ${error.message}`);
    }
  }

  /**
   * Delete directory
   */
  async deleteDirectory(folderPath) {
    try {
      const fullPath = path.join(this.basePath, folderPath);
      
      // Security check
      if (!fullPath.startsWith(this.basePath)) {
        throw new Error('Invalid directory path');
      }

      await fs.rmdir(fullPath, { recursive: true });

      logger.info(`Directory deleted: ${folderPath}`);

      return {
        success: true,
        path: folderPath,
        provider: 'local'
      };

    } catch (error) {
      logger.error('Directory deletion failed:', error);
      throw new Error(`Directory deletion failed: ${error.message}`);
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    try {
      const stats = await this.calculateDirectorySize(this.basePath);

      return {
        success: true,
        stats: {
          totalSize: stats.size,
          totalFiles: stats.files,
          totalDirectories: stats.directories,
          availableSpace: await this.getAvailableSpace()
        },
        provider: 'local'
      };

    } catch (error) {
      logger.error('Storage stats calculation failed:', error);
      throw new Error(`Storage stats calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate directory size
   */
  async calculateDirectorySize(dirPath) {
    let size = 0;
    let files = 0;
    let directories = 0;

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          directories++;
          const subStats = await this.calculateDirectorySize(fullPath);
          size += subStats.size;
          files += subStats.files;
          directories += subStats.directories;
        } else {
          const stats = await fs.stat(fullPath);
          size += stats.size;
          files++;
        }
      }
    } catch (error) {
      logger.error('Error calculating directory size:', error);
    }

    return { size, files, directories };
  }

  /**
   * Get available disk space
   */
  async getAvailableSpace() {
    try {
      const stats = await fs.statfs(this.basePath);
      return stats.bavail * stats.bsize; // Available space in bytes
    } catch (error) {
      logger.error('Error getting available space:', error);
      return null;
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file, allowedTypes) {
    if (!file || !file.buffer) {
      throw new Error('Invalid file data');
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize} bytes`);
    }

    if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} is not allowed`);
    }
  }

  /**
   * Generate file name
   */
  generateFileName(file, generateUniqueName, preserveOriginalName) {
    if (preserveOriginalName) {
      return file.originalname;
    }

    if (generateUniqueName) {
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(8).toString('hex');
      const extension = path.extname(file.originalname);
      return `${timestamp}_${randomString}${extension}`;
    }

    return file.originalname;
  }

  /**
   * Generate file metadata
   */
  async generateFileMetadata(filePath, file) {
    const stats = await fs.stat(filePath);
    
    return {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: stats.size,
      uploadedAt: new Date().toISOString(),
      lastModified: stats.mtime,
      checksum: crypto.createHash('md5').update(file.buffer).digest('hex')
    };
  }

  /**
   * Get file URL
   */
  getFileUrl(folder, fileName) {
    const baseUrl = process.env.LOCAL_STORAGE_URL || 'http://localhost:3001/uploads';
    const filePath = folder ? `${folder}/${fileName}` : fileName;
    return `${baseUrl}/${filePath}`;
  }

  /**
   * Health check for local storage
   */
  async healthCheck() {
    try {
      // Test write access
      const testFile = path.join(this.basePath, 'temp', `health_check_${Date.now()}.txt`);
      await fs.writeFile(testFile, 'health check');
      await fs.unlink(testFile);

      return {
        success: true,
        status: 'healthy',
        provider: 'local-storage',
        basePath: this.basePath
      };

    } catch (error) {
      logger.error('Local storage health check failed:', error);
      return {
        success: false,
        status: 'unhealthy',
        provider: 'local-storage',
        error: error.message
      };
    }
  }
}

module.exports = new LocalStorageService();

