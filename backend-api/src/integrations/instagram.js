const axios = require('axios');
const { logger } = require('../../monitoring/logs/logger');

class InstagramIntegration {
  constructor() {
    this.baseURL = 'https://graph.facebook.com/v18.0';
    this.appId = process.env.INSTAGRAM_APP_ID;
    this.appSecret = process.env.INSTAGRAM_APP_SECRET;
  }

  async getAccessToken(userId) {
    try {
      const accessToken = await this.getStoredAccessToken(userId);
      return accessToken;
    } catch (error) {
      logger.error('Error getting Instagram access token:', error);
      throw error;
    }
  }

  async getStoredAccessToken(userId) {
    // This would typically query your database for the user's stored token
    return 'your_instagram_access_token';
  }

  async publishPost(userId, postData) {
    try {
      const accessToken = await this.getAccessToken(userId);
      
      // Instagram requires a two-step process for posting
      // First, create the media container
      const mediaResponse = await axios.post(`${this.baseURL}/${userId}/media`, {
        image_url: postData.imageUrl,
        caption: postData.caption,
        access_token: accessToken
      });

      const mediaId = mediaResponse.data.id;

      // Then, publish the media
      const publishResponse = await axios.post(`${this.baseURL}/${userId}/media_publish`, {
        creation_id: mediaId,
        access_token: accessToken
      });

      logger.info('Instagram post published successfully', {
        userId,
        postId: publishResponse.data.id
      });

      return {
        success: true,
        postId: publishResponse.data.id,
        platform: 'instagram'
      };
    } catch (error) {
      logger.error('Error publishing Instagram post:', error);
      return {
        success: false,
        error: error.message,
        platform: 'instagram'
      };
    }
  }

  async getMediaInsights(mediaId) {
    try {
      const accessToken = await this.getAccessToken(mediaId);
      
      const response = await axios.get(`${this.baseURL}/${mediaId}/insights`, {
        params: {
          metric: 'impressions,reach,likes,comments,shares,saves',
          access_token: accessToken
        }
      });

      return {
        success: true,
        insights: response.data.data
      };
    } catch (error) {
      logger.error('Error getting Instagram insights:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async handleWebhook(req, res) {
    try {
      const { object, entry } = req.body;
      
      if (object === 'instagram') {
        for (const pageEntry of entry) {
          for (const event of pageEntry.messaging) {
            await this.processWebhookEvent(event);
          }
        }
      }
      
      res.status(200).send('OK');
    } catch (error) {
      logger.error('Error handling Instagram webhook:', error);
      res.status(500).send('Error');
    }
  }

  async processWebhookEvent(event) {
    logger.info('Processing Instagram webhook event:', event);
  }
}

module.exports = new InstagramIntegration();
