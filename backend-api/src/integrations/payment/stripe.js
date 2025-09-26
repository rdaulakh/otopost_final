const stripe = require('stripe');
const { logger } = require('../../utils/logger');
const { encrypt, decrypt } = require('../../utils/encryption');

class StripeIntegration {
    constructor() {
        this.stripe = null;
        this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    }

    /**
     * Initialize Stripe with API key
     */
    initialize(apiKey) {
        const decryptedKey = decrypt(apiKey);
        this.stripe = stripe(decryptedKey);
        return this.stripe;
    }

    /**
     * Create Stripe customer
     */
    async createCustomer(customerData, apiKey) {
        try {
            const stripeClient = this.initialize(apiKey);
            const customer = await stripeClient.customers.create({
                email: customerData.email,
                name: customerData.name,
                phone: customerData.phone || null,
                address: customerData.address || null,
                metadata: {
                    userId: customerData.userId,
                    organizationId: customerData.organizationId,
                    source: 'social_media_platform'
                }
            });

            return {
                success: true,
                customer: {
                    id: customer.id,
                    email: customer.email,
                    name: customer.name,
                    phone: customer.phone,
                    created: new Date(customer.created * 1000),
                    metadata: customer.metadata
                }
            };
        } catch (error) {
            logger.error('Stripe createCustomer error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to create Stripe customer'
            };
        }
    }

    /**
     * Create subscription
     */
    async createSubscription(subscriptionData, apiKey) {
        try {
            const stripeClient = this.initialize(apiKey);
            
            // Create subscription with trial if specified
            const subscriptionParams = {
                customer: subscriptionData.customerId,
                items: [{
                    price: subscriptionData.priceId,
                    quantity: subscriptionData.quantity || 1
                }],
                payment_behavior: 'default_incomplete',
                payment_settings: { save_default_payment_method: 'on_subscription' },
                expand: ['latest_invoice.payment_intent'],
                metadata: {
                    userId: subscriptionData.userId,
                    organizationId: subscriptionData.organizationId,
                    planName: subscriptionData.planName
                }
            };

            // Add trial period if specified
            if (subscriptionData.trialPeriodDays) {
                subscriptionParams.trial_period_days = subscriptionData.trialPeriodDays;
            }

            // Add coupon if specified
            if (subscriptionData.couponId) {
                subscriptionParams.coupon = subscriptionData.couponId;
            }

            const subscription = await stripeClient.subscriptions.create(subscriptionParams);

            return {
                success: true,
                subscription: {
                    id: subscription.id,
                    customerId: subscription.customer,
                    status: subscription.status,
                    currentPeriodStart: new Date(subscription.current_period_start * 1000),
                    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
                    trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
                    clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
                    metadata: subscription.metadata
                }
            };
        } catch (error) {
            logger.error('Stripe createSubscription error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to create subscription'
            };
        }
    }

    /**
     * Update subscription
     */
    async updateSubscription(subscriptionId, updateData, apiKey) {
        try {
            const stripeClient = this.initialize(apiKey);
            
            const updateParams = {};
            
            // Update price/plan
            if (updateData.priceId) {
                updateParams.items = [{
                    id: updateData.subscriptionItemId,
                    price: updateData.priceId,
                    quantity: updateData.quantity || 1
                }];
                updateParams.proration_behavior = updateData.prorationBehavior || 'create_prorations';
            }

            // Update metadata
            if (updateData.metadata) {
                updateParams.metadata = updateData.metadata;
            }

            // Cancel at period end
            if (updateData.cancelAtPeriodEnd !== undefined) {
                updateParams.cancel_at_period_end = updateData.cancelAtPeriodEnd;
            }

            const subscription = await stripeClient.subscriptions.update(subscriptionId, updateParams);

            return {
                success: true,
                subscription: {
                    id: subscription.id,
                    status: subscription.status,
                    currentPeriodStart: new Date(subscription.current_period_start * 1000),
                    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    cancelAtPeriodEnd: subscription.cancel_at_period_end,
                    metadata: subscription.metadata
                }
            };
        } catch (error) {
            logger.error('Stripe updateSubscription error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to update subscription'
            };
        }
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(subscriptionId, cancelData, apiKey) {
        try {
            const stripeClient = this.initialize(apiKey);
            
            let subscription;
            if (cancelData.immediately) {
                // Cancel immediately
                subscription = await stripeClient.subscriptions.cancel(subscriptionId, {
                    invoice_now: cancelData.invoiceNow || false,
                    prorate: cancelData.prorate || false
                });
            } else {
                // Cancel at period end
                subscription = await stripeClient.subscriptions.update(subscriptionId, {
                    cancel_at_period_end: true,
                    metadata: {
                        cancellation_reason: cancelData.reason || 'user_requested',
                        cancelled_at: new Date().toISOString()
                    }
                });
            }

            return {
                success: true,
                subscription: {
                    id: subscription.id,
                    status: subscription.status,
                    canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
                    cancelAtPeriodEnd: subscription.cancel_at_period_end,
                    currentPeriodEnd: new Date(subscription.current_period_end * 1000)
                }
            };
        } catch (error) {
            logger.error('Stripe cancelSubscription error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to cancel subscription'
            };
        }
    }

    /**
     * Create payment intent for one-time payments
     */
    async createPaymentIntent(paymentData, apiKey) {
        try {
            const stripeClient = this.initialize(apiKey);
            
            const paymentIntent = await stripeClient.paymentIntents.create({
                amount: paymentData.amount, // Amount in cents
                currency: paymentData.currency || 'usd',
                customer: paymentData.customerId,
                description: paymentData.description,
                metadata: {
                    userId: paymentData.userId,
                    organizationId: paymentData.organizationId,
                    type: paymentData.type || 'one_time_payment'
                },
                automatic_payment_methods: {
                    enabled: true
                }
            });

            return {
                success: true,
                paymentIntent: {
                    id: paymentIntent.id,
                    clientSecret: paymentIntent.client_secret,
                    amount: paymentIntent.amount,
                    currency: paymentIntent.currency,
                    status: paymentIntent.status
                }
            };
        } catch (error) {
            logger.error('Stripe createPaymentIntent error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to create payment intent'
            };
        }
    }

    /**
     * Create setup intent for saving payment methods
     */
    async createSetupIntent(customerId, apiKey) {
        try {
            const stripeClient = this.initialize(apiKey);
            
            const setupIntent = await stripeClient.setupIntents.create({
                customer: customerId,
                payment_method_types: ['card'],
                usage: 'off_session'
            });

            return {
                success: true,
                setupIntent: {
                    id: setupIntent.id,
                    clientSecret: setupIntent.client_secret,
                    status: setupIntent.status
                }
            };
        } catch (error) {
            logger.error('Stripe createSetupIntent error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to create setup intent'
            };
        }
    }

    /**
     * Get customer payment methods
     */
    async getPaymentMethods(customerId, apiKey) {
        try {
            const stripeClient = this.initialize(apiKey);
            
            const paymentMethods = await stripeClient.paymentMethods.list({
                customer: customerId,
                type: 'card'
            });

            return {
                success: true,
                paymentMethods: paymentMethods.data.map(pm => ({
                    id: pm.id,
                    type: pm.type,
                    card: pm.card ? {
                        brand: pm.card.brand,
                        last4: pm.card.last4,
                        expMonth: pm.card.exp_month,
                        expYear: pm.card.exp_year
                    } : null,
                    created: new Date(pm.created * 1000)
                }))
            };
        } catch (error) {
            logger.error('Stripe getPaymentMethods error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to get payment methods'
            };
        }
    }

    /**
     * Create invoice
     */
    async createInvoice(invoiceData, apiKey) {
        try {
            const stripeClient = this.initialize(apiKey);
            
            // Create invoice
            const invoice = await stripeClient.invoices.create({
                customer: invoiceData.customerId,
                description: invoiceData.description,
                metadata: {
                    userId: invoiceData.userId,
                    organizationId: invoiceData.organizationId,
                    type: invoiceData.type || 'one_time'
                },
                auto_advance: invoiceData.autoAdvance !== false
            });

            // Add invoice items
            if (invoiceData.items && invoiceData.items.length > 0) {
                for (const item of invoiceData.items) {
                    await stripeClient.invoiceItems.create({
                        customer: invoiceData.customerId,
                        invoice: invoice.id,
                        amount: item.amount,
                        currency: item.currency || 'usd',
                        description: item.description,
                        metadata: item.metadata || {}
                    });
                }
            }

            // Finalize invoice if requested
            if (invoiceData.finalize) {
                await stripeClient.invoices.finalizeInvoice(invoice.id);
            }

            return {
                success: true,
                invoice: {
                    id: invoice.id,
                    number: invoice.number,
                    status: invoice.status,
                    total: invoice.total,
                    currency: invoice.currency,
                    hostedInvoiceUrl: invoice.hosted_invoice_url,
                    invoicePdf: invoice.invoice_pdf
                }
            };
        } catch (error) {
            logger.error('Stripe createInvoice error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to create invoice'
            };
        }
    }

    /**
     * Create coupon
     */
    async createCoupon(couponData, apiKey) {
        try {
            const stripeClient = this.initialize(apiKey);
            
            const couponParams = {
                id: couponData.id,
                name: couponData.name,
                metadata: couponData.metadata || {}
            };

            // Set discount type
            if (couponData.percentOff) {
                couponParams.percent_off = couponData.percentOff;
            } else if (couponData.amountOff) {
                couponParams.amount_off = couponData.amountOff;
                couponParams.currency = couponData.currency || 'usd';
            }

            // Set duration
            couponParams.duration = couponData.duration || 'once'; // once, repeating, forever
            if (couponData.duration === 'repeating') {
                couponParams.duration_in_months = couponData.durationInMonths;
            }

            // Set redemption limits
            if (couponData.maxRedemptions) {
                couponParams.max_redemptions = couponData.maxRedemptions;
            }

            // Set expiration
            if (couponData.redeemBy) {
                couponParams.redeem_by = Math.floor(new Date(couponData.redeemBy).getTime() / 1000);
            }

            const coupon = await stripeClient.coupons.create(couponParams);

            return {
                success: true,
                coupon: {
                    id: coupon.id,
                    name: coupon.name,
                    percentOff: coupon.percent_off,
                    amountOff: coupon.amount_off,
                    currency: coupon.currency,
                    duration: coupon.duration,
                    durationInMonths: coupon.duration_in_months,
                    maxRedemptions: coupon.max_redemptions,
                    timesRedeemed: coupon.times_redeemed,
                    valid: coupon.valid
                }
            };
        } catch (error) {
            logger.error('Stripe createCoupon error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to create coupon'
            };
        }
    }

    /**
     * Get subscription details
     */
    async getSubscription(subscriptionId, apiKey) {
        try {
            const stripeClient = this.initialize(apiKey);
            
            const subscription = await stripeClient.subscriptions.retrieve(subscriptionId, {
                expand: ['latest_invoice', 'customer', 'items.data.price']
            });

            return {
                success: true,
                subscription: {
                    id: subscription.id,
                    customerId: subscription.customer.id,
                    customerEmail: subscription.customer.email,
                    status: subscription.status,
                    currentPeriodStart: new Date(subscription.current_period_start * 1000),
                    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
                    trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
                    cancelAtPeriodEnd: subscription.cancel_at_period_end,
                    canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
                    items: subscription.items.data.map(item => ({
                        id: item.id,
                        priceId: item.price.id,
                        quantity: item.quantity,
                        amount: item.price.unit_amount,
                        currency: item.price.currency,
                        interval: item.price.recurring?.interval,
                        intervalCount: item.price.recurring?.interval_count
                    })),
                    latestInvoice: subscription.latest_invoice ? {
                        id: subscription.latest_invoice.id,
                        status: subscription.latest_invoice.status,
                        total: subscription.latest_invoice.total,
                        hostedInvoiceUrl: subscription.latest_invoice.hosted_invoice_url
                    } : null,
                    metadata: subscription.metadata
                }
            };
        } catch (error) {
            logger.error('Stripe getSubscription error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to get subscription'
            };
        }
    }

    /**
     * Handle Stripe webhook
     */
    async handleWebhook(payload, signature) {
        try {
            const event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
            
            logger.info('Stripe webhook received:', { type: event.type, id: event.id });

            const eventData = {
                id: event.id,
                type: event.type,
                created: new Date(event.created * 1000),
                data: event.data.object
            };

            // Handle different event types
            switch (event.type) {
                case 'customer.subscription.created':
                case 'customer.subscription.updated':
                case 'customer.subscription.deleted':
                    eventData.subscription = this.formatSubscriptionData(event.data.object);
                    break;
                
                case 'invoice.payment_succeeded':
                case 'invoice.payment_failed':
                case 'invoice.finalized':
                    eventData.invoice = this.formatInvoiceData(event.data.object);
                    break;
                
                case 'payment_intent.succeeded':
                case 'payment_intent.payment_failed':
                    eventData.paymentIntent = this.formatPaymentIntentData(event.data.object);
                    break;
                
                case 'customer.created':
                case 'customer.updated':
                case 'customer.deleted':
                    eventData.customer = this.formatCustomerData(event.data.object);
                    break;
            }

            return {
                success: true,
                event: eventData
            };
        } catch (error) {
            logger.error('Stripe webhook error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to handle webhook'
            };
        }
    }

    /**
     * Format subscription data for webhook
     */
    formatSubscriptionData(subscription) {
        return {
            id: subscription.id,
            customerId: subscription.customer,
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            metadata: subscription.metadata
        };
    }

    /**
     * Format invoice data for webhook
     */
    formatInvoiceData(invoice) {
        return {
            id: invoice.id,
            customerId: invoice.customer,
            subscriptionId: invoice.subscription,
            status: invoice.status,
            total: invoice.total,
            currency: invoice.currency,
            hostedInvoiceUrl: invoice.hosted_invoice_url
        };
    }

    /**
     * Format payment intent data for webhook
     */
    formatPaymentIntentData(paymentIntent) {
        return {
            id: paymentIntent.id,
            customerId: paymentIntent.customer,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
            metadata: paymentIntent.metadata
        };
    }

    /**
     * Format customer data for webhook
     */
    formatCustomerData(customer) {
        return {
            id: customer.id,
            email: customer.email,
            name: customer.name,
            metadata: customer.metadata
        };
    }

    /**
     * Get usage records for metered billing
     */
    async createUsageRecord(subscriptionItemId, usageData, apiKey) {
        try {
            const stripeClient = this.initialize(apiKey);
            
            const usageRecord = await stripeClient.subscriptionItems.createUsageRecord(subscriptionItemId, {
                quantity: usageData.quantity,
                timestamp: usageData.timestamp || Math.floor(Date.now() / 1000),
                action: usageData.action || 'increment' // increment, set
            });

            return {
                success: true,
                usageRecord: {
                    id: usageRecord.id,
                    quantity: usageRecord.quantity,
                    timestamp: new Date(usageRecord.timestamp * 1000)
                }
            };
        } catch (error) {
            logger.error('Stripe createUsageRecord error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to create usage record'
            };
        }
    }
}

module.exports = new StripeIntegration();

