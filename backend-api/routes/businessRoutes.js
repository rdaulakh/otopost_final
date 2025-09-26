const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Business = require('../models/businessModel');
const { protect } = require('../middleware/authMiddleware');

// @desc    Create business profile
// @route   POST /api/business
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
  const { businessName, industry, targetAudience, businessType, location } = req.body;

  console.log('Business creation request:', {
    userId: req.user.id,
    userIdType: typeof req.user.id,
    body: req.body
  });

  // Check if business already exists for this user
  const existingBusiness = await Business.findOne({ userId: req.user.id });
  if (existingBusiness) {
    res.status(400);
    throw new Error('Business profile already exists. Use PUT to update.');
  }

  const business = await Business.create({
    userId: req.user.id,
    businessName,
    industry,
    targetAudience,
    businessType,
    location
  });

  res.status(201).json({
    success: true,
    message: 'Business profile created successfully',
    data: business
  });
}));

// @desc    Get business profile
// @route   GET /api/business/profile
// @access  Private
router.get('/profile', protect, asyncHandler(async (req, res) => {
  const business = await Business.findOne({ userId: req.user.id });
  
  if (!business) {
    res.status(404);
    throw new Error('Business profile not found');
  }

  res.json({ 
    success: true,
    message: 'Business profile retrieved successfully',
    data: business
  });
}));

// @desc    Update business profile
// @route   PUT /api/business/profile
// @access  Private
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const business = await Business.findOne({ userId: req.user.id });
  
  if (!business) {
    res.status(404);
    throw new Error('Business profile not found');
  }

  const updatedBusiness = await Business.findByIdAndUpdate(
    business._id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({ 
    success: true,
    message: 'Business profile updated successfully',
    data: updatedBusiness
  });
}));

// @desc    Delete business profile
// @route   DELETE /api/business/profile
// @access  Private
router.delete('/profile', protect, asyncHandler(async (req, res) => {
  const business = await Business.findOne({ userId: req.user.id });
  
  if (!business) {
    res.status(404);
    throw new Error('Business profile not found');
  }

  await Business.findByIdAndDelete(business._id);

  res.json({ 
    success: true,
    message: 'Business profile deleted successfully'
  });
}));

module.exports = router;
