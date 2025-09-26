const axios = require('axios');
const { logger } = require('../../utils/logger');
const { encrypt, decrypt } = require('../../utils/encryption');

class PinterestIntegration {
    constructor() {
        this.baseURL = 'https://api.pinterest.com/v5';
        this.apiVersion = 'v5';
    }

    /**
     * Get Pinterest user information
     */
    async getUserInfo(accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/user_account`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                }
            });

            const user = response.data;
            return {
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    displayName: user.display_name,
                    bio: user.bio,
                    profileImage: user.profile_image,
                    websiteUrl: user.website_url,
                    accountType: user.account_type,
                    businessName: user.business_name,
                    followerCount: user.follower_count,
                    followingCount: user.following_count,
                    boardCount: user.board_count,
                    pinCount: user.pin_count,
                    monthlyViews: user.monthly_views
                }
            };
        } catch (error) {
            logger.error('Pinterest getUserInfo error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch Pinterest user info'
            };
        }
    }

    /**
     * Get Pinterest boards
     */
    async getBoards(accessToken, pageSize = 25, bookmark = null) {
        try {
            const decryptedToken = decrypt(accessToken);
            const params = {
                page_size: pageSize
            };
            if (bookmark) {
                params.bookmark = bookmark;
            }

            const response = await axios.get(`${this.baseURL}/boards`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: params
            });

            const boards = response.data.items.map(board => ({
                id: board.id,
                name: board.name,
                description: board.description,
                collaboratorCount: board.collaborator_count,
                pinCount: board.pin_count,
                followerCount: board.follower_count,
                media: board.media,
                owner: board.owner,
                createdAt: board.created_at,
                boardUrl: board.board_url,
                privacy: board.privacy
            }));

            return {
                success: true,
                boards: boards,
                bookmark: response.data.bookmark
            };
        } catch (error) {
            logger.error('Pinterest getBoards error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch Pinterest boards'
            };
        }
    }

    /**
     * Create Pinterest board
     */
    async createBoard(accessToken, boardData) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.post(`${this.baseURL}/boards`, {
                name: boardData.name,
                description: boardData.description || '',
                privacy: boardData.privacy || 'PUBLIC' // PUBLIC, PROTECTED, SECRET
            }, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                board: {
                    id: response.data.id,
                    name: response.data.name,
                    description: response.data.description,
                    privacy: response.data.privacy,
                    boardUrl: response.data.board_url
                }
            };
        } catch (error) {
            logger.error('Pinterest createBoard error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to create Pinterest board'
            };
        }
    }

    /**
     * Create Pinterest pin
     */
    async createPin(accessToken, pinData) {
        try {
            const decryptedToken = decrypt(accessToken);
            const payload = {
                board_id: pinData.boardId,
                title: pinData.title,
                description: pinData.description || '',
                link: pinData.link || null,
                media_source: {
                    source_type: 'image_url',
                    url: pinData.imageUrl
                }
            };

            // Add additional fields if provided
            if (pinData.altText) {
                payload.alt_text = pinData.altText;
            }
            if (pinData.note) {
                payload.note = pinData.note;
            }

            const response = await axios.post(`${this.baseURL}/pins`, payload, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                pin: {
                    id: response.data.id,
                    title: response.data.title,
                    description: response.data.description,
                    link: response.data.link,
                    createdAt: response.data.created_at,
                    boardId: response.data.board_id,
                    pinUrl: `https://www.pinterest.com/pin/${response.data.id}/`,
                    media: response.data.media
                },
                platformPostId: response.data.id
            };
        } catch (error) {
            logger.error('Pinterest createPin error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to create Pinterest pin'
            };
        }
    }

    /**
     * Get Pinterest pin analytics
     */
    async getPinAnalytics(pinId, accessToken, startDate, endDate, metricTypes = ['IMPRESSION', 'SAVE', 'PIN_CLICK', 'OUTBOUND_CLICK']) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/pins/${pinId}/analytics`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    metric_types: metricTypes.join(','),
                    app_types: 'ALL',
                    split_field: 'NO_SPLIT',
                    granularity: 'DAY'
                }
            });

            const analytics = response.data.daily_metrics.reduce((acc, metric) => {
                acc[metric.metric_type] = metric.data_points.reduce((sum, point) => sum + point.value, 0);
                return acc;
            }, {});

            return {
                success: true,
                analytics: {
                    pinId: pinId,
                    startDate: startDate,
                    endDate: endDate,
                    impressions: analytics.IMPRESSION || 0,
                    saves: analytics.SAVE || 0,
                    pinClicks: analytics.PIN_CLICK || 0,
                    outboundClicks: analytics.OUTBOUND_CLICK || 0,
                    totalEngagement: (analytics.SAVE || 0) + (analytics.PIN_CLICK || 0) + (analytics.OUTBOUND_CLICK || 0)
                }
            };
        } catch (error) {
            logger.error('Pinterest getPinAnalytics error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch Pinterest pin analytics'
            };
        }
    }

    /**
     * Get user account analytics
     */
    async getUserAnalytics(accessToken, startDate, endDate, metricTypes = ['IMPRESSION', 'SAVE', 'PIN_CLICK', 'OUTBOUND_CLICK', 'VIDEO_MRC_VIEW']) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/user_account/analytics`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    metric_types: metricTypes.join(','),
                    app_types: 'ALL',
                    split_field: 'NO_SPLIT',
                    granularity: 'DAY'
                }
            });

            const analytics = response.data.daily_metrics.reduce((acc, metric) => {
                acc[metric.metric_type] = metric.data_points.reduce((sum, point) => sum + point.value, 0);
                return acc;
            }, {});

            return {
                success: true,
                analytics: {
                    startDate: startDate,
                    endDate: endDate,
                    impressions: analytics.IMPRESSION || 0,
                    saves: analytics.SAVE || 0,
                    pinClicks: analytics.PIN_CLICK || 0,
                    outboundClicks: analytics.OUTBOUND_CLICK || 0,
                    videoViews: analytics.VIDEO_MRC_VIEW || 0,
                    totalEngagement: (analytics.SAVE || 0) + (analytics.PIN_CLICK || 0) + (analytics.OUTBOUND_CLICK || 0)
                }
            };
        } catch (error) {
            logger.error('Pinterest getUserAnalytics error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch Pinterest user analytics'
            };
        }
    }

    /**
     * Get board analytics
     */
    async getBoardAnalytics(boardId, accessToken, startDate, endDate, metricTypes = ['IMPRESSION', 'SAVE', 'PIN_CLICK', 'OUTBOUND_CLICK']) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/boards/${boardId}/analytics`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    metric_types: metricTypes.join(','),
                    app_types: 'ALL',
                    split_field: 'NO_SPLIT',
                    granularity: 'DAY'
                }
            });

            const analytics = response.data.daily_metrics.reduce((acc, metric) => {
                acc[metric.metric_type] = metric.data_points.reduce((sum, point) => sum + point.value, 0);
                return acc;
            }, {});

            return {
                success: true,
                analytics: {
                    boardId: boardId,
                    startDate: startDate,
                    endDate: endDate,
                    impressions: analytics.IMPRESSION || 0,
                    saves: analytics.SAVE || 0,
                    pinClicks: analytics.PIN_CLICK || 0,
                    outboundClicks: analytics.OUTBOUND_CLICK || 0,
                    totalEngagement: (analytics.SAVE || 0) + (analytics.PIN_CLICK || 0) + (analytics.OUTBOUND_CLICK || 0)
                }
            };
        } catch (error) {
            logger.error('Pinterest getBoardAnalytics error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch Pinterest board analytics'
            };
        }
    }

    /**
     * Get board pins
     */
    async getBoardPins(boardId, accessToken, pageSize = 25, bookmark = null) {
        try {
            const decryptedToken = decrypt(accessToken);
            const params = {
                page_size: pageSize
            };
            if (bookmark) {
                params.bookmark = bookmark;
            }

            const response = await axios.get(`${this.baseURL}/boards/${boardId}/pins`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: params
            });

            const pins = response.data.items.map(pin => ({
                id: pin.id,
                title: pin.title,
                description: pin.description,
                link: pin.link,
                createdAt: pin.created_at,
                boardId: pin.board_id,
                media: pin.media,
                pinUrl: `https://www.pinterest.com/pin/${pin.id}/`
            }));

            return {
                success: true,
                pins: pins,
                bookmark: response.data.bookmark
            };
        } catch (error) {
            logger.error('Pinterest getBoardPins error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch Pinterest board pins'
            };
        }
    }

    /**
     * Search Pinterest pins
     */
    async searchPins(accessToken, query, pageSize = 25, bookmark = null) {
        try {
            const decryptedToken = decrypt(accessToken);
            const params = {
                query: query,
                page_size: pageSize
            };
            if (bookmark) {
                params.bookmark = bookmark;
            }

            const response = await axios.get(`${this.baseURL}/search/pins`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: params
            });

            const pins = response.data.items.map(pin => ({
                id: pin.id,
                title: pin.title,
                description: pin.description,
                link: pin.link,
                createdAt: pin.created_at,
                media: pin.media,
                pinUrl: `https://www.pinterest.com/pin/${pin.id}/`
            }));

            return {
                success: true,
                pins: pins,
                bookmark: response.data.bookmark
            };
        } catch (error) {
            logger.error('Pinterest searchPins error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to search Pinterest pins'
            };
        }
    }

    /**
     * Get trending keywords
     */
    async getTrendingKeywords(accessToken, region = 'US', trendType = 'growing') {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/trends/keywords/${region}/`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    trend_type: trendType // growing, monthly, weekly, daily
                }
            });

            return {
                success: true,
                keywords: response.data.trends.map(trend => ({
                    keyword: trend.keyword,
                    pctGrowthMom: trend.pct_growth_mom,
                    pctGrowthWow: trend.pct_growth_wow,
                    pctGrowthYoy: trend.pct_growth_yoy,
                    timeSeries: trend.time_series
                }))
            };
        } catch (error) {
            logger.error('Pinterest getTrendingKeywords error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch Pinterest trending keywords'
            };
        }
    }

    /**
     * Delete Pinterest pin
     */
    async deletePin(pinId, accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            await axios.delete(`${this.baseURL}/pins/${pinId}`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                message: 'Pin deleted successfully'
            };
        } catch (error) {
            logger.error('Pinterest deletePin error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to delete Pinterest pin'
            };
        }
    }

    /**
     * Update Pinterest pin
     */
    async updatePin(pinId, accessToken, updateData) {
        try {
            const decryptedToken = decrypt(accessToken);
            const payload = {};
            
            if (updateData.title) payload.title = updateData.title;
            if (updateData.description) payload.description = updateData.description;
            if (updateData.link) payload.link = updateData.link;
            if (updateData.altText) payload.alt_text = updateData.altText;
            if (updateData.boardId) payload.board_id = updateData.boardId;
            if (updateData.note) payload.note = updateData.note;

            const response = await axios.patch(`${this.baseURL}/pins/${pinId}`, payload, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                pin: {
                    id: response.data.id,
                    title: response.data.title,
                    description: response.data.description,
                    link: response.data.link,
                    boardId: response.data.board_id,
                    media: response.data.media
                }
            };
        } catch (error) {
            logger.error('Pinterest updatePin error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to update Pinterest pin'
            };
        }
    }

    /**
     * Validate Pinterest access token
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
            logger.error('Pinterest validateToken error:', error.message);
            return {
                success: false,
                valid: false,
                error: 'Invalid Pinterest access token'
            };
        }
    }

    /**
     * Get rate limit status
     */
    async getRateLimitStatus(accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/user_account`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                }
            });

            // Pinterest rate limit info is in headers
            const headers = response.headers;
            return {
                success: true,
                rateLimit: {
                    limit: headers['x-ratelimit-limit'] ? parseInt(headers['x-ratelimit-limit']) : 1000,
                    remaining: headers['x-ratelimit-remaining'] ? parseInt(headers['x-ratelimit-remaining']) : 999,
                    resetTime: headers['x-ratelimit-reset'] ? new Date(parseInt(headers['x-ratelimit-reset']) * 1000) : new Date(Date.now() + 60 * 60 * 1000)
                }
            };
        } catch (error) {
            logger.error('Pinterest getRateLimitStatus error:', error.response?.data || error.message);
            return {
                success: false,
                error: 'Failed to get rate limit status'
            };
        }
    }
}

module.exports = new PinterestIntegration();

