const express = require('express');
const aiAgentsController = require('../controllers/aiAgents');
const { authenticateCustomer, requirePermission } = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(authenticateCustomer);

// Get all AI agents
router.get('/', aiAgentsController.getAIAgents);

// Get specific AI agent details
router.get('/:agentId', aiAgentsController.getAgentDetails);

// Restart AI agent
router.post('/:agentId/restart', aiAgentsController.restartAgent);

module.exports = router;
