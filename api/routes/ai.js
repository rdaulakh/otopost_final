const express = require('express');
const { auth } = require('../middleware/auth');
const openaiService = require('../services/openaiService');
const { aiLimiter } = require('../middleware/rateLimiter');
const { aiValidation } = require('../middleware/validation');
const { auditLogger, AUDIT_EVENTS } = require('../middleware/auditLogger');

const router = express.Router();

// Apply AI-specific rate limiting
router.use(aiLimiter);

// @route   POST /api/ai/generate-content
// @desc    Generate social media content using AI
// @access  Private
router.post('/generate-content', auth, aiValidation.generateContent, async (req, res) => {
  try {
    const { prompt, platform, tone, length, includeHashtags, includeEmojis, targetAudience, callToAction } = req.body;
    
    const options = {
      tone,
      length,
      includeHashtags,
      includeEmojis,
      targetAudience,
      callToAction
    };

    const result = await openaiService.generateContent(prompt, platform, options);

    // Log AI usage
    auditLogger.log(AUDIT_EVENTS.AI_CONTENT_GENERATED, {
      userId: req.user.id,
      platform,
      promptLength: prompt.length,
      success: result.success,
      model: result.model
    }, req);

    if (result.success) {
      res.json({
        message: 'Content generated successfully',
        content: result.content,
        usage: result.usage,
        model: result.model
      });
    } else {
      res.status(500).json({
        message: 'Content generation failed',
        error: result.error,
        fallback: result.fallback
      });
    }
  } catch (error) {
    console.error('AI content generation error:', error);
    res.status(500).json({
      message: 'Error generating content',
      error: error.message
    });
  }
});

// @route   POST /api/ai/generate-hashtags
// @desc    Generate hashtags for content
// @access  Private
router.post('/generate-hashtags', auth, aiValidation.generateHashtags, async (req, res) => {
  try {
    const { content, platform, count = 10 } = req.body;

    const result = await openaiService.generateHashtags(content, platform, count);

    // Log AI usage
    auditLogger.log(AUDIT_EVENTS.AI_HASHTAGS_GENERATED, {
      userId: req.user.id,
      platform,
      contentLength: content.length,
      hashtagCount: count,
      success: result.success
    }, req);

    if (result.success) {
      res.json({
        message: 'Hashtags generated successfully',
        hashtags: result.hashtags,
        usage: result.usage,
        model: result.model
      });
    } else {
      res.status(500).json({
        message: 'Hashtag generation failed',
        error: result.error,
        fallback: result.fallback
      });
    }
  } catch (error) {
    console.error('AI hashtag generation error:', error);
    res.status(500).json({
      message: 'Error generating hashtags',
      error: error.message
    });
  }
});

// @route   POST /api/ai/generate-caption
// @desc    Generate caption for content
// @access  Private
router.post('/generate-caption', auth, async (req, res) => {
  try {
    const { content, platform, tone, includeQuestion, includeCallToAction, maxLength } = req.body;

    const options = {
      tone,
      includeQuestion,
      includeCallToAction,
      maxLength
    };

    const result = await openaiService.generateCaption(content, platform, options);

    if (result.success) {
      res.json({
        message: 'Caption generated successfully',
        caption: result.caption,
        usage: result.usage,
        model: result.model
      });
    } else {
      res.status(500).json({
        message: 'Caption generation failed',
        error: result.error,
        fallback: result.fallback
      });
    }
  } catch (error) {
    console.error('AI caption generation error:', error);
    res.status(500).json({
      message: 'Error generating caption',
      error: error.message
    });
  }
});

// @route   POST /api/ai/analyze-trends
// @desc    Analyze current trends for industry and platform
// @access  Private
router.post('/analyze-trends', auth, async (req, res) => {
  try {
    const { industry, platform, timeframe = '7d' } = req.body;

    const result = await openaiService.analyzeTrends(industry, platform, timeframe);

    // Log AI usage
    auditLogger.log(AUDIT_EVENTS.AI_ANALYSIS_PERFORMED, {
      userId: req.user.id,
      analysisType: 'trends',
      industry,
      platform,
      success: result.success
    }, req);

    if (result.success) {
      res.json({
        message: 'Trend analysis completed',
        analysis: result.analysis,
        usage: result.usage,
        model: result.model
      });
    } else {
      res.status(500).json({
        message: 'Trend analysis failed',
        error: result.error,
        fallback: result.fallback
      });
    }
  } catch (error) {
    console.error('AI trend analysis error:', error);
    res.status(500).json({
      message: 'Error analyzing trends',
      error: error.message
    });
  }
});

// @route   POST /api/ai/analyze-audience
// @desc    Analyze audience data and provide insights
// @access  Private
router.post('/analyze-audience', auth, async (req, res) => {
  try {
    const { audienceData, platform } = req.body;

    const result = await openaiService.analyzeAudience(audienceData, platform);

    // Log AI usage
    auditLogger.log(AUDIT_EVENTS.AI_ANALYSIS_PERFORMED, {
      userId: req.user.id,
      analysisType: 'audience',
      platform,
      success: result.success
    }, req);

    if (result.success) {
      res.json({
        message: 'Audience analysis completed',
        analysis: result.analysis,
        usage: result.usage,
        model: result.model
      });
    } else {
      res.status(500).json({
        message: 'Audience analysis failed',
        error: result.error,
        fallback: result.fallback
      });
    }
  } catch (error) {
    console.error('AI audience analysis error:', error);
    res.status(500).json({
      message: 'Error analyzing audience',
      error: error.message
    });
  }
});

// @route   POST /api/ai/analyze-competitors
// @desc    Analyze competitor data and strategies
// @access  Private
router.post('/analyze-competitors', auth, async (req, res) => {
  try {
    const { competitorData, industry } = req.body;

    const result = await openaiService.analyzeCompetitors(competitorData, industry);

    // Log AI usage
    auditLogger.log(AUDIT_EVENTS.AI_ANALYSIS_PERFORMED, {
      userId: req.user.id,
      analysisType: 'competitors',
      industry,
      success: result.success
    }, req);

    if (result.success) {
      res.json({
        message: 'Competitor analysis completed',
        analysis: result.analysis,
        usage: result.usage,
        model: result.model
      });
    } else {
      res.status(500).json({
        message: 'Competitor analysis failed',
        error: result.error,
        fallback: result.fallback
      });
    }
  } catch (error) {
    console.error('AI competitor analysis error:', error);
    res.status(500).json({
      message: 'Error analyzing competitors',
      error: error.message
    });
  }
});

// @route   POST /api/ai/optimize-performance
// @desc    Analyze performance data and provide optimization recommendations
// @access  Private
router.post('/optimize-performance', auth, async (req, res) => {
  try {
    const { performanceData, goals } = req.body;

    const result = await openaiService.optimizePerformance(performanceData, goals);

    // Log AI usage
    auditLogger.log(AUDIT_EVENTS.AI_ANALYSIS_PERFORMED, {
      userId: req.user.id,
      analysisType: 'performance_optimization',
      success: result.success
    }, req);

    if (result.success) {
      res.json({
        message: 'Performance optimization completed',
        recommendations: result.recommendations,
        usage: result.usage,
        model: result.model
      });
    } else {
      res.status(500).json({
        message: 'Performance optimization failed',
        error: result.error,
        fallback: result.fallback
      });
    }
  } catch (error) {
    console.error('AI performance optimization error:', error);
    res.status(500).json({
      message: 'Error optimizing performance',
      error: error.message
    });
  }
});

// @route   GET /api/ai/agents
// @desc    Get available AI agents and their capabilities
// @access  Private
router.get('/agents', auth, async (req, res) => {
  try {
    const agents = {
      contentCreator: {
        name: 'Content Creator',
        description: 'Generates engaging social media content tailored to your brand and audience',
        capabilities: ['Content generation', 'Platform optimization', 'Tone matching', 'Audience targeting'],
        model: 'GPT-4'
      },
      hashtagGenerator: {
        name: 'Hashtag Generator',
        description: 'Creates relevant and trending hashtags to maximize reach and engagement',
        capabilities: ['Trending hashtags', 'Niche targeting', 'Platform-specific optimization'],
        model: 'GPT-3.5-turbo'
      },
      captionWriter: {
        name: 'Caption Writer',
        description: 'Writes compelling captions that drive engagement and conversions',
        capabilities: ['Hook writing', 'Call-to-action creation', 'Engagement optimization'],
        model: 'GPT-4'
      },
      trendAnalyzer: {
        name: 'Trend Analyzer',
        description: 'Analyzes current trends and identifies opportunities for your content strategy',
        capabilities: ['Trend identification', 'Opportunity analysis', 'Strategic recommendations'],
        model: 'GPT-4'
      },
      audienceAnalyzer: {
        name: 'Audience Analyzer',
        description: 'Provides deep insights into your audience behavior and preferences',
        capabilities: ['Demographic analysis', 'Behavior patterns', 'Content preferences'],
        model: 'GPT-4'
      },
      competitorAnalyzer: {
        name: 'Competitor Analyzer',
        description: 'Analyzes competitor strategies and identifies competitive advantages',
        capabilities: ['Strategy analysis', 'Gap identification', 'Competitive insights'],
        model: 'GPT-4'
      },
      performanceOptimizer: {
        name: 'Performance Optimizer',
        description: 'Optimizes your content strategy based on performance data and analytics',
        capabilities: ['Performance analysis', 'Optimization recommendations', 'Strategy refinement'],
        model: 'GPT-4'
      }
    };

    res.json({
      message: 'AI agents retrieved successfully',
      agents,
      totalAgents: Object.keys(agents).length
    });
  } catch (error) {
    console.error('Get AI agents error:', error);
    res.status(500).json({
      message: 'Error retrieving AI agents',
      error: error.message
    });
  }
});

// @route   GET /api/ai/usage-stats
// @desc    Get AI usage statistics for the user
// @access  Private
router.get('/usage-stats', auth, async (req, res) => {
  try {
    const stats = await openaiService.getUsageStats();

    res.json({
      message: 'Usage statistics retrieved successfully',
      stats,
      subscription: req.user.subscription,
      limits: {
        free: { requests: 10, tokens: 10000 },
        basic: { requests: 100, tokens: 100000 },
        premium: { requests: 500, tokens: 500000 },
        enterprise: { requests: 'unlimited', tokens: 'unlimited' }
      }
    });
  } catch (error) {
    console.error('Get usage stats error:', error);
    res.status(500).json({
      message: 'Error retrieving usage statistics',
      error: error.message
    });
  }
});

// @route   POST /api/ai/batch-generate
// @desc    Generate multiple pieces of content in batch
// @access  Private
router.post('/batch-generate', auth, async (req, res) => {
  try {
    const { prompts, platform, options = {} } = req.body;

    if (!Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({
        message: 'Prompts array is required and cannot be empty'
      });
    }

    if (prompts.length > 10) {
      return res.status(400).json({
        message: 'Maximum 10 prompts allowed per batch request'
      });
    }

    const results = [];
    for (const prompt of prompts) {
      const result = await openaiService.generateContent(prompt, platform, options);
      results.push({
        prompt,
        result
      });
    }

    // Log batch AI usage
    auditLogger.log(AUDIT_EVENTS.AI_CONTENT_GENERATED, {
      userId: req.user.id,
      batchSize: prompts.length,
      platform,
      success: results.filter(r => r.result.success).length
    }, req);

    res.json({
      message: 'Batch content generation completed',
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.result.success).length,
        failed: results.filter(r => !r.result.success).length
      }
    });
  } catch (error) {
    console.error('AI batch generation error:', error);
    res.status(500).json({
      message: 'Error in batch content generation',
      error: error.message
    });
  }
});

module.exports = router;
