const axios = require('axios');
const { logger } = require('../../utils/logger');
const { encrypt, decrypt } = require('../../utils/encryption');

class TwitterIntegration {
    constructor() {
        this.baseURL = 'https://api.twitter.com/2';
        this.uploadURL = 'https://upload.twitter.com/1.1';
        this.apiVersion = '2';
    }

    /**
     * Get authenticated user information
     */
    async getUserInfo(accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    'user.fields': 'id,name,username,description,location,url,verified,public_metrics,profile_image_url,created_at'
                }
            });

            const user = response.data.data;
            return {
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    description: user.description,
                    location: user.location,
                    url: user.url,
                    verified: user.verified,
                    followersCount: user.public_metrics?.followers_count || 0,
                    followingCount: user.public_metrics?.following_count || 0,
                    tweetCount: user.public_metrics?.tweet_count || 0,
                    listedCount: user.public_metrics?.listed_count || 0,
                    profileImageUrl: user.profile_image_url,
                    createdAt: user.created_at
                }
            };
        } catch (error) {
            logger.error('Twitter getUserInfo error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.detail || 'Failed to fetch Twitter user info'
            };
        }
    }

    /**
     * Create a tweet
     */
    async createTweet(accessToken, tweetData) {
        try {
            const decryptedToken = decrypt(accessToken);
            const payload = {
                text: tweetData.content
            };

            // Add media if provided
            if (tweetData.media && tweetData.media.length > 0) {
                const mediaIds = [];
                for (const media of tweetData.media) {
                    const uploadResult = await this.uploadMedia(accessToken, media.url, media.type);
                    if (uploadResult.success) {
                        mediaIds.push(uploadResult.mediaId);
                    }
                }
                if (mediaIds.length > 0) {
                    payload.media = { media_ids: mediaIds };
                }
            }

            // Add poll if provided
            if (tweetData.poll) {
                payload.poll = {
                    options: tweetData.poll.options,
                    duration_minutes: tweetData.poll.duration || 1440 // 24 hours default
                };
            }

            // Add reply settings
            if (tweetData.replySettings) {
                payload.reply_settings = tweetData.replySettings; // 'everyone', 'mentionedUsers', 'following'
            }

            // Add location if provided
            if (tweetData.location) {
                payload.geo = {
                    place_id: tweetData.location.placeId
                };
            }

            const response = await axios.post(`${this.baseURL}/tweets`, payload, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                tweetId: response.data.data.id,
                platformPostId: response.data.data.id,
                text: response.data.data.text
            };
        } catch (error) {
            logger.error('Twitter createTweet error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.detail || 'Failed to create tweet'
            };
        }
    }

    /**
     * Upload media to Twitter
     */
    async uploadMedia(accessToken, mediaUrl, mediaType = 'image') {
        try {
            const decryptedToken = decrypt(accessToken);
            
            // First, download the media
            const mediaResponse = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
            const mediaBuffer = Buffer.from(mediaResponse.data);

            // Determine media category
            let mediaCategory = 'tweet_image';
            if (mediaType === 'video') {
                mediaCategory = 'tweet_video';
            } else if (mediaType === 'gif') {
                mediaCategory = 'tweet_gif';
            }

            // Upload media
            const uploadResponse = await axios.post(`${this.uploadURL}/media/upload.json`, {
                media_data: mediaBuffer.toString('base64'),
                media_category: mediaCategory
            }, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return {
                success: true,
                mediaId: uploadResponse.data.media_id_string
            };
        } catch (error) {
            logger.error('Twitter uploadMedia error:', error.response?.data || error.message);
            return {
                success: false,
                error: 'Failed to upload media to Twitter'
            };
        }
    }

    /**
     * Get tweet analytics
     */
    async getTweetAnalytics(tweetId, accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/tweets/${tweetId}`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    'tweet.fields': 'public_metrics,created_at,context_annotations,entities',
                    'expansions': 'author_id'
                }
            });

            const tweet = response.data.data;
            const metrics = tweet.public_metrics;

            return {
                success: true,
                analytics: {
                    tweetId: tweet.id,
                    retweetCount: metrics.retweet_count || 0,
                    likeCount: metrics.like_count || 0,
                    replyCount: metrics.reply_count || 0,
                    quoteCount: metrics.quote_count || 0,
                    impressionCount: metrics.impression_count || 0,
                    createdAt: tweet.created_at,
                    text: tweet.text
                }
            };
        } catch (error) {
            logger.error('Twitter getTweetAnalytics error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.detail || 'Failed to fetch tweet analytics'
            };
        }
    }

    /**
     * Get user tweets
     */
    async getUserTweets(userId, accessToken, maxResults = 10) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/users/${userId}/tweets`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    'tweet.fields': 'public_metrics,created_at,context_annotations',
                    'max_results': maxResults
                }
            });

            return {
                success: true,
                tweets: response.data.data.map(tweet => ({
                    id: tweet.id,
                    text: tweet.text,
                    createdAt: tweet.created_at,
                    publicMetrics: tweet.public_metrics,
                    contextAnnotations: tweet.context_annotations
                }))
            };
        } catch (error) {
            logger.error('Twitter getUserTweets error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.detail || 'Failed to fetch user tweets'
            };
        }
    }

    /**
     * Delete a tweet
     */
    async deleteTweet(tweetId, accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            await axios.delete(`${this.baseURL}/tweets/${tweetId}`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                message: 'Tweet deleted successfully'
            };
        } catch (error) {
            logger.error('Twitter deleteTweet error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.detail || 'Failed to delete tweet'
            };
        }
    }

    /**
     * Search tweets
     */
    async searchTweets(query, accessToken, maxResults = 10) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/tweets/search/recent`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    'query': query,
                    'tweet.fields': 'public_metrics,created_at,author_id,context_annotations',
                    'expansions': 'author_id',
                    'user.fields': 'name,username,verified',
                    'max_results': maxResults
                }
            });

            return {
                success: true,
                tweets: response.data.data || [],
                users: response.data.includes?.users || []
            };
        } catch (error) {
            logger.error('Twitter searchTweets error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.detail || 'Failed to search tweets'
            };
        }
    }

    /**
     * Get trending topics
     */
    async getTrendingTopics(accessToken, woeid = 1) { // 1 = Worldwide
        try {
            const decryptedToken = decrypt(accessToken);
            // Note: This endpoint requires Twitter API v1.1
            const response = await axios.get('https://api.twitter.com/1.1/trends/place.json', {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    'id': woeid
                }
            });

            return {
                success: true,
                trends: response.data[0].trends.map(trend => ({
                    name: trend.name,
                    url: trend.url,
                    tweetVolume: trend.tweet_volume,
                    query: trend.query
                }))
            };
        } catch (error) {
            logger.error('Twitter getTrendingTopics error:', error.response?.data || error.message);
            return {
                success: false,
                error: 'Failed to fetch trending topics'
            };
        }
    }

    /**
     * Follow a user
     */
    async followUser(userId, targetUserId, accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.post(`${this.baseURL}/users/${userId}/following`, {
                target_user_id: targetUserId
            }, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                following: response.data.data.following,
                pendingFollow: response.data.data.pending_follow
            };
        } catch (error) {
            logger.error('Twitter followUser error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.detail || 'Failed to follow user'
            };
        }
    }

    /**
     * Unfollow a user
     */
    async unfollowUser(userId, targetUserId, accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            await axios.delete(`${this.baseURL}/users/${userId}/following/${targetUserId}`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                message: 'User unfollowed successfully'
            };
        } catch (error) {
            logger.error('Twitter unfollowUser error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.detail || 'Failed to unfollow user'
            };
        }
    }

    /**
     * Like a tweet
     */
    async likeTweet(userId, tweetId, accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.post(`${this.baseURL}/users/${userId}/likes`, {
                tweet_id: tweetId
            }, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                liked: response.data.data.liked
            };
        } catch (error) {
            logger.error('Twitter likeTweet error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.detail || 'Failed to like tweet'
            };
        }
    }

    /**
     * Retweet a tweet
     */
    async retweetTweet(userId, tweetId, accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.post(`${this.baseURL}/users/${userId}/retweets`, {
                tweet_id: tweetId
            }, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                retweeted: response.data.data.retweeted
            };
        } catch (error) {
            logger.error('Twitter retweetTweet error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.detail || 'Failed to retweet'
            };
        }
    }

    /**
     * Validate Twitter access token
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
            logger.error('Twitter validateToken error:', error.message);
            return {
                success: false,
                valid: false,
                error: 'Invalid Twitter access token'
            };
        }
    }

    /**
     * Get rate limit status
     */
    async getRateLimitStatus(accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/tweets/search/recent`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    'query': 'test',
                    'max_results': 1
                }
            });

            // Twitter API v2 rate limit info is in headers
            const headers = response.headers;
            return {
                success: true,
                rateLimit: {
                    limit: headers['x-rate-limit-limit'] ? parseInt(headers['x-rate-limit-limit']) : null,
                    remaining: headers['x-rate-limit-remaining'] ? parseInt(headers['x-rate-limit-remaining']) : null,
                    resetTime: headers['x-rate-limit-reset'] ? new Date(parseInt(headers['x-rate-limit-reset']) * 1000) : null
                }
            };
        } catch (error) {
            logger.error('Twitter getRateLimitStatus error:', error.response?.data || error.message);
            return {
                success: false,
                error: 'Failed to get rate limit status'
            };
        }
    }
}

module.exports = new TwitterIntegration();

