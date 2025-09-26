const express = require('express');
const router = express.Router();

// Placeholder post routes
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Post routes endpoint - to be implemented'
    }
  });
});

module.exports = router;
