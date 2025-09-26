const crypto = require('crypto');
const logger = require('../utils/logger');
const Content = require('../models/Content');
const Analytics = require('../models/Analytics');
const User = require('../models/User');

/**
 * Webhooks Controller
 * Handles webhooks from social media platforms and third-party services
 */

// Verify webhook signature
const verifyWebhookSignature = (req, secret, signature) => {
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};

// Facebook/Meta webhook handler
const handleFacebookWebhook = async (req, res) => {
  try {
    const { body, headers } = req;
    const signature = headers['x-hub-signature-256'];
    const webhookSecret = process.env.FACEBOOK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      logger.warn('Facebook webhook secret not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(req, webhookSecret, signature)) {
      logger.warn('Invalid Facebook webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Handle webhook verification challenge
    if (body.object === 'page' && body.entry) {
      for (const entry of body.entry) {
        if (entry.changes) {
          for (const change of entry.changes) {
            await processFacebookChange(change, entry.id);
          }
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error handling Facebook webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Instagram webhook handler
const handleInstagramWebhook = async (req, res) => {
  try {
    const { body, headers } = req;
    const signature = headers['x-hub-signature-256'];
    const webhookSecret = process.env.INSTAGRAM_WEBHOOK_SECRET;

    if (!webhookSecret) {
      logger.warn('Instagram webhook secret not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    if (!verifyWebhookSignature(req, webhookSecret, signature)) {
      logger.warn('Invalid Instagram webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    if (body.object === 'instagram') {
      for (const entry of body.entry) {
        if (entry.changes) {
          for (const change of entry.changes) {
            await processInstagramChange(change, entry.id);
          }
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error handling Instagram webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Twitter webhook handler
const handleTwitterWebhook = async (req, res) => {
  try {
    const { body, headers } = req;
    const signature = headers['x-twitter-webhooks-signature'];
    const webhookSecret = process.env.TWITTER_WEBHOOK_SECRET;

    if (!webhookSecret) {
      logger.warn('Twitter webhook secret not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    if (!verifyWebhookSignature(req, webhookSecret, signature)) {
      logger.warn('Invalid Twitter webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    if (body.tweet_create_events) {
      for (const event of body.tweet_create_events) {
        await processTwitterEvent(event);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error handling Twitter webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// LinkedIn webhook handler
const handleLinkedInWebhook = async (req, res) => {
  try {
    const { body, headers } = req;
    const signature = headers['x-linkedin-signature'];
    const webhookSecret = process.env.LINKEDIN_WEBHOOK_SECRET;

    if (!webhookSecret) {
      logger.warn('LinkedIn webhook secret not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    if (!verifyWebhookSignature(req, webhookSecret, signature)) {
      logger.warn('Invalid LinkedIn webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    if (body.events) {
      for (const event of body.events) {
        await processLinkedInEvent(event);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error handling LinkedIn webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Stripe webhook handler
const handleStripeWebhook = async (req, res) => {
  try {
    const { body, headers } = req;
    const signature = headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      logger.warn('Stripe webhook secret not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    if (!verifyWebhookSignature(req, webhookSecret, signature)) {
      logger.warn('Invalid Stripe webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = body;
    await processStripeEvent(event);

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error handling Stripe webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Process Facebook webhook changes
const processFacebookChange = async (change, pageId) => {
  try {
    const { field, value } = change;

    switch (field) {
      case 'feed':
        await processFacebookFeedChange(value, pageId);
        break;
      case 'posts':
        await processFacebookPostsChange(value, pageId);
        break;
      case 'comments':
        await processFacebookCommentsChange(value, pageId);
        break;
      default:
        logger.info(`Unhandled Facebook webhook field: ${field}`);
    }
  } catch (error) {
    logger.error('Error processing Facebook change:', error);
  }
};

// Process Instagram webhook changes
const processInstagramChange = async (change, accountId) => {
  try {
    const { field, value } = change;

    switch (field) {
      case 'media':
        await processInstagramMediaChange(value, accountId);
        break;
      case 'comments':
        await processInstagramCommentsChange(value, accountId);
        break;
      case 'mentions':
        await processInstagramMentionsChange(value, accountId);
        break;
      default:
        logger.info(`Unhandled Instagram webhook field: ${field}`);
    }
  } catch (error) {
    logger.error('Error processing Instagram change:', error);
  }
};

// Process Twitter webhook events
const processTwitterEvent = async (event) => {
  try {
    const { event_type, created_tweet } = event;

    switch (event_type) {
      case 'tweet_create_events':
        await processTwitterTweetCreate(created_tweet);
        break;
      case 'favorite_events':
        await processTwitterFavorite(event);
        break;
      case 'follow_events':
        await processTwitterFollow(event);
        break;
      default:
        logger.info(`Unhandled Twitter webhook event: ${event_type}`);
    }
  } catch (error) {
    logger.error('Error processing Twitter event:', error);
  }
};

// Process LinkedIn webhook events
const processLinkedInEvent = async (event) => {
  try {
    const { eventType, entity } = event;

    switch (eventType) {
      case 'UGC_POST_CREATED':
        await processLinkedInPostCreate(entity);
        break;
      case 'UGC_POST_UPDATED':
        await processLinkedInPostUpdate(entity);
        break;
      case 'UGC_POST_DELETED':
        await processLinkedInPostDelete(entity);
        break;
      default:
        logger.info(`Unhandled LinkedIn webhook event: ${eventType}`);
    }
  } catch (error) {
    logger.error('Error processing LinkedIn event:', error);
  }
};

// Process Stripe webhook events
const processStripeEvent = async (event) => {
  try {
    const { type, data } = event;

    switch (type) {
      case 'customer.subscription.created':
        await processStripeSubscriptionCreated(data.object);
        break;
      case 'customer.subscription.updated':
        await processStripeSubscriptionUpdated(data.object);
        break;
      case 'customer.subscription.deleted':
        await processStripeSubscriptionDeleted(data.object);
        break;
      case 'invoice.payment_succeeded':
        await processStripePaymentSucceeded(data.object);
        break;
      case 'invoice.payment_failed':
        await processStripePaymentFailed(data.object);
        break;
      default:
        logger.info(`Unhandled Stripe webhook event: ${type}`);
    }
  } catch (error) {
    logger.error('Error processing Stripe event:', error);
  }
};

// Facebook feed change processor
const processFacebookFeedChange = async (value, pageId) => {
  // Update analytics for Facebook posts
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
};

// Instagram media change processor
const processInstagramMediaChange = async (value, accountId) => {
  // Update analytics for Instagram posts
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
};

// Twitter tweet create processor
const processTwitterTweetCreate = async (tweet) => {
  // Update analytics for Twitter posts
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
};

// LinkedIn post create processor
const processLinkedInPostCreate = async (post) => {
  // Update analytics for LinkedIn posts
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
};

// Stripe subscription created processor
const processStripeSubscriptionCreated = async (subscription) => {
  // Update user subscription status
  const user = await User.findOne({ stripeCustomerId: subscription.customer });
  if (user) {
    user.subscriptionStatus = 'active';
    user.subscriptionId = subscription.id;
    await user.save();
  }
};

// Stripe subscription updated processor
const processStripeSubscriptionUpdated = async (subscription) => {
  // Update user subscription status
  const user = await User.findOne({ stripeCustomerId: subscription.customer });
  if (user) {
    user.subscriptionStatus = subscription.status;
    await user.save();
  }
};

// Stripe subscription deleted processor
const processStripeSubscriptionDeleted = async (subscription) => {
  // Update user subscription status
  const user = await User.findOne({ stripeCustomerId: subscription.customer });
  if (user) {
    user.subscriptionStatus = 'cancelled';
    await user.save();
  }
};

// Stripe payment succeeded processor
const processStripePaymentSucceeded = async (invoice) => {
  // Log successful payment
  logger.info(`Payment succeeded for customer ${invoice.customer}, amount: ${invoice.amount_paid}`);
};

// Stripe payment failed processor
const processStripePaymentFailed = async (invoice) => {
  // Log failed payment and potentially notify user
  logger.warn(`Payment failed for customer ${invoice.customer}, amount: ${invoice.amount_due}`);
};

// Generic webhook processor for other platforms
const handleGenericWebhook = async (req, res) => {
  try {
    const { platform } = req.params;
    const { body, headers } = req;

    logger.info(`Received webhook from ${platform}:`, {
      headers: headers,
      body: body
    });

    // Process based on platform
    switch (platform) {
      case 'tiktok':
        await processTikTokWebhook(body);
        break;
      case 'youtube':
        await processYouTubeWebhook(body);
        break;
      case 'pinterest':
        await processPinterestWebhook(body);
        break;
      default:
        logger.warn(`Unknown webhook platform: ${platform}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error(`Error handling ${req.params.platform} webhook:`, error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// TikTok webhook processor
const processTikTokWebhook = async (body) => {
  // Process TikTok webhook data
  logger.info('Processing TikTok webhook:', body);
};

// YouTube webhook processor
const processYouTubeWebhook = async (body) => {
  // Process YouTube webhook data
  logger.info('Processing YouTube webhook:', body);
};

// Pinterest webhook processor
const processPinterestWebhook = async (body) => {
  // Process Pinterest webhook data
  logger.info('Processing Pinterest webhook:', body);
};

module.exports = {
  handleFacebookWebhook,
  handleInstagramWebhook,
  handleTwitterWebhook,
  handleLinkedInWebhook,
  handleStripeWebhook,
  handleGenericWebhook
};

