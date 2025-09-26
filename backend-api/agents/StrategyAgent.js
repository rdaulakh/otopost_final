const BaseAgent = require('./BaseAgent');

class StrategyAgent extends BaseAgent {
    constructor() {
        super(
            'Strategy Agent',
            'Content strategy planning and optimization specialist',
            [
                'Content strategy development',
                'Campaign planning',
                'Brand voice definition',
                'Content calendar creation',
                'Platform-specific strategies',
                'Goal alignment and KPI setting'
            ]
        );
    }

    async createContentStrategy(businessProfile, marketInsights) {
        const prompt = `Create a comprehensive content strategy based on:
        
Business Profile: ${JSON.stringify(businessProfile, null, 2)}
Market Insights: ${JSON.stringify(marketInsights, null, 2)}

Develop:
1. Overall content strategy and objectives
2. Brand voice and tone guidelines
3. Content pillars and themes (4-6 main pillars)
4. Platform-specific strategies
5. Content mix and posting frequency
6. Key performance indicators (KPIs)

Format as JSON with keys: strategy, brandVoice, pillars, platforms, contentMix, kpis.`;

        return await this.processStructuredData(prompt, 'json');
    }

    async planContentCalendar(strategy, timeframe = '30d') {
        const prompt = `Create a detailed content calendar for ${timeframe} based on this strategy:
        
Strategy: ${JSON.stringify(strategy, null, 2)}

Generate:
1. Daily content themes and topics
2. Platform-specific content distribution
3. Special events and seasonal content
4. Content types and formats for each day
5. Hashtag strategies for each post
6. Optimal posting times

Format as JSON with keys: calendar (array of daily plans), themes, distribution, events, formats, hashtags, timing.`;

        return await this.processStructuredData(prompt, 'json');
    }

    async optimizeStrategy(currentStrategy, performanceData) {
        const prompt = `Optimize this content strategy based on performance data:
        
Current Strategy: ${JSON.stringify(currentStrategy, null, 2)}
Performance Data: ${JSON.stringify(performanceData, null, 2)}

Provide:
1. Strategy optimization recommendations
2. Content pillar adjustments
3. Platform priority changes
4. Posting frequency modifications
5. New content opportunities
6. Updated KPIs and goals

Format as JSON with keys: optimizations, pillarAdjustments, platformChanges, frequencyChanges, opportunities, updatedKpis.`;

        return await this.processStructuredData(prompt, 'json');
    }

    async createCampaignStrategy(businessProfile, campaignGoals, duration) {
        const prompt = `Create a focused campaign strategy:
        
Business Profile: ${JSON.stringify(businessProfile, null, 2)}
Campaign Goals: ${JSON.stringify(campaignGoals, null, 2)}
Duration: ${duration}

Develop:
1. Campaign theme and messaging
2. Content series and storyline
3. Platform-specific tactics
4. Engagement strategies
5. Hashtag and keyword strategy
6. Success metrics and tracking

Format as JSON with keys: theme, messaging, series, tactics, engagement, hashtags, metrics.`;

        return await this.processStructuredData(prompt, 'json');
    }

    async defineBrandVoice(businessProfile, targetAudience) {
        const prompt = `Define a comprehensive brand voice for:
        
Business Profile: ${JSON.stringify(businessProfile, null, 2)}
Target Audience: ${JSON.stringify(targetAudience, null, 2)}

Create:
1. Brand personality traits (5-7 key traits)
2. Tone of voice guidelines
3. Communication style preferences
4. Do's and don'ts for content
5. Example phrases and language patterns
6. Platform-specific voice adaptations

Format as JSON with keys: personality, tone, style, guidelines, examples, adaptations.`;

        return await this.processStructuredData(prompt, 'json');
    }

    async createContentPillars(businessProfile, strategy) {
        const prompt = `Create detailed content pillars for this business:
        
Business Profile: ${JSON.stringify(businessProfile, null, 2)}
Strategy Context: ${JSON.stringify(strategy, null, 2)}

Develop 4-6 content pillars with:
1. Pillar name and description
2. Content themes and topics
3. Content types and formats
4. Target audience for each pillar
5. Posting frequency and timing
6. Success metrics

Format as JSON with keys: pillars (array of pillar objects with name, description, themes, types, audience, frequency, metrics).`;

        return await this.processStructuredData(prompt, 'json');
    }

    async planInfluencerStrategy(businessProfile, budget, goals) {
        const prompt = `Create an influencer collaboration strategy:
        
Business Profile: ${JSON.stringify(businessProfile, null, 2)}
Budget Range: ${budget}
Goals: ${JSON.stringify(goals, null, 2)}

Plan:
1. Influencer tier strategy (micro, macro, mega)
2. Content collaboration types
3. Platform priorities
4. Campaign themes and messaging
5. Performance tracking methods
6. Budget allocation recommendations

Format as JSON with keys: tiers, collaborations, platforms, themes, tracking, budget.`;

        return await this.processStructuredData(prompt, 'json');
    }
}

module.exports = StrategyAgent;
