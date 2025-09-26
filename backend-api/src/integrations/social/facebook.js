const axios = require('axios');
const { logger } = require('../../utils/logger');
const { encrypt, decrypt } = require('../../utils/encryption');

class FacebookIntegration {
    constructor() {
        this.baseURL = 'https://graph.facebook.com/v18.0';
        this.apiVersion = 'v18.0';
    }

    /**
     * Get Facebook pages for a user
     */
    async getPages(accessToken) {
        try {
            const response = await axios.get(`${this.baseURL}/me/accounts`, {
                params: {
                    access_token: accessToken,
                    fields: 'id,name,access_token,category,picture,fan_count,about'
                }
            });

            return {
                success: true,
                pages: response.data.data.map(page => ({
                    id: page.id,
                    name: page.name,
                    category: page.category,
                    followers: page.fan_count || 0,
                    about: page.about || '',
                    picture: page.picture?.data?.url || null,
                    accessToken: encrypt(page.access_token)
                }))
            };
        } catch (error) {
            logger.error('Facebook getPages error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to fetch Facebook pages'
            };
        }
    }

    /**
     * Publish a post to Facebook page
     */
    async publishPost(pageId, accessToken, postData) {
        try {
            const decryptedToken = decrypt(accessToken);
            const endpoint = `${this.baseURL}/${pageId}/feed`;

            const payload = {
                access_token: decryptedToken,
                message: postData.content,
                published: postData.published !== false
            };

            // Add media if provided
            if (postData.media && postData.media.length > 0) {
                if (postData.media.length === 1) {
                    // Single image/video
                    const media = postData.media[0];
                    if (media.type === 'image') {
                        payload.url = media.url;
                    } else if (media.type === 'video') {
                        payload.source = media.url;
                        payload.description = postData.content;
                        delete payload.message;
                    }
                } else {
                    // Multiple images (carousel)
                    payload.attached_media = postData.media.map(media => ({
                        media_fbid: media.fbid
                    }));
                }
            }

            // Add link if provided
            if (postData.link) {
                payload.link = postData.link;
            }

            // Schedule post if scheduled_time is provided
            if (postData.scheduledTime) {
                payload.scheduled_publish_time = Math.floor(new Date(postData.scheduledTime).getTime() / 1000);
                payload.published = false;
            }

            const response = await axios.post(endpoint, payload);

            return {
                success: true,
                postId: response.data.id,
                platformPostId: response.data.id
            };
        } catch (error) {
            logger.error('Facebook publishPost error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to publish Facebook post'
            };
        }
    }

    /**
     * Get post analytics
     */
    async getPostAnalytics(postId, accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/${postId}`, {
                params: {
                    access_token: decryptedToken,
                    fields: 'id,message,created_time,likes.summary(true),comments.summary(true),shares,reactions.summary(true)'
                }
            });

            const post = response.data;
            return {
                success: true,
                analytics: {
                    postId: post.id,
                    likes: post.likes?.summary?.total_count || 0,
                    comments: post.comments?.summary?.total_count || 0,
                    shares: post.shares?.count || 0,
                    reactions: post.reactions?.summary?.total_count || 0,
                    createdTime: post.created_time
                }
            };
        } catch (error) {
            logger.error('Facebook getPostAnalytics error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to fetch Facebook post analytics'
            };
        }
    }

    /**
     * Get page insights
     */
    async getPageInsights(pageId, accessToken, metrics = ['page_fans', 'page_impressions', 'page_engaged_users'], period = 'day', since = null, until = null) {
        try {
            const decryptedToken = decrypt(accessToken);
            const params = {
                access_token: decryptedToken,
                metric: metrics.join(','),
                period: period
            };

            if (since) params.since = since;
            if (until) params.until = until;

            const response = await axios.get(`${this.baseURL}/${pageId}/insights`, { params });

            const insights = {};
            response.data.data.forEach(metric => {
                insights[metric.name] = {
                    values: metric.values,
                    title: metric.title,
                    description: metric.description
                };
            });

            return {
                success: true,
                insights
            };
        } catch (error) {
            logger.error('Facebook getPageInsights error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to fetch Facebook page insights'
            };
        }
    }

    /**
     * Upload media to Facebook
     */
    async uploadMedia(pageId, accessToken, mediaUrl, mediaType = 'image') {
        try {
            const decryptedToken = decrypt(accessToken);
            let endpoint, payload;

            if (mediaType === 'image') {
                endpoint = `${this.baseURL}/${pageId}/photos`;
                payload = {
                    access_token: decryptedToken,
                    url: mediaUrl,
                    published: false
                };
            } else if (mediaType === 'video') {
                endpoint = `${this.baseURL}/${pageId}/videos`;
                payload = {
                    access_token: decryptedToken,
                    file_url: mediaUrl,
                    published: false
                };
            }

            const response = await axios.post(endpoint, payload);

            return {
                success: true,
                mediaId: response.data.id,
                fbid: response.data.id
            };
        } catch (error) {
            logger.error('Facebook uploadMedia error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to upload media to Facebook'
            };
        }
    }

    /**
     * Delete a post
     */
    async deletePost(postId, accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            await axios.delete(`${this.baseURL}/${postId}`, {
                params: {
                    access_token: decryptedToken
                }
            });

            return {
                success: true,
                message: 'Post deleted successfully'
            };
        } catch (error) {
            logger.error('Facebook deletePost error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to delete Facebook post'
            };
        }
    }

    /**
     * Validate access token
     */
    async validateToken(accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/me`, {
                params: {
                    access_token: decryptedToken,
                    fields: 'id,name'
                }
            });

            return {
                success: true,
                valid: true,
                user: response.data
            };
        } catch (error) {
            logger.error('Facebook validateToken error:', error.response?.data || error.message);
            return {
                success: false,
                valid: false,
                error: error.response?.data?.error?.message || 'Invalid Facebook access token'
            };
        }
    }

    /**
     * Get rate limit status
     */
    async getRateLimitStatus(accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/me`, {
                params: {
                    access_token: decryptedToken,
                    fields: 'id'
                }
            });

            // Facebook rate limit info is in headers
            const headers = response.headers;
            return {
                success: true,
                rateLimit: {
                    limit: headers['x-app-usage'] ? JSON.parse(headers['x-app-usage']).call_count : null,
                    remaining: headers['x-app-usage'] ? 100 - JSON.parse(headers['x-app-usage']).call_count : null,
                    resetTime: null // Facebook doesn't provide reset time
                }
            };
        } catch (error) {
            logger.error('Facebook getRateLimitStatus error:', error.response?.data || error.message);
            return {
                success: false,
                error: 'Failed to get rate limit status'
            };
        }
    }
}

module.exports = new FacebookIntegration();

