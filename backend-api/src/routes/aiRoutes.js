const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const UserClaude = require('../models/UserClaude');
const PostClaude = require('../models/PostClaude');
const router = express.Router();

// Middleware to authenticate requests
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await UserClaude.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Generate content using OpenAI
router.post('/generate-content', authenticate, async (req, res) => {
  try {
    const { prompt, platform = 'general', tone = 'professional', length = 'medium' } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    // Check AI credits
    if (req.user.stats.aiCreditsUsed >= req.user.subscription.features.aiCredits) {
      return res.status(403).json({
        success: false,
        error: 'AI credits limit reached. Please upgrade your plan.'
      });
    }

    // Platform-specific guidelines
    const platformGuidelines = {
      facebook: 'Create engaging Facebook post with emojis, keep it conversational and shareable.',
      instagram: 'Create Instagram post with relevant hashtags, visual appeal, and engaging caption.',
      twitter: 'Create Twitter post under 280 characters, use hashtags and mentions effectively.',
      linkedin: 'Create professional LinkedIn post, focus on industry insights and professional tone.',
      general: 'Create engaging social media content suitable for multiple platforms.'
    };

    // Tone guidelines
    const toneGuidelines = {
      professional: 'Use professional, authoritative tone',
      casual: 'Use casual, friendly, conversational tone',
      humorous: 'Use light humor and wit',
      inspirational: 'Use motivational and uplifting language'
    };

    // Length guidelines
    const lengthGuidelines = {
      short: 'Keep it concise, under 100 words',
      medium: 'Medium length, 100-200 words',
      long: 'Detailed content, 200-400 words'
    };

    const systemPrompt = `You are an expert social media content creator. Create engaging social media content based on the following guidelines:
    
Platform: ${platform}
${platformGuidelines[platform] || platformGuidelines.general}

Tone: ${tone}
${toneGuidelines[tone] || toneGuidelines.professional}

Length: ${length}
${lengthGuidelines[length] || lengthGuidelines.medium}

Make the content engaging, relevant, and optimized for social media engagement.`;

    // Call OpenAI API
    const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const generatedContent = openaiResponse.data.choices[0].message.content;

    // Update user's AI credits usage
    req.user.stats.aiCreditsUsed += 1;
    await req.user.save();

    // Extract hashtags and mentions from generated content
    const hashtags = generatedContent.match(/#\w+/g) || [];
    const mentions = generatedContent.match(/@\w+/g) || [];

    res.json({
      success: true,
      data: {
        content: generatedContent,
        metadata: {
          platform,
          tone,
          length,
          hashtags,
          mentions,
          prompt,
          creditsUsed: req.user.stats.aiCreditsUsed,
          creditsRemaining: req.user.subscription.features.aiCredits - req.user.stats.aiCreditsUsed
        }
      }
    });

  } catch (error) {
    console.error('AI generation error:', error);
    
    if (error.response?.status === 401) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key is invalid or missing'
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'OpenAI API rate limit exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to generate content'
    });
  }
});

// Generate hashtags for content
router.post('/generate-hashtags', authenticate, async (req, res) => {
  try {
    const { content, platform = 'general', count = 10 } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      });
    }

    const prompt = `Generate ${count} relevant hashtags for this ${platform} post: "${content}". Return only the hashtags, one per line, without explanations.`;

    const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.5
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const hashtagsText = openaiResponse.data.choices[0].message.content;
    const hashtags = hashtagsText
      .split('\n')
      .map(tag => tag.trim())
      .filter(tag => tag.startsWith('#'))
      .slice(0, count);

    res.json({
      success: true,
      data: {
        hashtags,
        platform,
        originalContent: content
      }
    });

  } catch (error) {
    console.error('Hashtag generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate hashtags'
    });
  }
});

// Improve existing content
router.post('/improve-content', authenticate, async (req, res) => {
  try {
    const { content, improvements = ['engagement', 'clarity'] } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      });
    }

    const improvementPrompts = {
      engagement: 'Make it more engaging and likely to get likes, comments, and shares',
      clarity: 'Make it clearer and easier to understand',
      professional: 'Make it more professional and polished',
      casual: 'Make it more casual and conversational',
      shorter: 'Make it more concise while keeping the key message',
      longer: 'Expand it with more details and context'
    };

    const selectedImprovements = improvements
      .map(imp => improvementPrompts[imp])
      .filter(Boolean)
      .join(', ');

    const prompt = `Improve this social media content by making it: ${selectedImprovements}. 

Original content: "${content}"

Return only the improved version without explanations.`;

    const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 400,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const improvedContent = openaiResponse.data.choices[0].message.content;

    res.json({
      success: true,
      data: {
        originalContent: content,
        improvedContent,
        improvements
      }
    });

  } catch (error) {
    console.error('Content improvement error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to improve content'
    });
  }
});

// Get AI usage statistics
router.get('/usage-stats', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      data: {
        creditsUsed: user.stats.aiCreditsUsed,
        creditsLimit: user.subscription.features.aiCredits,
        creditsRemaining: user.subscription.features.aiCredits - user.stats.aiCreditsUsed,
        subscriptionPlan: user.subscription.plan,
        usagePercentage: Math.round((user.stats.aiCreditsUsed / user.subscription.features.aiCredits) * 100)
      }
    });

  } catch (error) {
    console.error('Usage stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get usage statistics'
    });
  }
});

module.exports = router;
