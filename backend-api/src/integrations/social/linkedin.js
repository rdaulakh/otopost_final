const axios = require('axios');
const { logger } = require('../../utils/logger');
const { encrypt, decrypt } = require('../../utils/encryption');

class LinkedInIntegration {
    constructor() {
        this.baseURL = 'https://api.linkedin.com/v2';
        this.apiVersion = 'v2';
    }

    /**
     * Get LinkedIn user profile
     */
    async getUserProfile(accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/people/~`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    'projection': '(id,firstName,lastName,profilePicture(displayImage~:playableStreams),headline,summary,industry,location,positions)'
                }
            });

            const profile = response.data;
            return {
                success: true,
                profile: {
                    id: profile.id,
                    firstName: profile.firstName?.localized?.en_US || '',
                    lastName: profile.lastName?.localized?.en_US || '',
                    headline: profile.headline?.localized?.en_US || '',
                    summary: profile.summary?.localized?.en_US || '',
                    industry: profile.industry?.localized?.en_US || '',
                    location: profile.location?.name || '',
                    profilePicture: profile.profilePicture?.displayImage?.elements?.[0]?.identifiers?.[0]?.identifier || null,
                    positions: profile.positions?.values || []
                }
            };
        } catch (error) {
            logger.error('LinkedIn getUserProfile error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch LinkedIn user profile'
            };
        }
    }

    /**
     * Get LinkedIn company pages
     */
    async getCompanyPages(accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/organizationAcls`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    'q': 'roleAssignee',
                    'projection': '(elements*(organization~(id,name,description,website,industry,logo,followerCount,staffCount)))'
                }
            });

            const companies = response.data.elements.map(element => {
                const org = element['organization~'];
                return {
                    id: org.id,
                    name: org.name?.localized?.en_US || '',
                    description: org.description?.localized?.en_US || '',
                    website: org.website?.localized?.en_US || '',
                    industry: org.industry?.localized?.en_US || '',
                    logo: org.logo?.original || null,
                    followerCount: org.followerCount || 0,
                    staffCount: org.staffCount || 0
                };
            });

            return {
                success: true,
                companies
            };
        } catch (error) {
            logger.error('LinkedIn getCompanyPages error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch LinkedIn company pages'
            };
        }
    }

    /**
     * Create LinkedIn post (User or Company)
     */
    async createPost(accessToken, postData) {
        try {
            const decryptedToken = decrypt(accessToken);
            
            // Determine if it's a personal or company post
            const author = postData.companyId ? `urn:li:organization:${postData.companyId}` : `urn:li:person:${postData.userId}`;
            
            const payload = {
                author: author,
                lifecycleState: 'PUBLISHED',
                specificContent: {
                    'com.linkedin.ugc.ShareContent': {
                        shareCommentary: {
                            text: postData.content
                        },
                        shareMediaCategory: 'NONE'
                    }
                },
                visibility: {
                    'com.linkedin.ugc.MemberNetworkVisibility': postData.visibility || 'PUBLIC'
                }
            };

            // Add media if provided
            if (postData.media && postData.media.length > 0) {
                const media = postData.media[0]; // LinkedIn supports single media per post
                
                if (media.type === 'image') {
                    // Upload image first
                    const uploadResult = await this.uploadImage(accessToken, media.url, author);
                    if (uploadResult.success) {
                        payload.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE';
                        payload.specificContent['com.linkedin.ugc.ShareContent'].media = [{
                            status: 'READY',
                            description: {
                                text: media.description || ''
                            },
                            media: uploadResult.asset,
                            title: {
                                text: media.title || ''
                            }
                        }];
                    }
                } else if (media.type === 'article') {
                    payload.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'ARTICLE';
                    payload.specificContent['com.linkedin.ugc.ShareContent'].media = [{
                        status: 'READY',
                        description: {
                            text: media.description || ''
                        },
                        originalUrl: media.url,
                        title: {
                            text: media.title || ''
                        }
                    }];
                }
            }

            const response = await axios.post(`${this.baseURL}/ugcPosts`, payload, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json',
                    'X-Restli-Protocol-Version': '2.0.0'
                }
            });

            return {
                success: true,
                postId: response.data.id,
                platformPostId: response.data.id
            };
        } catch (error) {
            logger.error('LinkedIn createPost error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to create LinkedIn post'
            };
        }
    }

    /**
     * Upload image to LinkedIn
     */
    async uploadImage(accessToken, imageUrl, author) {
        try {
            const decryptedToken = decrypt(accessToken);
            
            // Step 1: Register upload
            const registerResponse = await axios.post(`${this.baseURL}/assets`, {
                registerUploadRequest: {
                    recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                    owner: author,
                    serviceRelationships: [{
                        relationshipType: 'OWNER',
                        identifier: 'urn:li:userGeneratedContent'
                    }]
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                }
            });

            const asset = registerResponse.data.value.asset;
            const uploadUrl = registerResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;

            // Step 2: Download image
            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(imageResponse.data);

            // Step 3: Upload image
            await axios.post(uploadUrl, imageBuffer, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/octet-stream'
                }
            });

            return {
                success: true,
                asset: asset
            };
        } catch (error) {
            logger.error('LinkedIn uploadImage error:', error.response?.data || error.message);
            return {
                success: false,
                error: 'Failed to upload image to LinkedIn'
            };
        }
    }

    /**
     * Get LinkedIn post analytics
     */
    async getPostAnalytics(postId, accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/socialActions/${postId}`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    'projection': '(likesSummary,commentsSummary,sharesSummary,clicksSummary,impressionsSummary)'
                }
            });

            const analytics = response.data;
            return {
                success: true,
                analytics: {
                    postId: postId,
                    likes: analytics.likesSummary?.totalLikes || 0,
                    comments: analytics.commentsSummary?.totalComments || 0,
                    shares: analytics.sharesSummary?.totalShares || 0,
                    clicks: analytics.clicksSummary?.totalClicks || 0,
                    impressions: analytics.impressionsSummary?.totalImpressions || 0
                }
            };
        } catch (error) {
            logger.error('LinkedIn getPostAnalytics error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch LinkedIn post analytics'
            };
        }
    }

    /**
     * Get company page analytics
     */
    async getCompanyAnalytics(companyId, accessToken, startDate, endDate) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/organizationalEntityShareStatistics`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    'q': 'organizationalEntity',
                    'organizationalEntity': `urn:li:organization:${companyId}`,
                    'timeIntervals.timeGranularityType': 'DAY',
                    'timeIntervals.timeRange.start': new Date(startDate).getTime(),
                    'timeIntervals.timeRange.end': new Date(endDate).getTime()
                }
            });

            const stats = response.data.elements[0];
            return {
                success: true,
                analytics: {
                    companyId: companyId,
                    impressions: stats.totalShareStatistics.impressionCount || 0,
                    clicks: stats.totalShareStatistics.clickCount || 0,
                    likes: stats.totalShareStatistics.likeCount || 0,
                    comments: stats.totalShareStatistics.commentCount || 0,
                    shares: stats.totalShareStatistics.shareCount || 0,
                    engagement: stats.totalShareStatistics.engagement || 0
                }
            };
        } catch (error) {
            logger.error('LinkedIn getCompanyAnalytics error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch LinkedIn company analytics'
            };
        }
    }

    /**
     * Get company follower statistics
     */
    async getFollowerStatistics(companyId, accessToken, startDate, endDate) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/organizationalEntityFollowerStatistics`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    'q': 'organizationalEntity',
                    'organizationalEntity': `urn:li:organization:${companyId}`,
                    'timeIntervals.timeGranularityType': 'DAY',
                    'timeIntervals.timeRange.start': new Date(startDate).getTime(),
                    'timeIntervals.timeRange.end': new Date(endDate).getTime()
                }
            });

            const stats = response.data.elements[0];
            return {
                success: true,
                followerStats: {
                    companyId: companyId,
                    organicFollowerCount: stats.organicFollowerCount || 0,
                    paidFollowerCount: stats.paidFollowerCount || 0,
                    totalFollowerCount: stats.totalFollowerCount || 0,
                    followerCountsByRegion: stats.followerCountsByRegion || [],
                    followerCountsByIndustry: stats.followerCountsByIndustry || [],
                    followerCountsBySeniority: stats.followerCountsBySeniority || []
                }
            };
        } catch (error) {
            logger.error('LinkedIn getFollowerStatistics error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch LinkedIn follower statistics'
            };
        }
    }

    /**
     * Delete LinkedIn post
     */
    async deletePost(postId, accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            await axios.delete(`${this.baseURL}/ugcPosts/${postId}`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                message: 'Post deleted successfully'
            };
        } catch (error) {
            logger.error('LinkedIn deletePost error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to delete LinkedIn post'
            };
        }
    }

    /**
     * Get user's LinkedIn posts
     */
    async getUserPosts(userId, accessToken, count = 10) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/ugcPosts`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    'q': 'authors',
                    'authors': `urn:li:person:${userId}`,
                    'count': count,
                    'projection': '(id,author,created,lastModified,lifecycleState,specificContent,visibility)'
                }
            });

            const posts = response.data.elements.map(post => ({
                id: post.id,
                author: post.author,
                created: new Date(post.created.time),
                lastModified: new Date(post.lastModified.time),
                lifecycleState: post.lifecycleState,
                content: post.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text || '',
                visibility: post.visibility?.['com.linkedin.ugc.MemberNetworkVisibility'] || 'PUBLIC'
            }));

            return {
                success: true,
                posts
            };
        } catch (error) {
            logger.error('LinkedIn getUserPosts error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch LinkedIn user posts'
            };
        }
    }

    /**
     * Validate LinkedIn access token
     */
    async validateToken(accessToken) {
        try {
            const profileResult = await this.getUserProfile(accessToken);
            return {
                success: profileResult.success,
                valid: profileResult.success,
                user: profileResult.profile,
                error: profileResult.error
            };
        } catch (error) {
            logger.error('LinkedIn validateToken error:', error.message);
            return {
                success: false,
                valid: false,
                error: 'Invalid LinkedIn access token'
            };
        }
    }

    /**
     * Get rate limit status
     */
    async getRateLimitStatus(accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${this.baseURL}/people/~`, {
                headers: {
                    'Authorization': `Bearer ${decryptedToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    'projection': '(id)'
                }
            });

            // LinkedIn rate limit info is in headers
            const headers = response.headers;
            return {
                success: true,
                rateLimit: {
                    limit: headers['x-ratelimit-limit'] ? parseInt(headers['x-ratelimit-limit']) : null,
                    remaining: headers['x-ratelimit-remaining'] ? parseInt(headers['x-ratelimit-remaining']) : null,
                    resetTime: headers['x-ratelimit-reset'] ? new Date(parseInt(headers['x-ratelimit-reset']) * 1000) : null
                }
            };
        } catch (error) {
            logger.error('LinkedIn getRateLimitStatus error:', error.response?.data || error.message);
            return {
                success: false,
                error: 'Failed to get rate limit status'
            };
        }
    }
}

module.exports = new LinkedInIntegration();

