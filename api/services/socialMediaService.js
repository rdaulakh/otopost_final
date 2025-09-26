const axios = require('axios');
const { TwitterApi } = require('twitter-api-v2');

class SocialMediaService {
  constructor() {
    this.platforms = {
      facebook: {
        baseUrl: 'https://graph.facebook.com/v18.0',
        scopes: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list']
      },
      instagram: {
        baseUrl: 'https://graph.instagram.com',
        scopes: ['instagram_basic', 'instagram_content_publish']
      },
      twitter: {
        baseUrl: 'https://api.twitter.com/2',
        client: null
      },
      linkedin: {
        baseUrl: 'https://api.linkedin.com/v2',
        scopes: ['w_member_social', 'r_liteprofile', 'r_emailaddress']
      },
      tiktok: {
        baseUrl: 'https://open-api.tiktok.com',
        scopes: ['user.info.basic', 'video.publish']
      },
      youtube: {
        baseUrl: 'https://www.googleapis.com/youtube/v3',
        scopes: ['https://www.googleapis.com/auth/youtube.upload']
      }
    };

    // Initialize Twitter client if credentials are available
    if (process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET) {
      this.platforms.twitter.client = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: '', // Will be set per user
        accessSecret: '', // Will be set per user
      });
    }
  }

  // Facebook Integration
  async publishToFacebook(accessToken, pageId, content) {
    try {
      const url = `${this.platforms.facebook.baseUrl}/${pageId}/feed`;
      
      const postData = {
        message: content.text,
        access_token: accessToken
      };

      // Add media if present
      if (content.mediaUrls && content.mediaUrls.length > 0) {
        if (content.mediaUrls.length === 1) {
          // Single media post
          if (content.mediaUrls[0].type === 'image') {
            postData.link = content.mediaUrls[0].url;
          } else if (content.mediaUrls[0].type === 'video') {
            // For video, use different endpoint
            const videoUrl = `${this.platforms.facebook.baseUrl}/${pageId}/videos`;
            const videoData = {
              description: content.text,
              file_url: content.mediaUrls[0].url,
              access_token: accessToken
            };
            const response = await axios.post(videoUrl, videoData);
            return { success: true, postId: response.data.id, platform: 'facebook' };
          }
        } else {
          // Multiple media - create album
          // This is a simplified version - full implementation would handle album creation
          postData.link = content.mediaUrls[0].url;
        }
      }

      const response = await axios.post(url, postData);
      
      return {
        success: true,
        postId: response.data.id,
        platform: 'facebook'
      };
    } catch (error) {
      console.error('Facebook publishing error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        platform: 'facebook'
      };
    }
  }

  // Instagram Integration
  async publishToInstagram(accessToken, instagramAccountId, content) {
    try {
      // Instagram requires a two-step process: create media object, then publish
      
      // Step 1: Create media object
      const createUrl = `${this.platforms.instagram.baseUrl}/${instagramAccountId}/media`;
      
      const mediaData = {
        caption: content.text,
        access_token: accessToken
      };

      if (content.mediaUrls && content.mediaUrls.length > 0) {
        if (content.mediaUrls[0].type === 'image') {
          mediaData.image_url = content.mediaUrls[0].url;
        } else if (content.mediaUrls[0].type === 'video') {
          mediaData.media_type = 'VIDEO';
          mediaData.video_url = content.mediaUrls[0].url;
        }
      } else {
        return {
          success: false,
          error: 'Instagram posts require media (image or video)',
          platform: 'instagram'
        };
      }

      const createResponse = await axios.post(createUrl, mediaData);
      const mediaId = createResponse.data.id;

      // Step 2: Publish the media
      const publishUrl = `${this.platforms.instagram.baseUrl}/${instagramAccountId}/media_publish`;
      const publishData = {
        creation_id: mediaId,
        access_token: accessToken
      };

      const publishResponse = await axios.post(publishUrl, publishData);

      return {
        success: true,
        postId: publishResponse.data.id,
        platform: 'instagram'
      };
    } catch (error) {
      console.error('Instagram publishing error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        platform: 'instagram'
      };
    }
  }

  // Twitter Integration
  async publishToTwitter(accessToken, accessSecret, content) {
    try {
      if (!this.platforms.twitter.client) {
        throw new Error('Twitter client not configured');
      }

      // Create user-specific client
      const userClient = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: accessToken,
        accessSecret: accessSecret,
      });

      let tweetData = {
        text: content.text
      };

      // Handle media uploads
      if (content.mediaUrls && content.mediaUrls.length > 0) {
        const mediaIds = [];
        
        for (const media of content.mediaUrls.slice(0, 4)) { // Twitter allows max 4 media
          try {
            // Download and upload media to Twitter
            const mediaResponse = await axios.get(media.url, { responseType: 'arraybuffer' });
            const mediaBuffer = Buffer.from(mediaResponse.data);
            
            const uploadResult = await userClient.v1.uploadMedia(mediaBuffer, { 
              mimeType: media.type === 'image' ? 'image/jpeg' : 'video/mp4' 
            });
            
            mediaIds.push(uploadResult);
          } catch (mediaError) {
            console.error('Twitter media upload error:', mediaError);
          }
        }

        if (mediaIds.length > 0) {
          tweetData.media = { media_ids: mediaIds };
        }
      }

      const tweet = await userClient.v2.tweet(tweetData);

      return {
        success: true,
        postId: tweet.data.id,
        platform: 'twitter'
      };
    } catch (error) {
      console.error('Twitter publishing error:', error);
      return {
        success: false,
        error: error.message,
        platform: 'twitter'
      };
    }
  }

  // LinkedIn Integration
  async publishToLinkedIn(accessToken, personId, content) {
    try {
      const url = `${this.platforms.linkedin.baseUrl}/ugcPosts`;
      
      const postData = {
        author: `urn:li:person:${personId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content.text
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      // Add media if present
      if (content.mediaUrls && content.mediaUrls.length > 0) {
        postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE';
        postData.specificContent['com.linkedin.ugc.ShareContent'].media = content.mediaUrls.map(media => ({
          status: 'READY',
          description: {
            text: content.text
          },
          media: media.url,
          title: {
            text: 'Shared Content'
          }
        }));
      }

      const response = await axios.post(url, postData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      return {
        success: true,
        postId: response.headers['x-restli-id'],
        platform: 'linkedin'
      };
    } catch (error) {
      console.error('LinkedIn publishing error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        platform: 'linkedin'
      };
    }
  }

  // TikTok Integration (Basic - requires approval for production)
  async publishToTikTok(accessToken, content) {
    try {
      // Note: TikTok API requires special approval and has limited functionality
      // This is a placeholder implementation
      
      const url = `${this.platforms.tiktok.baseUrl}/video/upload/`;
      
      if (!content.mediaUrls || content.mediaUrls.length === 0 || content.mediaUrls[0].type !== 'video') {
        return {
          success: false,
          error: 'TikTok requires video content',
          platform: 'tiktok'
        };
      }

      // TikTok upload process is complex and requires video file upload
      // This is a simplified version
      return {
        success: false,
        error: 'TikTok integration requires additional setup and approval',
        platform: 'tiktok'
      };
    } catch (error) {
      console.error('TikTok publishing error:', error);
      return {
        success: false,
        error: error.message,
        platform: 'tiktok'
      };
    }
  }

  // YouTube Integration
  async publishToYouTube(accessToken, content) {
    try {
      if (!content.mediaUrls || content.mediaUrls.length === 0 || content.mediaUrls[0].type !== 'video') {
        return {
          success: false,
          error: 'YouTube requires video content',
          platform: 'youtube'
        };
      }

      const url = `${this.platforms.youtube.baseUrl}/videos`;
      
      const videoData = {
        snippet: {
          title: content.title || 'Uploaded via AI Social Media Platform',
          description: content.text,
          tags: content.hashtags || [],
          categoryId: '22' // People & Blogs
        },
        status: {
          privacyStatus: 'public'
        }
      };

      // YouTube upload requires multipart form data with video file
      // This is a simplified version - full implementation would handle file upload
      const response = await axios.post(url, videoData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          part: 'snippet,status'
        }
      });

      return {
        success: true,
        postId: response.data.id,
        platform: 'youtube'
      };
    } catch (error) {
      console.error('YouTube publishing error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        platform: 'youtube'
      };
    }
  }

  // Multi-platform publishing
  async publishToMultiplePlatforms(platforms, content, userTokens) {
    const results = [];
    
    for (const platform of platforms) {
      const tokens = userTokens[platform];
      if (!tokens) {
        results.push({
          success: false,
          error: `No authentication tokens found for ${platform}`,
          platform
        });
        continue;
      }

      let result;
      switch (platform.toLowerCase()) {
        case 'facebook':
          result = await this.publishToFacebook(tokens.accessToken, tokens.pageId, content);
          break;
        case 'instagram':
          result = await this.publishToInstagram(tokens.accessToken, tokens.accountId, content);
          break;
        case 'twitter':
          result = await this.publishToTwitter(tokens.accessToken, tokens.accessSecret, content);
          break;
        case 'linkedin':
          result = await this.publishToLinkedIn(tokens.accessToken, tokens.personId, content);
          break;
        case 'tiktok':
          result = await this.publishToTikTok(tokens.accessToken, content);
          break;
        case 'youtube':
          result = await this.publishToYouTube(tokens.accessToken, content);
          break;
        default:
          result = {
            success: false,
            error: `Platform ${platform} not supported`,
            platform
          };
      }

      results.push(result);
      
      // Add delay between posts to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return {
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    };
  }

  // Get platform analytics
  async getPlatformAnalytics(platform, accessToken, options = {}) {
    try {
      switch (platform.toLowerCase()) {
        case 'facebook':
          return await this.getFacebookAnalytics(accessToken, options);
        case 'instagram':
          return await this.getInstagramAnalytics(accessToken, options);
        case 'twitter':
          return await this.getTwitterAnalytics(accessToken, options);
        case 'linkedin':
          return await this.getLinkedInAnalytics(accessToken, options);
        default:
          return {
            success: false,
            error: `Analytics not available for ${platform}`,
            platform
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        platform
      };
    }
  }

  async getFacebookAnalytics(accessToken, options) {
    const { pageId, since, until } = options;
    const url = `${this.platforms.facebook.baseUrl}/${pageId}/insights`;
    
    const params = {
      metric: 'page_impressions,page_reach,page_engaged_users,page_post_engagements',
      access_token: accessToken
    };

    if (since) params.since = since;
    if (until) params.until = until;

    const response = await axios.get(url, { params });
    
    return {
      success: true,
      data: response.data.data,
      platform: 'facebook'
    };
  }

  async getInstagramAnalytics(accessToken, options) {
    const { accountId, since, until } = options;
    const url = `${this.platforms.instagram.baseUrl}/${accountId}/insights`;
    
    const params = {
      metric: 'impressions,reach,profile_views,website_clicks',
      period: 'day',
      access_token: accessToken
    };

    if (since) params.since = since;
    if (until) params.until = until;

    const response = await axios.get(url, { params });
    
    return {
      success: true,
      data: response.data.data,
      platform: 'instagram'
    };
  }

  async getTwitterAnalytics(accessToken, options) {
    // Twitter API v2 analytics require special permissions
    // This is a placeholder implementation
    return {
      success: false,
      error: 'Twitter analytics require additional API permissions',
      platform: 'twitter'
    };
  }

  async getLinkedInAnalytics(accessToken, options) {
    const url = `${this.platforms.linkedin.baseUrl}/organizationalEntityShareStatistics`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });
    
    return {
      success: true,
      data: response.data,
      platform: 'linkedin'
    };
  }

  // OAuth URL generation
  generateOAuthUrl(platform, redirectUri, state) {
    const configs = {
      facebook: {
        url: 'https://www.facebook.com/v18.0/dialog/oauth',
        params: {
          client_id: process.env.FACEBOOK_APP_ID,
          redirect_uri: redirectUri,
          scope: this.platforms.facebook.scopes.join(','),
          state: state,
          response_type: 'code'
        }
      },
      instagram: {
        url: 'https://api.instagram.com/oauth/authorize',
        params: {
          client_id: process.env.INSTAGRAM_APP_ID,
          redirect_uri: redirectUri,
          scope: this.platforms.instagram.scopes.join(','),
          state: state,
          response_type: 'code'
        }
      },
      twitter: {
        url: 'https://twitter.com/i/oauth2/authorize',
        params: {
          response_type: 'code',
          client_id: process.env.TWITTER_CLIENT_ID,
          redirect_uri: redirectUri,
          scope: 'tweet.read tweet.write users.read',
          state: state,
          code_challenge: 'challenge', // PKCE required
          code_challenge_method: 'plain'
        }
      },
      linkedin: {
        url: 'https://www.linkedin.com/oauth/v2/authorization',
        params: {
          response_type: 'code',
          client_id: process.env.LINKEDIN_CLIENT_ID,
          redirect_uri: redirectUri,
          scope: this.platforms.linkedin.scopes.join(' '),
          state: state
        }
      }
    };

    const config = configs[platform.toLowerCase()];
    if (!config) {
      throw new Error(`OAuth not supported for platform: ${platform}`);
    }

    const params = new URLSearchParams(config.params);
    return `${config.url}?${params.toString()}`;
  }

  // Validate webhook signatures
  validateWebhookSignature(platform, signature, payload, secret) {
    const crypto = require('crypto');
    
    switch (platform.toLowerCase()) {
      case 'facebook':
      case 'instagram':
        const expectedSignature = crypto
          .createHmac('sha1', secret)
          .update(payload)
          .digest('hex');
        return signature === `sha1=${expectedSignature}`;
      
      case 'twitter':
        const expectedTwitterSignature = crypto
          .createHmac('sha256', secret)
          .update(payload)
          .digest('base64');
        return signature === expectedTwitterSignature;
      
      default:
        return false;
    }
  }

  // Get supported platforms
  getSupportedPlatforms() {
    return Object.keys(this.platforms).map(platform => ({
      name: platform,
      displayName: platform.charAt(0).toUpperCase() + platform.slice(1),
      features: {
        publishing: true,
        analytics: ['facebook', 'instagram', 'linkedin'].includes(platform),
        scheduling: true,
        mediaSupport: platform !== 'twitter' || ['image', 'video'].includes(platform)
      }
    }));
  }
}

module.exports = new SocialMediaService();
