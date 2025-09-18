const logger = require('../utils/logger');
const openaiService = require('../integrations/ai/openai');
const claudeService = require('../integrations/ai/claude');
const geminiService = require('../integrations/ai/gemini');
const azureOpenaiService = require('../integrations/ai/azure-openai');

/**
 * AI Service
 * Unified service for AI content generation and analysis
 */

class AIService {
  constructor() {
    this.providers = {
      openai: openaiService,
      claude: claudeService,
      gemini: geminiService,
      'azure-openai': azureOpenaiService
    };
    this.defaultProvider = process.env.DEFAULT_AI_PROVIDER || 'openai';
  }

  // Generate content using specified provider
  async generateContent(prompt, options = {}) {
    try {
      const {
        provider = this.defaultProvider,
        type = 'text',
        maxTokens = 1000,
        temperature = 0.7,
        model = null
      } = options;

      const aiProvider = this.providers[provider];
      if (!aiProvider) {
        throw new Error(`AI provider ${provider} not supported`);
      }

      logger.info(`Generating content with ${provider} provider`);

      let result;
      switch (type) {
        case 'text':
          result = await aiProvider.generateText(prompt, { maxTokens, temperature, model });
          break;
        case 'caption':
          result = await aiProvider.generateCaption(prompt, { maxTokens, temperature, model });
          break;
        case 'hashtags':
          result = await aiProvider.generateHashtags(prompt, { maxTokens, temperature, model });
          break;
        case 'post':
          result = await aiProvider.generatePost(prompt, { maxTokens, temperature, model });
          break;
        default:
          throw new Error(`Content type ${type} not supported`);
      }

      return {
        success: true,
        content: result,
        provider,
        type,
        metadata: {
          prompt,
          maxTokens,
          temperature,
          model: model || 'default'
        }
      };
    } catch (error) {
      logger.error('Error generating content:', error);
      return {
        success: false,
        error: error.message,
        provider: options.provider || this.defaultProvider
      };
    }
  }

  // Generate social media post
  async generateSocialMediaPost(topic, platform, options = {}) {
    try {
      const {
        provider = this.defaultProvider,
        tone = 'professional',
        length = 'medium',
        includeHashtags = true,
        includeCallToAction = true
      } = options;

      const prompt = this.buildPostPrompt(topic, platform, tone, length, includeCallToAction);
      
      const result = await this.generateContent(prompt, {
        provider,
        type: 'post',
        maxTokens: this.getMaxTokensForLength(length),
        temperature: 0.7
      });

      if (result.success && includeHashtags) {
        const hashtags = await this.generateHashtags(topic, platform, { provider });
        if (hashtags.success) {
          result.content += `\n\n${hashtags.content}`;
        }
      }

      return result;
    } catch (error) {
      logger.error('Error generating social media post:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate hashtags
  async generateHashtags(topic, platform, options = {}) {
    try {
      const { provider = this.defaultProvider, count = 10 } = options;

      const prompt = `Generate ${count} relevant hashtags for the topic "${topic}" on ${platform}. Return only the hashtags, one per line, without explanations.`;

      const result = await this.generateContent(prompt, {
        provider,
        type: 'hashtags',
        maxTokens: 200,
        temperature: 0.5
      });

      if (result.success) {
        const hashtags = result.content
          .split('\n')
          .map(tag => tag.trim())
          .filter(tag => tag.startsWith('#') && tag.length > 1)
          .slice(0, count);

        result.content = hashtags.join(' ');
      }

      return result;
    } catch (error) {
      logger.error('Error generating hashtags:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Analyze sentiment
  async analyzeSentiment(text, options = {}) {
    try {
      const { provider = this.defaultProvider } = options;

      const prompt = `Analyze the sentiment of the following text and provide a score from -1 (very negative) to 1 (very positive), along with a brief explanation:

"${text}"

Respond in JSON format: {"sentiment": number, "confidence": number, "explanation": "string"}`;

      const result = await this.generateContent(prompt, {
        provider,
        type: 'text',
        maxTokens: 200,
        temperature: 0.1
      });

      if (result.success) {
        try {
          const analysis = JSON.parse(result.content);
          return {
            success: true,
            sentiment: analysis.sentiment,
            confidence: analysis.confidence,
            explanation: analysis.explanation,
            provider
          };
        } catch (parseError) {
          logger.warn('Failed to parse sentiment analysis JSON:', parseError);
          return {
            success: false,
            error: 'Failed to parse sentiment analysis'
          };
        }
      }

      return result;
    } catch (error) {
      logger.error('Error analyzing sentiment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Optimize content for engagement
  async optimizeContentForEngagement(content, platform, options = {}) {
    try {
      const { provider = this.defaultProvider } = options;

      const prompt = `Optimize the following ${platform} content for maximum engagement. Provide suggestions for improvement while maintaining the original message:

"${content}"

Respond with the optimized content and a brief explanation of the changes made.`;

      const result = await this.generateContent(prompt, {
        provider,
        type: 'text',
        maxTokens: 500,
        temperature: 0.6
      });

      return result;
    } catch (error) {
      logger.error('Error optimizing content for engagement:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate content variations
  async generateContentVariations(originalContent, count = 3, options = {}) {
    try {
      const { provider = this.defaultProvider, platform = 'generic' } = options;

      const prompt = `Create ${count} different variations of the following ${platform} content. Each variation should maintain the core message but use different wording, structure, or approach:

"${originalContent}"

Provide each variation on a new line, numbered 1-${count}.`;

      const result = await this.generateContent(prompt, {
        provider,
        type: 'text',
        maxTokens: 800,
        temperature: 0.8
      });

      if (result.success) {
        const variations = result.content
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.match(/^\d+\./))
          .map(line => line.replace(/^\d+\.\s*/, ''));

        return {
          success: true,
          variations,
          original: originalContent,
          provider
        };
      }

      return result;
    } catch (error) {
      logger.error('Error generating content variations:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate content ideas
  async generateContentIdeas(topic, platform, count = 5, options = {}) {
    try {
      const { provider = this.defaultProvider, contentType = 'post' } = options;

      const prompt = `Generate ${count} creative content ideas for ${platform} about "${topic}". Each idea should be a ${contentType} concept that would engage the audience. Provide a brief title and description for each idea.

Format each idea as:
Title: [idea title]
Description: [brief description]`;

      const result = await this.generateContent(prompt, {
        provider,
        type: 'text',
        maxTokens: 1000,
        temperature: 0.8
      });

      if (result.success) {
        const ideas = this.parseContentIdeas(result.content);
        return {
          success: true,
          ideas,
          topic,
          platform,
          provider
        };
      }

      return result;
    } catch (error) {
      logger.error('Error generating content ideas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Translate content
  async translateContent(content, targetLanguage, options = {}) {
    try {
      const { provider = this.defaultProvider, sourceLanguage = 'auto' } = options;

      const prompt = `Translate the following text to ${targetLanguage}${sourceLanguage !== 'auto' ? ` from ${sourceLanguage}` : ''}. Maintain the original tone and style:

"${content}"`;

      const result = await this.generateContent(prompt, {
        provider,
        type: 'text',
        maxTokens: 500,
        temperature: 0.3
      });

      return {
        ...result,
        sourceLanguage,
        targetLanguage
      };
    } catch (error) {
      logger.error('Error translating content:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get available providers
  getAvailableProviders() {
    return Object.keys(this.providers).map(provider => ({
      id: provider,
      name: this.getProviderDisplayName(provider),
      available: this.isProviderAvailable(provider)
    }));
  }

  // Check if provider is available
  isProviderAvailable(provider) {
    try {
      const aiProvider = this.providers[provider];
      return aiProvider && aiProvider.isConfigured();
    } catch (error) {
      return false;
    }
  }

  // Get provider display name
  getProviderDisplayName(provider) {
    const names = {
      'openai': 'OpenAI GPT',
      'claude': 'Anthropic Claude',
      'gemini': 'Google Gemini',
      'azure-openai': 'Azure OpenAI'
    };
    return names[provider] || provider;
  }

  // Build post prompt
  buildPostPrompt(topic, platform, tone, length, includeCallToAction) {
    const lengthGuidelines = {
      short: 'Keep it concise (1-2 sentences)',
      medium: 'Write a medium-length post (2-3 sentences)',
      long: 'Write a detailed post (3-5 sentences)'
    };

    const platformGuidelines = {
      twitter: 'Write a tweet (280 characters max)',
      instagram: 'Write an Instagram post with engaging copy',
      facebook: 'Write a Facebook post that encourages engagement',
      linkedin: 'Write a professional LinkedIn post',
      tiktok: 'Write engaging TikTok caption',
      youtube: 'Write a YouTube video description'
    };

    let prompt = `Create a ${tone} ${platform} post about "${topic}". `;
    prompt += platformGuidelines[platform] || 'Write a social media post';
    prompt += `. ${lengthGuidelines[length] || lengthGuidelines.medium}`;
    
    if (includeCallToAction) {
      prompt += ' Include a call-to-action to encourage engagement.';
    }

    return prompt;
  }

  // Get max tokens for length
  getMaxTokensForLength(length) {
    const tokenMap = {
      short: 100,
      medium: 300,
      long: 500
    };
    return tokenMap[length] || 300;
  }

  // Parse content ideas from AI response
  parseContentIdeas(content) {
    const ideas = [];
    const lines = content.split('\n');
    
    let currentIdea = {};
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('Title:')) {
        if (currentIdea.title) {
          ideas.push(currentIdea);
        }
        currentIdea = {
          title: trimmedLine.replace('Title:', '').trim()
        };
      } else if (trimmedLine.startsWith('Description:')) {
        currentIdea.description = trimmedLine.replace('Description:', '').trim();
      }
    }
    
    if (currentIdea.title) {
      ideas.push(currentIdea);
    }
    
    return ideas;
  }

  // Get AI service statistics
  async getStatistics() {
    try {
      const stats = {
        providers: {},
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0
      };

      for (const [provider, service] of Object.entries(this.providers)) {
        if (service.getStatistics) {
          stats.providers[provider] = await service.getStatistics();
        }
      }

      return stats;
    } catch (error) {
      logger.error('Error getting AI service statistics:', error);
      return {
        error: error.message
      };
    }
  }
}

module.exports = new AIService();

