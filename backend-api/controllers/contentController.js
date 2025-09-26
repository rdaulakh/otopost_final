const asyncHandler = require('express-async-handler');
const Business = require('../models/businessModel');
const { runContentGenerationWorkflow } = require('../services/agentOrchestrator');

const generateContent = asyncHandler(async (req, res) => {
  const businessProfile = await Business.findOne({ user: req.user.id });

  if (!businessProfile) {
    res.status(404);
    throw new Error('Business profile not found. Please create one first.');
  }

  try {
    const generatedPosts = await runContentGenerationWorkflow(businessProfile);
    res.status(200).json(generatedPosts);
  } catch (error) {
    console.error('Error during content generation controller:', error);
    res.status(500);
    throw new Error('An error occurred during AI content generation.');
  }
});

module.exports = {
  generateContent,
};
