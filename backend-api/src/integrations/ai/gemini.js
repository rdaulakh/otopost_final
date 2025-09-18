const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../../utils/logger');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
      generationConfig: {
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS) || 4000,
      }
    });
  }

  /**
   * Generate content using Google Gemini
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

      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const content = response.text();

      const executionTime = Date.now() - startTime;

      logger.info(`Gemini content generation completed in ${executionTime}ms`);

      return {
        success: true,
        content: content,
        metadata: {
          model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
          tokensUsed: response.usageMetadata?.totalTokenCount || 0,
          executionTime: executionTime,
          provider: 'gemini'
        }
      };

    } catch (error) {
      logger.error('Gemini content generation failed:', error);
      throw new Error(`Gemini AI content generation failed: ${error.message}`);
    }
  }

  /**
   * Generate hashtags using Gemini
   */
  async generateHashtags(request) {
    try {
      const { text, count = 10, trending = true, niche = '' } = request;

      const prompt = `You are a social media marketing expert specializing in hashtag generation. 
      Generate ${count} relevant, trending hashtags for the given content. 
      ${trending ? 'Focus on currently trending hashtags.' : ''}
      ${niche ? `Target the ${niche} niche specifically.` : ''}
      
      Content: "${text}"
      
      Return only the hashtags, one per line, without explanations.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      const hashtags = content
        .split('\n')
        .map(tag => tag.trim())
        .filter(tag => tag.startsWith('#') && tag.length > 1)
        .slice(0, count);

      return {
        success: true,
        hashtags: hashtags,
        metadata: {
          model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
          tokensUsed: response.usageMetadata?.totalTokenCount || 0,
          provider: 'gemini'
        }
      };

    } catch (error) {
      logger.error('Gemini hashtag generation failed:', error);
      throw new Error(`Gemini hashtag generation failed: ${error.message}`);
    }
  }

  /**
   * Generate captions using Gemini
   */
  async generateCaption(request) {
    try {
      const { text, tone = 'engaging', length = 'short', keywords = '', platform = 'instagram' } = request;

      const prompt = `You are an expert social media caption writer. 
      Create a ${length}, ${tone} caption for a ${platform} post. 
      ${keywords ? `Incorporate these keywords naturally: ${keywords}` : ''}
      Make it engaging and platform-appropriate.
      
      Content: "${text}"`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const caption = response.text().trim();

      return {
        success: true,
        caption: caption,
        metadata: {
          model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
          tokensUsed: response.usageMetadata?.totalTokenCount || 0,
          provider: 'gemini'
        }
      };

    } catch (error) {
      logger.error('Gemini caption generation failed:', error);
      throw new Error(`Gemini caption generation failed: ${error.message}`);
    }
  }

  /**
   * Analyze content performance using Gemini
   */
  async analyzeContent(request) {
    try {
      const { content, platform, metrics } = request;

      const prompt = `You are a social media analytics expert. 
      Analyze the given content and provide insights on performance, engagement potential, and optimization suggestions.
      
      Content: "${content}"
      Platform: ${platform}
      Current metrics: ${JSON.stringify(metrics || {})}
      
      Provide analysis on:
      1. Engagement potential (1-10)
      2. Content quality score (1-10)
      3. Optimization suggestions
      4. Target audience alignment
      5. Best posting times
      6. Hashtag recommendations
      7. Visual content suggestions`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();

      return {
        success: true,
        analysis: analysis,
        metadata: {
          model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
          tokensUsed: response.usageMetadata?.totalTokenCount || 0,
          provider: 'gemini'
        }
      };

    } catch (error) {
      logger.error('Gemini content analysis failed:', error);
      throw new Error(`Gemini content analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate content variations using Gemini
   */
  async generateVariations(request) {
    try {
      const { content, count = 3, platforms = [] } = request;

      const prompt = `Create ${count} different variations of this social media content for different platforms: ${platforms.join(', ')}.
      
      Original content: "${content}"
      
      For each variation:
      1. Adapt the tone and style for the specific platform
      2. Adjust the length appropriately
      3. Include platform-specific elements (hashtags, mentions, etc.)
      4. Maintain the core message but optimize for engagement
      
      Format as JSON with platform as key and content as value.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const variations = response.text();

      return {
        success: true,
        variations: variations,
        metadata: {
          model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
          tokensUsed: response.usageMetadata?.totalTokenCount || 0,
          provider: 'gemini'
        }
      };

    } catch (error) {
      logger.error('Gemini content variations failed:', error);
      throw new Error(`Gemini content variations failed: ${error.message}`);
    }
  }

  /**
   * Generate content strategy using Gemini
   */
  async generateStrategy(request) {
    try {
      const { 
        businessType, 
        targetAudience, 
        goals, 
        platforms, 
        budget, 
        timeline 
      } = request;

      const prompt = `You are a social media strategy expert. Create a comprehensive content strategy based on the following:
      
      Business Type: ${businessType}
      Target Audience: ${targetAudience}
      Goals: ${goals}
      Platforms: ${platforms.join(', ')}
      Budget: ${budget}
      Timeline: ${timeline}
      
      Provide:
      1. Content themes and topics
      2. Posting frequency for each platform
      3. Content mix (text, images, videos, stories)
      4. Engagement strategies
      5. Hashtag strategy
      6. Influencer collaboration ideas
      7. Campaign suggestions
      8. Performance metrics to track`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const strategy = response.text();

      return {
        success: true,
        strategy: strategy,
        metadata: {
          model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
          tokensUsed: response.usageMetadata?.totalTokenCount || 0,
          provider: 'gemini'
        }
      };

    } catch (error) {
      logger.error('Gemini strategy generation failed:', error);
      throw new Error(`Gemini strategy generation failed: ${error.message}`);
    }
  }

  /**
   * Build system prompt for content generation
   */
  buildSystemPrompt(options) {
    const {
      contentType,
      tone,
      style,
      length,
      brandVoice,
      targetAudience,
      customInstructions
    } = options;

    let prompt = `You are an expert social media content creator and copywriter. `;
    
    if (contentType) prompt += `Create ${contentType} content. `;
    if (tone) prompt += `Use a ${tone} tone. `;
    if (style) prompt += `Follow a ${style} style. `;
    if (length) prompt += `Keep it ${length} length. `;
    if (brandVoice) prompt += `Maintain this brand voice: ${brandVoice}. `;
    if (targetAudience) prompt += `Target audience: ${targetAudience}. `;
    if (customInstructions) prompt += `Additional instructions: ${customInstructions}. `;
    
    prompt += `Make the content engaging, platform-appropriate, and optimized for social media.`;

    return prompt;
  }

  /**
   * Build user prompt for content generation
   */
  buildUserPrompt(options) {
    const { prompt, platforms, includeHashtags, includeCallToAction } = options;

    let userPrompt = `Create content based on: "${prompt}"`;
    
    if (platforms && platforms.length > 0) {
      userPrompt += `\n\nFor these platforms: ${platforms.join(', ')}`;
    }
    
    if (includeHashtags) {
      userPrompt += `\n\nInclude relevant hashtags.`;
    }
    
    if (includeCallToAction) {
      userPrompt += `\n\nInclude a compelling call-to-action.`;
    }

    return userPrompt;
  }

  /**
   * Health check for Gemini service
   */
  async healthCheck() {
    try {
      const result = await this.model.generateContent('Hello');
      const response = await result.response;
      const content = response.text();

      return {
        success: true,
        status: 'healthy',
        provider: 'gemini',
        model: process.env.GEMINI_MODEL || 'gemini-1.5-pro'
      };
    } catch (error) {
      logger.error('Gemini health check failed:', error);
      return {
        success: false,
        status: 'unhealthy',
        provider: 'gemini',
        error: error.message
      };
    }
  }
}

module.exports = new GeminiService();

