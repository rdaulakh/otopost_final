const asyncHandler = require('express-async-handler');
const Business = require('../models/businessModel');
const enhancedOrchestrator = require('../services/enhancedOrchestrator');

const generateContent = asyncHandler(async (req, res) => {
  const businessProfile = await Business.findOne({ userId: req.user.id });

  if (!businessProfile) {
    res.status(404);
    throw new Error('Business profile not found. Please create one first.');
  }

  try {
    const result = await enhancedOrchestrator.startContentGenerationWorkflow(
      req.user.id, 
      businessProfile._id, 
      req.body.options || {}
    );
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Content generation workflow started successfully'
    });
  } catch (error) {
    console.error('Error during content generation controller:', error);
    res.status(500);
    throw new Error(`AI content generation failed: ${error.message}`);
  }
});

const generateStrategy = asyncHandler(async (req, res) => {
  const businessProfile = await Business.findOne({ userId: req.user.id });

  if (!businessProfile) {
    res.status(404);
    throw new Error('Business profile not found. Please create one first.');
  }

  try {
    const result = await enhancedOrchestrator.startStrategyGenerationWorkflow(
      req.user.id, 
      businessProfile._id, 
      req.body.options || {}
    );
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Strategy generation workflow started successfully'
    });
  } catch (error) {
    console.error('Error during strategy generation controller:', error);
    res.status(500);
    throw new Error(`AI strategy generation failed: ${error.message}`);
  }
});

const analyzePerformance = asyncHandler(async (req, res) => {
  const { performanceData } = req.body;
  const businessProfile = await Business.findOne({ userId: req.user.id });

  if (!businessProfile) {
    res.status(404);
    throw new Error('Business profile not found. Please create one first.');
  }

  if (!performanceData) {
    res.status(400);
    throw new Error('Performance data is required for analysis.');
  }

  try {
    const result = await enhancedOrchestrator.startPerformanceAnalysisWorkflow(
      req.user.id, 
      businessProfile._id, 
      performanceData, 
      req.body.options || {}
    );
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Performance analysis workflow started successfully'
    });
  } catch (error) {
    console.error('Error during performance analysis controller:', error);
    res.status(500);
    throw new Error(`AI performance analysis failed: ${error.message}`);
  }
});

const getAgentsStatus = asyncHandler(async (req, res) => {
  try {
    const status = enhancedOrchestrator.getAgentsStatus();
    res.status(200).json({
      success: true,
      data: status,
      message: 'AI agents status retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting agents status:', error);
    res.status(500);
    throw new Error('Failed to retrieve AI agents status');
  }
});

const getWorkflowHistory = asyncHandler(async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = await enhancedOrchestrator.getUserWorkflowHistory(req.user.id, limit);
    res.status(200).json({
      success: true,
      data: history,
      message: 'Workflow history retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting workflow history:', error);
    res.status(500);
    throw new Error('Failed to retrieve workflow history');
  }
});

const getWorkflowStatus = asyncHandler(async (req, res) => {
  try {
    const { workflowId } = req.params;
    const status = await enhancedOrchestrator.getWorkflowStatus(workflowId);
    res.status(200).json({
      success: true,
      data: status,
      message: 'Workflow status retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting workflow status:', error);
    res.status(500);
    throw new Error('Failed to retrieve workflow status');
  }
});

const getUserStats = asyncHandler(async (req, res) => {
  try {
    const stats = await enhancedOrchestrator.getUserWorkflowStats(req.user.id);
    res.status(200).json({
      success: true,
      data: stats,
      message: 'User workflow statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500);
    throw new Error('Failed to retrieve user statistics');
  }
});

const cancelWorkflow = asyncHandler(async (req, res) => {
  try {
    const { workflowId } = req.params;
    const result = await enhancedOrchestrator.cancelWorkflow(workflowId);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Workflow cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling workflow:', error);
    res.status(500);
    throw new Error('Failed to cancel workflow');
  }
});

module.exports = {
  generateContent,
  generateStrategy,
  analyzePerformance,
  getAgentsStatus,
  getWorkflowHistory,
  getWorkflowStatus,
  getUserStats,
  cancelWorkflow,
};
