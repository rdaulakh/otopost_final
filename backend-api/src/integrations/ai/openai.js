const OpenAI = require('openai');
const logger = require('../../utils/logger');

class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000
    });
    this.model = process.env.OPENAI_MODEL || 'gpt-4';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 4000;
    this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7;
  }

  /**
   * Generate content using OpenAI
   */
  async generateContent(request) {
    try {
      const startTime = Date.now();
      
      const {
        prompt,
        platforms,
        contentType,
        tone,
        style,
        length,
        includeHashtags,
        includeCallToAction,
        customInstructions,
        brandVoice,
        targetAudience,
        organizationId
      } = request;

      // Build system prompt
      const systemPrompt = this.buildSystemPrompt({
        contentType,
        tone,
        style,
        length,
        brandVoice,
        targetAudience,
        customInstructions
      });

      // Build user prompt
      const userPrompt = this.buildUserPrompt({
        prompt,
        platforms,
        includeHashtags,
        includeCallToAction
      });

      // Call OpenAI API
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      });

      const content = response.choices[0].message.content;
      const processingTime = Date.now() - startTime;
      const tokensUsed = response.usage.total_tokens;

      // Parse the response
      const parsedContent = this.parseContentResponse(content, platforms);

      logger.info('OpenAI content generation completed', {
        organizationId,
        tokensUsed,
        processingTime,
        model: this.model
      });

      return {
        success: true,
        data: {
          ...parsedContent,
          tokensUsed,
          processingTime,
          confidence: this.calculateConfidence(response.choices[0].finish_reason)
        }
      };
    } catch (error) {
      logger.error('OpenAI content generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Optimize existing content
   */
  async optimizeContent(request) {
    try {
      const startTime = Date.now();
      
      const {
        content,
        platforms,
        optimizationType,
        customInstructions,
        organizationId
      } = request;

      const systemPrompt = this.buildOptimizationSystemPrompt(optimizationType);
      const userPrompt = this.buildOptimizationUserPrompt({
        content,
        platforms,
        customInstructions
      });

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature * 0.8, // Lower temperature for optimization
        top_p: 0.9
      });

      const optimizedContent = response.choices[0].message.content;
      const processingTime = Date.now() - startTime;
      const tokensUsed = response.usage.total_tokens;

      const parsedOptimization = this.parseOptimizationResponse(optimizedContent, platforms);

      logger.info('OpenAI content optimization completed', {
        organizationId,
        tokensUsed,
        processingTime,
        optimizationType
      });

      return {
        success: true,
        data: {
          ...parsedOptimization,
          tokensUsed,
          processingTime
        }
      };
    } catch (error) {
      logger.error('OpenAI content optimization error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate content ideas
   */
  async generateIdeas(request) {
    try {
      const startTime = Date.now();
      
      const {
        topic,
        platforms,
        contentType,
        count,
        includeTrending,
        includeSeasonal,
        targetAudience,
        organizationId
      } = request;

      const systemPrompt = this.buildIdeasSystemPrompt({
        contentType,
        includeTrending,
        includeSeasonal,
        targetAudience
      });

      const userPrompt = this.buildIdeasUserPrompt({
        topic,
        platforms,
        count
      });

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature * 1.2, // Higher temperature for creativity
        top_p: 0.95
      });

      const ideas = response.choices[0].message.content;
      const processingTime = Date.now() - startTime;
      const tokensUsed = response.usage.total_tokens;

      const parsedIdeas = this.parseIdeasResponse(ideas);

      logger.info('OpenAI ideas generation completed', {
        organizationId,
        tokensUsed,
        processingTime,
        topic,
        count: parsedIdeas.length
      });

      return {
        success: true,
        data: {
          ideas: parsedIdeas,
          tokensUsed,
          processingTime
        }
      };
    } catch (error) {
      logger.error('OpenAI ideas generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Analyze content performance
   */
  async analyzeContent(request) {
    try {
      const startTime = Date.now();
      
      const {
        content,
        platforms,
        metrics,
        includeRecommendations,
        organizationId
      } = request;

      const systemPrompt = this.buildAnalysisSystemPrompt(includeRecommendations);
      const userPrompt = this.buildAnalysisUserPrompt({
        content,
        platforms,
        metrics
      });

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature * 0.6, // Lower temperature for analysis
        top_p: 0.9
      });

      const analysis = response.choices[0].message.content;
      const processingTime = Date.now() - startTime;
      const tokensUsed = response.usage.total_tokens;

      const parsedAnalysis = this.parseAnalysisResponse(analysis);

      logger.info('OpenAI content analysis completed', {
        organizationId,
        tokensUsed,
        processingTime
      });

      return {
        success: true,
        data: {
          ...parsedAnalysis,
          tokensUsed,
          processingTime
        }
      };
    } catch (error) {
      logger.error('OpenAI content analysis error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate hashtags
   */
  async generateHashtags(request) {
    try {
      const startTime = Date.now();
      
      const {
        content,
        platforms,
        count,
        includeTrending,
        organizationId
      } = request;

      const systemPrompt = this.buildHashtagSystemPrompt({
        platforms,
        includeTrending
      });

      const userPrompt = this.buildHashtagUserPrompt({
        content,
        count
      });

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: Math.min(this.maxTokens, 1000), // Lower token limit for hashtags
        temperature: this.temperature * 0.8,
        top_p: 0.9
      });

      const hashtags = response.choices[0].message.content;
      const processingTime = Date.now() - startTime;
      const tokensUsed = response.usage.total_tokens;

      const parsedHashtags = this.parseHashtagResponse(hashtags);

      logger.info('OpenAI hashtag generation completed', {
        organizationId,
        tokensUsed,
        processingTime,
        count: parsedHashtags.length
      });

      return {
        success: true,
        data: {
          hashtags: parsedHashtags,
          tokensUsed,
          processingTime
        }
      };
    } catch (error) {
      logger.error('OpenAI hashtag generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper methods for building prompts

  buildSystemPrompt({ contentType, tone, style, length, brandVoice, targetAudience, customInstructions }) {
    let prompt = `You are an expert social media content creator and marketing strategist. Your task is to create engaging, high-quality content for social media platforms.

Content Type: ${contentType}
Tone: ${tone}
Style: ${style}
Length: ${length}`;

    if (brandVoice) {
      prompt += `\nBrand Voice: ${brandVoice}`;
    }

    if (targetAudience) {
      prompt += `\nTarget Audience: ${targetAudience}`;
    }

    if (customInstructions) {
      prompt += `\nCustom Instructions: ${customInstructions}`;
    }

    prompt += `\n\nPlease provide your response in the following JSON format:
{
  "title": "Content title",
  "caption": "Main content caption",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "callToAction": "Call to action text",
  "visualDescription": "Description of visual elements",
  "platformContent": {
    "facebook": {
      "caption": "Facebook-specific caption",
      "hashtags": ["#facebook", "#hashtag"]
    },
    "instagram": {
      "caption": "Instagram-specific caption",
      "hashtags": ["#instagram", "#hashtag"]
    },
    "twitter": {
      "caption": "Twitter-specific caption",
      "hashtags": ["#twitter", "#hashtag"]
    },
    "linkedin": {
      "caption": "LinkedIn-specific caption",
      "hashtags": ["#linkedin", "#hashtag"]
    }
  }
}`;

    return prompt;
  }

  buildUserPrompt({ prompt, platforms, includeHashtags, includeCallToAction }) {
    let userPrompt = `Create social media content based on this prompt: "${prompt}"`;

    if (platforms && platforms.length > 0) {
      userPrompt += `\n\nTarget platforms: ${platforms.join(', ')}`;
    }

    if (includeHashtags) {
      userPrompt += `\n\nInclude relevant hashtags for better discoverability.`;
    }

    if (includeCallToAction) {
      userPrompt += `\n\nInclude a compelling call-to-action.`;
    }

    userPrompt += `\n\nMake sure the content is optimized for each platform's specific requirements and best practices.`;

    return userPrompt;
  }

  buildOptimizationSystemPrompt(optimizationType) {
    return `You are an expert social media content optimizer. Your task is to analyze and improve existing social media content to maximize engagement and performance.

Optimization Type: ${optimizationType}

Please provide your response in the following JSON format:
{
  "optimizedCaption": "Improved caption",
  "optimizedHashtags": ["#improved", "#hashtags"],
  "optimizedCallToAction": "Improved call to action",
  "platformOptimizations": {
    "facebook": {
      "caption": "Facebook-optimized caption",
      "hashtags": ["#facebook", "#optimized"]
    },
    "instagram": {
      "caption": "Instagram-optimized caption",
      "hashtags": ["#instagram", "#optimized"]
    }
  },
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "improvements": ["Improvement 1", "Improvement 2"]
}`;
  }

  buildOptimizationUserPrompt({ content, platforms, customInstructions }) {
    let prompt = `Optimize this social media content:\n\n`;
    prompt += `Caption: ${content.caption}\n`;
    prompt += `Hashtags: ${content.hashtags.join(', ')}\n`;
    if (content.callToAction) {
      prompt += `Call to Action: ${content.callToAction}\n`;
    }

    if (platforms && platforms.length > 0) {
      prompt += `\nTarget platforms: ${platforms.join(', ')}`;
    }

    if (customInstructions) {
      prompt += `\n\nCustom Instructions: ${customInstructions}`;
    }

    return prompt;
  }

  buildIdeasSystemPrompt({ contentType, includeTrending, includeSeasonal, targetAudience }) {
    let prompt = `You are a creative social media strategist. Generate engaging content ideas that will resonate with audiences and drive engagement.

Content Type: ${contentType}`;

    if (targetAudience) {
      prompt += `\nTarget Audience: ${targetAudience}`;
    }

    if (includeTrending) {
      prompt += `\nInclude trending topics and hashtags when relevant.`;
    }

    if (includeSeasonal) {
      prompt += `\nConsider seasonal relevance and current events.`;
    }

    prompt += `\n\nProvide your response as a JSON array of content ideas:
[
  {
    "title": "Idea title",
    "description": "Brief description",
    "content": "Sample content",
    "hashtags": ["#hashtag1", "#hashtag2"],
    "platforms": ["platform1", "platform2"],
    "category": "content category",
    "difficulty": "easy|medium|hard"
  }
]`;

    return prompt;
  }

  buildIdeasUserPrompt({ topic, platforms, count }) {
    let prompt = `Generate ${count} creative content ideas for the topic: "${topic}"`;

    if (platforms && platforms.length > 0) {
      prompt += `\n\nTarget platforms: ${platforms.join(', ')}`;
    }

    prompt += `\n\nMake the ideas diverse, engaging, and actionable.`;

    return prompt;
  }

  buildAnalysisSystemPrompt(includeRecommendations) {
    let prompt = `You are a social media analytics expert. Analyze content performance and provide insights.

Please provide your response in the following JSON format:
{
  "analysis": {
    "overallScore": 85,
    "strengths": ["Strength 1", "Strength 2"],
    "weaknesses": ["Weakness 1", "Weakness 2"],
    "engagement": "High|Medium|Low",
    "reach": "High|Medium|Low",
    "conversion": "High|Medium|Low"
  },
  "insights": ["Insight 1", "Insight 2"],
  "score": 85`;

    if (includeRecommendations) {
      prompt += `,
  "recommendations": ["Recommendation 1", "Recommendation 2"]`;
    }

    prompt += `\n}`;

    return prompt;
  }

  buildAnalysisUserPrompt({ content, platforms, metrics }) {
    let prompt = `Analyze this social media content:\n\n`;
    prompt += `Caption: ${content.caption}\n`;
    prompt += `Hashtags: ${content.hashtags.join(', ')}\n`;
    if (content.callToAction) {
      prompt += `Call to Action: ${content.callToAction}\n`;
    }

    if (platforms && platforms.length > 0) {
      prompt += `\nPlatforms: ${platforms.join(', ')}`;
    }

    if (metrics && Object.keys(metrics).length > 0) {
      prompt += `\n\nPerformance Metrics:\n${JSON.stringify(metrics, null, 2)}`;
    }

    return prompt;
  }

  buildHashtagSystemPrompt({ platforms, includeTrending }) {
    let prompt = `You are a hashtag expert. Generate relevant, effective hashtags for social media content.

Target platforms: ${platforms.join(', ')}`;

    if (includeTrending) {
      prompt += `\n\nInclude trending hashtags when relevant.`;
    }

    prompt += `\n\nProvide your response in the following JSON format:
{
  "hashtags": ["#hashtag1", "#hashtag2"],
  "categorized": {
    "brand": ["#brand1", "#brand2"],
    "industry": ["#industry1", "#industry2"],
    "trending": ["#trending1", "#trending2"]
  },
  "trending": ["#trending1", "#trending2"]
}`;

    return prompt;
  }

  buildHashtagUserPrompt({ content, count }) {
    return `Generate ${count} relevant hashtags for this content: "${content}"`;
  }

  // Helper methods for parsing responses

  parseContentResponse(content, platforms) {
    try {
      const parsed = JSON.parse(content);
      return {
        title: parsed.title || 'Generated Content',
        caption: parsed.caption || '',
        hashtags: parsed.hashtags || [],
        callToAction: parsed.callToAction || '',
        visualDescription: parsed.visualDescription || '',
        platformContent: parsed.platformContent || {}
      };
    } catch (error) {
      logger.error('Error parsing OpenAI content response:', error);
      return {
        title: 'Generated Content',
        caption: content,
        hashtags: [],
        callToAction: '',
        visualDescription: '',
        platformContent: {}
      };
    }
  }

  parseOptimizationResponse(content, platforms) {
    try {
      const parsed = JSON.parse(content);
      return {
        optimizedCaption: parsed.optimizedCaption || '',
        optimizedHashtags: parsed.optimizedHashtags || [],
        optimizedCallToAction: parsed.optimizedCallToAction || '',
        platformOptimizations: parsed.platformOptimizations || {},
        suggestions: parsed.suggestions || [],
        improvements: parsed.improvements || []
      };
    } catch (error) {
      logger.error('Error parsing OpenAI optimization response:', error);
      return {
        optimizedCaption: content,
        optimizedHashtags: [],
        optimizedCallToAction: '',
        platformOptimizations: {},
        suggestions: [],
        improvements: []
      };
    }
  }

  parseIdeasResponse(content) {
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      logger.error('Error parsing OpenAI ideas response:', error);
      return [];
    }
  }

  parseAnalysisResponse(content) {
    try {
      const parsed = JSON.parse(content);
      return {
        analysis: parsed.analysis || {},
        insights: parsed.insights || [],
        score: parsed.score || 0,
        recommendations: parsed.recommendations || []
      };
    } catch (error) {
      logger.error('Error parsing OpenAI analysis response:', error);
      return {
        analysis: {},
        insights: [],
        score: 0,
        recommendations: []
      };
    }
  }

  parseHashtagResponse(content) {
    try {
      const parsed = JSON.parse(content);
      return {
        hashtags: parsed.hashtags || [],
        categorized: parsed.categorized || {},
        trending: parsed.trending || []
      };
    } catch (error) {
      logger.error('Error parsing OpenAI hashtag response:', error);
      return {
        hashtags: [],
        categorized: {},
        trending: []
      };
    }
  }

  calculateConfidence(finishReason) {
    switch (finishReason) {
      case 'stop':
        return 0.95;
      case 'length':
        return 0.8;
      case 'content_filter':
        return 0.6;
      default:
        return 0.7;
    }
  }
}

module.exports = new OpenAIService();

