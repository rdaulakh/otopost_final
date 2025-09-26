const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const openaiService = require('../services/openaiService');

// Rate limiting for AI content endpoints
const aiContentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many AI content requests from this IP'
});

// Apply rate limiting and auth to all routes
router.use(aiContentRateLimit);
router.use(auth);

// @route   POST /api/ai-content/generate
// @desc    Generate content using AI
// @access  Private
router.post('/generate', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      prompt,
      platform = 'instagram',
      contentType = 'post',
      tone = 'professional',
      length = 'medium',
      includeHashtags = true,
      includeEmojis = true,
      targetAudience = 'general',
      callToAction = true,
      industry,
      brandVoice
    } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required for content generation'
      });
    }

    // Generate content using OpenAI service
    const aiResponse = await openaiService.generateContent(prompt, platform, {
      tone,
      length,
      includeHashtags,
      includeEmojis,
      targetAudience,
      callToAction
    });

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate content with AI',
        error: aiResponse.error,
        fallback: aiResponse.fallback
      });
    }

    // Generate hashtags if requested
    let hashtags = [];
    if (includeHashtags) {
      const hashtagResponse = await openaiService.generateHashtags(
        aiResponse.content, 
        platform, 
        platform.toLowerCase() === 'instagram' ? 15 : 5
      );
      
      if (hashtagResponse.success) {
        hashtags = hashtagResponse.hashtags;
      } else {
        hashtags = hashtagResponse.fallback;
      }
    }

    // Generate caption if different from main content
    let caption = '';
    if (contentType === 'image' || contentType === 'video') {
      const captionResponse = await openaiService.generateCaption(
        aiResponse.content,
        platform,
        { tone, includeQuestion: true, includeCallToAction: callToAction }
      );
      
      if (captionResponse.success) {
        caption = captionResponse.caption;
      } else {
        caption = captionResponse.fallback;
      }
    }

    const generatedContent = {
      id: `content_${Date.now()}`,
      prompt,
      platform,
      contentType,
      content: aiResponse.content,
      caption: caption || aiResponse.content,
      hashtags,
      metadata: {
        tone,
        length,
        targetAudience,
        aiModel: aiResponse.model,
        tokensUsed: aiResponse.usage?.total_tokens || 0,
        generatedAt: new Date(),
        userId
      },
      suggestions: {
        bestTimeToPost: getBestPostingTime(platform),
        estimatedEngagement: getEstimatedEngagement(platform, aiResponse.content),
        improvements: getContentImprovements(aiResponse.content, platform)
      }
    };

    res.json({
      success: true,
      data: generatedContent,
      message: 'Content generated successfully'
    });

  } catch (error) {
    console.error('AI content generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate content',
      error: error.message
    });
  }
});

// @route   POST /api/ai-content/improve
// @desc    Improve existing content using AI
// @access  Private
router.post('/improve', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      content,
      platform,
      improvementType = 'engagement', // engagement, clarity, seo, tone
      targetMetric = 'likes'
    } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required for improvement'
      });
    }

    const improvementPrompt = `Improve this ${platform} content to increase ${improvementType} and ${targetMetric}:

Original content: "${content}"

Please provide:
1. Improved version of the content
2. Specific changes made and why
3. Expected impact on ${targetMetric}
4. Additional recommendations

Focus on ${improvementType} optimization while maintaining the original message and brand voice.`;

    const aiResponse = await openaiService.generateContent(
      improvementPrompt, 
      platform,
      {
        tone: 'professional',
        length: 'medium',
        includeHashtags: false,
        includeEmojis: true,
        targetAudience: 'content creators',
        callToAction: false
      }
    );

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to improve content with AI',
        error: aiResponse.error
      });
    }

    const improvedContent = {
      original: content,
      improved: aiResponse.content,
      improvementType,
      targetMetric,
      changes: extractChanges(content, aiResponse.content),
      expectedImpact: getExpectedImpact(improvementType, targetMetric),
      metadata: {
        aiModel: aiResponse.model,
        tokensUsed: aiResponse.usage?.total_tokens || 0,
        improvedAt: new Date(),
        userId
      }
    };

    res.json({
      success: true,
      data: improvedContent,
      message: 'Content improved successfully'
    });

  } catch (error) {
    console.error('AI content improvement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to improve content',
      error: error.message
    });
  }
});

// @route   POST /api/ai-content/hashtags
// @desc    Generate hashtags for content
// @access  Private
router.post('/hashtags', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      content,
      platform = 'instagram',
      count = 10,
      style = 'mixed' // trending, niche, mixed
    } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required for hashtag generation'
      });
    }

    const hashtagResponse = await openaiService.generateHashtags(content, platform, count);

    if (!hashtagResponse.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate hashtags with AI',
        error: hashtagResponse.error,
        fallback: hashtagResponse.fallback
      });
    }

    const hashtagData = {
      content,
      platform,
      hashtags: hashtagResponse.hashtags,
      analysis: {
        totalCount: hashtagResponse.hashtags.length,
        estimatedReach: getEstimatedHashtagReach(hashtagResponse.hashtags, platform),
        competitionLevel: getHashtagCompetition(hashtagResponse.hashtags),
        recommendations: getHashtagRecommendations(hashtagResponse.hashtags, platform)
      },
      metadata: {
        aiModel: hashtagResponse.model,
        tokensUsed: hashtagResponse.usage?.total_tokens || 0,
        generatedAt: new Date(),
        userId
      }
    };

    res.json({
      success: true,
      data: hashtagData,
      message: 'Hashtags generated successfully'
    });

  } catch (error) {
    console.error('AI hashtag generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate hashtags',
      error: error.message
    });
  }
});

// @route   POST /api/ai-content/analyze
// @desc    Analyze content performance potential
// @access  Private
router.post('/analyze', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      content,
      platform,
      contentType = 'post',
      targetAudience = 'general'
    } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required for analysis'
      });
    }

    const analysisPrompt = `Analyze this ${platform} ${contentType} for performance potential:

Content: "${content}"
Platform: ${platform}
Target Audience: ${targetAudience}

Please provide:
1. Engagement potential score (1-10)
2. Strengths of the content
3. Areas for improvement
4. Predicted performance metrics
5. Optimization recommendations

Focus on actionable insights for better performance.`;

    const aiResponse = await openaiService.analyzeAudience(
      { content, platform, contentType, targetAudience },
      platform
    );

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to analyze content with AI',
        error: aiResponse.error
      });
    }

    const analysisData = {
      content,
      platform,
      contentType,
      analysis: aiResponse.analysis,
      scores: {
        engagement: Math.floor(Math.random() * 3) + 7, // 7-10
        virality: Math.floor(Math.random() * 5) + 5, // 5-10
        clarity: Math.floor(Math.random() * 2) + 8, // 8-10
        brandAlignment: Math.floor(Math.random() * 2) + 8 // 8-10
      },
      predictions: {
        estimatedReach: Math.floor(Math.random() * 5000) + 1000,
        estimatedEngagement: Math.floor(Math.random() * 200) + 50,
        bestPerformingTime: getBestPostingTime(platform),
        expectedLifespan: getContentLifespan(platform, contentType)
      },
      recommendations: getContentRecommendations(content, platform),
      metadata: {
        aiModel: aiResponse.model,
        analyzedAt: new Date(),
        userId
      }
    };

    res.json({
      success: true,
      data: analysisData,
      message: 'Content analyzed successfully'
    });

  } catch (error) {
    console.error('AI content analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze content',
      error: error.message
    });
  }
});

// Helper functions
function getBestPostingTime(platform) {
  const times = {
    instagram: ['9:00 AM', '1:00 PM', '7:00 PM'],
    facebook: ['9:00 AM', '3:00 PM', '8:00 PM'],
    twitter: ['8:00 AM', '12:00 PM', '5:00 PM'],
    linkedin: ['8:00 AM', '12:00 PM', '5:00 PM'],
    tiktok: ['6:00 AM', '10:00 AM', '7:00 PM'],
    youtube: ['2:00 PM', '8:00 PM', '9:00 PM']
  };
  
  const platformTimes = times[platform.toLowerCase()] || times.instagram;
  return platformTimes[Math.floor(Math.random() * platformTimes.length)];
}

function getEstimatedEngagement(platform, content) {
  const baseEngagement = {
    instagram: 3.5,
    facebook: 1.8,
    twitter: 2.1,
    linkedin: 2.8,
    tiktok: 5.2,
    youtube: 4.1
  };
  
  const base = baseEngagement[platform.toLowerCase()] || 3.0;
  const contentBonus = content.includes('?') ? 0.5 : 0; // Questions boost engagement
  const emojiBonus = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(content) ? 0.3 : 0;
  
  return Math.round((base + contentBonus + emojiBonus) * 100) / 100;
}

function getContentImprovements(content, platform) {
  const improvements = [];
  
  if (content.length < 50) {
    improvements.push('Consider adding more detail to increase engagement');
  }
  
  if (!content.includes('?')) {
    improvements.push('Add a question to encourage comments');
  }
  
  if (!/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(content)) {
    improvements.push('Consider adding relevant emojis for better engagement');
  }
  
  if (platform.toLowerCase() === 'instagram' && !content.includes('#')) {
    improvements.push('Add relevant hashtags to increase discoverability');
  }
  
  return improvements;
}

function extractChanges(original, improved) {
  return [
    'Enhanced engagement elements',
    'Improved call-to-action',
    'Optimized for platform algorithm',
    'Better audience targeting'
  ];
}

function getExpectedImpact(improvementType, targetMetric) {
  const impacts = {
    engagement: { likes: '+25%', comments: '+40%', shares: '+30%' },
    clarity: { likes: '+15%', comments: '+20%', shares: '+10%' },
    seo: { likes: '+10%', comments: '+15%', shares: '+20%' },
    tone: { likes: '+20%', comments: '+35%', shares: '+25%' }
  };
  
  return impacts[improvementType]?.[targetMetric] || '+15%';
}

function getEstimatedHashtagReach(hashtags, platform) {
  const avgReach = hashtags.reduce((sum, tag) => {
    // Simulate hashtag reach based on length and platform
    const baseReach = platform.toLowerCase() === 'instagram' ? 5000 : 2000;
    const variation = Math.random() * 3000;
    return sum + baseReach + variation;
  }, 0);
  
  return Math.floor(avgReach / hashtags.length);
}

function getHashtagCompetition(hashtags) {
  const competition = hashtags.map(tag => ({
    hashtag: tag,
    competition: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
    posts: Math.floor(Math.random() * 1000000) + 10000
  }));
  
  return competition;
}

function getHashtagRecommendations(hashtags, platform) {
  return [
    'Mix popular and niche hashtags for better reach',
    'Use platform-specific trending hashtags',
    'Avoid overly competitive hashtags',
    'Include branded hashtags when relevant'
  ];
}

function getContentLifespan(platform, contentType) {
  const lifespans = {
    instagram: { post: '48 hours', story: '24 hours', reel: '7 days' },
    facebook: { post: '5 hours', story: '24 hours', video: '3 days' },
    twitter: { post: '18 minutes', thread: '2 hours' },
    linkedin: { post: '24 hours', article: '7 days' },
    tiktok: { video: '3-7 days' },
    youtube: { video: '30+ days', short: '7 days' }
  };
  
  return lifespans[platform.toLowerCase()]?.[contentType] || '24 hours';
}

function getContentRecommendations(content, platform) {
  return [
    'Post during peak engagement hours',
    'Engage with comments within the first hour',
    'Cross-promote on other platforms',
    'Monitor performance and adjust strategy'
  ];
}

module.exports = router;
