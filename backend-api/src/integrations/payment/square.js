const { Client, Environment } = require('squareup');
const crypto = require('crypto');
const { logger } = require('../../utils/logger');
const { encrypt, decrypt } = require('../../utils/encryption');

class SquareIntegration {
    constructor() {
        this.client = null;
        this.webhookSecret = process.env.SQUARE_WEBHOOK_SECRET;
    }

    /**
     * Initialize Square client with API credentials
     */
    initialize(applicationId, accessToken, environment = 'sandbox') {
        try {
            const decryptedAppId = decrypt(applicationId);
            const decryptedAccessToken = decrypt(accessToken);
            
            this.client = new Client({
                environment: environment === 'production' ? Environment.Production : Environment.Sandbox,
                accessToken: decryptedAccessToken,
                userAgentDetail: 'AI Social Media Platform'
            });
            
            logger.info('Square client initialized successfully');
            return true;
        } catch (error) {
            logger.error('Square initialization error:', error);
            return false;
        }
    }

    /**
     * Create a payment
     */
    async createPayment(paymentData, applicationId, accessToken) {
        try {
            if (!this.client) {
                this.initialize(applicationId, accessToken);
            }

            const { paymentsApi } = this.client;
            
            const requestBody = {
                sourceId: paymentData.sourceId, // Card nonce from Square
                idempotencyKey: paymentData.idempotencyKey || crypto.randomUUID(),
                amountMoney: {
                    amount: Math.round(paymentData.amount * 100), // Convert to cents
                    currency: paymentData.currency || 'USD'
                },
                note: paymentData.note || 'Social Media Platform Subscription',
                buyerEmailAddress: paymentData.customerEmail,
                orderId: paymentData.orderId,
                referenceId: paymentData.referenceId || paymentData.userId
            };

            const response = await paymentsApi.createPayment(requestBody);
            
            if (response.result.payment) {
                return {
                    success: true,
                    paymentId: response.result.payment.id,
                    status: response.result.payment.status,
                    amount: response.result.payment.amountMoney.amount,
                    currency: response.result.payment.amountMoney.currency,
                    paymentData: response.result.payment
                };
            } else {
                return {
                    success: false,
                    error: 'Payment creation failed',
                    errors: response.result.errors
                };
            }
        } catch (error) {
            logger.error('Square createPayment error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create Square payment'
            };
        }
    }

    /**
     * Get payment details
     */
    async getPayment(paymentId, applicationId, accessToken) {
        try {
            if (!this.client) {
                this.initialize(applicationId, accessToken);
            }

            const { paymentsApi } = this.client;
            const response = await paymentsApi.getPayment(paymentId);
            
            return {
                success: true,
                paymentData: response.result.payment
            };
        } catch (error) {
            logger.error('Square getPayment error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get Square payment'
            };
        }
    }

    /**
     * Cancel payment
     */
    async cancelPayment(paymentId, applicationId, accessToken) {
        try {
            if (!this.client) {
                this.initialize(applicationId, accessToken);
            }

            const { paymentsApi } = this.client;
            const response = await paymentsApi.cancelPayment(paymentId);
            
            return {
                success: true,
                paymentId: response.result.payment.id,
                status: response.result.payment.status,
                message: 'Payment cancelled successfully'
            };
        } catch (error) {
            logger.error('Square cancelPayment error:', error);
            return {
                success: false,
                error: error.message || 'Failed to cancel Square payment'
            };
        }
    }

    /**
     * Create a subscription
     */
    async createSubscription(subscriptionData, applicationId, accessToken) {
        try {
            if (!this.client) {
                this.initialize(applicationId, accessToken);
            }

            const { subscriptionsApi } = this.client;
            
            const requestBody = {
                idempotencyKey: subscriptionData.idempotencyKey || crypto.randomUUID(),
                locationId: subscriptionData.locationId,
                planId: subscriptionData.planId,
                customerId: subscriptionData.customerId,
                cardId: subscriptionData.cardId,
                timezone: subscriptionData.timezone || 'UTC',
                source: subscriptionData.source || 'API',
                priceOverrideMoney: subscriptionData.priceOverride ? {
                    amount: Math.round(subscriptionData.priceOverride * 100),
                    currency: subscriptionData.currency || 'USD'
                } : undefined,
                taxPercentage: subscriptionData.taxPercentage || '0',
                startDate: subscriptionData.startDate || new Date().toISOString().split('T')[0],
                canceledDate: subscriptionData.canceledDate,
                noShowFee: subscriptionData.noShowFee || {
                    amount: 0,
                    currency: subscriptionData.currency || 'USD'
                }
            };

            const response = await subscriptionsApi.createSubscription(requestBody);
            
            if (response.result.subscription) {
                return {
                    success: true,
                    subscriptionId: response.result.subscription.id,
                    status: response.result.subscription.status,
                    subscriptionData: response.result.subscription
                };
            } else {
                return {
                    success: false,
                    error: 'Subscription creation failed',
                    errors: response.result.errors
                };
            }
        } catch (error) {
            logger.error('Square createSubscription error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create Square subscription'
            };
        }
    }

    /**
     * Get subscription details
     */
    async getSubscription(subscriptionId, applicationId, accessToken) {
        try {
            if (!this.client) {
                this.initialize(applicationId, accessToken);
            }

            const { subscriptionsApi } = this.client;
            const response = await subscriptionsApi.retrieveSubscription(subscriptionId);
            
            return {
                success: true,
                subscriptionData: response.result.subscription
            };
        } catch (error) {
            logger.error('Square getSubscription error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get Square subscription'
            };
        }
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(subscriptionId, applicationId, accessToken) {
        try {
            if (!this.client) {
                this.initialize(applicationId, accessToken);
            }

            const { subscriptionsApi } = this.client;
            const response = await subscriptionsApi.cancelSubscription(subscriptionId);
            
            return {
                success: true,
                subscriptionId: response.result.subscription.id,
                status: response.result.subscription.status,
                canceledDate: response.result.subscription.canceledDate,
                message: 'Subscription cancelled successfully'
            };
        } catch (error) {
            logger.error('Square cancelSubscription error:', error);
            return {
                success: false,
                error: error.message || 'Failed to cancel Square subscription'
            };
        }
    }

    /**
     * Create a customer
     */
    async createCustomer(customerData, applicationId, accessToken) {
        try {
            if (!this.client) {
                this.initialize(applicationId, accessToken);
            }

            const { customersApi } = this.client;
            
            const requestBody = {
                idempotencyKey: customerData.idempotencyKey || crypto.randomUUID(),
                givenName: customerData.givenName || customerData.firstName,
                familyName: customerData.familyName || customerData.lastName,
                companyName: customerData.companyName,
                nickname: customerData.nickname,
                emailAddress: customerData.emailAddress,
                address: customerData.address ? {
                    addressLine1: customerData.address.addressLine1,
                    addressLine2: customerData.address.addressLine2,
                    locality: customerData.address.locality,
                    sublocality: customerData.address.sublocality,
                    sublocality2: customerData.address.sublocality2,
                    administrativeDistrictLevel1: customerData.address.administrativeDistrictLevel1,
                    administrativeDistrictLevel2: customerData.address.administrativeDistrictLevel2,
                    postalCode: customerData.address.postalCode,
                    country: customerData.address.country || 'US'
                } : undefined,
                phoneNumber: customerData.phoneNumber,
                referenceId: customerData.referenceId || customerData.userId,
                note: customerData.note
            };

            const response = await customersApi.createCustomer(requestBody);
            
            if (response.result.customer) {
                return {
                    success: true,
                    customerId: response.result.customer.id,
                    customerData: response.result.customer
                };
            } else {
                return {
                    success: false,
                    error: 'Customer creation failed',
                    errors: response.result.errors
                };
            }
        } catch (error) {
            logger.error('Square createCustomer error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create Square customer'
            };
        }
    }

    /**
     * Get customer details
     */
    async getCustomer(customerId, applicationId, accessToken) {
        try {
            if (!this.client) {
                this.initialize(applicationId, accessToken);
            }

            const { customersApi } = this.client;
            const response = await customersApi.retrieveCustomer(customerId);
            
            return {
                success: true,
                customerData: response.result.customer
            };
        } catch (error) {
            logger.error('Square getCustomer error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get Square customer'
            };
        }
    }

    /**
     * Create a refund
     */
    async createRefund(paymentId, refundData, applicationId, accessToken) {
        try {
            if (!this.client) {
                this.initialize(applicationId, accessToken);
            }

            const { refundsApi } = this.client;
            
            const requestBody = {
                idempotencyKey: refundData.idempotencyKey || crypto.randomUUID(),
                paymentId: paymentId,
                amountMoney: {
                    amount: Math.round(refundData.amount * 100), // Convert to cents
                    currency: refundData.currency || 'USD'
                },
                reason: refundData.reason || 'User requested refund'
            };

            const response = await refundsApi.refundPayment(requestBody);
            
            if (response.result.refund) {
                return {
                    success: true,
                    refundId: response.result.refund.id,
                    status: response.result.refund.status,
                    amount: response.result.refund.amountMoney.amount,
                    currency: response.result.refund.amountMoney.currency,
                    refundData: response.result.refund
                };
            } else {
                return {
                    success: false,
                    error: 'Refund creation failed',
                    errors: response.result.errors
                };
            }
        } catch (error) {
            logger.error('Square createRefund error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create Square refund'
            };
        }
    }

    /**
     * Get refund details
     */
    async getRefund(refundId, applicationId, accessToken) {
        try {
            if (!this.client) {
                this.initialize(applicationId, accessToken);
            }

            const { refundsApi } = this.client;
            const response = await refundsApi.getPaymentRefund(refundId);
            
            return {
                success: true,
                refundData: response.result.refund
            };
        } catch (error) {
            logger.error('Square getRefund error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get Square refund'
            };
        }
    }

    /**
     * Create a card
     */
    async createCard(customerId, cardData, applicationId, accessToken) {
        try {
            if (!this.client) {
                this.initialize(applicationId, accessToken);
            }

            const { cardsApi } = this.client;
            
            const requestBody = {
                idempotencyKey: cardData.idempotencyKey || crypto.randomUUID(),
                sourceId: cardData.sourceId, // Card nonce from Square
                card: {
                    cardholderName: cardData.cardholderName,
                    billingAddress: cardData.billingAddress ? {
                        addressLine1: cardData.billingAddress.addressLine1,
                        addressLine2: cardData.billingAddress.addressLine2,
                        locality: cardData.billingAddress.locality,
                        administrativeDistrictLevel1: cardData.billingAddress.administrativeDistrictLevel1,
                        postalCode: cardData.billingAddress.postalCode,
                        country: cardData.billingAddress.country || 'US'
                    } : undefined
                }
            };

            const response = await cardsApi.createCard(requestBody);
            
            if (response.result.card) {
                return {
                    success: true,
                    cardId: response.result.card.id,
                    cardData: response.result.card
                };
            } else {
                return {
                    success: false,
                    error: 'Card creation failed',
                    errors: response.result.errors
                };
            }
        } catch (error) {
            logger.error('Square createCard error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create Square card'
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
                .digest('base64');
            
            const isAuthentic = expectedSignature === signature;
            
            return {
                success: isAuthentic,
                verified: isAuthentic,
                error: isAuthentic ? null : 'Invalid webhook signature'
            };
        } catch (error) {
            logger.error('Square webhook verification error:', error);
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

            const eventType = event.type;
            const data = event.data;

            logger.info(`Processing Square webhook: ${eventType}`);

            switch (eventType) {
                case 'payment.updated':
                    return await this.handlePaymentUpdated(data);
                case 'subscription.updated':
                    return await this.handleSubscriptionUpdated(data);
                case 'subscription.deleted':
                    return await this.handleSubscriptionDeleted(data);
                case 'customer.created':
                    return await this.handleCustomerCreated(data);
                case 'customer.updated':
                    return await this.handleCustomerUpdated(data);
                case 'customer.deleted':
                    return await this.handleCustomerDeleted(data);
                case 'refund.updated':
                    return await this.handleRefundUpdated(data);
                default:
                    logger.info(`Unhandled Square webhook event: ${eventType}`);
                    return { success: true, message: 'Event logged but not processed' };
            }
        } catch (error) {
            logger.error('Square webhook processing error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async handlePaymentUpdated(data) {
        logger.info('Square payment updated:', data.object.payment.id);
        return { success: true, message: 'Payment updated' };
    }

    async handleSubscriptionUpdated(data) {
        logger.info('Square subscription updated:', data.object.subscription.id);
        return { success: true, message: 'Subscription updated' };
    }

    async handleSubscriptionDeleted(data) {
        logger.info('Square subscription deleted:', data.object.subscription.id);
        return { success: true, message: 'Subscription deleted' };
    }

    async handleCustomerCreated(data) {
        logger.info('Square customer created:', data.object.customer.id);
        return { success: true, message: 'Customer created' };
    }

    async handleCustomerUpdated(data) {
        logger.info('Square customer updated:', data.object.customer.id);
        return { success: true, message: 'Customer updated' };
    }

    async handleCustomerDeleted(data) {
        logger.info('Square customer deleted:', data.object.customer.id);
        return { success: true, message: 'Customer deleted' };
    }

    async handleRefundUpdated(data) {
        logger.info('Square refund updated:', data.object.refund.id);
        return { success: true, message: 'Refund updated' };
    }

    /**
     * Format customer data for display
     */
    formatCustomerData(customer) {
        return {
            id: customer.id,
            givenName: customer.givenName,
            familyName: customer.familyName,
            companyName: customer.companyName,
            emailAddress: customer.emailAddress,
            phoneNumber: customer.phoneNumber,
            address: customer.address,
            referenceId: customer.referenceId,
            createdAt: customer.createdAt
        };
    }
}

module.exports = new SquareIntegration();

