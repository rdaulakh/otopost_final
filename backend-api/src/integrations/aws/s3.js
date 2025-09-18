const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const { logger } = require('../../utils/logger');
const { encrypt, decrypt } = require('../../utils/encryption');

class S3Integration {
    constructor() {
        this.s3 = null;
        this.region = process.env.AWS_REGION || 'us-east-1';
        this.bucketName = process.env.AWS_S3_BUCKET;
    }

    /**
     * Initialize AWS S3 with credentials
     */
    initialize(credentials) {
        const config = {
            region: this.region,
            apiVersion: '2006-03-01'
        };

        if (credentials) {
            config.accessKeyId = decrypt(credentials.accessKeyId);
            config.secretAccessKey = decrypt(credentials.secretAccessKey);
        }

        this.s3 = new AWS.S3(config);
        return this.s3;
    }

    /**
     * Upload file to S3
     */
    async uploadFile(fileData, credentials = null) {
        try {
            const s3Client = this.initialize(credentials);
            
            const params = {
                Bucket: fileData.bucket || this.bucketName,
                Key: fileData.key,
                Body: fileData.body,
                ContentType: fileData.contentType,
                ACL: fileData.acl || 'private'
            };

            // Add metadata if provided
            if (fileData.metadata) {
                params.Metadata = fileData.metadata;
            }

            // Add cache control if provided
            if (fileData.cacheControl) {
                params.CacheControl = fileData.cacheControl;
            }

            // Add content disposition if provided
            if (fileData.contentDisposition) {
                params.ContentDisposition = fileData.contentDisposition;
            }

            // Add server-side encryption if requested
            if (fileData.serverSideEncryption) {
                params.ServerSideEncryption = fileData.serverSideEncryption;
            }

            // Add tags if provided
            if (fileData.tags && Object.keys(fileData.tags).length > 0) {
                const tagString = Object.entries(fileData.tags)
                    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                    .join('&');
                params.Tagging = tagString;
            }

            const result = await s3Client.upload(params).promise();

            logger.info('S3 file uploaded successfully:', {
                bucket: params.Bucket,
                key: params.Key,
                location: result.Location
            });

            return {
                success: true,
                file: {
                    bucket: params.Bucket,
                    key: params.Key,
                    location: result.Location,
                    etag: result.ETag,
                    url: result.Location
                }
            };
        } catch (error) {
            logger.error('S3 uploadFile error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to upload file to S3'
            };
        }
    }

    /**
     * Download file from S3
     */
    async downloadFile(bucket, key, credentials = null) {
        try {
            const s3Client = this.initialize(credentials);
            
            const params = {
                Bucket: bucket || this.bucketName,
                Key: key
            };

            const result = await s3Client.getObject(params).promise();

            return {
                success: true,
                file: {
                    body: result.Body,
                    contentType: result.ContentType,
                    contentLength: result.ContentLength,
                    lastModified: result.LastModified,
                    etag: result.ETag,
                    metadata: result.Metadata
                }
            };
        } catch (error) {
            logger.error('S3 downloadFile error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to download file from S3'
            };
        }
    }

    /**
     * Delete file from S3
     */
    async deleteFile(bucket, key, credentials = null) {
        try {
            const s3Client = this.initialize(credentials);
            
            const params = {
                Bucket: bucket || this.bucketName,
                Key: key
            };

            await s3Client.deleteObject(params).promise();

            logger.info('S3 file deleted successfully:', {
                bucket: params.Bucket,
                key: params.Key
            });

            return {
                success: true,
                message: 'File deleted successfully'
            };
        } catch (error) {
            logger.error('S3 deleteFile error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to delete file from S3'
            };
        }
    }

    /**
     * Delete multiple files from S3
     */
    async deleteFiles(bucket, keys, credentials = null) {
        try {
            const s3Client = this.initialize(credentials);
            
            const params = {
                Bucket: bucket || this.bucketName,
                Delete: {
                    Objects: keys.map(key => ({ Key: key })),
                    Quiet: false
                }
            };

            const result = await s3Client.deleteObjects(params).promise();

            logger.info('S3 files deleted successfully:', {
                bucket: params.Bucket,
                deletedCount: result.Deleted.length,
                errorCount: result.Errors.length
            });

            return {
                success: true,
                deleted: result.Deleted.map(item => item.Key),
                errors: result.Errors.map(error => ({
                    key: error.Key,
                    code: error.Code,
                    message: error.Message
                }))
            };
        } catch (error) {
            logger.error('S3 deleteFiles error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to delete files from S3'
            };
        }
    }

    /**
     * List files in S3 bucket
     */
    async listFiles(bucket, prefix = '', maxKeys = 1000, continuationToken = null, credentials = null) {
        try {
            const s3Client = this.initialize(credentials);
            
            const params = {
                Bucket: bucket || this.bucketName,
                MaxKeys: maxKeys
            };

            if (prefix) {
                params.Prefix = prefix;
            }

            if (continuationToken) {
                params.ContinuationToken = continuationToken;
            }

            const result = await s3Client.listObjectsV2(params).promise();

            return {
                success: true,
                files: result.Contents.map(file => ({
                    key: file.Key,
                    size: file.Size,
                    lastModified: file.LastModified,
                    etag: file.ETag,
                    storageClass: file.StorageClass
                })),
                isTruncated: result.IsTruncated,
                nextContinuationToken: result.NextContinuationToken,
                keyCount: result.KeyCount
            };
        } catch (error) {
            logger.error('S3 listFiles error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to list files from S3'
            };
        }
    }

    /**
     * Get file metadata
     */
    async getFileMetadata(bucket, key, credentials = null) {
        try {
            const s3Client = this.initialize(credentials);
            
            const params = {
                Bucket: bucket || this.bucketName,
                Key: key
            };

            const result = await s3Client.headObject(params).promise();

            return {
                success: true,
                metadata: {
                    contentType: result.ContentType,
                    contentLength: result.ContentLength,
                    lastModified: result.LastModified,
                    etag: result.ETag,
                    cacheControl: result.CacheControl,
                    contentDisposition: result.ContentDisposition,
                    serverSideEncryption: result.ServerSideEncryption,
                    metadata: result.Metadata
                }
            };
        } catch (error) {
            logger.error('S3 getFileMetadata error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to get file metadata from S3'
            };
        }
    }

    /**
     * Generate presigned URL for file access
     */
    async generatePresignedUrl(bucket, key, operation = 'getObject', expiresIn = 3600, credentials = null) {
        try {
            const s3Client = this.initialize(credentials);
            
            const params = {
                Bucket: bucket || this.bucketName,
                Key: key,
                Expires: expiresIn
            };

            const url = await s3Client.getSignedUrlPromise(operation, params);

            return {
                success: true,
                url: url,
                expiresIn: expiresIn,
                expiresAt: new Date(Date.now() + (expiresIn * 1000))
            };
        } catch (error) {
            logger.error('S3 generatePresignedUrl error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to generate presigned URL'
            };
        }
    }

    /**
     * Copy file within S3 or between buckets
     */
    async copyFile(sourceBucket, sourceKey, destBucket, destKey, credentials = null) {
        try {
            const s3Client = this.initialize(credentials);
            
            const params = {
                Bucket: destBucket || this.bucketName,
                CopySource: `${sourceBucket}/${sourceKey}`,
                Key: destKey
            };

            const result = await s3Client.copyObject(params).promise();

            logger.info('S3 file copied successfully:', {
                source: `${sourceBucket}/${sourceKey}`,
                destination: `${destBucket}/${destKey}`
            });

            return {
                success: true,
                file: {
                    bucket: destBucket,
                    key: destKey,
                    etag: result.ETag,
                    copySourceVersionId: result.CopySourceVersionId
                }
            };
        } catch (error) {
            logger.error('S3 copyFile error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to copy file in S3'
            };
        }
    }

    /**
     * Create multipart upload for large files
     */
    async createMultipartUpload(bucket, key, contentType, credentials = null) {
        try {
            const s3Client = this.initialize(credentials);
            
            const params = {
                Bucket: bucket || this.bucketName,
                Key: key,
                ContentType: contentType
            };

            const result = await s3Client.createMultipartUpload(params).promise();

            return {
                success: true,
                uploadId: result.UploadId,
                bucket: result.Bucket,
                key: result.Key
            };
        } catch (error) {
            logger.error('S3 createMultipartUpload error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to create multipart upload'
            };
        }
    }

    /**
     * Upload part for multipart upload
     */
    async uploadPart(bucket, key, uploadId, partNumber, body, credentials = null) {
        try {
            const s3Client = this.initialize(credentials);
            
            const params = {
                Bucket: bucket || this.bucketName,
                Key: key,
                UploadId: uploadId,
                PartNumber: partNumber,
                Body: body
            };

            const result = await s3Client.uploadPart(params).promise();

            return {
                success: true,
                etag: result.ETag,
                partNumber: partNumber
            };
        } catch (error) {
            logger.error('S3 uploadPart error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to upload part'
            };
        }
    }

    /**
     * Complete multipart upload
     */
    async completeMultipartUpload(bucket, key, uploadId, parts, credentials = null) {
        try {
            const s3Client = this.initialize(credentials);
            
            const params = {
                Bucket: bucket || this.bucketName,
                Key: key,
                UploadId: uploadId,
                MultipartUpload: {
                    Parts: parts.map(part => ({
                        ETag: part.etag,
                        PartNumber: part.partNumber
                    }))
                }
            };

            const result = await s3Client.completeMultipartUpload(params).promise();

            logger.info('S3 multipart upload completed successfully:', {
                bucket: result.Bucket,
                key: result.Key,
                location: result.Location
            });

            return {
                success: true,
                file: {
                    bucket: result.Bucket,
                    key: result.Key,
                    location: result.Location,
                    etag: result.ETag
                }
            };
        } catch (error) {
            logger.error('S3 completeMultipartUpload error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to complete multipart upload'
            };
        }
    }

    /**
     * Abort multipart upload
     */
    async abortMultipartUpload(bucket, key, uploadId, credentials = null) {
        try {
            const s3Client = this.initialize(credentials);
            
            const params = {
                Bucket: bucket || this.bucketName,
                Key: key,
                UploadId: uploadId
            };

            await s3Client.abortMultipartUpload(params).promise();

            logger.info('S3 multipart upload aborted successfully:', {
                bucket: bucket,
                key: key,
                uploadId: uploadId
            });

            return {
                success: true,
                message: 'Multipart upload aborted successfully'
            };
        } catch (error) {
            logger.error('S3 abortMultipartUpload error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to abort multipart upload'
            };
        }
    }

    /**
     * Create Multer middleware for direct S3 uploads
     */
    createMulterS3Middleware(options = {}, credentials = null) {
        const s3Client = this.initialize(credentials);
        
        const upload = multer({
            storage: multerS3({
                s3: s3Client,
                bucket: options.bucket || this.bucketName,
                acl: options.acl || 'private',
                key: options.keyGenerator || function (req, file, cb) {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const extension = path.extname(file.originalname);
                    const filename = file.fieldname + '-' + uniqueSuffix + extension;
                    cb(null, `uploads/${filename}`);
                },
                contentType: options.contentType || multerS3.AUTO_CONTENT_TYPE,
                metadata: options.metadata || function (req, file, cb) {
                    cb(null, {
                        fieldName: file.fieldname,
                        originalName: file.originalname,
                        uploadedBy: req.user?.id || 'anonymous',
                        uploadedAt: new Date().toISOString()
                    });
                }
            }),
            limits: {
                fileSize: options.maxFileSize || 10 * 1024 * 1024, // 10MB default
                files: options.maxFiles || 5
            },
            fileFilter: options.fileFilter || function (req, file, cb) {
                // Default: allow images and documents
                const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
                const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
                const mimetype = allowedTypes.test(file.mimetype);
                
                if (mimetype && extname) {
                    return cb(null, true);
                } else {
                    cb(new Error('Invalid file type'));
                }
            }
        });

        return upload;
    }

    /**
     * Set bucket policy
     */
    async setBucketPolicy(bucket, policy, credentials = null) {
        try {
            const s3Client = this.initialize(credentials);
            
            const params = {
                Bucket: bucket || this.bucketName,
                Policy: JSON.stringify(policy)
            };

            await s3Client.putBucketPolicy(params).promise();

            logger.info('S3 bucket policy set successfully:', {
                bucket: params.Bucket
            });

            return {
                success: true,
                message: 'Bucket policy set successfully'
            };
        } catch (error) {
            logger.error('S3 setBucketPolicy error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to set bucket policy'
            };
        }
    }

    /**
     * Set bucket CORS configuration
     */
    async setBucketCors(bucket, corsRules, credentials = null) {
        try {
            const s3Client = this.initialize(credentials);
            
            const params = {
                Bucket: bucket || this.bucketName,
                CORSConfiguration: {
                    CORSRules: corsRules
                }
            };

            await s3Client.putBucketCors(params).promise();

            logger.info('S3 bucket CORS set successfully:', {
                bucket: params.Bucket
            });

            return {
                success: true,
                message: 'Bucket CORS configuration set successfully'
            };
        } catch (error) {
            logger.error('S3 setBucketCors error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to set bucket CORS'
            };
        }
    }

    /**
     * Get bucket location
     */
    async getBucketLocation(bucket, credentials = null) {
        try {
            const s3Client = this.initialize(credentials);
            
            const params = {
                Bucket: bucket || this.bucketName
            };

            const result = await s3Client.getBucketLocation(params).promise();

            return {
                success: true,
                location: result.LocationConstraint || 'us-east-1'
            };
        } catch (error) {
            logger.error('S3 getBucketLocation error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to get bucket location'
            };
        }
    }
}

module.exports = new S3Integration();

