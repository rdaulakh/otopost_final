const axios = require('axios');
const { logger } = require('../../utils/logger');
const { encrypt, decrypt } = require('../../utils/encryption');

class TikTokIntegration {
    constructor() {
        this.baseURL = 'https://open-api.tiktok.com';
        this.apiVersion = 'v1.3';
    }

    /**
     * Get TikTok user information
     */
    async getUserInfo(accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.post(`${this.baseURL}/user/info/`, {
                access_token: decryptedToken,
                fields: ['open_id', 'union_id', 'avatar_url', 'avatar_url_100', 'avatar_url_200', 'display_name', 'bio_description', 'profile_deep_link', 'is_verified', 'follower_count', 'following_count', 'likes_count', 'video_count']
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.error.code !== 'ok') {
                throw new Error(response.data.error.message);
            }

            const user = response.data.data.user;
            return {
                success: true,
                user: {
                    openId: user.open_id,
                    unionId: user.union_id,
                    displayName: user.display_name,
                    avatarUrl: user.avatar_url_100,
                    bioDescription: user.bio_description,
                    profileDeepLink: user.profile_deep_link,
                    isVerified: user.is_verified,
                    followerCount: user.follower_count,
                    followingCount: user.following_count,
                    likesCount: user.likes_count,
                    videoCount: user.video_count
                }
            };
        } catch (error) {
            logger.error('TikTok getUserInfo error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to fetch TikTok user info'
            };
        }
    }

    /**
     * Upload video to TikTok
     */
    async uploadVideo(accessToken, videoData) {
        try {
            const decryptedToken = decrypt(accessToken);
            
            // Step 1: Initialize video upload
            const initResponse = await axios.post(`${this.baseURL}/share/video/upload/`, {
                access_token: decryptedToken,
                video_size: videoData.size,
                chunk_size: videoData.chunkSize || 10000000, // 10MB chunks
                total_chunk_count: Math.ceil(videoData.size / (videoData.chunkSize || 10000000))
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (initResponse.data.error.code !== 'ok') {
                throw new Error(initResponse.data.error.message);
            }

            const uploadUrl = initResponse.data.data.upload_url;
            const publishId = initResponse.data.data.publish_id;

            // Step 2: Upload video chunks
            const videoBuffer = await this.downloadVideo(videoData.url);
            const chunkSize = videoData.chunkSize || 10000000;
            const totalChunks = Math.ceil(videoBuffer.length / chunkSize);

            for (let i = 0; i < totalChunks; i++) {
                const start = i * chunkSize;
                const end = Math.min(start + chunkSize, videoBuffer.length);
                const chunk = videoBuffer.slice(start, end);

                await axios.put(uploadUrl, chunk, {
                    headers: {
                        'Content-Type': 'video/mp4',
                        'Content-Range': `bytes ${start}-${end - 1}/${videoBuffer.length}`
                    }
                });
            }

            // Step 3: Publish video
            const publishResponse = await this.publishVideo(accessToken, publishId, videoData);
            return publishResponse;

        } catch (error) {
            logger.error('TikTok uploadVideo error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to upload video to TikTok'
            };
        }
    }

    /**
     * Publish TikTok video
     */
    async publishVideo(accessToken, publishId, videoData) {
        try {
            const decryptedToken = decrypt(accessToken);
            const payload = {
                access_token: decryptedToken,
                publish_id: publishId,
                post_info: {
                    title: videoData.title || '',
                    description: videoData.description || '',
                    privacy_level: videoData.privacyLevel || 'SELF_ONLY', // PUBLIC_TO_EVERYONE, MUTUAL_FOLLOW_FRIENDS, SELF_ONLY
                    disable_duet: videoData.disableDuet || false,
                    disable_comment: videoData.disableComment || false,
                    disable_stitch: videoData.disableStitch || false,
                    video_cover_timestamp_ms: videoData.coverTimestamp || 1000
                }
            };

            const response = await axios.post(`${this.baseURL}/share/video/publish/`, payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.error.code !== 'ok') {
                throw new Error(response.data.error.message);
            }

            return {
                success: true,
                shareId: response.data.data.share_id,
                platformPostId: response.data.data.share_id
            };
        } catch (error) {
            logger.error('TikTok publishVideo error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to publish TikTok video'
            };
        }
    }

    /**
     * Get TikTok video list
     */
    async getVideoList(accessToken, cursor = 0, maxCount = 20) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.post(`${this.baseURL}/video/list/`, {
                access_token: decryptedToken,
                cursor: cursor,
                max_count: maxCount,
                fields: ['id', 'title', 'video_description', 'duration', 'cover_image_url', 'share_url', 'embed_html', 'embed_link', 'create_time', 'view_count', 'like_count', 'comment_count', 'share_count']
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.error.code !== 'ok') {
                throw new Error(response.data.error.message);
            }

            const videos = response.data.data.videos.map(video => ({
                id: video.id,
                title: video.title,
                description: video.video_description,
                duration: video.duration,
                coverImageUrl: video.cover_image_url,
                shareUrl: video.share_url,
                embedHtml: video.embed_html,
                embedLink: video.embed_link,
                createTime: new Date(video.create_time * 1000),
                viewCount: video.view_count,
                likeCount: video.like_count,
                commentCount: video.comment_count,
                shareCount: video.share_count
            }));

            return {
                success: true,
                videos: videos,
                cursor: response.data.data.cursor,
                hasMore: response.data.data.has_more
            };
        } catch (error) {
            logger.error('TikTok getVideoList error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to fetch TikTok video list'
            };
        }
    }

    /**
     * Get TikTok video analytics
     */
    async getVideoAnalytics(videoId, accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.post(`${this.baseURL}/video/query/`, {
                access_token: decryptedToken,
                video_ids: [videoId],
                fields: ['id', 'title', 'create_time', 'cover_image_url', 'share_url', 'view_count', 'like_count', 'comment_count', 'share_count', 'download_count']
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.error.code !== 'ok') {
                throw new Error(response.data.error.message);
            }

            const video = response.data.data.videos[0];
            return {
                success: true,
                analytics: {
                    videoId: video.id,
                    title: video.title,
                    createTime: new Date(video.create_time * 1000),
                    coverImageUrl: video.cover_image_url,
                    shareUrl: video.share_url,
                    viewCount: video.view_count,
                    likeCount: video.like_count,
                    commentCount: video.comment_count,
                    shareCount: video.share_count,
                    downloadCount: video.download_count
                }
            };
        } catch (error) {
            logger.error('TikTok getVideoAnalytics error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to fetch TikTok video analytics'
            };
        }
    }

    /**
     * Get TikTok research insights (trending hashtags, etc.)
     */
    async getResearchInsights(accessToken, query, searchType = 'hashtag') {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.post(`${this.baseURL}/research/adlib/`, {
                access_token: decryptedToken,
                query: query,
                search_type: searchType, // hashtag, keyword, user
                count: 50
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.error.code !== 'ok') {
                throw new Error(response.data.error.message);
            }

            return {
                success: true,
                insights: response.data.data.results.map(result => ({
                    id: result.id,
                    name: result.name,
                    type: result.type,
                    videoCount: result.video_count,
                    viewCount: result.view_count,
                    isCommercial: result.is_commercial
                }))
            };
        } catch (error) {
            logger.error('TikTok getResearchInsights error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to fetch TikTok research insights'
            };
        }
    }

    /**
     * Get TikTok hashtag suggestions
     */
    async getHashtagSuggestions(accessToken, keywords) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.post(`${this.baseURL}/research/hashtag/suggest/`, {
                access_token: decryptedToken,
                keywords: keywords,
                count: 20
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.error.code !== 'ok') {
                throw new Error(response.data.error.message);
            }

            return {
                success: true,
                hashtags: response.data.data.hashtags.map(hashtag => ({
                    name: hashtag.hashtag_name,
                    videoCount: hashtag.video_count,
                    viewCount: hashtag.view_count,
                    isCommercial: hashtag.is_commercial
                }))
            };
        } catch (error) {
            logger.error('TikTok getHashtagSuggestions error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to fetch TikTok hashtag suggestions'
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
            logger.error('TikTok downloadVideo error:', error.message);
            throw new Error('Failed to download video');
        }
    }

    /**
     * Validate TikTok access token
     */
    async validateToken(accessToken) {
        try {
            const userInfo = await this.getUserInfo(accessToken);
            return {
                success: userInfo.success,
                valid: userInfo.success,
                user: userInfo.user,
                error: userInfo.error
            };
        } catch (error) {
            logger.error('TikTok validateToken error:', error.message);
            return {
                success: false,
                valid: false,
                error: 'Invalid TikTok access token'
            };
        }
    }

    /**
     * Get rate limit status
     */
    async getRateLimitStatus(accessToken) {
        try {
            // TikTok doesn't provide explicit rate limit headers
            // We'll make a lightweight request to check token validity
            const validation = await this.validateToken(accessToken);
            
            return {
                success: validation.success,
                rateLimit: {
                    limit: 1000, // TikTok's typical daily limit
                    remaining: validation.success ? 999 : 0, // Estimated
                    resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
                }
            };
        } catch (error) {
            logger.error('TikTok getRateLimitStatus error:', error.message);
            return {
                success: false,
                error: 'Failed to get rate limit status'
            };
        }
    }

    /**
     * Get TikTok trending content
     */
    async getTrendingContent(accessToken, region = 'US', count = 50) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.post(`${this.baseURL}/research/trending/`, {
                access_token: decryptedToken,
                region: region,
                count: count,
                type: 'video' // video, hashtag, effect
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.error.code !== 'ok') {
                throw new Error(response.data.error.message);
            }

            return {
                success: true,
                trending: response.data.data.results.map(item => ({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    viewCount: item.view_count,
                    likeCount: item.like_count,
                    shareCount: item.share_count,
                    trendingScore: item.trending_score,
                    category: item.category
                }))
            };
        } catch (error) {
            logger.error('TikTok getTrendingContent error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to fetch TikTok trending content'
            };
        }
    }
}

module.exports = new TikTokIntegration();

