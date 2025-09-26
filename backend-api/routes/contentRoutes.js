const express = require('express');
const router = express.Router();
const { generateContent } = require('../controllers/contentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateContent);

module.exports = router;
