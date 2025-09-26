const BaseAgent = require('./BaseAgent');

class IntelligenceAgent extends BaseAgent {
    constructor() {
        super(
            'Intelligence Agent',
            'Data analysis and market insights specialist',
            [
                'Market trend analysis',
                'Competitor research',
                'Audience insights',
                'Performance data analysis',
                'Industry intelligence',
                'Data pattern recognition'
            ]
        );
    }

    async analyzeMarketTrends(businessProfile) {
        const prompt = `Analyze current market trends for a business with the following profile:
        
Business Details:
- Industry: ${businessProfile.industry || 'Not specified'}
- Target Audience: ${businessProfile.targetAudience || 'Not specified'}
- Business Type: ${businessProfile.businessType || 'Not specified'}
- Location: ${businessProfile.location || 'Global'}

Please provide:
1. Top 3 current market trends relevant to this business
2. Emerging opportunities in their industry
3. Potential challenges or threats
4. Recommended focus areas for social media strategy

Format your response as a JSON object with keys: trends, opportunities, challenges, recommendations.`;

        return await this.processStructuredData(prompt, 'json');
    }

    async analyzeCompetitors(businessProfile, competitors = []) {
        const prompt = `Analyze competitors for this business profile:
        
Business: ${JSON.stringify(businessProfile, null, 2)}
Known Competitors: ${competitors.length > 0 ? competitors.join(', ') : 'None specified'}

Provide:
1. Competitive landscape analysis
2. Content strategy gaps and opportunities
3. Unique positioning recommendations
4. Social media platform priorities

Format as JSON with keys: landscape, gaps, positioning, platforms.`;

        return await this.processStructuredData(prompt, 'json');
    }

    async analyzeAudienceInsights(businessProfile) {
        const prompt = `Generate detailed audience insights for this business:
        
${JSON.stringify(businessProfile, null, 2)}

Provide:
1. Primary audience demographics and psychographics
2. Content preferences and consumption patterns
3. Optimal posting times and frequency
4. Engagement triggers and pain points
5. Platform-specific audience behaviors

Format as JSON with keys: demographics, preferences, timing, triggers, behaviors.`;

        return await this.processStructuredData(prompt, 'json');
    }

    async analyzePerformanceData(performanceMetrics) {
        const prompt = `Analyze the following social media performance data and provide insights:
        
Performance Data: ${JSON.stringify(performanceMetrics, null, 2)}

Provide:
1. Key performance insights and trends
2. Content types that perform best
3. Engagement patterns and optimal timing
4. Areas for improvement
5. Strategic recommendations

Format as JSON with keys: insights, topContent, patterns, improvements, recommendations.`;

        return await this.processStructuredData(prompt, 'json');
    }

    async generateIndustryIntelligence(industry, timeframe = '30d') {
        const prompt = `Generate comprehensive industry intelligence for the ${industry} sector over the last ${timeframe}:

Provide:
1. Industry-specific trends and developments
2. Key influencers and thought leaders
3. Popular content themes and formats
4. Seasonal patterns and opportunities
5. Regulatory or market changes affecting social media strategy

Format as JSON with keys: trends, influencers, themes, patterns, changes.`;

        return await this.processStructuredData(prompt, 'json');
    }

    async identifyContentOpportunities(businessProfile, currentContent = []) {
        const prompt = `Based on this business profile and current content, identify new content opportunities:
        
Business Profile: ${JSON.stringify(businessProfile, null, 2)}
Current Content Themes: ${currentContent.join(', ') || 'None specified'}

Identify:
1. Untapped content categories
2. Trending topics relevant to the business
3. Content gaps in their current strategy
4. Viral content opportunities
5. Educational content possibilities

Format as JSON with keys: categories, trending, gaps, viral, educational.`;

        return await this.processStructuredData(prompt, 'json');
    }
}

module.exports = IntelligenceAgent;
