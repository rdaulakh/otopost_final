const axios = require('axios');
const { logger } = require('../../utils/logger');
const { encrypt, decrypt } = require('../../utils/encryption');

class InstagramIntegration {
    constructor() {
        this.baseURL = 'https://graph.facebook.com/v18.0';
        this.apiVersion = 'v18.0';
    }

    /**
     * Get Instagram business accounts
     */
    async getBusinessAccounts(accessToken) {
        try {
            const response = await axios.get(`${this.baseURL}/me/accounts`, {
                params: {
                    access_token: accessToken,
                    fields: 'id,name,instagram_business_account'
                }
            });

            const accounts = [];
            for (const page of response.data.data) {
                if (page.instagram_business_account) {
                    const igAccount = await this.getAccountDetails(page.instagram_business_account.id, accessToken);
                    if (igAccount.success) {
                        accounts.push({
                            ...igAccount.account,
                            pageId: page.id,
                            pageName: page.name
                        });
                    }
                }
            }

            return {
                success: true,
                accounts
            };
        } catch (error) {
            logger.error('Instagram getBusinessAccounts error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to fetch Instagram business accounts'
            };
        }
    }

    /**
     * Get Instagram account details
     */
    async getAccountDetails(accountId, accessToken) {
        try {
            const response = await axios.get(`${this.baseURL}/${accountId}`, {
                params: {
                    access_token: accessToken,
                    fields: 'id,username,name,biography,website,followers_count,follows_count,media_count,profile_picture_url'
                }
            });

            return {
                success: true,
                account: {
                    id: response.data.id,
                    username: response.data.username,
                    name: response.data.name,
                    biography: response.data.biography,
                    website: response.data.website,
                    followersCount: response.data.followers_count,
                    followingCount: response.data.follows_count,
                    mediaCount: response.data.media_count,
                    profilePicture: response.data.profile_picture_url
                }
            };
        } catch (error) {
            logger.error('Instagram getAccountDetails error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to fetch Instagram account details'
            };
        }
    }

    /**
     * Create Instagram media container
     */
    async createMediaContainer(accountId, accessToken, mediaData) {
        try {
            const decryptedToken = decrypt(accessToken);
            let payload = {
                access_token: decryptedToken,
                caption: mediaData.caption
            };

            // Handle different media types
            if (mediaData.type === 'image') {
                payload.image_url = mediaData.url;
            } else if (mediaData.type === 'video') {
                payload.video_url = mediaData.url;
                payload.media_type = 'VIDEO';
            } else if (mediaData.type === 'carousel') {
                payload.media_type = 'CAROUSEL';
                payload.children = mediaData.children.map(child => child.containerId).join(',');
            } else if (mediaData.type === 'reel') {
                payload.video_url = mediaData.url;
                payload.media_type = 'REELS';
            } else if (mediaData.type === 'story') {
                payload.image_url = mediaData.url;
                payload.media_type = 'STORIES';
            }

            // Add location if provided
            if (mediaData.locationId) {
                payload.location_id = mediaData.locationId;
            }

            // Add user tags if provided
            if (mediaData.userTags && mediaData.userTags.length > 0) {
                payload.user_tags = JSON.stringify(mediaData.userTags);
            }

            const response = await axios.post(`${this.baseURL}/${accountId}/media`, payload);

            return {
                success: true,
                containerId: response.data.id
            };
        } catch (error) {
            logger.error('Instagram createMediaContainer error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to create Instagram media container'
            };
        }
    }

    /**
     * Publish Instagram media
     */
    async publishMedia(accountId, accessToken, containerId) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.post(`${this.baseURL}/${accountId}/media_publish`, {
                access_token: decryptedToken,
                creation_id: containerId
            });

            return {
                success: true,
                mediaId: response.data.id,
                platformPostId: response.data.id
            };
        } catch (error) {
            logger.error('Instagram publishMedia error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to publish Instagram media'
            };
        }
    }

    /**
     * Create and publish Instagram post
     */
    async publishPost(accountId, accessToken, postData) {
        try {
            let containerId;

            if (postData.type === 'carousel' && postData.media.length > 1) {
                // Create containers for each carousel item
                const childContainers = [];
                for (const media of postData.media) {
                    const childContainer = await this.createMediaContainer(accountId, accessToken, {
                        type: media.type,
                        url: media.url,
                        caption: '' // No caption for child items
                    });
                    if (childContainer.success) {
                        childContainers.push({ containerId: childContainer.containerId });
                    }
                }

                // Create carousel container
                const carouselContainer = await this.createMediaContainer(accountId, accessToken, {
                    type: 'carousel',
                    caption: postData.content,
                    children: childContainers
                });

                if (!carouselContainer.success) {
                    return carouselContainer;
                }
                containerId = carouselContainer.containerId;
            } else {
                // Single media post
                const media = postData.media && postData.media[0];
                const containerData = {
                    type: media ? media.type : 'image',
                    url: media ? media.url : null,
                    caption: postData.content,
                    locationId: postData.locationId,
                    userTags: postData.userTags
                };

                const container = await this.createMediaContainer(accountId, accessToken, containerData);
                if (!container.success) {
                    return container;
                }
                containerId = container.containerId;
            }

            // Publish the media
            const publishResult = await this.publishMedia(accountId, accessToken, containerId);
            return publishResult;

        } catch (error) {
            logger.error('Instagram publishPost error:', error.response?.data || error.message);
            return {
                success: false,
                error: 'Failed to publish Instagram post'
            };
        }
    }

    /**
     * Get Instagram media analytics
     */
    async getMediaAnalytics(mediaId, accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/${mediaId}/insights`, {
                params: {
                    access_token: decryptedToken,
                    metric: 'engagement,impressions,reach,saved,video_views,likes,comments,shares'
                }
            });

            const analytics = {};
            response.data.data.forEach(metric => {
                analytics[metric.name] = metric.values[0]?.value || 0;
            });

            return {
                success: true,
                analytics: {
                    mediaId,
                    engagement: analytics.engagement || 0,
                    impressions: analytics.impressions || 0,
                    reach: analytics.reach || 0,
                    saved: analytics.saved || 0,
                    videoViews: analytics.video_views || 0,
                    likes: analytics.likes || 0,
                    comments: analytics.comments || 0,
                    shares: analytics.shares || 0
                }
            };
        } catch (error) {
            logger.error('Instagram getMediaAnalytics error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to fetch Instagram media analytics'
            };
        }
    }

    /**
     * Get Instagram account insights
     */
    async getAccountInsights(accountId, accessToken, metrics = ['impressions', 'reach', 'profile_views'], period = 'day', since = null, until = null) {
        try {
            const decryptedToken = decrypt(accessToken);
            const params = {
                access_token: decryptedToken,
                metric: metrics.join(','),
                period: period
            };

            if (since) params.since = since;
            if (until) params.until = until;

            const response = await axios.get(`${this.baseURL}/${accountId}/insights`, { params });

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
            logger.error('Instagram getAccountInsights error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to fetch Instagram account insights'
            };
        }
    }

    /**
     * Get Instagram media list
     */
    async getMediaList(accountId, accessToken, limit = 25) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/${accountId}/media`, {
                params: {
                    access_token: decryptedToken,
                    fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
                    limit: limit
                }
            });

            return {
                success: true,
                media: response.data.data.map(item => ({
                    id: item.id,
                    caption: item.caption,
                    mediaType: item.media_type,
                    mediaUrl: item.media_url,
                    thumbnailUrl: item.thumbnail_url,
                    permalink: item.permalink,
                    timestamp: item.timestamp,
                    likeCount: item.like_count || 0,
                    commentsCount: item.comments_count || 0
                }))
            };
        } catch (error) {
            logger.error('Instagram getMediaList error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to fetch Instagram media list'
            };
        }
    }

    /**
     * Get Instagram hashtag insights
     */
    async getHashtagInsights(hashtagId, accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/${hashtagId}`, {
                params: {
                    access_token: decryptedToken,
                    fields: 'id,name'
                }
            });

            // Get recent media for hashtag
            const mediaResponse = await axios.get(`${this.baseURL}/${hashtagId}/recent_media`, {
                params: {
                    access_token: decryptedToken,
                    fields: 'id,caption,like_count,comments_count,timestamp',
                    limit: 50
                }
            });

            return {
                success: true,
                hashtag: {
                    id: response.data.id,
                    name: response.data.name,
                    recentMedia: mediaResponse.data.data
                }
            };
        } catch (error) {
            logger.error('Instagram getHashtagInsights error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to fetch Instagram hashtag insights'
            };
        }
    }

    /**
     * Delete Instagram media
     */
    async deleteMedia(mediaId, accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            await axios.delete(`${this.baseURL}/${mediaId}`, {
                params: {
                    access_token: decryptedToken
                }
            });

            return {
                success: true,
                message: 'Media deleted successfully'
            };
        } catch (error) {
            logger.error('Instagram deleteMedia error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to delete Instagram media'
            };
        }
    }

    /**
     * Validate Instagram access token
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
            logger.error('Instagram validateToken error:', error.response?.data || error.message);
            return {
                success: false,
                valid: false,
                error: error.response?.data?.error?.message || 'Invalid Instagram access token'
            };
        }
    }
}

module.exports = new InstagramIntegration();

