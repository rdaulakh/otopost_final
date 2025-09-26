const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    // Initialize client only when API key is available
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-dummy-key-for-testing') {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } else {
      this.client = null;
      console.log('OpenAI service initialized without API key - AI features will be disabled');
    }
    
    // AI Agent configurations
    this.agents = {
      contentCreator: {
        model: 'gpt-4.1-mini',
        systemPrompt: `You are a professional social media content creator. Create engaging, platform-appropriate content that drives engagement and aligns with brand voice. Always consider the target audience and platform best practices.`
      },
      hashtagGenerator: {
        model: 'gpt-4.1-nano',
        systemPrompt: `You are a hashtag specialist. Generate relevant, trending, and effective hashtags for social media posts. Mix popular and niche hashtags for optimal reach.`
      },
      captionWriter: {
        model: 'gpt-4.1-mini',
        systemPrompt: `You are a caption writing expert. Write compelling captions that encourage engagement, include call-to-actions, and match the brand's tone of voice.`
      },
      trendAnalyzer: {
        model: 'gpt-4.1-mini',
        systemPrompt: `You are a social media trend analyst. Analyze current trends, identify opportunities, and provide strategic recommendations for content and engagement.`
      },
      audienceAnalyzer: {
        model: 'gpt-4.1-mini',
        systemPrompt: `You are an audience analysis expert. Analyze audience behavior, preferences, and engagement patterns to provide actionable insights for content strategy.`
      },
      competitorAnalyzer: {
        model: 'gpt-4.1-mini',
        systemPrompt: `You are a competitive analysis specialist. Analyze competitor strategies, identify gaps and opportunities, and provide strategic recommendations.`
      },
      performanceOptimizer: {
        model: 'gpt-4.1-mini',
        systemPrompt: `You are a social media performance optimization expert. Analyze metrics, identify improvement opportunities, and provide data-driven recommendations for better performance.`
      }
    };
  }

  // Content Creator Agent
  async generateContent(prompt, platform, options = {}) {
    try {
      const {
        tone = 'professional',
        length = 'medium',
        includeHashtags = true,
        includeEmojis = true,
        targetAudience = 'general',
        callToAction = true
      } = options;

      const systemPrompt = `${this.agents.contentCreator.systemPrompt}

Platform: ${platform}
Tone: ${tone}
Length: ${length}
Target Audience: ${targetAudience}
Include Hashtags: ${includeHashtags}
Include Emojis: ${includeEmojis}
Include Call-to-Action: ${callToAction}

Platform-specific guidelines:
- Facebook: Engaging, conversational, up to 250 characters for optimal engagement
- Instagram: Visual-focused, story-driven, up to 2,200 characters
- Twitter: Concise, trending, up to 280 characters
- LinkedIn: Professional, value-driven, up to 1,300 characters
- TikTok: Trendy, fun, hashtag-heavy, up to 150 characters
- YouTube: Descriptive, SEO-friendly, up to 5,000 characters`;

      const response = await this.client.chat.completions.create({
        model: this.agents.contentCreator.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      return {
        success: true,
        content: response.choices[0].message.content,
        usage: response.usage,
        model: this.agents.contentCreator.model
      };
    } catch (error) {
      console.error('Content generation error:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.generateFallbackContent(prompt, platform)
      };
    }
  }

  // Hashtag Generator Agent
  async generateHashtags(content, platform, count = 10) {
    try {
      const systemPrompt = `${this.agents.hashtagGenerator.systemPrompt}

Platform: ${platform}
Number of hashtags needed: ${count}

Platform-specific hashtag guidelines:
- Instagram: Mix of popular (1M+ posts) and niche (10K-100K posts) hashtags
- Twitter: 1-2 trending hashtags, keep it concise
- LinkedIn: Professional, industry-specific hashtags
- TikTok: Trending challenges, effects, and viral hashtags
- Facebook: Minimal hashtags, focus on 1-3 relevant ones
- YouTube: SEO-focused, searchable keywords as hashtags

Return only the hashtags, separated by spaces, without explanations.`;

      const response = await this.client.chat.completions.create({
        model: this.agents.hashtagGenerator.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate hashtags for this content: "${content}"` }
        ],
        max_tokens: 200,
        temperature: 0.6
      });

      const hashtags = response.choices[0].message.content
        .split(/\s+/)
        .filter(tag => tag.startsWith('#'))
        .slice(0, count);

      return {
        success: true,
        hashtags,
        usage: response.usage,
        model: this.agents.hashtagGenerator.model
      };
    } catch (error) {
      console.error('Hashtag generation error:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.generateFallbackHashtags(content, platform, count)
      };
    }
  }

  // Caption Writer Agent
  async generateCaption(content, platform, options = {}) {
    try {
      const {
        tone = 'engaging',
        includeQuestion = true,
        includeCallToAction = true,
        maxLength = null
      } = options;

      const platformLimits = {
        instagram: 2200,
        facebook: 250,
        twitter: 280,
        linkedin: 1300,
        tiktok: 150,
        youtube: 5000
      };

      const maxChars = maxLength || platformLimits[platform.toLowerCase()] || 500;

      const systemPrompt = `${this.agents.captionWriter.systemPrompt}

Platform: ${platform}
Tone: ${tone}
Max length: ${maxChars} characters
Include question: ${includeQuestion}
Include call-to-action: ${includeCallToAction}

Write a compelling caption that:
1. Hooks the reader in the first line
2. Provides value or entertainment
3. Encourages engagement
4. Stays within character limits
5. Matches the platform's style`;

      const response = await this.client.chat.completions.create({
        model: this.agents.captionWriter.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Write a caption for: "${content}"` }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      return {
        success: true,
        caption: response.choices[0].message.content,
        usage: response.usage,
        model: this.agents.captionWriter.model
      };
    } catch (error) {
      console.error('Caption generation error:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.generateFallbackCaption(content, platform)
      };
    }
  }

  // Trend Analyzer Agent
  async analyzeTrends(industry, platform, timeframe = '7d') {
    try {
      const systemPrompt = `${this.agents.trendAnalyzer.systemPrompt}

Industry: ${industry}
Platform: ${platform}
Timeframe: ${timeframe}

Analyze current trends and provide:
1. Top 5 trending topics/hashtags
2. Content format trends (video, carousel, stories, etc.)
3. Engagement patterns
4. Recommended content strategies
5. Upcoming opportunities

Format as JSON with clear categories.`;

      const response = await this.client.chat.completions.create({
        model: this.agents.trendAnalyzer.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze current trends for ${industry} on ${platform}` }
        ],
        max_tokens: 800,
        temperature: 0.5
      });

      return {
        success: true,
        analysis: response.choices[0].message.content,
        usage: response.usage,
        model: this.agents.trendAnalyzer.model
      };
    } catch (error) {
      console.error('Trend analysis error:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.generateFallbackTrendAnalysis(industry, platform)
      };
    }
  }

  // Audience Analyzer Agent
  async analyzeAudience(audienceData, platform) {
    try {
      const systemPrompt = `${this.agents.audienceAnalyzer.systemPrompt}

Platform: ${platform}

Analyze the provided audience data and provide:
1. Audience demographics breakdown
2. Engagement behavior patterns
3. Content preferences
4. Optimal posting times
5. Personalization recommendations

Provide actionable insights for content strategy.`;

      const response = await this.client.chat.completions.create({
        model: this.agents.audienceAnalyzer.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this audience data: ${JSON.stringify(audienceData)}` }
        ],
        max_tokens: 800,
        temperature: 0.4
      });

      return {
        success: true,
        analysis: response.choices[0].message.content,
        usage: response.usage,
        model: this.agents.audienceAnalyzer.model
      };
    } catch (error) {
      console.error('Audience analysis error:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.generateFallbackAudienceAnalysis(audienceData)
      };
    }
  }

  // Competitor Analyzer Agent
  async analyzeCompetitors(competitorData, industry) {
    try {
      const systemPrompt = `${this.agents.competitorAnalyzer.systemPrompt}

Industry: ${industry}

Analyze competitor data and provide:
1. Content strategy analysis
2. Engagement rate comparisons
3. Content gap opportunities
4. Best performing content types
5. Strategic recommendations

Focus on actionable competitive insights.`;

      const response = await this.client.chat.completions.create({
        model: this.agents.competitorAnalyzer.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze these competitors: ${JSON.stringify(competitorData)}` }
        ],
        max_tokens: 800,
        temperature: 0.4
      });

      return {
        success: true,
        analysis: response.choices[0].message.content,
        usage: response.usage,
        model: this.agents.competitorAnalyzer.model
      };
    } catch (error) {
      console.error('Competitor analysis error:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.generateFallbackCompetitorAnalysis(competitorData)
      };
    }
  }

  // Performance Optimizer Agent
  async optimizePerformance(performanceData, goals) {
    try {
      const systemPrompt = `${this.agents.performanceOptimizer.systemPrompt}

Goals: ${JSON.stringify(goals)}

Analyze performance data and provide:
1. Key performance insights
2. Underperforming areas
3. Optimization opportunities
4. Content strategy adjustments
5. Specific action items with expected impact

Focus on data-driven, measurable recommendations.`;

      const response = await this.client.chat.completions.create({
        model: this.agents.performanceOptimizer.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Optimize performance based on: ${JSON.stringify(performanceData)}` }
        ],
        max_tokens: 800,
        temperature: 0.3
      });

      return {
        success: true,
        recommendations: response.choices[0].message.content,
        usage: response.usage,
        model: this.agents.performanceOptimizer.model
      };
    } catch (error) {
      console.error('Performance optimization error:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.generateFallbackOptimization(performanceData)
      };
    }
  }

  // Fallback methods for when AI fails
  generateFallbackContent(prompt, platform) {
    const templates = {
      facebook: `Check out this amazing content! ${prompt} What do you think? Let us know in the comments! 👇`,
      instagram: `✨ ${prompt} ✨\n\nDouble tap if you agree! 💖\n\n#content #social #engagement`,
      twitter: `${prompt} 🚀 What's your take on this?`,
      linkedin: `Insights on ${prompt}. What are your thoughts on this topic? Share your experience in the comments.`,
      tiktok: `${prompt} 🔥 #trending #viral`,
      youtube: `In this content, we explore ${prompt}. Don't forget to like and subscribe for more!`
    };
    
    return templates[platform.toLowerCase()] || `${prompt} - What do you think?`;
  }

  generateFallbackHashtags(content, platform, count) {
    const commonHashtags = {
      instagram: ['#content', '#social', '#engagement', '#follow', '#like', '#share', '#viral', '#trending', '#instagood', '#photooftheday'],
      twitter: ['#content', '#social', '#trending', '#follow', '#engagement'],
      linkedin: ['#professional', '#business', '#networking', '#career', '#industry'],
      tiktok: ['#fyp', '#viral', '#trending', '#content', '#fun', '#creative', '#tiktok', '#foryou'],
      facebook: ['#content', '#social', '#community'],
      youtube: ['#content', '#video', '#subscribe', '#youtube', '#trending']
    };

    const platformTags = commonHashtags[platform.toLowerCase()] || commonHashtags.instagram;
    return platformTags.slice(0, count);
  }

  generateFallbackCaption(content, platform) {
    return `${content}\n\nWhat do you think about this? Share your thoughts below! 👇`;
  }

  generateFallbackTrendAnalysis(industry, platform) {
    return {
      trends: ['Video content is performing well', 'User-generated content is trending', 'Interactive content drives engagement'],
      recommendations: ['Focus on video content', 'Encourage user participation', 'Use trending hashtags'],
      opportunities: ['Live streaming', 'Behind-the-scenes content', 'Educational posts']
    };
  }

  generateFallbackAudienceAnalysis(audienceData) {
    return {
      insights: ['Audience is most active in the evening', 'Visual content performs best', 'Engagement is higher on weekends'],
      recommendations: ['Post between 6-9 PM', 'Use more images and videos', 'Schedule weekend content']
    };
  }

  generateFallbackCompetitorAnalysis(competitorData) {
    return {
      insights: ['Competitors are using video content heavily', 'User engagement varies by content type', 'Posting frequency affects reach'],
      opportunities: ['Create more video content', 'Focus on engagement', 'Optimize posting schedule']
    };
  }

  generateFallbackOptimization(performanceData) {
    return {
      recommendations: ['Increase posting frequency', 'Use more visual content', 'Engage with audience comments', 'Optimize posting times'],
      priorities: ['Content quality', 'Audience engagement', 'Consistent posting']
    };
  }

  // Usage tracking
  async getUsageStats() {
    // This would typically query a database for usage statistics
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      costEstimate: 0
    };
  }
}

module.exports = new OpenAIService();
