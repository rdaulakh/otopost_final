const paypal = require('@paypal/checkout-server-sdk');
const { logger } = require('../../utils/logger');
const { encrypt, decrypt } = require('../../utils/encryption');

class PayPalIntegration {
    constructor() {
        this.client = null;
        this.webhookSecret = process.env.PAYPAL_WEBHOOK_SECRET;
    }

    /**
     * Initialize PayPal client with API credentials
     */
    initialize(clientId, clientSecret, environment = 'sandbox') {
        try {
            const decryptedClientId = decrypt(clientId);
            const decryptedClientSecret = decrypt(clientSecret);
            
            const environment_class = environment === 'production' 
                ? paypal.core.LiveEnvironment 
                : paypal.core.SandboxEnvironment;
            
            const client = new paypal.core.PayPalHttpClient(
                new environment_class(decryptedClientId, decryptedClientSecret)
            );
            
            this.client = client;
            logger.info('PayPal client initialized successfully');
            return true;
        } catch (error) {
            logger.error('PayPal initialization error:', error);
            return false;
        }
    }

    /**
     * Create a PayPal order
     */
    async createOrder(orderData, clientId, clientSecret) {
        try {
            if (!this.client) {
                this.initialize(clientId, clientSecret);
            }

            const request = new paypal.orders.OrdersCreateRequest();
            request.prefer("return=representation");
            request.requestBody({
                intent: orderData.intent || 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: orderData.currency || 'USD',
                        value: orderData.amount.toString()
                    },
                    description: orderData.description || 'Social Media Platform Subscription',
                    custom_id: orderData.customId || orderData.userId,
                    invoice_id: orderData.invoiceId
                }],
                application_context: {
                    brand_name: orderData.brandName || 'AI Social Media Platform',
                    landing_page: 'BILLING',
                    user_action: 'PAY_NOW',
                    return_url: orderData.returnUrl || `${process.env.FRONTEND_URL}/payment/success`,
                    cancel_url: orderData.cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`
                }
            });

            const response = await this.client.execute(request);
            
            return {
                success: true,
                orderId: response.result.id,
                status: response.result.status,
                links: response.result.links,
                orderData: response.result
            };
        } catch (error) {
            logger.error('PayPal createOrder error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create PayPal order'
            };
        }
    }

    /**
     * Capture a PayPal order
     */
    async captureOrder(orderId, clientId, clientSecret) {
        try {
            if (!this.client) {
                this.initialize(clientId, clientSecret);
            }

            const request = new paypal.orders.OrdersCaptureRequest(orderId);
            request.requestBody({});

            const response = await this.client.execute(request);
            
            return {
                success: true,
                captureId: response.result.purchase_units[0].payments.captures[0].id,
                status: response.result.status,
                amount: response.result.purchase_units[0].payments.captures[0].amount,
                orderData: response.result
            };
        } catch (error) {
            logger.error('PayPal captureOrder error:', error);
            return {
                success: false,
                error: error.message || 'Failed to capture PayPal order'
            };
        }
    }

    /**
     * Get order details
     */
    async getOrder(orderId, clientId, clientSecret) {
        try {
            if (!this.client) {
                this.initialize(clientId, clientSecret);
            }

            const request = new paypal.orders.OrdersGetRequest(orderId);
            const response = await this.client.execute(request);
            
            return {
                success: true,
                orderData: response.result
            };
        } catch (error) {
            logger.error('PayPal getOrder error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get PayPal order'
            };
        }
    }

    /**
     * Create a subscription
     */
    async createSubscription(subscriptionData, clientId, clientSecret) {
        try {
            if (!this.client) {
                this.initialize(clientId, clientSecret);
            }

            const request = new paypal.subscriptions.SubscriptionsCreateRequest();
            request.requestBody({
                plan_id: subscriptionData.planId,
                subscriber: {
                    name: {
                        given_name: subscriptionData.customerName.split(' ')[0],
                        surname: subscriptionData.customerName.split(' ').slice(1).join(' ')
                    },
                    email_address: subscriptionData.customerEmail
                },
                application_context: {
                    brand_name: subscriptionData.brandName || 'AI Social Media Platform',
                    locale: subscriptionData.locale || 'en-US',
                    shipping_preference: 'NO_SHIPPING',
                    user_action: 'SUBSCRIBE_NOW',
                    payment_method: {
                        payer_selected: 'PAYPAL',
                        payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
                    },
                    return_url: subscriptionData.returnUrl || `${process.env.FRONTEND_URL}/subscription/success`,
                    cancel_url: subscriptionData.cancelUrl || `${process.env.FRONTEND_URL}/subscription/cancel`
                },
                custom_id: subscriptionData.customId || subscriptionData.userId
            });

            const response = await this.client.execute(request);
            
            return {
                success: true,
                subscriptionId: response.result.id,
                status: response.result.status,
                links: response.result.links,
                subscriptionData: response.result
            };
        } catch (error) {
            logger.error('PayPal createSubscription error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create PayPal subscription'
            };
        }
    }

    /**
     * Get subscription details
     */
    async getSubscription(subscriptionId, clientId, clientSecret) {
        try {
            if (!this.client) {
                this.initialize(clientId, clientSecret);
            }

            const request = new paypal.subscriptions.SubscriptionsGetRequest(subscriptionId);
            const response = await this.client.execute(request);
            
            return {
                success: true,
                subscriptionData: response.result
            };
        } catch (error) {
            logger.error('PayPal getSubscription error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get PayPal subscription'
            };
        }
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(subscriptionId, reason, clientId, clientSecret) {
        try {
            if (!this.client) {
                this.initialize(clientId, clientSecret);
            }

            const request = new paypal.subscriptions.SubscriptionsCancelRequest(subscriptionId);
            request.requestBody({
                reason: reason || 'User requested cancellation'
            });

            const response = await this.client.execute(request);
            
            return {
                success: true,
                message: 'Subscription cancelled successfully'
            };
        } catch (error) {
            logger.error('PayPal cancelSubscription error:', error);
            return {
                success: false,
                error: error.message || 'Failed to cancel PayPal subscription'
            };
        }
    }

    /**
     * Create a refund
     */
    async createRefund(captureId, refundData, clientId, clientSecret) {
        try {
            if (!this.client) {
                this.initialize(clientId, clientSecret);
            }

            const request = new paypal.payments.CapturesRefundRequest(captureId);
            request.requestBody({
                amount: {
                    value: refundData.amount.toString(),
                    currency_code: refundData.currency || 'USD'
                },
                note_to_payer: refundData.note || 'Refund for subscription cancellation'
            });

            const response = await this.client.execute(request);
            
            return {
                success: true,
                refundId: response.result.id,
                status: response.result.status,
                refundData: response.result
            };
        } catch (error) {
            logger.error('PayPal createRefund error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create PayPal refund'
            };
        }
    }

    /**
     * Verify webhook signature
     */
    verifyWebhook(headers, body, webhookSecret) {
        try {
            const signature = headers['paypal-transmission-sig'];
            const certId = headers['paypal-cert-id'];
            const transmissionId = headers['paypal-transmission-id'];
            const timestamp = headers['paypal-transmission-time'];
            
            // In a real implementation, you would verify the webhook signature
            // using PayPal's webhook verification process
            logger.info('PayPal webhook verification (simplified)');
            
            return {
                success: true,
                verified: true
            };
        } catch (error) {
            logger.error('PayPal webhook verification error:', error);
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
    async processWebhook(event, headers, body) {
        try {
            const verification = this.verifyWebhook(headers, body, this.webhookSecret);
            
            if (!verification.verified) {
                return {
                    success: false,
                    error: 'Webhook verification failed'
                };
            }

            const eventType = event.event_type;
            const resource = event.resource;

            logger.info(`Processing PayPal webhook: ${eventType}`);

            switch (eventType) {
                case 'PAYMENT.CAPTURE.COMPLETED':
                    return await this.handlePaymentCompleted(resource);
                case 'PAYMENT.CAPTURE.DENIED':
                    return await this.handlePaymentDenied(resource);
                case 'BILLING.SUBSCRIPTION.ACTIVATED':
                    return await this.handleSubscriptionActivated(resource);
                case 'BILLING.SUBSCRIPTION.CANCELLED':
                    return await this.handleSubscriptionCancelled(resource);
                case 'BILLING.SUBSCRIPTION.SUSPENDED':
                    return await this.handleSubscriptionSuspended(resource);
                default:
                    logger.info(`Unhandled PayPal webhook event: ${eventType}`);
                    return { success: true, message: 'Event logged but not processed' };
            }
        } catch (error) {
            logger.error('PayPal webhook processing error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async handlePaymentCompleted(resource) {
        // Handle payment completion
        logger.info('PayPal payment completed:', resource.id);
        return { success: true, message: 'Payment completed' };
    }

    async handlePaymentDenied(resource) {
        // Handle payment denial
        logger.info('PayPal payment denied:', resource.id);
        return { success: true, message: 'Payment denied' };
    }

    async handleSubscriptionActivated(resource) {
        // Handle subscription activation
        logger.info('PayPal subscription activated:', resource.id);
        return { success: true, message: 'Subscription activated' };
    }

    async handleSubscriptionCancelled(resource) {
        // Handle subscription cancellation
        logger.info('PayPal subscription cancelled:', resource.id);
        return { success: true, message: 'Subscription cancelled' };
    }

    async handleSubscriptionSuspended(resource) {
        // Handle subscription suspension
        logger.info('PayPal subscription suspended:', resource.id);
        return { success: true, message: 'Subscription suspended' };
    }

    /**
     * Format customer data for display
     */
    formatCustomerData(customer) {
        return {
            id: customer.id,
            email: customer.email_address,
            name: customer.name ? `${customer.name.given_name} ${customer.name.surname}` : 'N/A',
            payerId: customer.payer_id,
            address: customer.address || null
        };
    }
}

module.exports = new PayPalIntegration();

