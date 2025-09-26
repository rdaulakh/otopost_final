const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../../utils/logger');

class ClaudeService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
      timeout: 30000
    });
    this.model = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';
    this.maxTokens = parseInt(process.env.CLAUDE_MAX_TOKENS) || 4000;
    this.temperature = parseFloat(process.env.CLAUDE_TEMPERATURE) || 0.7;
  }

  /**
   * Generate content using Claude AI
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

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      const executionTime = Date.now() - startTime;
      const content = response.content[0].text;

      logger.info(`Claude content generation completed in ${executionTime}ms`);

      return {
        success: true,
        content: content,
        metadata: {
          model: this.model,
          tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
          executionTime: executionTime,
          provider: 'claude'
        }
      };

    } catch (error) {
      logger.error('Claude content generation failed:', error);
      throw new Error(`Claude AI content generation failed: ${error.message}`);
    }
  }

  /**
   * Generate hashtags using Claude
   */
  async generateHashtags(request) {
    try {
      const { text, count = 10, trending = true, niche = '' } = request;

      const systemPrompt = `You are a social media marketing expert specializing in hashtag generation. 
      Generate ${count} relevant, trending hashtags for the given content. 
      ${trending ? 'Focus on currently trending hashtags.' : ''}
      ${niche ? `Target the ${niche} niche specifically.` : ''}
      Return only the hashtags, one per line, without explanations.`;

      const userPrompt = `Generate hashtags for this content: "${text}"`;

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 200,
        temperature: 0.8,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      const hashtags = response.content[0].text
        .split('\n')
        .map(tag => tag.trim())
        .filter(tag => tag.startsWith('#') && tag.length > 1)
        .slice(0, count);

      return {
        success: true,
        hashtags: hashtags,
        metadata: {
          model: this.model,
          tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
          provider: 'claude'
        }
      };

    } catch (error) {
      logger.error('Claude hashtag generation failed:', error);
      throw new Error(`Claude hashtag generation failed: ${error.message}`);
    }
  }

  /**
   * Generate captions using Claude
   */
  async generateCaption(request) {
    try {
      const { text, tone = 'engaging', length = 'short', keywords = '', platform = 'instagram' } = request;

      const systemPrompt = `You are an expert social media caption writer. 
      Create a ${length}, ${tone} caption for a ${platform} post. 
      ${keywords ? `Incorporate these keywords naturally: ${keywords}` : ''}
      Make it engaging and platform-appropriate.`;

      const userPrompt = `Generate a caption for: "${text}"`;

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 300,
        temperature: 0.8,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      return {
        success: true,
        caption: response.content[0].text.trim(),
        metadata: {
          model: this.model,
          tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
          provider: 'claude'
        }
      };

    } catch (error) {
      logger.error('Claude caption generation failed:', error);
      throw new Error(`Claude caption generation failed: ${error.message}`);
    }
  }

  /**
   * Analyze content performance using Claude
   */
  async analyzeContent(request) {
    try {
      const { content, platform, metrics } = request;

      const systemPrompt = `You are a social media analytics expert. 
      Analyze the given content and provide insights on performance, engagement potential, and optimization suggestions.`;

      const userPrompt = `Analyze this ${platform} content: "${content}"
      
      Current metrics: ${JSON.stringify(metrics || {})}
      
      Provide analysis on:
      1. Engagement potential
      2. Content quality score (1-10)
      3. Optimization suggestions
      4. Target audience alignment
      5. Best posting times`;

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 500,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      return {
        success: true,
        analysis: response.content[0].text,
        metadata: {
          model: this.model,
          tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
          provider: 'claude'
        }
      };

    } catch (error) {
      logger.error('Claude content analysis failed:', error);
      throw new Error(`Claude content analysis failed: ${error.message}`);
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
   * Health check for Claude service
   */
  async healthCheck() {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Hello'
          }
        ]
      });

      return {
        success: true,
        status: 'healthy',
        provider: 'claude',
        model: this.model
      };
    } catch (error) {
      logger.error('Claude health check failed:', error);
      return {
        success: false,
        status: 'unhealthy',
        provider: 'claude',
        error: error.message
      };
    }
  }
}

module.exports = new ClaudeService();

