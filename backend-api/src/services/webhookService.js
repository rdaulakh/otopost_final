const crypto = require('crypto');
const logger = require('../utils/logger');
const Notification = require('../models/Notification');
const Analytics = require('../models/Analytics');
const Content = require('../models/Content');

/**
 * Webhook Service
 * Handles webhook processing, validation, and data updates
 */

class WebhookService {
  constructor() {
    this.webhookSecrets = {
      facebook: process.env.FACEBOOK_WEBHOOK_SECRET,
      instagram: process.env.INSTAGRAM_WEBHOOK_SECRET,
      twitter: process.env.TWITTER_WEBHOOK_SECRET,
      linkedin: process.env.LINKEDIN_WEBHOOK_SECRET,
      stripe: process.env.STRIPE_WEBHOOK_SECRET,
      tiktok: process.env.TIKTOK_WEBHOOK_SECRET,
      youtube: process.env.YOUTUBE_WEBHOOK_SECRET,
      pinterest: process.env.PINTEREST_WEBHOOK_SECRET
    };
  }

  // Verify webhook signature
  verifySignature(platform, payload, signature) {
    const secret = this.webhookSecrets[platform];
    if (!secret) {
      logger.warn(`Webhook secret not configured for platform: ${platform}`);
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      logger.error(`Error verifying webhook signature for ${platform}:`, error);
      return false;
    }
  }

  // Process Facebook webhook
  async processFacebookWebhook(payload) {
    try {
      const { entry } = payload;
      
      for (const entryItem of entry) {
        if (entryItem.changes) {
          for (const change of entryItem.changes) {
            await this.processFacebookChange(change, entryItem.id);
          }
        }
      }
      
      logger.info('Facebook webhook processed successfully');
    } catch (error) {
      logger.error('Error processing Facebook webhook:', error);
      throw error;
    }
  }

  // Process Instagram webhook
  async processInstagramWebhook(payload) {
    try {
      const { entry } = payload;
      
      for (const entryItem of entry) {
        if (entryItem.changes) {
          for (const change of entryItem.changes) {
            await this.processInstagramChange(change, entryItem.id);
          }
        }
      }
      
      logger.info('Instagram webhook processed successfully');
    } catch (error) {
      logger.error('Error processing Instagram webhook:', error);
      throw error;
    }
  }

  // Process Twitter webhook
  async processTwitterWebhook(payload) {
    try {
      if (payload.tweet_create_events) {
        for (const event of payload.tweet_create_events) {
          await this.processTwitterEvent(event);
        }
      }
      
      logger.info('Twitter webhook processed successfully');
    } catch (error) {
      logger.error('Error processing Twitter webhook:', error);
      throw error;
    }
  }

  // Process LinkedIn webhook
  async processLinkedInWebhook(payload) {
    try {
      if (payload.events) {
        for (const event of payload.events) {
          await this.processLinkedInEvent(event);
        }
      }
      
      logger.info('LinkedIn webhook processed successfully');
    } catch (error) {
      logger.error('Error processing LinkedIn webhook:', error);
      throw error;
    }
  }

  // Process Stripe webhook
  async processStripeWebhook(payload) {
    try {
      const { type, data } = payload;
      
      switch (type) {
        case 'customer.subscription.created':
          await this.processStripeSubscriptionCreated(data.object);
          break;
        case 'customer.subscription.updated':
          await this.processStripeSubscriptionUpdated(data.object);
          break;
        case 'customer.subscription.deleted':
          await this.processStripeSubscriptionDeleted(data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.processStripePaymentSucceeded(data.object);
          break;
        case 'invoice.payment_failed':
          await this.processStripePaymentFailed(data.object);
          break;
        default:
          logger.info(`Unhandled Stripe webhook event: ${type}`);
      }
      
      logger.info('Stripe webhook processed successfully');
    } catch (error) {
      logger.error('Error processing Stripe webhook:', error);
      throw error;
    }
  }

  // Process Facebook change
  async processFacebookChange(change, pageId) {
    try {
      const { field, value } = change;

      switch (field) {
        case 'feed':
          await this.processFacebookFeedChange(value, pageId);
          break;
        case 'posts':
          await this.processFacebookPostsChange(value, pageId);
          break;
        case 'comments':
          await this.processFacebookCommentsChange(value, pageId);
          break;
        default:
          logger.info(`Unhandled Facebook webhook field: ${field}`);
      }
    } catch (error) {
      logger.error('Error processing Facebook change:', error);
    }
  }

  // Process Instagram change
  async processInstagramChange(change, accountId) {
    try {
      const { field, value } = change;

      switch (field) {
        case 'media':
          await this.processInstagramMediaChange(value, accountId);
          break;
        case 'comments':
          await this.processInstagramCommentsChange(value, accountId);
          break;
        case 'mentions':
          await this.processInstagramMentionsChange(value, accountId);
          break;
        default:
          logger.info(`Unhandled Instagram webhook field: ${field}`);
      }
    } catch (error) {
      logger.error('Error processing Instagram change:', error);
    }
  }

  // Process Twitter event
  async processTwitterEvent(event) {
    try {
      const { event_type, created_tweet } = event;

      switch (event_type) {
        case 'tweet_create_events':
          await this.processTwitterTweetCreate(created_tweet);
          break;
        case 'favorite_events':
          await this.processTwitterFavorite(event);
          break;
        case 'follow_events':
          await this.processTwitterFollow(event);
          break;
        default:
          logger.info(`Unhandled Twitter webhook event: ${event_type}`);
      }
    } catch (error) {
      logger.error('Error processing Twitter event:', error);
    }
  }

  // Process LinkedIn event
  async processLinkedInEvent(event) {
    try {
      const { eventType, entity } = event;

      switch (eventType) {
        case 'UGC_POST_CREATED':
          await this.processLinkedInPostCreate(entity);
          break;
        case 'UGC_POST_UPDATED':
          await this.processLinkedInPostUpdate(entity);
          break;
        case 'UGC_POST_DELETED':
          await this.processLinkedInPostDelete(entity);
          break;
        default:
          logger.info(`Unhandled LinkedIn webhook event: ${eventType}`);
      }
    } catch (error) {
      logger.error('Error processing LinkedIn event:', error);
    }
  }

  // Process Facebook feed change
  async processFacebookFeedChange(value, pageId) {
    try {
      const analytics = new Analytics({
        platform: 'facebook',
        pageId,
        type: 'engagement',
        data: {
          likes: value.like_count || 0,
          comments: value.comment_count || 0,
          shares: value.share_count || 0,
          timestamp: new Date()
        }
      });
      await analytics.save();

      // Create notification for high engagement
      if (value.like_count > 100 || value.comment_count > 20) {
        await this.createEngagementNotification(pageId, 'facebook', value);
      }
    } catch (error) {
      logger.error('Error processing Facebook feed change:', error);
    }
  }

  // Process Instagram media change
  async processInstagramMediaChange(value, accountId) {
    try {
      const analytics = new Analytics({
        platform: 'instagram',
        accountId,
        type: 'engagement',
        data: {
          likes: value.like_count || 0,
          comments: value.comment_count || 0,
          timestamp: new Date()
        }
      });
      await analytics.save();

      // Create notification for high engagement
      if (value.like_count > 500 || value.comment_count > 50) {
        await this.createEngagementNotification(accountId, 'instagram', value);
      }
    } catch (error) {
      logger.error('Error processing Instagram media change:', error);
    }
  }

  // Process Twitter tweet create
  async processTwitterTweetCreate(tweet) {
    try {
      const analytics = new Analytics({
        platform: 'twitter',
        postId: tweet.id,
        type: 'engagement',
        data: {
          likes: tweet.public_metrics?.like_count || 0,
          retweets: tweet.public_metrics?.retweet_count || 0,
          replies: tweet.public_metrics?.reply_count || 0,
          timestamp: new Date()
        }
      });
      await analytics.save();

      // Create notification for high engagement
      const totalEngagement = (tweet.public_metrics?.like_count || 0) + 
                             (tweet.public_metrics?.retweet_count || 0) + 
                             (tweet.public_metrics?.reply_count || 0);
      
      if (totalEngagement > 100) {
        await this.createEngagementNotification(tweet.id, 'twitter', tweet);
      }
    } catch (error) {
      logger.error('Error processing Twitter tweet create:', error);
    }
  }

  // Process LinkedIn post create
  async processLinkedInPostCreate(post) {
    try {
      const analytics = new Analytics({
        platform: 'linkedin',
        postId: post.id,
        type: 'engagement',
        data: {
          likes: post.numLikes || 0,
          comments: post.numComments || 0,
          shares: post.numShares || 0,
          timestamp: new Date()
        }
      });
      await analytics.save();

      // Create notification for high engagement
      const totalEngagement = (post.numLikes || 0) + (post.numComments || 0) + (post.numShares || 0);
      if (totalEngagement > 50) {
        await this.createEngagementNotification(post.id, 'linkedin', post);
      }
    } catch (error) {
      logger.error('Error processing LinkedIn post create:', error);
    }
  }

  // Process Stripe subscription created
  async processStripeSubscriptionCreated(subscription) {
    try {
      // Update user subscription status
      const User = require('../models/User');
      const user = await User.findOne({ stripeCustomerId: subscription.customer });
      
      if (user) {
        user.subscriptionStatus = 'active';
        user.subscriptionId = subscription.id;
        await user.save();

        // Create notification
        await this.createSubscriptionNotification(user._id, 'created', subscription);
      }
    } catch (error) {
      logger.error('Error processing Stripe subscription created:', error);
    }
  }

  // Process Stripe subscription updated
  async processStripeSubscriptionUpdated(subscription) {
    try {
      const User = require('../models/User');
      const user = await User.findOne({ stripeCustomerId: subscription.customer });
      
      if (user) {
        user.subscriptionStatus = subscription.status;
        await user.save();

        // Create notification
        await this.createSubscriptionNotification(user._id, 'updated', subscription);
      }
    } catch (error) {
      logger.error('Error processing Stripe subscription updated:', error);
    }
  }

  // Process Stripe subscription deleted
  async processStripeSubscriptionDeleted(subscription) {
    try {
      const User = require('../models/User');
      const user = await User.findOne({ stripeCustomerId: subscription.customer });
      
      if (user) {
        user.subscriptionStatus = 'cancelled';
        await user.save();

        // Create notification
        await this.createSubscriptionNotification(user._id, 'cancelled', subscription);
      }
    } catch (error) {
      logger.error('Error processing Stripe subscription deleted:', error);
    }
  }

  // Process Stripe payment succeeded
  async processStripePaymentSucceeded(invoice) {
    try {
      logger.info(`Payment succeeded for customer ${invoice.customer}, amount: ${invoice.amount_paid}`);
      
      // Create payment notification
      const User = require('../models/User');
      const user = await User.findOne({ stripeCustomerId: invoice.customer });
      
      if (user) {
        await this.createPaymentNotification(user._id, 'succeeded', invoice);
      }
    } catch (error) {
      logger.error('Error processing Stripe payment succeeded:', error);
    }
  }

  // Process Stripe payment failed
  async processStripePaymentFailed(invoice) {
    try {
      logger.warn(`Payment failed for customer ${invoice.customer}, amount: ${invoice.amount_due}`);
      
      // Create payment notification
      const User = require('../models/User');
      const user = await User.findOne({ stripeCustomerId: invoice.customer });
      
      if (user) {
        await this.createPaymentNotification(user._id, 'failed', invoice);
      }
    } catch (error) {
      logger.error('Error processing Stripe payment failed:', error);
    }
  }

  // Create engagement notification
  async createEngagementNotification(accountId, platform, data) {
    try {
      // Find user by account ID (this would need to be implemented based on your data structure)
      const User = require('../models/User');
      const user = await User.findOne({ [`${platform}AccountId`]: accountId });
      
      if (user) {
        const notification = new Notification({
          user: user._id,
          title: `High Engagement on ${platform}`,
          message: `Your ${platform} post received high engagement!`,
          type: 'engagement',
          priority: 'medium',
          metadata: {
            platform,
            accountId,
            data
          }
        });
        await notification.save();
      }
    } catch (error) {
      logger.error('Error creating engagement notification:', error);
    }
  }

  // Create subscription notification
  async createSubscriptionNotification(userId, event, subscription) {
    try {
      const notification = new Notification({
        user: userId,
        title: `Subscription ${event}`,
        message: `Your subscription has been ${event}`,
        type: 'subscription',
        priority: 'high',
        metadata: {
          event,
          subscriptionId: subscription.id,
          status: subscription.status
        }
      });
      await notification.save();
    } catch (error) {
      logger.error('Error creating subscription notification:', error);
    }
  }

  // Create payment notification
  async createPaymentNotification(userId, event, invoice) {
    try {
      const notification = new Notification({
        user: userId,
        title: `Payment ${event}`,
        message: `Your payment has ${event}`,
        type: 'payment',
        priority: event === 'failed' ? 'high' : 'medium',
        metadata: {
          event,
          amount: invoice.amount_paid || invoice.amount_due,
          currency: invoice.currency
        }
      });
      await notification.save();
    } catch (error) {
      logger.error('Error creating payment notification:', error);
    }
  }

  // Generic webhook processor
  async processGenericWebhook(platform, payload) {
    try {
      logger.info(`Processing generic webhook for ${platform}:`, payload);
      
      // Log webhook data for debugging
      const webhookLog = new Analytics({
        platform,
        type: 'webhook',
        data: {
          payload,
          timestamp: new Date()
        }
      });
      await webhookLog.save();
      
    } catch (error) {
      logger.error(`Error processing generic webhook for ${platform}:`, error);
      throw error;
    }
  }
}

module.exports = new WebhookService();

