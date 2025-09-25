const { OpenAIClient } = require('@azure/openai');
const { AzureKeyCredential } = require('@azure/core-auth');
const logger = require('../../utils/logger');

class AzureOpenAIService {
  constructor() {
    this.client = new OpenAIClient(
      process.env.AZURE_OPENAI_ENDPOINT,
      new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY)
    );
    this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4';
    this.maxTokens = parseInt(process.env.AZURE_OPENAI_MAX_TOKENS) || 4000;
    this.temperature = parseFloat(process.env.AZURE_OPENAI_TEMPERATURE) || 0.7;
  }

  /**
   * Generate content using Azure OpenAI
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

      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ];

      const response = await this.client.getChatCompletions(
        this.deploymentName,
        messages,
        {
          maxTokens: this.maxTokens,
          temperature: this.temperature,
          topP: 0.95,
          frequencyPenalty: 0,
          presencePenalty: 0
        }
      );

      const executionTime = Date.now() - startTime;
      const content = response.choices[0].message.content;

      logger.info(`Azure OpenAI content generation completed in ${executionTime}ms`);

      return {
        success: true,
        content: content,
        metadata: {
          model: this.deploymentName,
          tokensUsed: response.usage.totalTokens,
          executionTime: executionTime,
          provider: 'azure-openai'
        }
      };

    } catch (error) {
      logger.error('Azure OpenAI content generation failed:', error);
      throw new Error(`Azure OpenAI content generation failed: ${error.message}`);
    }
  }

  /**
   * Generate hashtags using Azure OpenAI
   */
  async generateHashtags(request) {
    try {
      const { text, count = 10, trending = true, niche = '' } = request;

      const messages = [
        {
          role: 'system',
          content: `You are a social media marketing expert specializing in hashtag generation. 
          Generate ${count} relevant, trending hashtags for the given content. 
          ${trending ? 'Focus on currently trending hashtags.' : ''}
          ${niche ? `Target the ${niche} niche specifically.` : ''}
          Return only the hashtags, one per line, without explanations.`
        },
        {
          role: 'user',
          content: `Generate hashtags for this content: "${text}"`
        }
      ];

      const response = await this.client.getChatCompletions(
        this.deploymentName,
        messages,
        {
          maxTokens: 200,
          temperature: 0.8
        }
      );

      const hashtags = response.choices[0].message.content
        .split('\n')
        .map(tag => tag.trim())
        .filter(tag => tag.startsWith('#') && tag.length > 1)
        .slice(0, count);

      return {
        success: true,
        hashtags: hashtags,
        metadata: {
          model: this.deploymentName,
          tokensUsed: response.usage.totalTokens,
          provider: 'azure-openai'
        }
      };

    } catch (error) {
      logger.error('Azure OpenAI hashtag generation failed:', error);
      throw new Error(`Azure OpenAI hashtag generation failed: ${error.message}`);
    }
  }

  /**
   * Generate captions using Azure OpenAI
   */
  async generateCaption(request) {
    try {
      const { text, tone = 'engaging', length = 'short', keywords = '', platform = 'instagram' } = request;

      const messages = [
        {
          role: 'system',
          content: `You are an expert social media caption writer. 
          Create a ${length}, ${tone} caption for a ${platform} post. 
          ${keywords ? `Incorporate these keywords naturally: ${keywords}` : ''}
          Make it engaging and platform-appropriate.`
        },
        {
          role: 'user',
          content: `Generate a caption for: "${text}"`
        }
      ];

      const response = await this.client.getChatCompletions(
        this.deploymentName,
        messages,
        {
          maxTokens: 300,
          temperature: 0.8
        }
      );

      return {
        success: true,
        caption: response.choices[0].message.content.trim(),
        metadata: {
          model: this.deploymentName,
          tokensUsed: response.usage.totalTokens,
          provider: 'azure-openai'
        }
      };

    } catch (error) {
      logger.error('Azure OpenAI caption generation failed:', error);
      throw new Error(`Azure OpenAI caption generation failed: ${error.message}`);
    }
  }

  /**
   * Analyze content performance using Azure OpenAI
   */
  async analyzeContent(request) {
    try {
      const { content, platform, metrics } = request;

      const messages = [
        {
          role: 'system',
          content: `You are a social media analytics expert. 
          Analyze the given content and provide insights on performance, engagement potential, and optimization suggestions.`
        },
        {
          role: 'user',
          content: `Analyze this ${platform} content: "${content}"
          
          Current metrics: ${JSON.stringify(metrics || {})}
          
          Provide analysis on:
          1. Engagement potential (1-10)
          2. Content quality score (1-10)
          3. Optimization suggestions
          4. Target audience alignment
          5. Best posting times
          6. Hashtag recommendations
          7. Visual content suggestions`
        }
      ];

      const response = await this.client.getChatCompletions(
        this.deploymentName,
        messages,
        {
          maxTokens: 500,
          temperature: 0.3
        }
      );

      return {
        success: true,
        analysis: response.choices[0].message.content,
        metadata: {
          model: this.deploymentName,
          tokensUsed: response.usage.totalTokens,
          provider: 'azure-openai'
        }
      };

    } catch (error) {
      logger.error('Azure OpenAI content analysis failed:', error);
      throw new Error(`Azure OpenAI content analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate content variations using Azure OpenAI
   */
  async generateVariations(request) {
    try {
      const { content, count = 3, platforms = [] } = request;

      const messages = [
        {
          role: 'system',
          content: `You are a social media content optimization expert. 
          Create ${count} different variations of social media content for different platforms.`
        },
        {
          role: 'user',
          content: `Create ${count} different variations of this social media content for these platforms: ${platforms.join(', ')}.
          
          Original content: "${content}"
          
          For each variation:
          1. Adapt the tone and style for the specific platform
          2. Adjust the length appropriately
          3. Include platform-specific elements (hashtags, mentions, etc.)
          4. Maintain the core message but optimize for engagement
          
          Format as JSON with platform as key and content as value.`
        }
      ];

      const response = await this.client.getChatCompletions(
        this.deploymentName,
        messages,
        {
          maxTokens: 800,
          temperature: 0.7
        }
      );

      return {
        success: true,
        variations: response.choices[0].message.content,
        metadata: {
          model: this.deploymentName,
          tokensUsed: response.usage.totalTokens,
          provider: 'azure-openai'
        }
      };

    } catch (error) {
      logger.error('Azure OpenAI content variations failed:', error);
      throw new Error(`Azure OpenAI content variations failed: ${error.message}`);
    }
  }

  /**
   * Generate content strategy using Azure OpenAI
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

      const messages = [
        {
          role: 'system',
          content: `You are a social media strategy expert with extensive experience in digital marketing and content strategy.`
        },
        {
          role: 'user',
          content: `Create a comprehensive content strategy based on the following:
          
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
          8. Performance metrics to track
          9. Content calendar suggestions
          10. A/B testing recommendations`
        }
      ];

      const response = await this.client.getChatCompletions(
        this.deploymentName,
        messages,
        {
          maxTokens: 1000,
          temperature: 0.6
        }
      );

      return {
        success: true,
        strategy: response.choices[0].message.content,
        metadata: {
          model: this.deploymentName,
          tokensUsed: response.usage.totalTokens,
          provider: 'azure-openai'
        }
      };

    } catch (error) {
      logger.error('Azure OpenAI strategy generation failed:', error);
      throw new Error(`Azure OpenAI strategy generation failed: ${error.message}`);
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
   * Health check for Azure OpenAI service
   */
  async healthCheck() {
    try {
      const messages = [
        {
          role: 'user',
          content: 'Hello'
        }
      ];

      const response = await this.client.getChatCompletions(
        this.deploymentName,
        messages,
        {
          maxTokens: 10
        }
      );

      return {
        success: true,
        status: 'healthy',
        provider: 'azure-openai',
        model: this.deploymentName
      };
    } catch (error) {
      logger.error('Azure OpenAI health check failed:', error);
      return {
        success: false,
        status: 'unhealthy',
        provider: 'azure-openai',
        error: error.message
      };
    }
  }
}

module.exports = new AzureOpenAIService();

