const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const enhancedOrchestrator = require('../services/enhancedOrchestrator');
const { protect } = require('../middleware/authMiddleware');

// @desc    Test AI content generation without business profile requirement
// @route   POST /api/test/generate
// @access  Private
router.post('/generate', protect, asyncHandler(async (req, res) => {
  try {
    // Create a mock business profile for testing
    const mockBusinessProfile = {
      _id: 'test_business_id',
      userId: req.user.id,
      businessName: 'Test Business',
      industry: 'Technology',
      targetAudience: 'Tech professionals',
      brandVoice: 'professional'
    };

    const result = await enhancedOrchestrator.startContentGenerationWorkflow(
      req.user.id, 
      mockBusinessProfile._id, 
      req.body.options || {}
    );
    
    res.status(200).json({
      success: true,
      message: 'AI content generation completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Test content generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Content Generation Failed',
      message: error.message,
      details: {
        type: 'ai_generation_error',
        recoverable: true,
        suggestedAction: 'Please try again with different parameters'
      }
    });
  }
}));

// @desc    Test all AI agents status
// @route   GET /api/test/agents
// @access  Private
router.get('/agents', protect, asyncHandler(async (req, res) => {
  try {
    const agentsStatus = enhancedOrchestrator.getAgentsStatus();
    
    res.status(200).json({
      success: true,
      message: 'AI agents status retrieved successfully',
      data: agentsStatus
    });
  } catch (error) {
    console.error('Test agents status error:', error);
    res.status(500).json({
      success: false,
      error: 'Agents Status Failed',
      message: error.message
    });
  }
}));

// @desc    Test workflow creation
// @route   POST /api/test/workflow
// @access  Private
router.post('/workflow', protect, asyncHandler(async (req, res) => {
  try {
    const workflowId = `test_${Date.now()}_${req.user.id}`;
    
    // Test workflow creation
    const workflow = {
      workflowId,
      userId: req.user.id,
      business: 'test_business_id',
      type: 'content_generation',
      status: 'pending',
      input: req.body.options || {},
      steps: [],
      summary: {},
      metrics: {}
    };

    res.status(200).json({
      success: true,
      message: 'Test workflow created successfully',
      data: {
        workflowId,
        status: 'created',
        workflow
      }
    });
  } catch (error) {
    console.error('Test workflow creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Workflow Creation Failed',
      message: error.message
    });
  }
}));

module.exports = router;
