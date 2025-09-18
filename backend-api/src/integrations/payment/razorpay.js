const Razorpay = require('razorpay');
const crypto = require('crypto');
const { logger } = require('../../utils/logger');
const { encrypt, decrypt } = require('../../utils/encryption');

class RazorpayIntegration {
    constructor() {
        this.razorpay = null;
        this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    }

    /**
     * Initialize Razorpay with API credentials
     */
    initialize(keyId, keySecret) {
        try {
            const decryptedKeyId = decrypt(keyId);
            const decryptedKeySecret = decrypt(keySecret);
            
            this.razorpay = new Razorpay({
                key_id: decryptedKeyId,
                key_secret: decryptedKeySecret
            });
            
            logger.info('Razorpay client initialized successfully');
            return true;
        } catch (error) {
            logger.error('Razorpay initialization error:', error);
            return false;
        }
    }

    /**
     * Create a Razorpay order
     */
    async createOrder(orderData, keyId, keySecret) {
        try {
            if (!this.razorpay) {
                this.initialize(keyId, keySecret);
            }

            const options = {
                amount: Math.round(orderData.amount * 100), // Convert to paise
                currency: orderData.currency || 'INR',
                receipt: orderData.receipt || `order_${Date.now()}`,
                notes: {
                    userId: orderData.userId,
                    organizationId: orderData.organizationId,
                    planName: orderData.planName,
                    description: orderData.description || 'Social Media Platform Subscription'
                }
            };

            const order = await this.razorpay.orders.create(options);
            
            return {
                success: true,
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt,
                status: order.status,
                orderData: order
            };
        } catch (error) {
            logger.error('Razorpay createOrder error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create Razorpay order'
            };
        }
    }

    /**
     * Verify payment signature
     */
    verifyPaymentSignature(paymentData, signature, keySecret) {
        try {
            const decryptedKeySecret = decrypt(keySecret);
            const body = paymentData.razorpay_order_id + "|" + paymentData.razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', decryptedKeySecret)
                .update(body.toString())
                .digest('hex');
            
            const isAuthentic = expectedSignature === signature;
            
            return {
                success: isAuthentic,
                verified: isAuthentic,
                error: isAuthentic ? null : 'Invalid payment signature'
            };
        } catch (error) {
            logger.error('Razorpay signature verification error:', error);
            return {
                success: false,
                verified: false,
                error: error.message
            };
        }
    }

    /**
     * Capture payment
     */
    async capturePayment(paymentId, amount, currency, keyId, keySecret) {
        try {
            if (!this.razorpay) {
                this.initialize(keyId, keySecret);
            }

            const payment = await this.razorpay.payments.capture(
                paymentId,
                Math.round(amount * 100), // Convert to paise
                currency || 'INR'
            );
            
            return {
                success: true,
                paymentId: payment.id,
                status: payment.status,
                amount: payment.amount,
                currency: payment.currency,
                paymentData: payment
            };
        } catch (error) {
            logger.error('Razorpay capturePayment error:', error);
            return {
                success: false,
                error: error.message || 'Failed to capture Razorpay payment'
            };
        }
    }

    /**
     * Get payment details
     */
    async getPayment(paymentId, keyId, keySecret) {
        try {
            if (!this.razorpay) {
                this.initialize(keyId, keySecret);
            }

            const payment = await this.razorpay.payments.fetch(paymentId);
            
            return {
                success: true,
                paymentData: payment
            };
        } catch (error) {
            logger.error('Razorpay getPayment error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get Razorpay payment'
            };
        }
    }

    /**
     * Create a subscription
     */
    async createSubscription(subscriptionData, keyId, keySecret) {
        try {
            if (!this.razorpay) {
                this.initialize(keyId, keySecret);
            }

            const options = {
                plan_id: subscriptionData.planId,
                customer_notify: subscriptionData.customerNotify !== false,
                quantity: subscriptionData.quantity || 1,
                total_count: subscriptionData.totalCount || 12, // 12 months default
                start_at: subscriptionData.startAt || Math.floor(Date.now() / 1000),
                expire_by: subscriptionData.expireBy,
                addons: subscriptionData.addons || [],
                notes: {
                    userId: subscriptionData.userId,
                    organizationId: subscriptionData.organizationId,
                    planName: subscriptionData.planName
                }
            };

            const subscription = await this.razorpay.subscriptions.create(options);
            
            return {
                success: true,
                subscriptionId: subscription.id,
                status: subscription.status,
                planId: subscription.plan_id,
                customerId: subscription.customer_id,
                subscriptionData: subscription
            };
        } catch (error) {
            logger.error('Razorpay createSubscription error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create Razorpay subscription'
            };
        }
    }

    /**
     * Get subscription details
     */
    async getSubscription(subscriptionId, keyId, keySecret) {
        try {
            if (!this.razorpay) {
                this.initialize(keyId, keySecret);
            }

            const subscription = await this.razorpay.subscriptions.fetch(subscriptionId);
            
            return {
                success: true,
                subscriptionData: subscription
            };
        } catch (error) {
            logger.error('Razorpay getSubscription error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get Razorpay subscription'
            };
        }
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(subscriptionId, cancelAtCycleEnd = false, keyId, keySecret) {
        try {
            if (!this.razorpay) {
                this.initialize(keyId, keySecret);
            }

            const subscription = await this.razorpay.subscriptions.cancel(
                subscriptionId,
                cancelAtCycleEnd
            );
            
            return {
                success: true,
                subscriptionId: subscription.id,
                status: subscription.status,
                cancelledAt: subscription.ended_at,
                message: 'Subscription cancelled successfully'
            };
        } catch (error) {
            logger.error('Razorpay cancelSubscription error:', error);
            return {
                success: false,
                error: error.message || 'Failed to cancel Razorpay subscription'
            };
        }
    }

    /**
     * Pause subscription
     */
    async pauseSubscription(subscriptionId, pauseAt, keyId, keySecret) {
        try {
            if (!this.razorpay) {
                this.initialize(keyId, keySecret);
            }

            const subscription = await this.razorpay.subscriptions.pause(
                subscriptionId,
                pauseAt
            );
            
            return {
                success: true,
                subscriptionId: subscription.id,
                status: subscription.status,
                pausedAt: subscription.paused_at,
                message: 'Subscription paused successfully'
            };
        } catch (error) {
            logger.error('Razorpay pauseSubscription error:', error);
            return {
                success: false,
                error: error.message || 'Failed to pause Razorpay subscription'
            };
        }
    }

    /**
     * Resume subscription
     */
    async resumeSubscription(subscriptionId, keyId, keySecret) {
        try {
            if (!this.razorpay) {
                this.initialize(keyId, keySecret);
            }

            const subscription = await this.razorpay.subscriptions.resume(subscriptionId);
            
            return {
                success: true,
                subscriptionId: subscription.id,
                status: subscription.status,
                resumedAt: subscription.resumed_at,
                message: 'Subscription resumed successfully'
            };
        } catch (error) {
            logger.error('Razorpay resumeSubscription error:', error);
            return {
                success: false,
                error: error.message || 'Failed to resume Razorpay subscription'
            };
        }
    }

    /**
     * Create a refund
     */
    async createRefund(paymentId, refundData, keyId, keySecret) {
        try {
            if (!this.razorpay) {
                this.initialize(keyId, keySecret);
            }

            const options = {
                amount: Math.round((refundData.amount || refundData.fullAmount) * 100), // Convert to paise
                speed: refundData.speed || 'normal', // normal, instant
                notes: {
                    reason: refundData.reason || 'User requested refund',
                    userId: refundData.userId,
                    organizationId: refundData.organizationId
                }
            };

            const refund = await this.razorpay.payments.refund(paymentId, options);
            
            return {
                success: true,
                refundId: refund.id,
                status: refund.status,
                amount: refund.amount,
                currency: refund.currency,
                refundData: refund
            };
        } catch (error) {
            logger.error('Razorpay createRefund error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create Razorpay refund'
            };
        }
    }

    /**
     * Get refund details
     */
    async getRefund(refundId, keyId, keySecret) {
        try {
            if (!this.razorpay) {
                this.initialize(keyId, keySecret);
            }

            const refund = await this.razorpay.refunds.fetch(refundId);
            
            return {
                success: true,
                refundData: refund
            };
        } catch (error) {
            logger.error('Razorpay getRefund error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get Razorpay refund'
            };
        }
    }

    /**
     * Create a customer
     */
    async createCustomer(customerData, keyId, keySecret) {
        try {
            if (!this.razorpay) {
                this.initialize(keyId, keySecret);
            }

            const options = {
                name: customerData.name,
                email: customerData.email,
                contact: customerData.contact,
                fail_existing: customerData.failExisting || '0',
                gstin: customerData.gstin,
                notes: {
                    userId: customerData.userId,
                    organizationId: customerData.organizationId
                }
            };

            const customer = await this.razorpay.customers.create(options);
            
            return {
                success: true,
                customerId: customer.id,
                customerData: customer
            };
        } catch (error) {
            logger.error('Razorpay createCustomer error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create Razorpay customer'
            };
        }
    }

    /**
     * Get customer details
     */
    async getCustomer(customerId, keyId, keySecret) {
        try {
            if (!this.razorpay) {
                this.initialize(keyId, keySecret);
            }

            const customer = await this.razorpay.customers.fetch(customerId);
            
            return {
                success: true,
                customerData: customer
            };
        } catch (error) {
            logger.error('Razorpay getCustomer error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get Razorpay customer'
            };
        }
    }

    /**
     * Verify webhook signature
     */
    verifyWebhook(body, signature, webhookSecret) {
        try {
            const decryptedSecret = decrypt(webhookSecret);
            const expectedSignature = crypto
                .createHmac('sha256', decryptedSecret)
                .update(body)
                .digest('hex');
            
            const isAuthentic = expectedSignature === signature;
            
            return {
                success: isAuthentic,
                verified: isAuthentic,
                error: isAuthentic ? null : 'Invalid webhook signature'
            };
        } catch (error) {
            logger.error('Razorpay webhook verification error:', error);
            return {
                success: false,
                verified: false,
                error: error.message
            };
        }
    }

    /**
     * Process webhook event
     */
    async processWebhook(event, body, signature) {
        try {
            const verification = this.verifyWebhook(body, signature, this.webhookSecret);
            
            if (!verification.verified) {
                return {
                    success: false,
                    error: 'Webhook verification failed'
                };
            }

            const eventType = event.event;
            const entity = event.contained[0];

            logger.info(`Processing Razorpay webhook: ${eventType}`);

            switch (eventType) {
                case 'payment.captured':
                    return await this.handlePaymentCaptured(entity);
                case 'payment.failed':
                    return await this.handlePaymentFailed(entity);
                case 'subscription.activated':
                    return await this.handleSubscriptionActivated(entity);
                case 'subscription.cancelled':
                    return await this.handleSubscriptionCancelled(entity);
                case 'subscription.charged':
                    return await this.handleSubscriptionCharged(entity);
                case 'subscription.completed':
                    return await this.handleSubscriptionCompleted(entity);
                case 'subscription.halted':
                    return await this.handleSubscriptionHalted(entity);
                case 'subscription.paused':
                    return await this.handleSubscriptionPaused(entity);
                case 'subscription.resumed':
                    return await this.handleSubscriptionResumed(entity);
                default:
                    logger.info(`Unhandled Razorpay webhook event: ${eventType}`);
                    return { success: true, message: 'Event logged but not processed' };
            }
        } catch (error) {
            logger.error('Razorpay webhook processing error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async handlePaymentCaptured(entity) {
        logger.info('Razorpay payment captured:', entity.id);
        return { success: true, message: 'Payment captured' };
    }

    async handlePaymentFailed(entity) {
        logger.info('Razorpay payment failed:', entity.id);
        return { success: true, message: 'Payment failed' };
    }

    async handleSubscriptionActivated(entity) {
        logger.info('Razorpay subscription activated:', entity.id);
        return { success: true, message: 'Subscription activated' };
    }

    async handleSubscriptionCancelled(entity) {
        logger.info('Razorpay subscription cancelled:', entity.id);
        return { success: true, message: 'Subscription cancelled' };
    }

    async handleSubscriptionCharged(entity) {
        logger.info('Razorpay subscription charged:', entity.id);
        return { success: true, message: 'Subscription charged' };
    }

    async handleSubscriptionCompleted(entity) {
        logger.info('Razorpay subscription completed:', entity.id);
        return { success: true, message: 'Subscription completed' };
    }

    async handleSubscriptionHalted(entity) {
        logger.info('Razorpay subscription halted:', entity.id);
        return { success: true, message: 'Subscription halted' };
    }

    async handleSubscriptionPaused(entity) {
        logger.info('Razorpay subscription paused:', entity.id);
        return { success: true, message: 'Subscription paused' };
    }

    async handleSubscriptionResumed(entity) {
        logger.info('Razorpay subscription resumed:', entity.id);
        return { success: true, message: 'Subscription resumed' };
    }

    /**
     * Format customer data for display
     */
    formatCustomerData(customer) {
        return {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            contact: customer.contact,
            gstin: customer.gstin,
            createdAt: customer.created_at
        };
    }
}

module.exports = new RazorpayIntegration();

