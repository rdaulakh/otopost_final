const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Memory storage for processing before saving
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    // Images
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Videos
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/webm',
    'video/quicktime',
    // Documents
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/ogg'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Maximum 10 files at once
  }
});

// Middleware for single file upload
const uploadSingle = (fieldName = 'file') => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);
    
    singleUpload(req, res, (error) => {
      if (error) {
        if (error instanceof multer.MulterError) {
          switch (error.code) {
            case 'LIMIT_FILE_SIZE':
              return res.status(400).json({
                message: 'File size too large. Maximum size is 50MB.',
                error: 'FILE_TOO_LARGE'
              });
            case 'LIMIT_FILE_COUNT':
              return res.status(400).json({
                message: 'Too many files. Maximum is 10 files.',
                error: 'TOO_MANY_FILES'
              });
            case 'LIMIT_UNEXPECTED_FILE':
              return res.status(400).json({
                message: 'Unexpected file field.',
                error: 'UNEXPECTED_FILE'
              });
            default:
              return res.status(400).json({
                message: 'File upload error.',
                error: error.code
              });
          }
        } else {
          return res.status(400).json({
            message: error.message,
            error: 'UPLOAD_ERROR'
          });
        }
      }
      
      // Add file validation
      if (!req.file) {
        return res.status(400).json({
          message: 'No file provided',
          error: 'NO_FILE'
        });
      }

      next();
    });
  };
};

// Middleware for multiple file upload
const uploadMultiple = (fieldName = 'files', maxCount = 10) => {
  return (req, res, next) => {
    const multipleUpload = upload.array(fieldName, maxCount);
    
    multipleUpload(req, res, (error) => {
      if (error) {
        if (error instanceof multer.MulterError) {
          switch (error.code) {
            case 'LIMIT_FILE_SIZE':
              return res.status(400).json({
                message: 'One or more files are too large. Maximum size is 50MB per file.',
                error: 'FILE_TOO_LARGE'
              });
            case 'LIMIT_FILE_COUNT':
              return res.status(400).json({
                message: `Too many files. Maximum is ${maxCount} files.`,
                error: 'TOO_MANY_FILES'
              });
            case 'LIMIT_UNEXPECTED_FILE':
              return res.status(400).json({
                message: 'Unexpected file field.',
                error: 'UNEXPECTED_FILE'
              });
            default:
              return res.status(400).json({
                message: 'File upload error.',
                error: error.code
              });
          }
        } else {
          return res.status(400).json({
            message: error.message,
            error: 'UPLOAD_ERROR'
          });
        }
      }
      
      // Add files validation
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          message: 'No files provided',
          error: 'NO_FILES'
        });
      }

      next();
    });
  };
};

// Middleware for mixed file upload (multiple fields)
const uploadFields = (fields) => {
  return (req, res, next) => {
    const fieldsUpload = upload.fields(fields);
    
    fieldsUpload(req, res, (error) => {
      if (error) {
        if (error instanceof multer.MulterError) {
          switch (error.code) {
            case 'LIMIT_FILE_SIZE':
              return res.status(400).json({
                message: 'One or more files are too large. Maximum size is 50MB per file.',
                error: 'FILE_TOO_LARGE'
              });
            case 'LIMIT_FILE_COUNT':
              return res.status(400).json({
                message: 'Too many files in one or more fields.',
                error: 'TOO_MANY_FILES'
              });
            case 'LIMIT_UNEXPECTED_FILE':
              return res.status(400).json({
                message: 'Unexpected file field.',
                error: 'UNEXPECTED_FILE'
              });
            default:
              return res.status(400).json({
                message: 'File upload error.',
                error: error.code
              });
          }
        } else {
          return res.status(400).json({
            message: error.message,
            error: 'UPLOAD_ERROR'
          });
        }
      }

      next();
    });
  };
};

// Progress tracking middleware
const uploadProgress = (req, res, next) => {
  let progress = 0;
  const contentLength = parseInt(req.headers['content-length']);
  
  if (contentLength) {
    req.on('data', (chunk) => {
      progress += chunk.length;
      const percentage = Math.round((progress / contentLength) * 100);
      
      // Emit progress event (can be used with WebSocket)
      req.uploadProgress = percentage;
    });
  }
  
  next();
};

// File type validation middleware
const validateFileType = (allowedTypes) => {
  return (req, res, next) => {
    const files = req.files || [req.file];
    
    for (const file of files) {
      if (file && !allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          message: `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
          error: 'INVALID_FILE_TYPE'
        });
      }
    }
    
    next();
  };
};

// Image-only validation
const validateImageOnly = validateFileType([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
]);

// Video-only validation
const validateVideoOnly = validateFileType([
  'video/mp4',
  'video/avi',
  'video/mov',
  'video/wmv',
  'video/webm',
  'video/quicktime'
]);

// Document-only validation
const validateDocumentOnly = validateFileType([
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadProgress,
  validateFileType,
  validateImageOnly,
  validateVideoOnly,
  validateDocumentOnly
};
