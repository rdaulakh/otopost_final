const express = require('express');
const router = express.Router();
const { saveBatchPosts, approvePost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.post('/save-batch', protect, saveBatchPosts);
router.put('/:id/approve', protect, approvePost);

module.exports = router;
