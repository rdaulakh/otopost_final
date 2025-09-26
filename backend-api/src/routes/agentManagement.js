const express = require('express');
const router = express.Router();
const agentManagementController = require('../controllers/agentManagement');
const { authenticateCustomer } = require('../middleware/auth');
const { validateAgentConfiguration } = require('../middleware/validation');

// All routes require customer authentication
router.use(authenticateCustomer);

// Get all agents for organization
router.get('/', agentManagementController.getOrganizationAgents);

// Get specific agent details
router.get('/:agentId', agentManagementController.getAgentDetails);

// Provision agents for organization (manual trigger)
router.post('/provision', agentManagementController.provisionAgents);

// Remove all agents for organization
router.delete('/remove-all', agentManagementController.removeAgents);

// Update agent configuration
router.put('/:agentId/configuration', validateAgentConfiguration, agentManagementController.updateAgentConfiguration);

// Toggle agent status (enable/disable)
router.patch('/:agentId/toggle-status', agentManagementController.toggleAgentStatus);

// Get agent performance metrics
router.get('/:agentId/performance', agentManagementController.getAgentPerformance);

module.exports = router;




