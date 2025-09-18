const Plan = require('../models/Plan');
const logger = require('../utils/logger');

console.log('Plan model loaded:', Plan ? 'Yes' : 'No');

const plansController = {
  // Test endpoint
  testPlans: async (req, res) => {
    res.json({ message: 'Plans controller is working' });
  },

  // Get all plans
  getAllPlans: async (req, res) => {
    console.log('getAllPlans called');
    try {
      const { category, isActive } = req.query;
      
      const query = {};
      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      } else {
        // Default to active plans only
        query.isActive = true;
      }
      if (category) {
        query.category = category;
      }
      
      console.log('Query:', query);
      const plans = await Plan.find(query).sort({ sortOrder: 1, createdAt: 1 });
      console.log('Found plans:', plans.length);
      
      logger.info(`Retrieved ${plans.length} plans`);
      
      res.json({
        success: true,
        message: 'Plans retrieved successfully',
        data: { plans }
      });
    } catch (error) {
      console.error('Error in getAllPlans:', error);
      logger.error('Error getting plans:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get plans',
        error: error.message
      });
    }
  },

  // Get plan by ID
  getPlanById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const plan = await Plan.findOne({ 
        $or: [
          { _id: id },
          { planId: id }
        ]
      });
      
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Plan retrieved successfully',
        data: { plan }
      });
    } catch (error) {
      logger.error('Error getting plan:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get plan',
        error: error.message
      });
    }
  },

  // Create new plan
  createPlan: async (req, res) => {
    try {
      const planData = req.body;
      
      // Check if plan with same planId already exists
      const existingPlan = await Plan.findOne({ planId: planData.planId });
      if (existingPlan) {
        return res.status(400).json({
          success: false,
          message: 'Plan with this ID already exists'
        });
      }
      
      const plan = new Plan(planData);
      await plan.save();
      
      logger.info(`Plan created: ${plan.name} (${plan.planId})`);
      
      res.status(201).json({
        success: true,
        message: 'Plan created successfully',
        data: { plan }
      });
    } catch (error) {
      logger.error('Error creating plan:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create plan',
        error: error.message
      });
    }
  },

  // Update plan
  updatePlan: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const plan = await Plan.findOneAndUpdate(
        { 
          $or: [
            { _id: id },
            { planId: id }
          ]
        },
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found'
        });
      }
      
      logger.info(`Plan updated: ${plan.name} (${plan.planId})`);
      
      res.json({
        success: true,
        message: 'Plan updated successfully',
        data: { plan }
      });
    } catch (error) {
      logger.error('Error updating plan:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update plan',
        error: error.message
      });
    }
  },

  // Delete plan
  deletePlan: async (req, res) => {
    try {
      const { id } = req.params;
      
      const plan = await Plan.findOneAndDelete({
        $or: [
          { _id: id },
          { planId: id }
        ]
      });
      
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found'
        });
      }
      
      logger.info(`Plan deleted: ${plan.name} (${plan.planId})`);
      
      res.json({
        success: true,
        message: 'Plan deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting plan:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete plan',
        error: error.message
      });
    }
  },

  // Toggle plan status
  togglePlanStatus: async (req, res) => {
    try {
      const { id } = req.params;
      
      const plan = await Plan.findOne({
        $or: [
          { _id: id },
          { planId: id }
        ]
      });
      
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found'
        });
      }
      
      plan.isActive = !plan.isActive;
      await plan.save();
      
      logger.info(`Plan status toggled: ${plan.name} (${plan.planId}) - ${plan.isActive ? 'Active' : 'Inactive'}`);
      
      res.json({
        success: true,
        message: `Plan ${plan.isActive ? 'activated' : 'deactivated'} successfully`,
        data: { plan }
      });
    } catch (error) {
      logger.error('Error toggling plan status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle plan status',
        error: error.message
      });
    }
  }
};

module.exports = plansController;
