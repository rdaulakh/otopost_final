const express = require('express');
const router = express.Router();
const { 
  generateContent, 
  generateStrategy, 
  analyzePerformance, 
  getAgentsStatus, 
  getWorkflowHistory,
  getWorkflowStatus,
  getUserStats,
  cancelWorkflow
} = require('../controllers/contentController');
const { protect } = require('../middleware/authMiddleware');
const { 
  validateAIRequest, 
  aiRateLimit 
} = require('../middleware/aiAgentErrorHandler');

// Content generation endpoints with rate limiting and validation
router.post('/generate', 
  protect, 
  aiRateLimit(5, 300000), // 5 requests per 5 minutes
  validateAIRequest([]), 
  generateContent
);

router.post('/strategy', 
  protect, 
  aiRateLimit(3, 600000), // 3 requests per 10 minutes
  validateAIRequest([]), 
  generateStrategy
);

router.post('/analyze', 
  protect, 
  aiRateLimit(10, 300000), // 10 requests per 5 minutes
  validateAIRequest(['performanceData']), 
  analyzePerformance
);

// AI agents management endpoints (no rate limiting for status checks)
router.get('/agents/status', protect, getAgentsStatus);
router.get('/workflows/history', protect, getWorkflowHistory);
router.get('/workflows/:workflowId/status', protect, getWorkflowStatus);
router.get('/user/stats', protect, getUserStats);
router.post('/workflows/:workflowId/cancel', protect, cancelWorkflow);

module.exports = router;
