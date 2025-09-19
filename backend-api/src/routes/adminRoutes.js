const express = require('express');
const router = express.Router();

// Placeholder admin routes
router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Admin dashboard endpoint - to be implemented'
    }
  });
});

module.exports = router;
