const Content = require('../models/Content');
const Organization = require('../models/Organization');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');
const openaiService = require('../integrations/ai/openai');
const claudeService = require('../integrations/ai/claude');
const geminiService = require('../integrations/ai/gemini');

/**
 * AI Content Generation Controller
 * Handles AI-powered content creation and optimization
 */

// Generate content using AI
const generateContent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { organizationId, userId } = req.user;
    const {
      prompt,
      platforms,
      contentType,
      tone,
      style,
      length,
      includeHashtags,
      includeCallToAction,
      aiProvider = 'openai',
      customInstructions,
      brandVoice,
      targetAudience
    } = req.body;

    // Get organization settings for AI
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Prepare AI request
    const aiRequest = {
      prompt,
      platforms: platforms || ['facebook', 'instagram', 'twitter', 'linkedin'],
      contentType: contentType || 'post',
      tone: tone || 'professional',
      style: style || 'engaging',
      length: length || 'medium',
      includeHashtags: includeHashtags !== false,
      includeCallToAction: includeCallToAction !== false,
      customInstructions,
      brandVoice: brandVoice || organization.settings?.brandVoice,
      targetAudience: targetAudience || organization.settings?.targetAudience,
      organizationId
    };

    let aiResponse;

    // Call appropriate AI service
    switch (aiProvider.toLowerCase()) {
      case 'openai':
        aiResponse = await openaiService.generateContent(aiRequest);
        break;
      case 'claude':
        aiResponse = await claudeService.generateContent(aiRequest);
        break;
      case 'gemini':
        aiResponse = await geminiService.generateContent(aiRequest);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid AI provider'
        });
    }

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        message: 'AI content generation failed',
        error: aiResponse.error
      });
    }

    // Create content record
    const contentData = {
      title: aiResponse.data.title || 'AI Generated Content',
      content: {
        caption: aiResponse.data.caption,
        hashtags: aiResponse.data.hashtags || [],
        callToAction: aiResponse.data.callToAction,
        visualDescription: aiResponse.data.visualDescription
      },
      type: contentType || 'post',
      platforms: platforms.map(platform => ({
        platform,
        status: 'draft',
        content: {
          caption: aiResponse.data.platformContent?.[platform]?.caption || aiResponse.data.caption,
          hashtags: aiResponse.data.platformContent?.[platform]?.hashtags || aiResponse.data.hashtags || []
        }
      })),
      organizationId,
      createdBy: userId,
      aiGenerated: true,
      aiProvider,
      aiSettings: {
        prompt,
        tone,
        style,
        length,
        customInstructions
      },
      status: 'draft'
    };

    const content = new Content(contentData);
    await content.save();

    logger.info(`AI content generated: ${content._id}`, {
      organizationId,
      userId,
      aiProvider,
      contentType,
      platforms
    });

    res.status(201).json({
      success: true,
      message: 'Content generated successfully',
      data: {
        content,
        aiResponse: {
          provider: aiProvider,
          tokensUsed: aiResponse.data.tokensUsed,
          processingTime: aiResponse.data.processingTime,
          confidence: aiResponse.data.confidence
        }
      }
    });
  } catch (error) {
    logger.error('Generate AI content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate content',
      error: error.message
    });
  }
};

// Optimize existing content using AI
const optimizeContent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { contentId } = req.params;
    const { organizationId } = req.user;
    const {
      optimizationType = 'all',
      aiProvider = 'openai',
      customInstructions
    } = req.body;

    const content = await Content.findOne({
      _id: contentId,
      organizationId
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Prepare optimization request
    const optimizationRequest = {
      content: {
        caption: content.content.caption,
        hashtags: content.content.hashtags,
        callToAction: content.content.callToAction
      },
      platforms: content.platforms.map(p => p.platform),
      optimizationType,
      customInstructions,
      organizationId
    };

    let aiResponse;

    // Call appropriate AI service
    switch (aiProvider.toLowerCase()) {
      case 'openai':
        aiResponse = await openaiService.optimizeContent(optimizationRequest);
        break;
      case 'claude':
        aiResponse = await claudeService.optimizeContent(optimizationRequest);
        break;
      case 'gemini':
        aiResponse = await geminiService.optimizeContent(optimizationRequest);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid AI provider'
        });
    }

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        message: 'Content optimization failed',
        error: aiResponse.error
      });
    }

    // Update content with optimized version
    const originalContent = { ...content.content };
    
    content.content.caption = aiResponse.data.optimizedCaption || content.content.caption;
    content.content.hashtags = aiResponse.data.optimizedHashtags || content.content.hashtags;
    content.content.callToAction = aiResponse.data.optimizedCallToAction || content.content.callToAction;
    
    // Update platform-specific content
    if (aiResponse.data.platformOptimizations) {
      content.platforms.forEach(platform => {
        const optimization = aiResponse.data.platformOptimizations[platform.platform];
        if (optimization) {
          platform.content.caption = optimization.caption || platform.content.caption;
          platform.content.hashtags = optimization.hashtags || platform.content.hashtags;
        }
      });
    }

    content.aiOptimized = true;
    content.aiOptimizationHistory = content.aiOptimizationHistory || [];
    content.aiOptimizationHistory.push({
      timestamp: new Date(),
      provider: aiProvider,
      type: optimizationType,
      originalContent,
      optimizedContent: content.content,
      suggestions: aiResponse.data.suggestions || []
    });

    await content.save();

    logger.info(`Content optimized: ${contentId}`, {
      organizationId,
      aiProvider,
      optimizationType
    });

    res.json({
      success: true,
      message: 'Content optimized successfully',
      data: {
        content,
        optimization: {
          provider: aiProvider,
          type: optimizationType,
          suggestions: aiResponse.data.suggestions || [],
          improvements: aiResponse.data.improvements || [],
          tokensUsed: aiResponse.data.tokensUsed,
          processingTime: aiResponse.data.processingTime
        }
      }
    });
  } catch (error) {
    logger.error('Optimize content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to optimize content',
      error: error.message
    });
  }
};

// Generate content ideas
const generateIdeas = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { organizationId } = req.user;
    const {
      topic,
      platforms,
      contentType = 'post',
      count = 5,
      aiProvider = 'openai',
      includeTrending,
      includeSeasonal,
      targetAudience
    } = req.body;

    // Get organization settings
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Prepare ideas request
    const ideasRequest = {
      topic,
      platforms: platforms || ['facebook', 'instagram', 'twitter', 'linkedin'],
      contentType,
      count: Math.min(count, 20), // Limit to 20 ideas max
      includeTrending,
      includeSeasonal,
      targetAudience: targetAudience || organization.settings?.targetAudience,
      organizationId
    };

    let aiResponse;

    // Call appropriate AI service
    switch (aiProvider.toLowerCase()) {
      case 'openai':
        aiResponse = await openaiService.generateIdeas(ideasRequest);
        break;
      case 'claude':
        aiResponse = await claudeService.generateIdeas(ideasRequest);
        break;
      case 'gemini':
        aiResponse = await geminiService.generateIdeas(ideasRequest);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid AI provider'
        });
    }

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        message: 'Ideas generation failed',
        error: aiResponse.error
      });
    }

    logger.info(`Content ideas generated`, {
      organizationId,
      topic,
      count: ideasRequest.count,
      aiProvider
    });

    res.json({
      success: true,
      message: 'Content ideas generated successfully',
      data: {
        ideas: aiResponse.data.ideas,
        metadata: {
          provider: aiProvider,
          topic,
          platforms: ideasRequest.platforms,
          count: aiResponse.data.ideas.length,
          tokensUsed: aiResponse.data.tokensUsed,
          processingTime: aiResponse.data.processingTime
        }
      }
    });
  } catch (error) {
    logger.error('Generate ideas error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate content ideas',
      error: error.message
    });
  }
};

// Analyze content performance
const analyzeContent = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { organizationId } = req.user;
    const {
      aiProvider = 'openai',
      includeRecommendations = true
    } = req.body;

    const content = await Content.findOne({
      _id: contentId,
      organizationId
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Prepare analysis request
    const analysisRequest = {
      content: {
        caption: content.content.caption,
        hashtags: content.content.hashtags,
        callToAction: content.content.callToAction
      },
      platforms: content.platforms.map(p => p.platform),
      metrics: content.analytics || {},
      includeRecommendations,
      organizationId
    };

    let aiResponse;

    // Call appropriate AI service
    switch (aiProvider.toLowerCase()) {
      case 'openai':
        aiResponse = await openaiService.analyzeContent(analysisRequest);
        break;
      case 'claude':
        aiResponse = await claudeService.analyzeContent(analysisRequest);
        break;
      case 'gemini':
        aiResponse = await geminiService.analyzeContent(analysisRequest);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid AI provider'
        });
    }

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        message: 'Content analysis failed',
        error: aiResponse.error
      });
    }

    // Update content with analysis
    content.aiAnalysis = {
      provider: aiProvider,
      timestamp: new Date(),
      analysis: aiResponse.data.analysis,
      recommendations: aiResponse.data.recommendations || [],
      score: aiResponse.data.score || 0,
      insights: aiResponse.data.insights || []
    };

    await content.save();

    logger.info(`Content analyzed: ${contentId}`, {
      organizationId,
      aiProvider
    });

    res.json({
      success: true,
      message: 'Content analyzed successfully',
      data: {
        analysis: aiResponse.data.analysis,
        recommendations: aiResponse.data.recommendations || [],
        score: aiResponse.data.score || 0,
        insights: aiResponse.data.insights || [],
        metadata: {
          provider: aiProvider,
          tokensUsed: aiResponse.data.tokensUsed,
          processingTime: aiResponse.data.processingTime
        }
      }
    });
  } catch (error) {
    logger.error('Analyze content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze content',
      error: error.message
    });
  }
};

// Generate hashtags
const generateHashtags = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { organizationId } = req.user;
    const {
      content,
      platforms,
      count = 10,
      includeTrending = true,
      aiProvider = 'openai'
    } = req.body;

    // Prepare hashtag request
    const hashtagRequest = {
      content,
      platforms: platforms || ['instagram', 'twitter', 'linkedin'],
      count: Math.min(count, 30), // Limit to 30 hashtags max
      includeTrending,
      organizationId
    };

    let aiResponse;

    // Call appropriate AI service
    switch (aiProvider.toLowerCase()) {
      case 'openai':
        aiResponse = await openaiService.generateHashtags(hashtagRequest);
        break;
      case 'claude':
        aiResponse = await claudeService.generateHashtags(hashtagRequest);
        break;
      case 'gemini':
        aiResponse = await geminiService.generateHashtags(hashtagRequest);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid AI provider'
        });
    }

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        message: 'Hashtag generation failed',
        error: aiResponse.error
      });
    }

    logger.info(`Hashtags generated`, {
      organizationId,
      platforms: hashtagRequest.platforms,
      count: aiResponse.data.hashtags.length,
      aiProvider
    });

    res.json({
      success: true,
      message: 'Hashtags generated successfully',
      data: {
        hashtags: aiResponse.data.hashtags,
        categorized: aiResponse.data.categorized || {},
        trending: aiResponse.data.trending || [],
        metadata: {
          provider: aiProvider,
          platforms: hashtagRequest.platforms,
          count: aiResponse.data.hashtags.length,
          tokensUsed: aiResponse.data.tokensUsed,
          processingTime: aiResponse.data.processingTime
        }
      }
    });
  } catch (error) {
    logger.error('Generate hashtags error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate hashtags',
      error: error.message
    });
  }
};

// Get AI usage statistics
const getAIUsageStats = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { startDate, endDate, aiProvider } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Build provider filter
    const providerFilter = {};
    if (aiProvider) {
      providerFilter.$or = [
        { aiProvider },
        { 'aiOptimizationHistory.provider': aiProvider },
        { 'aiAnalysis.provider': aiProvider }
      ];
    }

    // Get AI-generated content stats
    const aiContentStats = await Content.aggregate([
      {
        $match: {
          organizationId,
          ...providerFilter,
          ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {})
        }
      },
      {
        $group: {
          _id: '$aiProvider',
          count: { $sum: 1 },
          totalTokens: { $sum: '$aiSettings.tokensUsed' }
        }
      }
    ]);

    // Get AI optimization stats
    const optimizationStats = await Content.aggregate([
      {
        $match: {
          organizationId,
          aiOptimized: true,
          ...(Object.keys(dateFilter).length > 0 ? { 'aiOptimizationHistory.timestamp': dateFilter } : {})
        }
      },
      {
        $unwind: '$aiOptimizationHistory'
      },
      {
        $group: {
          _id: '$aiOptimizationHistory.provider',
          count: { $sum: 1 },
          totalTokens: { $sum: '$aiOptimizationHistory.tokensUsed' }
        }
      }
    ]);

    // Get AI analysis stats
    const analysisStats = await Content.aggregate([
      {
        $match: {
          organizationId,
          'aiAnalysis.provider': { $exists: true },
          ...(Object.keys(dateFilter).length > 0 ? { 'aiAnalysis.timestamp': dateFilter } : {})
        }
      },
      {
        $group: {
          _id: '$aiAnalysis.provider',
          count: { $sum: 1 },
          totalTokens: { $sum: '$aiAnalysis.tokensUsed' }
        }
      }
    ]);

    // Combine all stats
    const allStats = [...aiContentStats, ...optimizationStats, ...analysisStats];
    const combinedStats = {};

    allStats.forEach(stat => {
      if (!combinedStats[stat._id]) {
        combinedStats[stat._id] = {
          provider: stat._id,
          contentGenerated: 0,
          optimizations: 0,
          analyses: 0,
          totalTokens: 0
        };
      }
      combinedStats[stat._id].totalTokens += stat.totalTokens || 0;
    });

    // Add specific counts
    aiContentStats.forEach(stat => {
      if (combinedStats[stat._id]) {
        combinedStats[stat._id].contentGenerated = stat.count;
      }
    });

    optimizationStats.forEach(stat => {
      if (combinedStats[stat._id]) {
        combinedStats[stat._id].optimizations = stat.count;
      }
    });

    analysisStats.forEach(stat => {
      if (combinedStats[stat._id]) {
        combinedStats[stat._id].analyses = stat.count;
      }
    });

    const stats = Object.values(combinedStats);

    res.json({
      success: true,
      data: {
        stats,
        summary: {
          totalContentGenerated: aiContentStats.reduce((sum, stat) => sum + stat.count, 0),
          totalOptimizations: optimizationStats.reduce((sum, stat) => sum + stat.count, 0),
          totalAnalyses: analysisStats.reduce((sum, stat) => sum + stat.count, 0),
          totalTokens: stats.reduce((sum, stat) => sum + stat.totalTokens, 0)
        }
      }
    });
  } catch (error) {
    logger.error('Get AI usage stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI usage statistics',
      error: error.message
    });
  }
};

module.exports = {
  generateContent,
  optimizeContent,
  generateIdeas,
  analyzeContent,
  generateHashtags,
  getAIUsageStats
};

