const express = require('express');
const router = express.Router();

// @desc    Get all plans
// @route   GET /api/plans
// @access  Public
router.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Get all plans endpoint',
    data: [
      { id: '1', name: 'Basic', price: 29, features: ['Feature 1', 'Feature 2'] },
      { id: '2', name: 'Pro', price: 59, features: ['Feature 1', 'Feature 2', 'Feature 3'] }
    ]
  });
});

// @desc    Create new plan
// @route   POST /api/plans
// @access  Private (Admin)
router.post('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Plan created successfully',
    data: { id: '3', ...req.body }
  });
});

module.exports = router;
