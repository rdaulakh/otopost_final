const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const User = require('../models/User');

// @route   POST /api/profile/avatar
// @desc    Upload user avatar
// @access  Private
router.post("/avatar", auth, uploadSingle("avatar"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({ 
        message: 'Avatar uploaded successfully',
        avatar: user.avatar
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/profile/avatar
// @desc    Delete user avatar
// @access  Private
router.delete('/avatar', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.avatar = null;
    await user.save();

    res.json({ message: 'Avatar deleted successfully' });
  } catch (error) {
    console.error('Avatar deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
