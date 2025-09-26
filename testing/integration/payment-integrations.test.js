const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../backend-api/server');
const User = require('../../backend-api/src/models/User');
const Organization = require('../../backend-api/src/models/Organization');
const Subscription = require('../../backend-api/src/models/Subscription');
const { logger } = require('../../backend-api/src/utils/logger');

describe('Payment Integrations Integration Tests', () => {
  let authToken;
  let testUser;
  let testOrganization;
  let testSubscription;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test_ai_social_platform');
    
    // Create test organization
    testOrganization = new Organization({
      name: 'Test Payment Organization',
      description: 'Test organization for payment testing',
      industry: 'Technology',
      contactEmail: 'test@payment-org.com'
    });
    await testOrganization.save();

    // Create test user
    testUser = new User({
      username: 'testpaymentuser',
      email: 'testpayment@example.com',
      password: 'TestPassword123!',
      organization: testOrganization._id,
      role: 'admin',
      isActive: true
    });
    await testUser.save();

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testpayment@example.com',
        password: 'TestPassword123!'
      });
    
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: 'testpayment@example.com' });
    await Organization.deleteMany({ name: 'Test Payment Organization' });
    await Subscription.deleteMany({ organization: testOrganization._id });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create test subscription
    testSubscription = new Subscription({
      organization: testOrganization._id,
      planName: 'Test Plan',
      amount: 29.99,
      currency: 'USD',
      status: 'active',
      provider: 'stripe',
      providerSubscriptionId: 'sub_test123',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });
    await testSubscription.save();
  });

  afterEach(async () => {
    // Clean up test subscription
    await Subscription.deleteMany({ organization: testOrganization._id });
  });

  describe('Stripe Integration', () => {
    test('should create Stripe customer', async () => {
      const customerData = {
        email: 'test@stripe.com',
        name: 'Test Stripe Customer',
        description: 'Test customer for Stripe integration'
      };

      const response = await request(app)
        .post('/api/payments/stripe/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.customerId).toBeDefined();
      expect(response.body.data.email).toBe(customerData.email);
    });

    test('should create Stripe subscription', async () => {
      const subscriptionData = {
        customerId: 'cus_test123',
        priceId: 'price_test123',
        planName: 'Pro Plan',
        quantity: 1
      };

      const response = await request(app)
        .post('/api/payments/stripe/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(subscriptionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.subscriptionId).toBeDefined();
      expect(response.body.data.status).toBeDefined();
    });

    test('should get Stripe subscription details', async () => {
      const subscriptionId = 'sub_test123';

      const response = await request(app)
        .get(`/api/payments/stripe/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.subscriptionId).toBe(subscriptionId);
    });

    test('should cancel Stripe subscription', async () => {
      const subscriptionId = 'sub_test123';

      const response = await request(app)
        .post(`/api/payments/stripe/subscriptions/${subscriptionId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('cancelled');
    });

    test('should create Stripe refund', async () => {
      const refundData = {
        paymentIntentId: 'pi_test123',
        amount: 29.99,
        reason: 'requested_by_customer'
      };

      const response = await request(app)
        .post('/api/payments/stripe/refunds')
        .set('Authorization', `Bearer ${authToken}`)
        .send(refundData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.refundId).toBeDefined();
    });
  });

  describe('PayPal Integration', () => {
    test('should create PayPal order', async () => {
      const orderData = {
        amount: 29.99,
        currency: 'USD',
        description: 'Test PayPal order',
        returnUrl: 'http://localhost:3000/payment/success',
        cancelUrl: 'http://localhost:3000/payment/cancel'
      };

      const response = await request(app)
        .post('/api/payments/paypal/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderId).toBeDefined();
      expect(response.body.data.status).toBeDefined();
    });

    test('should capture PayPal order', async () => {
      const orderId = 'order_test123';

      const response = await request(app)
        .post(`/api/payments/paypal/orders/${orderId}/capture`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.captureId).toBeDefined();
    });

    test('should create PayPal subscription', async () => {
      const subscriptionData = {
        planId: 'plan_test123',
        customerName: 'Test PayPal Customer',
        customerEmail: 'test@paypal.com'
      };

      const response = await request(app)
        .post('/api/payments/paypal/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(subscriptionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.subscriptionId).toBeDefined();
    });

    test('should cancel PayPal subscription', async () => {
      const subscriptionId = 'sub_paypal_test123';

      const response = await request(app)
        .post(`/api/payments/paypal/subscriptions/${subscriptionId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'User requested cancellation' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('cancelled');
    });
  });

  describe('Razorpay Integration', () => {
    test('should create Razorpay order', async () => {
      const orderData = {
        amount: 2999, // Amount in paise
        currency: 'INR',
        receipt: 'order_test123',
        notes: {
          userId: testUser._id.toString(),
          planName: 'Pro Plan'
        }
      };

      const response = await request(app)
        .post('/api/payments/razorpay/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderId).toBeDefined();
      expect(response.body.data.amount).toBe(orderData.amount);
    });

    test('should verify Razorpay payment', async () => {
      const paymentData = {
        razorpay_order_id: 'order_test123',
        razorpay_payment_id: 'pay_test123',
        razorpay_signature: 'signature_test123'
      };

      const response = await request(app)
        .post('/api/payments/razorpay/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.verified).toBeDefined();
    });

    test('should create Razorpay subscription', async () => {
      const subscriptionData = {
        planId: 'plan_razorpay_test123',
        customerId: 'cust_test123',
        quantity: 1,
        totalCount: 12
      };

      const response = await request(app)
        .post('/api/payments/razorpay/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(subscriptionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.subscriptionId).toBeDefined();
    });

    test('should create Razorpay refund', async () => {
      const refundData = {
        paymentId: 'pay_test123',
        amount: 29.99,
        reason: 'User requested refund'
      };

      const response = await request(app)
        .post('/api/payments/razorpay/refunds')
        .set('Authorization', `Bearer ${authToken}`)
        .send(refundData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.refundId).toBeDefined();
    });
  });

  describe('Square Integration', () => {
    test('should create Square payment', async () => {
      const paymentData = {
        sourceId: 'source_test123',
        amount: 29.99,
        currency: 'USD',
        customerEmail: 'test@square.com',
        idempotencyKey: 'test_key_123'
      };

      const response = await request(app)
        .post('/api/payments/square/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paymentId).toBeDefined();
    });

    test('should create Square customer', async () => {
      const customerData = {
        givenName: 'Test',
        familyName: 'Customer',
        emailAddress: 'test@square.com',
        phoneNumber: '+1234567890'
      };

      const response = await request(app)
        .post('/api/payments/square/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.customerId).toBeDefined();
    });

    test('should create Square subscription', async () => {
      const subscriptionData = {
        locationId: 'loc_test123',
        planId: 'plan_square_test123',
        customerId: 'cust_test123',
        cardId: 'card_test123'
      };

      const response = await request(app)
        .post('/api/payments/square/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(subscriptionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.subscriptionId).toBeDefined();
    });

    test('should create Square refund', async () => {
      const refundData = {
        paymentId: 'pay_square_test123',
        amount: 29.99,
        currency: 'USD',
        reason: 'User requested refund'
      };

      const response = await request(app)
        .post('/api/payments/square/refunds')
        .set('Authorization', `Bearer ${authToken}`)
        .send(refundData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.refundId).toBeDefined();
    });
  });

  describe('Payment Webhooks', () => {
    test('should handle Stripe webhook', async () => {
      const webhookData = {
        id: 'evt_test123',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test123',
            amount: 2999,
            currency: 'usd',
            status: 'succeeded'
          }
        }
      };

      const response = await request(app)
        .post('/api/payments/stripe/webhook')
        .set('stripe-signature', 'test_signature')
        .send(webhookData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should handle PayPal webhook', async () => {
      const webhookData = {
        id: 'evt_paypal_test123',
        event_type: 'PAYMENT.CAPTURE.COMPLETED',
        resource: {
          id: 'capture_test123',
          amount: {
            value: '29.99',
            currency_code: 'USD'
          }
        }
      };

      const response = await request(app)
        .post('/api/payments/paypal/webhook')
        .set('paypal-transmission-sig', 'test_signature')
        .send(webhookData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should handle Razorpay webhook', async () => {
      const webhookData = {
        event: 'payment.captured',
        contained: [{
          id: 'pay_razorpay_test123',
          amount: 2999,
          currency: 'INR',
          status: 'captured'
        }]
      };

      const response = await request(app)
        .post('/api/payments/razorpay/webhook')
        .set('x-razorpay-signature', 'test_signature')
        .send(webhookData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should handle Square webhook', async () => {
      const webhookData = {
        type: 'payment.updated',
        data: {
          object: {
            payment: {
              id: 'pay_square_test123',
              amount_money: {
                amount: 2999,
                currency: 'USD'
              },
              status: 'COMPLETED'
            }
          }
        }
      };

      const response = await request(app)
        .post('/api/payments/square/webhook')
        .set('x-square-signature', 'test_signature')
        .send(webhookData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Payment Analytics', () => {
    test('should get payment analytics', async () => {
      const response = await request(app)
        .get('/api/payments/analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalRevenue).toBeDefined();
      expect(response.body.data.paymentMethods).toBeDefined();
      expect(response.body.data.revenueByMonth).toBeDefined();
    });

    test('should get subscription analytics', async () => {
      const response = await request(app)
        .get('/api/payments/subscriptions/analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalSubscriptions).toBeDefined();
      expect(response.body.data.activeSubscriptions).toBeDefined();
      expect(response.body.data.churnRate).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should return 400 for invalid payment data', async () => {
      const invalidData = {
        amount: -10, // Invalid: negative amount
        currency: 'INVALID' // Invalid: unsupported currency
      };

      const response = await request(app)
        .post('/api/payments/stripe/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should return 401 for unauthorized payment access', async () => {
      const response = await request(app)
        .get('/api/payments/analytics')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
    });

    test('should return 404 for non-existent payment', async () => {
      const fakeId = 'pay_fake123';
      const response = await request(app)
        .get(`/api/payments/stripe/payments/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });
});

