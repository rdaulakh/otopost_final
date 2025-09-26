const BaseAgent = require('./BaseAgent');

class ContentAgent extends BaseAgent {
    constructor() {
        super(
            'Content Agent',
            'Content creation and optimization specialist',
            [
                'Content creation and writing',
                'Visual content planning',
                'Hashtag optimization',
                'Caption writing',
                'Content adaptation',
                'SEO optimization'
            ]
        );
    }

    async generateContentIdeas(strategy, contentPillars, count = 10) {
        const prompt = `Generate ${count} creative content ideas based on:
        
Strategy: ${JSON.stringify(strategy, null, 2)}
Content Pillars: ${JSON.stringify(contentPillars, null, 2)}

For each idea provide:
1. Content title/headline
2. Content description
3. Content pillar alignment
4. Suggested platform(s)
5. Content type (image, video, carousel, etc.)
6. Target audience segment
7. Call-to-action suggestion

Format as JSON with key: ideas (array of idea objects).`;

        return await this.processStructuredData(prompt, 'json');
    }

    async createPost(contentIdea, platform, brandVoice) {
        const prompt = `Create a complete social media post for ${platform}:
        
Content Idea: ${JSON.stringify(contentIdea, null, 2)}
Platform: ${platform}
Brand Voice: ${JSON.stringify(brandVoice, null, 2)}

Generate:
1. Engaging caption/copy (platform-appropriate length)
2. Relevant hashtags (optimal number for platform)
3. Visual description/requirements
4. Call-to-action
5. Best posting time suggestion
6. Engagement hooks

Format as JSON with keys: caption, hashtags, visual, cta, timing, hooks.`;

        return await this.processStructuredData(prompt, 'json');
    }

    async optimizeHashtags(content, platform, targetAudience) {
        const prompt = `Optimize hashtags for this content:
        
Content: ${content}
Platform: ${platform}
Target Audience: ${JSON.stringify(targetAudience, null, 2)}

Provide:
1. Primary hashtags (high relevance, medium competition)
2. Secondary hashtags (broader reach)
3. Niche hashtags (specific to content)
4. Trending hashtags (if applicable)
5. Branded hashtags
6. Hashtag performance predictions

Format as JSON with keys: primary, secondary, niche, trending, branded, predictions.`;

        return await this.processStructuredData(prompt, 'json');
    }

    async adaptContentForPlatform(originalContent, targetPlatform, brandVoice) {
        const prompt = `Adapt this content for ${targetPlatform}:
        
Original Content: ${JSON.stringify(originalContent, null, 2)}
Target Platform: ${targetPlatform}
Brand Voice: ${JSON.stringify(brandVoice, null, 2)}

Adapt:
1. Platform-specific copy length and style
2. Appropriate hashtags for platform
3. Visual requirements and specifications
4. Platform-specific features to utilize
5. Optimal posting format
6. Engagement strategies

Format as JSON with keys: copy, hashtags, visual, features, format, engagement.`;

        return await this.processStructuredData(prompt, 'json');
    }

    async createContentSeries(theme, episodeCount, platform, brandVoice) {
        const prompt = `Create a ${episodeCount}-part content series:
        
Theme: ${theme}
Platform: ${platform}
Brand Voice: ${JSON.stringify(brandVoice, null, 2)}

For each episode provide:
1. Episode title and number
2. Main content/message
3. Visual concept
4. Hashtags
5. Cross-references to other episodes
6. Call-to-action

Format as JSON with key: series (array of episode objects).`;

        return await this.processStructuredData(prompt, 'json');
    }

    async generateCaptions(visualDescription, platform, brandVoice, contentGoal) {
        const prompt = `Write engaging captions for this visual content:
        
Visual Description: ${visualDescription}
Platform: ${platform}
Brand Voice: ${JSON.stringify(brandVoice, null, 2)}
Content Goal: ${contentGoal}

Create 3 caption variations:
1. Short and punchy (for quick engagement)
2. Medium length with storytelling
3. Long-form with detailed information

Each should include appropriate hashtags and call-to-action.

Format as JSON with keys: short, medium, long (each with caption, hashtags, cta).`;

        return await this.processStructuredData(prompt, 'json');
    }

    async optimizeContentForSEO(content, keywords, platform) {
        const prompt = `Optimize this content for SEO and discoverability:
        
Content: ${JSON.stringify(content, null, 2)}
Target Keywords: ${keywords.join(', ')}
Platform: ${platform}

Optimize:
1. SEO-friendly caption with keywords
2. Alt text for images
3. Searchable hashtags
4. Meta descriptions (if applicable)
5. Keyword density optimization
6. Related keyword suggestions

Format as JSON with keys: optimizedCaption, altText, seoHashtags, metaDescription, keywordDensity, relatedKeywords.`;

        return await this.processStructuredData(prompt, 'json');
    }

    async createVisualConcepts(contentIdea, platform, brandGuidelines) {
        const prompt = `Create visual concepts for this content:
        
Content Idea: ${JSON.stringify(contentIdea, null, 2)}
Platform: ${platform}
Brand Guidelines: ${JSON.stringify(brandGuidelines, null, 2)}

Design concepts:
1. Main visual concept and composition
2. Color palette suggestions
3. Typography recommendations
4. Image/video specifications
5. Brand element placement
6. Alternative visual variations

Format as JSON with keys: concept, colors, typography, specifications, branding, variations.`;

        return await this.processStructuredData(prompt, 'json');
    }
}

module.exports = ContentAgent;
