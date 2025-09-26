const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Content = require('../models/Content');
const SocialProfile = require('../models/SocialProfile');
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const openaiService = require('../services/openaiService');

// Rate limiting for AI strategy endpoints
const aiStrategyRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many AI strategy requests from this IP'
});

// Apply rate limiting and auth to all routes
router.use(aiStrategyRateLimit);
router.use(auth);

// @route   GET /api/ai-strategy/strategies
// @desc    Get user's AI-generated strategies
// @access  Private
router.get('/strategies', async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = '30d', status = 'all' } = req.query;

    // Calculate date range
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : 
                    timeRange === '30d' ? 30 : 
                    timeRange === '90d' ? 90 : 30;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Mock strategy data (replace with actual database queries)
    const currentMonth = {
      month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      theme: 'Growth & Engagement Strategy',
      confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
      progress: Math.floor(Math.random() * 40) + 40, // 40-80%
      objectives: [
        { 
          goal: 'Increase engagement rate by 25%', 
          progress: Math.floor(Math.random() * 30) + 60, 
          status: 'on_track',
          target: 25,
          current: 18.5
        },
        { 
          goal: 'Grow followers by 500+', 
          progress: Math.floor(Math.random() * 40) + 30, 
          status: 'on_track',
          target: 500,
          current: 287
        },
        { 
          goal: 'Improve content reach by 40%', 
          progress: Math.floor(Math.random() * 50) + 40, 
          status: 'ahead',
          target: 40,
          current: 52.3
        },
        { 
          goal: 'Launch 2 viral campaigns', 
          progress: Math.floor(Math.random() * 30) + 20, 
          status: 'behind',
          target: 2,
          current: 0
        }
      ],
      keyMetrics: {
        engagement: { current: 4.2, target: 5.0, change: 12.5 },
        reach: { current: 15420, target: 20000, change: 8.3 },
        followers: { current: 3287, target: 4000, change: 5.2 }
      }
    };

    const weeklyPlans = [
      {
        week: 'Week 1',
        theme: 'Brand Awareness',
        status: 'completed',
        posts: 7,
        engagement: 4.8,
        reach: 12500,
        contentTypes: ['image', 'video', 'carousel'],
        platforms: ['instagram', 'linkedin', 'twitter']
      },
      {
        week: 'Week 2',
        theme: 'Product Showcase',
        status: 'in_progress',
        posts: 5,
        engagement: 3.9,
        reach: 9800,
        contentTypes: ['video', 'carousel'],
        platforms: ['instagram', 'facebook', 'youtube']
      },
      {
        week: 'Week 3',
        theme: 'Community Engagement',
        status: 'planned',
        posts: 6,
        engagement: 0,
        reach: 0,
        contentTypes: ['image', 'text', 'poll'],
        platforms: ['twitter', 'linkedin', 'instagram']
      },
      {
        week: 'Week 4',
        theme: 'Thought Leadership',
        status: 'planned',
        posts: 8,
        engagement: 0,
        reach: 0,
        contentTypes: ['article', 'video', 'image'],
        platforms: ['linkedin', 'twitter', 'medium']
      }
    ];

    const aiInsights = [
      {
        type: 'opportunity',
        title: 'Video Content Performing 40% Better',
        description: 'Your video posts are getting significantly higher engagement. Consider increasing video content to 60% of your strategy.',
        confidence: 87,
        impact: 'high',
        action: 'Increase video content production'
      },
      {
        type: 'trend',
        title: 'LinkedIn Audience Most Engaged',
        description: 'Your LinkedIn audience shows 3x higher engagement rates. Focus more content efforts on this platform.',
        confidence: 92,
        impact: 'medium',
        action: 'Prioritize LinkedIn content'
      },
      {
        type: 'warning',
        title: 'Instagram Reach Declining',
        description: 'Instagram organic reach has dropped 15% this month. Consider adjusting posting times and hashtag strategy.',
        confidence: 78,
        impact: 'medium',
        action: 'Optimize Instagram strategy'
      }
    ];

    const strategiesData = {
      currentMonth,
      weeklyPlans,
      aiInsights,
      summary: {
        totalStrategies: 4,
        activeStrategies: 2,
        completedObjectives: 1,
        avgConfidence: currentMonth.confidence,
        nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      timeRange,
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: strategiesData
    });

  } catch (error) {
    console.error('Strategies fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch strategies',
      error: error.message
    });
  }
});

// @route   POST /api/ai-strategy/generate
// @desc    Generate new AI strategy
// @access  Private
router.post('/generate', async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      objectives = [], 
      timeframe = '30d', 
      platforms = [], 
      targetAudience = '',
      businessGoals = '',
      currentChallenges = ''
    } = req.body;

    // Get user's current data for context
    const user = await User.findById(userId).select('-password');
    const socialProfiles = await SocialProfile.find({ userId });
    const recentContent = await Content.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Prepare context for AI
    const context = {
      user: {
        name: user.name,
        businessType: user.businessType || 'General',
        industry: user.industry || 'Technology'
      },
      socialProfiles: socialProfiles.map(p => ({
        platform: p.platform,
        followers: p.followers || 0,
        engagement: p.averageEngagement || 0
      })),
      recentPerformance: {
        totalPosts: recentContent.length,
        avgEngagement: 3.5, // Mock data
        topPlatform: 'instagram'
      },
      objectives,
      timeframe,
      platforms,
      targetAudience,
      businessGoals,
      currentChallenges
    };

    // Generate strategy using real OpenAI service
    const openaiService = require('../services/openaiService');
    
    const aiPrompt = `Generate a comprehensive social media strategy for a ${context.user.businessType} business in the ${context.user.industry} industry.
      
Context:
- User has ${context.socialProfiles.length} connected social platforms: ${context.socialProfiles.map(p => p.platform).join(', ')}
- Recent performance: ${context.recentPerformance.totalPosts} posts with ${context.recentPerformance.avgEngagement}% avg engagement
- Target timeframe: ${timeframe}
- Objectives: ${objectives.join(', ')}
- Target audience: ${targetAudience}
- Business goals: ${businessGoals}
- Current challenges: ${currentChallenges}

Please provide a detailed strategy including:
1. Monthly theme and focus area
2. Weekly content plans with specific themes
3. Platform-specific strategies and content mix
4. Content type recommendations (video, image, text, carousel)
5. Key performance indicators and targets
6. Actionable next steps with timelines

Format the response as a structured strategy that can be implemented immediately.`;

    // Call OpenAI service for strategy generation
    let aiResponse;
    try {
      aiResponse = await openaiService.generateContent(aiPrompt, 'strategy', {
        tone: 'professional',
        length: 'long',
        includeHashtags: false,
        includeEmojis: false,
        targetAudience: targetAudience || 'business professionals',
        callToAction: false
      });
    } catch (error) {
      console.error('OpenAI strategy generation error:', error);
      aiResponse = { success: false, error: error.message };
    }

    // Parse AI response and structure the strategy
    let aiGeneratedContent = '';
    let confidence = 85;
    
    if (aiResponse && aiResponse.success) {
      aiGeneratedContent = aiResponse.content;
      confidence = 95; // Higher confidence for real AI response
    } else {
      // Fallback to structured mock data if AI fails
      aiGeneratedContent = `AI-Generated Strategy for ${context.user.businessType} Business:

Monthly Theme: Accelerated Growth & Community Building
Focus: Building authentic connections while driving measurable business results

Weekly Content Plans:
Week 1: Brand Story & Value Proposition
Week 2: Product/Service Showcase & Social Proof  
Week 3: Community Engagement & User-Generated Content
Week 4: Thought Leadership & Industry Insights

Platform Strategies:
${platforms.includes('linkedin') ? '- LinkedIn: Professional content, industry insights, B2B networking' : ''}
${platforms.includes('instagram') ? '- Instagram: Visual storytelling, behind-the-scenes, user-generated content' : ''}
${platforms.includes('twitter') ? '- Twitter: Real-time engagement, industry news, thought leadership' : ''}
${platforms.includes('facebook') ? '- Facebook: Community building, customer service, event promotion' : ''}

Content Mix Recommendations:
- Video Content: 40% (highest engagement)
- Image Posts: 30% (consistent performance)
- Text/Article Posts: 20% (thought leadership)
- Interactive Content: 10% (polls, Q&A, live sessions)

Key Performance Indicators:
- Engagement Rate: Target 5%+ (currently ${context.recentPerformance.avgEngagement}%)
- Follower Growth: 15% monthly increase
- Website Traffic: 25% increase from social
- Lead Generation: 20 qualified leads per month

Next Steps:
1. Set up content calendar for Week 1 (immediate)
2. Create brand asset library (within 3 days)
3. Identify key hashtags and keywords (within 1 week)
4. Launch first campaign (within 2 weeks)`;
    }

    const generatedStrategy = {
      id: `strategy_${Date.now()}`,
      theme: aiResponse?.success ? 'AI-Generated Growth Strategy' : 'Accelerated Growth & Community Building',
      confidence,
      aiGenerated: aiResponse?.success || false,
      rawAIResponse: aiGeneratedContent,
      timeframe,
      objectives: objectives.map(obj => ({
        goal: obj,
        target: Math.floor(Math.random() * 50) + 25,
        timeline: timeframe,
        metrics: ['engagement', 'reach', 'followers'],
        status: 'planned'
      })),
      weeklyPlans: [
        {
          week: 1,
          theme: 'Brand Introduction & Value Proposition',
          focus: 'Establish brand presence and communicate core values',
          contentTypes: ['video', 'carousel', 'image'],
          platforms: platforms.length > 0 ? platforms : ['instagram', 'linkedin'],
          postFrequency: 5,
          keyMessages: ['Brand story', 'Value proposition', 'Team introduction']
        },
        {
          week: 2,
          theme: 'Product/Service Showcase',
          focus: 'Demonstrate expertise and showcase offerings',
          contentTypes: ['demo', 'tutorial', 'case_study'],
          platforms: platforms.length > 0 ? platforms : ['linkedin', 'youtube'],
          postFrequency: 6,
          keyMessages: ['Product benefits', 'Customer success', 'Behind the scenes']
        },
        {
          week: 3,
          theme: 'Community Engagement & User-Generated Content',
          focus: 'Build community and encourage user participation',
          contentTypes: ['poll', 'question', 'user_content'],
          platforms: platforms.length > 0 ? platforms : ['instagram', 'twitter'],
          postFrequency: 7,
          keyMessages: ['Community building', 'User stories', 'Interactive content']
        },
        {
          week: 4,
          theme: 'Thought Leadership & Industry Insights',
          focus: 'Position as industry expert and share valuable insights',
          contentTypes: ['article', 'infographic', 'trend_analysis'],
          platforms: platforms.length > 0 ? platforms : ['linkedin', 'twitter'],
          postFrequency: 6,
          keyMessages: ['Industry trends', 'Expert opinions', 'Future predictions']
        }
      ],
      platformStrategies: platforms.map(platform => ({
        platform,
        focus: platform === 'linkedin' ? 'Professional networking and B2B content' :
               platform === 'instagram' ? 'Visual storytelling and brand aesthetics' :
               platform === 'twitter' ? 'Real-time engagement and thought leadership' :
               platform === 'facebook' ? 'Community building and customer service' :
               'General brand awareness',
        contentMix: {
          video: platform === 'youtube' ? 60 : platform === 'instagram' ? 40 : 20,
          image: platform === 'instagram' ? 40 : 30,
          text: platform === 'twitter' ? 50 : platform === 'linkedin' ? 40 : 20,
          carousel: platform === 'instagram' ? 20 : platform === 'linkedin' ? 30 : 10
        },
        postingFrequency: platform === 'twitter' ? 'daily' : 
                         platform === 'instagram' ? '5-6 times/week' :
                         platform === 'linkedin' ? '3-4 times/week' : '4-5 times/week',
        bestTimes: ['9:00 AM', '1:00 PM', '6:00 PM'] // Mock optimal times
      })),
      kpis: [
        { metric: 'Engagement Rate', target: '5%', current: '3.2%' },
        { metric: 'Follower Growth', target: '15%', current: '8%' },
        { metric: 'Reach Increase', target: '40%', current: '12%' },
        { metric: 'Website Traffic', target: '25%', current: '5%' }
      ],
      nextSteps: [
        'Set up content calendar for the first week',
        'Create brand guidelines and visual assets',
        'Identify key hashtags and keywords for each platform',
        'Schedule initial batch of content',
        'Set up analytics tracking and monitoring'
      ],
      createdAt: new Date(),
      status: 'active'
    };

    // In a real implementation, you would:
    // 1. Call OpenAI API with the prompt
    // 2. Save the strategy to the database
    // 3. Set up monitoring and tracking

    res.json({
      success: true,
      data: generatedStrategy,
      message: 'Strategy generated successfully'
    });

  } catch (error) {
    console.error('Strategy generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate strategy',
      error: error.message
    });
  }
});

// @route   GET /api/ai-strategy/performance
// @desc    Get strategy performance analytics
// @access  Private
router.get('/performance', async (req, res) => {
  try {
    const userId = req.user.id;
    const { strategyId, timeRange = '30d' } = req.query;

    // Mock performance data
    const performanceData = {
      overview: {
        strategiesActive: 2,
        objectivesCompleted: 3,
        avgConfidence: 87,
        overallProgress: 68
      },
      metrics: {
        engagement: {
          current: 4.2,
          target: 5.0,
          change: 12.5,
          trend: 'up',
          data: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: 3.5 + Math.random() * 1.5
          }))
        },
        reach: {
          current: 15420,
          target: 20000,
          change: 8.3,
          trend: 'up',
          data: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: 12000 + Math.random() * 6000
          }))
        },
        followers: {
          current: 3287,
          target: 4000,
          change: 5.2,
          trend: 'up',
          data: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: 3000 + i * 10 + Math.random() * 20
          }))
        }
      },
      platformPerformance: [
        { platform: 'instagram', score: 85, improvement: 12 },
        { platform: 'linkedin', score: 92, improvement: 8 },
        { platform: 'twitter', score: 78, improvement: -3 },
        { platform: 'facebook', score: 71, improvement: 15 }
      ],
      contentPerformance: {
        topPerforming: [
          { type: 'video', avgEngagement: 6.2, posts: 8 },
          { type: 'carousel', avgEngagement: 5.1, posts: 12 },
          { type: 'image', avgEngagement: 3.8, posts: 15 },
          { type: 'text', avgEngagement: 2.9, posts: 6 }
        ],
        recommendations: [
          'Increase video content to 40% of total posts',
          'Optimize carousel posts with better storytelling',
          'Reduce text-only posts, add visual elements'
        ]
      },
      timeRange,
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: performanceData
    });

  } catch (error) {
    console.error('Strategy performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch strategy performance',
      error: error.message
    });
  }
});

// @route   PUT /api/ai-strategy/:id
// @desc    Update strategy
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Mock strategy update (replace with actual database update)
    const updatedStrategy = {
      id,
      ...updates,
      updatedAt: new Date(),
      updatedBy: userId
    };

    res.json({
      success: true,
      data: updatedStrategy,
      message: 'Strategy updated successfully'
    });

  } catch (error) {
    console.error('Strategy update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update strategy',
      error: error.message
    });
  }
});

// @route   POST /api/ai-strategy/analyze
// @desc    Get AI analysis and recommendations
// @access  Private
router.post('/analyze', async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'performance', data = {} } = req.body;

    // Mock AI analysis (replace with actual AI service call)
    const analysis = {
      type,
      insights: [
        {
          category: 'performance',
          title: 'Video Content Outperforming by 40%',
          description: 'Your video posts are generating 40% more engagement than other content types. Consider increasing video production.',
          confidence: 87,
          impact: 'high',
          recommendation: 'Increase video content to 50% of your posting schedule'
        },
        {
          category: 'timing',
          title: 'Optimal Posting Window Identified',
          description: 'Posts published between 2-4 PM show 25% higher engagement rates.',
          confidence: 92,
          impact: 'medium',
          recommendation: 'Schedule more content during 2-4 PM window'
        },
        {
          category: 'audience',
          title: 'LinkedIn Audience Most Engaged',
          description: 'Your LinkedIn audience shows 3x higher engagement compared to other platforms.',
          confidence: 89,
          impact: 'high',
          recommendation: 'Allocate 40% of content efforts to LinkedIn'
        }
      ],
      recommendations: [
        'Focus on video content creation',
        'Optimize posting schedule for peak engagement times',
        'Increase LinkedIn content frequency',
        'Experiment with carousel posts for better storytelling'
      ],
      score: 78,
      improvementPotential: 22,
      analyzedAt: new Date()
    };

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform AI analysis',
      error: error.message
    });
  }
});

module.exports = router;
