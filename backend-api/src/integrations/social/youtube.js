const axios = require('axios');
const { logger } = require('../../utils/logger');
const { encrypt, decrypt } = require('../../utils/encryption');

class YouTubeIntegration {
    constructor() {
        this.baseURL = 'https://www.googleapis.com/youtube/v3';
        this.uploadURL = 'https://www.googleapis.com/upload/youtube/v3';
        this.apiVersion = 'v3';
    }

    /**
     * Get YouTube channel information
     */
    async getChannelInfo(accessToken, channelId = 'mine') {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/channels`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    part: 'snippet,statistics,contentDetails,brandingSettings,status',
                    id: channelId === 'mine' ? undefined : channelId,
                    mine: channelId === 'mine' ? true : undefined
                }
            });

            if (!response.data.items || response.data.items.length === 0) {
                throw new Error('Channel not found');
            }

            const channel = response.data.items[0];
            return {
                success: true,
                channel: {
                    id: channel.id,
                    title: channel.snippet.title,
                    description: channel.snippet.description,
                    customUrl: channel.snippet.customUrl,
                    publishedAt: channel.snippet.publishedAt,
                    thumbnails: channel.snippet.thumbnails,
                    country: channel.snippet.country,
                    viewCount: parseInt(channel.statistics.viewCount) || 0,
                    subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
                    videoCount: parseInt(channel.statistics.videoCount) || 0,
                    uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
                    keywords: channel.brandingSettings?.channel?.keywords || '',
                    privacyStatus: channel.status?.privacyStatus || 'public'
                }
            };
        } catch (error) {
            logger.error('YouTube getChannelInfo error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to fetch YouTube channel info'
            };
        }
    }

    /**
     * Upload video to YouTube
     */
    async uploadVideo(accessToken, videoData) {
        try {
            const decryptedToken = decrypt(accessToken);
            
            // Step 1: Download video
            const videoBuffer = await this.downloadVideo(videoData.url);
            
            // Step 2: Prepare metadata
            const metadata = {
                snippet: {
                    title: videoData.title,
                    description: videoData.description || '',
                    tags: videoData.tags || [],
                    categoryId: videoData.categoryId || '22', // People & Blogs
                    defaultLanguage: videoData.language || 'en',
                    defaultAudioLanguage: videoData.audioLanguage || 'en'
                },
                status: {
                    privacyStatus: videoData.privacyStatus || 'private', // private, unlisted, public
                    embeddable: videoData.embeddable !== false,
                    license: videoData.license || 'youtube',
                    publicStatsViewable: videoData.publicStatsViewable !== false,
                    publishAt: videoData.publishAt || undefined,
                    selfDeclaredMadeForKids: videoData.madeForKids || false
                }
            };

            // Step 3: Upload video
            const uploadResponse = await axios.post(`${this.uploadURL}/videos`, videoBuffer, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'video/*',
                    'X-Upload-Content-Length': videoBuffer.length,
                    'X-Upload-Content-Type': 'video/*'
                },
                params: {
                    part: 'snippet,status',
                    uploadType: 'media'
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });

            // Step 4: Update video metadata
            const videoId = uploadResponse.data.id;
            await axios.put(`${this.baseURL}/videos`, metadata, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    part: 'snippet,status'
                }
            });

            return {
                success: true,
                videoId: videoId,
                platformPostId: videoId,
                url: `https://www.youtube.com/watch?v=${videoId}`
            };
        } catch (error) {
            logger.error('YouTube uploadVideo error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to upload video to YouTube'
            };
        }
    }

    /**
     * Get YouTube video analytics
     */
    async getVideoAnalytics(videoId, accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/videos`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    part: 'snippet,statistics,contentDetails,status',
                    id: videoId
                }
            });

            if (!response.data.items || response.data.items.length === 0) {
                throw new Error('Video not found');
            }

            const video = response.data.items[0];
            return {
                success: true,
                analytics: {
                    videoId: video.id,
                    title: video.snippet.title,
                    description: video.snippet.description,
                    publishedAt: video.snippet.publishedAt,
                    thumbnails: video.snippet.thumbnails,
                    duration: video.contentDetails.duration,
                    viewCount: parseInt(video.statistics.viewCount) || 0,
                    likeCount: parseInt(video.statistics.likeCount) || 0,
                    commentCount: parseInt(video.statistics.commentCount) || 0,
                    favoriteCount: parseInt(video.statistics.favoriteCount) || 0,
                    privacyStatus: video.status.privacyStatus,
                    uploadStatus: video.status.uploadStatus,
                    url: `https://www.youtube.com/watch?v=${video.id}`
                }
            };
        } catch (error) {
            logger.error('YouTube getVideoAnalytics error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to fetch YouTube video analytics'
            };
        }
    }

    /**
     * Get channel videos
     */
    async getChannelVideos(accessToken, channelId = 'mine', maxResults = 25) {
        try {
            const decryptedToken = decrypt(accessToken);
            
            // First get the uploads playlist ID
            const channelResponse = await this.getChannelInfo(accessToken, channelId);
            if (!channelResponse.success) {
                throw new Error('Failed to get channel info');
            }

            const uploadsPlaylistId = channelResponse.channel.uploadsPlaylistId;

            // Get videos from uploads playlist
            const response = await axios.get(`${this.baseURL}/playlistItems`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    part: 'snippet,contentDetails',
                    playlistId: uploadsPlaylistId,
                    maxResults: maxResults
                }
            });

            const videos = response.data.items.map(item => ({
                videoId: item.contentDetails.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                publishedAt: item.snippet.publishedAt,
                thumbnails: item.snippet.thumbnails,
                url: `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`
            }));

            return {
                success: true,
                videos: videos,
                nextPageToken: response.data.nextPageToken
            };
        } catch (error) {
            logger.error('YouTube getChannelVideos error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to fetch YouTube channel videos'
            };
        }
    }

    /**
     * Get YouTube Analytics (requires YouTube Analytics API)
     */
    async getChannelAnalytics(accessToken, channelId, startDate, endDate, metrics = 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained') {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get('https://youtubeanalytics.googleapis.com/v2/reports', {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    ids: `channel==${channelId}`,
                    startDate: startDate,
                    endDate: endDate,
                    metrics: metrics,
                    dimensions: 'day',
                    sort: 'day'
                }
            });

            return {
                success: true,
                analytics: {
                    channelId: channelId,
                    startDate: startDate,
                    endDate: endDate,
                    columnHeaders: response.data.columnHeaders,
                    rows: response.data.rows
                }
            };
        } catch (error) {
            logger.error('YouTube getChannelAnalytics error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to fetch YouTube channel analytics'
            };
        }
    }

    /**
     * Search YouTube videos
     */
    async searchVideos(accessToken, query, maxResults = 25, order = 'relevance') {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/search`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    part: 'snippet',
                    q: query,
                    type: 'video',
                    maxResults: maxResults,
                    order: order, // relevance, date, rating, viewCount, title
                    safeSearch: 'moderate'
                }
            });

            const videos = response.data.items.map(item => ({
                videoId: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                channelTitle: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt,
                thumbnails: item.snippet.thumbnails,
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`
            }));

            return {
                success: true,
                videos: videos,
                nextPageToken: response.data.nextPageToken
            };
        } catch (error) {
            logger.error('YouTube searchVideos error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to search YouTube videos'
            };
        }
    }

    /**
     * Get video comments
     */
    async getVideoComments(videoId, accessToken, maxResults = 20) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/commentThreads`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    part: 'snippet,replies',
                    videoId: videoId,
                    maxResults: maxResults,
                    order: 'time'
                }
            });

            const comments = response.data.items.map(item => ({
                id: item.id,
                authorDisplayName: item.snippet.topLevelComment.snippet.authorDisplayName,
                authorProfileImageUrl: item.snippet.topLevelComment.snippet.authorProfileImageUrl,
                textDisplay: item.snippet.topLevelComment.snippet.textDisplay,
                likeCount: item.snippet.topLevelComment.snippet.likeCount,
                publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
                replyCount: item.snippet.totalReplyCount || 0,
                replies: item.replies ? item.replies.comments.map(reply => ({
                    id: reply.id,
                    authorDisplayName: reply.snippet.authorDisplayName,
                    textDisplay: reply.snippet.textDisplay,
                    likeCount: reply.snippet.likeCount,
                    publishedAt: reply.snippet.publishedAt
                })) : []
            }));

            return {
                success: true,
                comments: comments,
                nextPageToken: response.data.nextPageToken
            };
        } catch (error) {
            logger.error('YouTube getVideoComments error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to fetch YouTube video comments'
            };
        }
    }

    /**
     * Create playlist
     */
    async createPlaylist(accessToken, playlistData) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.post(`${this.baseURL}/playlists`, {
                snippet: {
                    title: playlistData.title,
                    description: playlistData.description || '',
                    tags: playlistData.tags || [],
                    defaultLanguage: playlistData.language || 'en'
                },
                status: {
                    privacyStatus: playlistData.privacyStatus || 'private'
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    part: 'snippet,status'
                }
            });

            return {
                success: true,
                playlistId: response.data.id,
                title: response.data.snippet.title,
                url: `https://www.youtube.com/playlist?list=${response.data.id}`
            };
        } catch (error) {
            logger.error('YouTube createPlaylist error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to create YouTube playlist'
            };
        }
    }

    /**
     * Add video to playlist
     */
    async addVideoToPlaylist(accessToken, playlistId, videoId, position = 0) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.post(`${this.baseURL}/playlistItems`, {
                snippet: {
                    playlistId: playlistId,
                    position: position,
                    resourceId: {
                        kind: 'youtube#video',
                        videoId: videoId
                    }
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    part: 'snippet'
                }
            });

            return {
                success: true,
                playlistItemId: response.data.id
            };
        } catch (error) {
            logger.error('YouTube addVideoToPlaylist error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to add video to YouTube playlist'
            };
        }
    }

    /**
     * Delete video
     */
    async deleteVideo(videoId, accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            await axios.delete(`${this.baseURL}/videos`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    id: videoId
                }
            });

            return {
                success: true,
                message: 'Video deleted successfully'
            };
        } catch (error) {
            logger.error('YouTube deleteVideo error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to delete YouTube video'
            };
        }
    }

    /**
     * Download video from URL
     */
    async downloadVideo(videoUrl) {
        try {
            const response = await axios.get(videoUrl, { responseType: 'arraybuffer' });
            return Buffer.from(response.data);
        } catch (error) {
            logger.error('YouTube downloadVideo error:', error.message);
            throw new Error('Failed to download video');
        }
    }

    /**
     * Validate YouTube access token
     */
    async validateToken(accessToken) {
        try {
            const channelInfo = await this.getChannelInfo(accessToken);
            return {
                success: channelInfo.success,
                valid: channelInfo.success,
                channel: channelInfo.channel,
                error: channelInfo.error
            };
        } catch (error) {
            logger.error('YouTube validateToken error:', error.message);
            return {
                success: false,
                valid: false,
                error: 'Invalid YouTube access token'
            };
        }
    }

    /**
     * Get rate limit status
     */
    async getRateLimitStatus(accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/channels`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    part: 'id',
                    mine: true
                }
            });

            // YouTube API quota info is not in headers, but we can estimate
            return {
                success: true,
                rateLimit: {
                    limit: 10000, // YouTube's daily quota limit
                    remaining: 9999, // Estimated
                    resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
                }
            };
        } catch (error) {
            logger.error('YouTube getRateLimitStatus error:', error.response?.data || error.message);
            return {
                success: false,
                error: 'Failed to get rate limit status'
            };
        }
    }
}

module.exports = new YouTubeIntegration();

