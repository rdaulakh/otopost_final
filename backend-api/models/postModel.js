const mongoose = require('mongoose');

const postSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    copy: {
      type: String,
      required: [true, 'Please add post copy'],
    },
    hashtags: {
      type: String,
    },
    visualSuggestion: {
        type: String,
    },
    postType: {
        type: String,
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'approved', 'scheduled', 'published'],
        default: 'pending',
    },
    scheduledTime: {
        type: Date,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Post', postSchema);
