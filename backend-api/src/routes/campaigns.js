const express = require('express');
const router = express.Router();
const campaignsController = require('../controllers/campaigns');
const { authenticateCustomer } = require('../middleware/auth');

// All routes require customer authentication
router.use(authenticateCustomer);

// Campaign CRUD operations
router.get('/', campaignsController.getCampaigns);
router.get('/stats', campaignsController.getCampaignStats);
router.get('/:campaignId', campaignsController.getCampaign);
router.post('/', campaignsController.createCampaign);
router.put('/:campaignId', campaignsController.updateCampaign);
router.delete('/:campaignId', campaignsController.deleteCampaign);

// Campaign management operations
router.post('/:campaignId/start', campaignsController.startCampaign);
router.post('/:campaignId/pause', campaignsController.pauseCampaign);
router.get('/:campaignId/analytics', campaignsController.getCampaignAnalytics);
router.post('/:campaignId/duplicate', campaignsController.duplicateCampaign);

module.exports = router;
