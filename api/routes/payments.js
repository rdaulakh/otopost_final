const express = require('express');
const { auth } = require('../middleware/auth');
const stripeService = require('../services/stripeService');
const { paymentLimiter } = require('../middleware/rateLimiter');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Apply payment-specific rate limiting
router.use(paymentLimiter);

// @route   GET /api/payments/plans
// @desc    Get all available subscription plans
// @access  Public
router.get('/plans', async (req, res) => {
  try {
    const plans = stripeService.getPlans();
    res.json({
      message: 'Plans retrieved successfully',
      plans
    });
  } catch (error) {
    console.error('Error getting plans:', error);
    res.status(500).json({
      message: 'Failed to retrieve plans',
      error: error.message
    });
  }
});

// @route   GET /api/payments/subscription
// @desc    Get current user's subscription details
// @access  Private
router.get('/subscription', auth, async (req, res) => {
  try {
    const subscription = await stripeService.getSubscription(req.user.id);
    res.json({
      message: 'Subscription retrieved successfully',
      subscription
    });
  } catch (error) {
    console.error('Error getting subscription:', error);
    res.status(500).json({
      message: 'Failed to retrieve subscription',
      error: error.message
    });
  }
});

// @route   POST /api/payments/create-subscription
// @desc    Create a new subscription
// @access  Private
router.post('/create-subscription', [
  auth,
  body('planType').isIn(['pro', 'enterprise']).withMessage('Invalid plan type'),
  body('paymentMethodId').notEmpty().withMessage('Payment method is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { planType, paymentMethodId } = req.body;
    
    const result = await stripeService.createSubscription(
      req.user.id,
      planType,
      paymentMethodId
    );

    res.json({
      message: 'Subscription created successfully',
      ...result
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      message: 'Failed to create subscription',
      error: error.message
    });
  }
});

// @route   PUT /api/payments/update-subscription
// @desc    Update existing subscription
// @access  Private
router.put('/update-subscription', [
  auth,
  body('planType').isIn(['pro', 'enterprise']).withMessage('Invalid plan type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { planType } = req.body;
    
    const subscription = await stripeService.updateSubscription(
      req.user.id,
      planType
    );

    res.json({
      message: 'Subscription updated successfully',
      subscription
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      message: 'Failed to update subscription',
      error: error.message
    });
  }
});

// @route   DELETE /api/payments/cancel-subscription
// @desc    Cancel current subscription
// @access  Private
router.delete('/cancel-subscription', auth, async (req, res) => {
  try {
    const subscription = await stripeService.cancelSubscription(req.user.id);
    
    res.json({
      message: 'Subscription canceled successfully',
      subscription
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
});

// @route   POST /api/payments/check-feature-access
// @desc    Check if user can access a specific feature
// @access  Private
router.post('/check-feature-access', [
  auth,
  body('feature').notEmpty().withMessage('Feature is required'),
  body('currentUsage').optional().isNumeric().withMessage('Current usage must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { feature, currentUsage = 0 } = req.body;
    
    const access = await stripeService.checkFeatureAccess(
      req.user.id,
      feature,
      currentUsage
    );

    res.json({
      message: 'Feature access checked',
      access
    });
  } catch (error) {
    console.error('Error checking feature access:', error);
    res.status(500).json({
      message: 'Failed to check feature access',
      error: error.message
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Stripe webhooks
// @access  Public (but verified with Stripe signature)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await stripeService.handleWebhook(event);
    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({
      message: 'Webhook handling failed',
      error: error.message
    });
  }
});

// @route   POST /api/payments/create-setup-intent
// @desc    Create setup intent for saving payment method
// @access  Private
router.post('/create-setup-intent', auth, async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const User = require('../models/User');
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let customerId = user.stripeCustomerId;
    
    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripeService.createCustomer(user);
      customerId = customer.id;
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });

    res.json({
      message: 'Setup intent created',
      clientSecret: setupIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating setup intent:', error);
    res.status(500).json({
      message: 'Failed to create setup intent',
      error: error.message
    });
  }
});

// @route   GET /api/payments/payment-methods
// @desc    Get user's saved payment methods
// @access  Private
router.get('/payment-methods', auth, async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const User = require('../models/User');
    
    const user = await User.findById(req.user.id);
    if (!user || !user.stripeCustomerId) {
      return res.json({
        message: 'No payment methods found',
        paymentMethods: []
      });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    res.json({
      message: 'Payment methods retrieved',
      paymentMethods: paymentMethods.data.map(pm => ({
        id: pm.id,
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year
      }))
    });
  } catch (error) {
    console.error('Error getting payment methods:', error);
    res.status(500).json({
      message: 'Failed to retrieve payment methods',
      error: error.message
    });
  }
});

module.exports = router;
