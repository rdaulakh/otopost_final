const compression = require('compression');
const logger = require('../utils/logger');

/**
 * Compression Middleware
 * Handles response compression for better performance
 */

// Compression configuration
const compressionOptions = {
  // Compression level (1-9, where 9 is highest compression)
  level: parseInt(process.env.COMPRESSION_LEVEL) || 6,
  
  // Threshold for compression (only compress responses larger than this)
  threshold: parseInt(process.env.COMPRESSION_THRESHOLD) || 1024,
  
  // Filter function to determine which responses to compress
  filter: (req, res) => {
    // Don't compress if the response is already compressed
    if (res.getHeader('Content-Encoding')) {
      return false;
    }
    
    // Don't compress if the response is too small
    const contentLength = res.getHeader('Content-Length');
    if (contentLength && parseInt(contentLength) < compressionOptions.threshold) {
      return false;
    }
    
    // Don't compress certain content types
    const contentType = res.getHeader('Content-Type');
    if (contentType) {
      const noCompressTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'video/mp4',
        'video/webm',
        'application/zip',
        'application/gzip',
        'application/x-gzip',
        'application/x-compress',
        'application/x-compressed'
      ];
      
      if (noCompressTypes.some(type => contentType.includes(type))) {
        return false;
      }
    }
    
    // Don't compress if the client doesn't support compression
    const acceptEncoding = req.headers['accept-encoding'];
    if (!acceptEncoding || !acceptEncoding.includes('gzip')) {
      return false;
    }
    
    // Compress everything else
    return true;
  },
  
  // Custom compression function for different content types
  customCompression: (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;
    
    // Override res.send to add compression headers
    res.send = function(data) {
      if (compressionOptions.filter(req, res)) {
        res.setHeader('Content-Encoding', 'gzip');
        res.setHeader('Vary', 'Accept-Encoding');
      }
      return originalSend.call(this, data);
    };
    
    // Override res.json to add compression headers
    res.json = function(data) {
      if (compressionOptions.filter(req, res)) {
        res.setHeader('Content-Encoding', 'gzip');
        res.setHeader('Vary', 'Accept-Encoding');
      }
      return originalJson.call(this, data);
    };
    
    next();
  }
};

// Create compression middleware
const compressionMiddleware = compression(compressionOptions);

// Enhanced compression middleware with logging
const enhancedCompressionMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const originalSize = res.getHeader('Content-Length');
  
  // Add response listener to log compression stats
  res.on('finish', () => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const compressedSize = res.getHeader('Content-Length');
    const encoding = res.getHeader('Content-Encoding');
    
    if (encoding && originalSize && compressedSize) {
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
      logger.debug(`Response compressed: ${originalSize} -> ${compressedSize} bytes (${compressionRatio}% reduction) in ${responseTime}ms`);
    }
  });
  
  // Apply compression
  compressionMiddleware(req, res, next);
};

// Static file compression middleware
const staticCompressionMiddleware = (req, res, next) => {
  // Only apply to static files
  if (req.path.startsWith('/static/') || req.path.startsWith('/public/')) {
    return compressionMiddleware(req, res, next);
  }
  next();
};

// API response compression middleware
const apiCompressionMiddleware = (req, res, next) => {
  // Only apply to API routes
  if (req.path.startsWith('/api/')) {
    return compressionMiddleware(req, res, next);
  }
  next();
};

// Conditional compression based on request headers
const conditionalCompressionMiddleware = (req, res, next) => {
  const acceptEncoding = req.headers['accept-encoding'];
  
  if (!acceptEncoding) {
    return next();
  }
  
  // Check if client supports gzip
  if (acceptEncoding.includes('gzip')) {
    return compressionMiddleware(req, res, next);
  }
  
  // Check if client supports deflate
  if (acceptEncoding.includes('deflate')) {
    const deflateCompression = compression({
      ...compressionOptions,
      method: 'deflate'
    });
    return deflateCompression(req, res, next);
  }
  
  // Check if client supports brotli
  if (acceptEncoding.includes('br')) {
    const brotliCompression = compression({
      ...compressionOptions,
      method: 'brotli'
    });
    return brotliCompression(req, res, next);
  }
  
  next();
};

// Compression statistics middleware
const compressionStatsMiddleware = (req, res, next) => {
  const startTime = Date.now();
  let originalSize = 0;
  let compressedSize = 0;
  
  // Override res.end to capture response size
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    if (chunk) {
      originalSize = Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk, encoding);
    }
    
    const result = originalEnd.call(this, chunk, encoding);
    
    // Log compression stats
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const encodingHeader = res.getHeader('Content-Encoding');
    
    if (encodingHeader) {
      compressedSize = res.getHeader('Content-Length') || 0;
      const compressionRatio = originalSize > 0 ? ((originalSize - compressedSize) / originalSize * 100).toFixed(2) : 0;
      
      logger.info(`Compression stats for ${req.method} ${req.path}: ${originalSize} -> ${compressedSize} bytes (${compressionRatio}% reduction) in ${responseTime}ms`);
    }
    
    return result;
  };
  
  next();
};

// Memory usage monitoring for compression
const compressionMemoryMiddleware = (req, res, next) => {
  const startMemory = process.memoryUsage();
  
  res.on('finish', () => {
    const endMemory = process.memoryUsage();
    const memoryDiff = endMemory.heapUsed - startMemory.heapUsed;
    
    if (memoryDiff > 10 * 1024 * 1024) { // 10MB threshold
      logger.warn(`High memory usage during compression: ${memoryDiff / 1024 / 1024}MB`);
    }
  });
  
  next();
};

// Compression error handling
const compressionErrorMiddleware = (err, req, res, next) => {
  if (err.code === 'ENOTSUP' || err.code === 'ENOSYS') {
    logger.warn('Compression not supported, falling back to uncompressed response');
    return next();
  }
  
  if (err.code === 'Z_DATA_ERROR' || err.code === 'Z_BUF_ERROR') {
    logger.warn('Compression error, falling back to uncompressed response');
    return next();
  }
  
  logger.error('Compression error:', err);
  next(err);
};

// Get compression statistics
const getCompressionStats = () => {
  return {
    enabled: true,
    level: compressionOptions.level,
    threshold: compressionOptions.threshold,
    supportedMethods: ['gzip', 'deflate', 'brotli'],
    memoryUsage: process.memoryUsage()
  };
};

// Disable compression for specific routes
const disableCompressionForRoutes = (routes) => {
  return (req, res, next) => {
    if (routes.some(route => req.path.startsWith(route))) {
      return next();
    }
    return compressionMiddleware(req, res, next);
  };
};

// Enable compression only for specific routes
const enableCompressionForRoutes = (routes) => {
  return (req, res, next) => {
    if (routes.some(route => req.path.startsWith(route))) {
      return compressionMiddleware(req, res, next);
    }
    return next();
  };
};

// Compression middleware factory
const createCompressionMiddleware = (options = {}) => {
  const mergedOptions = { ...compressionOptions, ...options };
  return compression(mergedOptions);
};

module.exports = {
  compressionMiddleware,
  enhancedCompressionMiddleware,
  staticCompressionMiddleware,
  apiCompressionMiddleware,
  conditionalCompressionMiddleware,
  compressionStatsMiddleware,
  compressionMemoryMiddleware,
  compressionErrorMiddleware,
  getCompressionStats,
  disableCompressionForRoutes,
  enableCompressionForRoutes,
  createCompressionMiddleware,
  compressionOptions
};

