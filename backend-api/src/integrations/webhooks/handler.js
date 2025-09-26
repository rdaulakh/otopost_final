const crypto = require('crypto');
const { logger } = require('../../utils/logger');
const { redisClient } = require('../../config/redis');
const { io } = require('../../websocket');

class WebhookHandler {
    constructor() {
        this.handlers = new Map();
        this.setupHandlers();
    }

    /**
     * Setup webhook handlers for all platforms
     */
    setupHandlers() {
        // Social Media Platform Handlers
        this.handlers.set('facebook', this.handleFacebookWebhook.bind(this));
        this.handlers.set('instagram', this.handleInstagramWebhook.bind(this));
        this.handlers.set('twitter', this.handleTwitterWebhook.bind(this));
        this.handlers.set('linkedin', this.handleLinkedInWebhook.bind(this));
        this.handlers.set('tiktok', this.handleTikTokWebhook.bind(this));
        this.handlers.set('youtube', this.handleYouTubeWebhook.bind(this));
        this.handlers.set('pinterest', this.handlePinterestWebhook.bind(this));
        
        // Payment Platform Handlers
        this.handlers.set('stripe', this.handleStripeWebhook.bind(this));
        
        // AWS Service Handlers
        this.handlers.set('ses', this.handleSESWebhook.bind(this));
        this.handlers.set('s3', this.handleS3Webhook.bind(this));
    }

    /**
     * Main webhook processing function
     */
    async processWebhook(platform, payload, headers, organizationId = null) {
        try {
            const handler = this.handlers.get(platform.toLowerCase());
            if (!handler) {
                throw new Error(`No handler found for platform: ${platform}`);
            }

            // Verify webhook signature
            const isValid = await this.verifyWebhookSignature(platform, payload, headers);
            if (!isValid) {
                throw new Error(`Invalid webhook signature for platform: ${platform}`);
            }

            // Process the webhook
            const result = await handler(payload, headers, organizationId);
            
            // Log successful processing
            logger.info('Webhook processed successfully:', {
                platform: platform,
                eventType: result.eventType,
                organizationId: organizationId,
                timestamp: new Date().toISOString()
            });

            // Emit real-time updates if needed
            if (result.realTimeUpdate) {
                await this.emitRealTimeUpdate(result, organizationId);
            }

            // Store webhook event for audit
            await this.storeWebhookEvent(platform, result, organizationId);

            return {
                success: true,
                eventType: result.eventType,
                data: result.data,
                processed: true
            };
        } catch (error) {
            logger.error('Webhook processing error:', {
                platform: platform,
                error: error.message,
                organizationId: organizationId
            });

            return {
                success: false,
                error: error.message,
                processed: false
            };
        }
    }

    /**
     * Facebook webhook handler
     */
    async handleFacebookWebhook(payload, headers, organizationId) {
        const data = JSON.parse(payload);
        
        if (data.object === 'page') {
            for (const entry of data.entry) {
                for (const change of entry.changes || []) {
                    switch (change.field) {
                        case 'feed':
                            return await this.handleFacebookFeedChange(change.value, entry.id, organizationId);
                        case 'comments':
                            return await this.handleFacebookCommentChange(change.value, entry.id, organizationId);
                        case 'reactions':
                            return await this.handleFacebookReactionChange(change.value, entry.id, organizationId);
                        case 'messages':
                            return await this.handleFacebookMessageChange(change.value, entry.id, organizationId);
                    }
                }
            }
        }

        return {
            eventType: 'facebook_unknown',
            data: data,
            realTimeUpdate: false
        };
    }

    /**
     * Instagram webhook handler
     */
    async handleInstagramWebhook(payload, headers, organizationId) {
        const data = JSON.parse(payload);
        
        if (data.object === 'instagram') {
            for (const entry of data.entry) {
                for (const change of entry.changes || []) {
                    switch (change.field) {
                        case 'comments':
                            return await this.handleInstagramCommentChange(change.value, entry.id, organizationId);
                        case 'mentions':
                            return await this.handleInstagramMentionChange(change.value, entry.id, organizationId);
                        case 'story_insights':
                            return await this.handleInstagramStoryInsights(change.value, entry.id, organizationId);
                    }
                }
            }
        }

        return {
            eventType: 'instagram_unknown',
            data: data,
            realTimeUpdate: false
        };
    }

    /**
     * Twitter webhook handler
     */
    async handleTwitterWebhook(payload, headers, organizationId) {
        const data = JSON.parse(payload);
        
        // Handle different Twitter webhook events
        if (data.tweet_create_events) {
            return await this.handleTwitterTweetCreate(data.tweet_create_events, organizationId);
        } else if (data.favorite_events) {
            return await this.handleTwitterFavorite(data.favorite_events, organizationId);
        } else if (data.follow_events) {
            return await this.handleTwitterFollow(data.follow_events, organizationId);
        } else if (data.direct_message_events) {
            return await this.handleTwitterDirectMessage(data.direct_message_events, organizationId);
        }

        return {
            eventType: 'twitter_unknown',
            data: data,
            realTimeUpdate: false
        };
    }

    /**
     * LinkedIn webhook handler
     */
    async handleLinkedInWebhook(payload, headers, organizationId) {
        const data = JSON.parse(payload);
        
        // Handle LinkedIn webhook events
        if (data.eventType === 'SHARE_STATISTICS_UPDATE') {
            return await this.handleLinkedInShareStats(data, organizationId);
        } else if (data.eventType === 'COMPANY_SOCIAL_ACTION') {
            return await this.handleLinkedInCompanyAction(data, organizationId);
        }

        return {
            eventType: 'linkedin_unknown',
            data: data,
            realTimeUpdate: false
        };
    }

    /**
     * TikTok webhook handler
     */
    async handleTikTokWebhook(payload, headers, organizationId) {
        const data = JSON.parse(payload);
        
        // Handle TikTok webhook events
        if (data.event === 'video.publish') {
            return await this.handleTikTokVideoPublish(data, organizationId);
        } else if (data.event === 'video.update') {
            return await this.handleTikTokVideoUpdate(data, organizationId);
        }

        return {
            eventType: 'tiktok_unknown',
            data: data,
            realTimeUpdate: false
        };
    }

    /**
     * YouTube webhook handler
     */
    async handleYouTubeWebhook(payload, headers, organizationId) {
        const data = JSON.parse(payload);
        
        // Handle YouTube webhook events (PubSubHubbub)
        if (data.feed && data.feed.entry) {
            return await this.handleYouTubeVideoUpdate(data.feed.entry, organizationId);
        }

        return {
            eventType: 'youtube_unknown',
            data: data,
            realTimeUpdate: false
        };
    }

    /**
     * Pinterest webhook handler
     */
    async handlePinterestWebhook(payload, headers, organizationId) {
        const data = JSON.parse(payload);
        
        // Handle Pinterest webhook events
        if (data.event_type === 'pin_create') {
            return await this.handlePinterestPinCreate(data, organizationId);
        } else if (data.event_type === 'pin_update') {
            return await this.handlePinterestPinUpdate(data, organizationId);
        }

        return {
            eventType: 'pinterest_unknown',
            data: data,
            realTimeUpdate: false
        };
    }

    /**
     * Stripe webhook handler
     */
    async handleStripeWebhook(payload, headers, organizationId) {
        const data = JSON.parse(payload);
        
        switch (data.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                return await this.handleStripeSubscriptionEvent(data, organizationId);
            
            case 'invoice.payment_succeeded':
            case 'invoice.payment_failed':
                return await this.handleStripeInvoiceEvent(data, organizationId);
            
            case 'payment_intent.succeeded':
            case 'payment_intent.payment_failed':
                return await this.handleStripePaymentEvent(data, organizationId);
            
            default:
                return {
                    eventType: `stripe_${data.type}`,
                    data: data,
                    realTimeUpdate: true
                };
        }
    }

    /**
     * AWS SES webhook handler
     */
    async handleSESWebhook(payload, headers, organizationId) {
        const data = JSON.parse(payload);
        
        // Handle SNS notification from SES
        if (data.Type === 'Notification') {
            const message = JSON.parse(data.Message);
            
            if (message.eventType === 'bounce') {
                return await this.handleSESBounce(message, organizationId);
            } else if (message.eventType === 'complaint') {
                return await this.handleSESComplaint(message, organizationId);
            } else if (message.eventType === 'delivery') {
                return await this.handleSESDelivery(message, organizationId);
            }
        }

        return {
            eventType: 'ses_unknown',
            data: data,
            realTimeUpdate: false
        };
    }

    /**
     * AWS S3 webhook handler
     */
    async handleS3Webhook(payload, headers, organizationId) {
        const data = JSON.parse(payload);
        
        // Handle S3 event notifications
        if (data.Records) {
            for (const record of data.Records) {
                if (record.eventName.startsWith('s3:ObjectCreated')) {
                    return await this.handleS3ObjectCreated(record, organizationId);
                } else if (record.eventName.startsWith('s3:ObjectRemoved')) {
                    return await this.handleS3ObjectRemoved(record, organizationId);
                }
            }
        }

        return {
            eventType: 's3_unknown',
            data: data,
            realTimeUpdate: false
        };
    }

    /**
     * Verify webhook signature for security
     */
    async verifyWebhookSignature(platform, payload, headers) {
        try {
            switch (platform.toLowerCase()) {
                case 'facebook':
                case 'instagram':
                    return this.verifyFacebookSignature(payload, headers);
                case 'twitter':
                    return this.verifyTwitterSignature(payload, headers);
                case 'linkedin':
                    return this.verifyLinkedInSignature(payload, headers);
                case 'stripe':
                    return this.verifyStripeSignature(payload, headers);
                default:
                    // For platforms without signature verification, return true
                    return true;
            }
        } catch (error) {
            logger.error('Webhook signature verification error:', {
                platform: platform,
                error: error.message
            });
            return false;
        }
    }

    /**
     * Verify Facebook/Instagram webhook signature
     */
    verifyFacebookSignature(payload, headers) {
        const signature = headers['x-hub-signature-256'];
        if (!signature) return false;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.FACEBOOK_WEBHOOK_SECRET)
            .update(payload)
            .digest('hex');

        return signature === `sha256=${expectedSignature}`;
    }

    /**
     * Verify Twitter webhook signature
     */
    verifyTwitterSignature(payload, headers) {
        const signature = headers['x-twitter-webhooks-signature'];
        if (!signature) return false;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.TWITTER_WEBHOOK_SECRET)
            .update(payload)
            .digest('base64');

        return signature === `sha256=${expectedSignature}`;
    }

    /**
     * Verify LinkedIn webhook signature
     */
    verifyLinkedInSignature(payload, headers) {
        const signature = headers['x-linkedin-signature'];
        if (!signature) return false;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.LINKEDIN_WEBHOOK_SECRET)
            .update(payload)
            .digest('hex');

        return signature === expectedSignature;
    }

    /**
     * Verify Stripe webhook signature
     */
    verifyStripeSignature(payload, headers) {
        const signature = headers['stripe-signature'];
        if (!signature) return false;

        try {
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Emit real-time updates via WebSocket
     */
    async emitRealTimeUpdate(result, organizationId) {
        try {
            if (organizationId) {
                // Emit to specific organization
                io.to(`org_${organizationId}`).emit('webhook_update', {
                    eventType: result.eventType,
                    data: result.data,
                    timestamp: new Date().toISOString()
                });
            }

            // Emit to admin panel
            io.to('admin').emit('webhook_update', {
                eventType: result.eventType,
                organizationId: organizationId,
                data: result.data,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Real-time update emission error:', error.message);
        }
    }

    /**
     * Store webhook event for audit and analytics
     */
    async storeWebhookEvent(platform, result, organizationId) {
        try {
            const eventData = {
                platform: platform,
                eventType: result.eventType,
                organizationId: organizationId,
                data: result.data,
                timestamp: new Date().toISOString(),
                processed: true
            };

            // Store in Redis for recent events (24 hours)
            const key = `webhook_events:${platform}:${organizationId || 'system'}`;
            await redisClient.lpush(key, JSON.stringify(eventData));
            await redisClient.expire(key, 86400); // 24 hours

            // Store in database for long-term analytics (implement as needed)
            // await WebhookEvent.create(eventData);
        } catch (error) {
            logger.error('Webhook event storage error:', error.message);
        }
    }

    /**
     * Handle Facebook feed changes
     */
    async handleFacebookFeedChange(value, pageId, organizationId) {
        return {
            eventType: 'facebook_feed_change',
            data: {
                pageId: pageId,
                postId: value.post_id,
                verb: value.verb, // add, edit, remove
                item: value.item,
                organizationId: organizationId
            },
            realTimeUpdate: true
        };
    }

    /**
     * Handle Facebook comment changes
     */
    async handleFacebookCommentChange(value, pageId, organizationId) {
        return {
            eventType: 'facebook_comment_change',
            data: {
                pageId: pageId,
                commentId: value.comment_id,
                postId: value.post_id,
                verb: value.verb, // add, edit, remove
                message: value.message,
                from: value.from,
                organizationId: organizationId
            },
            realTimeUpdate: true
        };
    }

    /**
     * Handle Stripe subscription events
     */
    async handleStripeSubscriptionEvent(data, organizationId) {
        const subscription = data.data.object;
        
        return {
            eventType: `stripe_subscription_${data.type.split('.').pop()}`,
            data: {
                subscriptionId: subscription.id,
                customerId: subscription.customer,
                status: subscription.status,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                organizationId: organizationId
            },
            realTimeUpdate: true
        };
    }

    /**
     * Get webhook event history
     */
    async getWebhookHistory(platform, organizationId, limit = 50) {
        try {
            const key = `webhook_events:${platform}:${organizationId || 'system'}`;
            const events = await redisClient.lrange(key, 0, limit - 1);
            
            return {
                success: true,
                events: events.map(event => JSON.parse(event))
            };
        } catch (error) {
            logger.error('Get webhook history error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get webhook statistics
     */
    async getWebhookStats(organizationId, timeframe = '24h') {
        try {
            const stats = {};
            const platforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'stripe'];
            
            for (const platform of platforms) {
                const key = `webhook_events:${platform}:${organizationId || 'system'}`;
                const count = await redisClient.llen(key);
                stats[platform] = count;
            }

            return {
                success: true,
                stats: stats,
                timeframe: timeframe,
                organizationId: organizationId
            };
        } catch (error) {
            logger.error('Get webhook stats error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new WebhookHandler();

