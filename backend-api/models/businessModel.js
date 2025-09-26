const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  businessName: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  website: {
    type: String
  },
  targetAudience: {
    type: String
  },
  brandVoice: {
    type: String,
    enum: ['professional', 'casual', 'friendly', 'authoritative', 'playful'],
    default: 'professional'
  },
  socialMediaGoals: [{
    type: String
  }],
  contentPreferences: {
    postTypes: [{
      type: String
    }],
    topics: [{
      type: String
    }]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Business', businessSchema);
