const IntelligenceAgent = require('./IntelligenceAgent');
const StrategyAgent = require('./StrategyAgent');
const ContentAgent = require('./ContentAgent');
const ExecutionAgent = require('./ExecutionAgent');
const LearningAgent = require('./LearningAgent');
const EngagementAgent = require('./EngagementAgent');
const AnalyticsAgent = require('./AnalyticsAgent');

class AgentOrchestrator {
    constructor() {
        this.agents = {
            intelligence: new IntelligenceAgent(),
            strategy: new StrategyAgent(),
            content: new ContentAgent(),
            execution: new ExecutionAgent(),
            learning: new LearningAgent(),
            engagement: new EngagementAgent(),
            analytics: new AnalyticsAgent()
        };
        
        this.workflowHistory = [];
        this.isProcessing = false;
    }

    // Get status of all agents
    getAllAgentsStatus() {
        const status = {};
        Object.keys(this.agents).forEach(agentKey => {
            status[agentKey] = this.agents[agentKey].getStatus();
        });
        return {
            agents: status,
            orchestrator: {
                isProcessing: this.isProcessing,
                totalWorkflows: this.workflowHistory.length,
                lastActivity: this.workflowHistory.length > 0 
                    ? this.workflowHistory[this.workflowHistory.length - 1].timestamp 
                    : null
            }
        };
    }

    // Main content generation workflow
    async runContentGenerationWorkflow(businessProfile) {
        if (this.isProcessing) {
            throw new Error('Another workflow is currently in progress');
        }

        this.isProcessing = true;
        const workflowId = `workflow_${Date.now()}`;
        
        try {
            console.log(`[Orchestrator] Starting content generation workflow ${workflowId}`);
            
            const workflow = {
                id: workflowId,
                type: 'content_generation',
                timestamp: new Date(),
                steps: [],
                businessProfile
            };

            // Step 1: Intelligence Agent - Market Analysis
            console.log('[Orchestrator] Step 1/7: Running Intelligence Agent...');
            const marketInsights = await this.agents.intelligence.analyzeMarketTrends(businessProfile);
            workflow.steps.push({ step: 1, agent: 'intelligence', result: 'market_insights', timestamp: new Date() });

            // Step 2: Strategy Agent - Create Content Strategy
            console.log('[Orchestrator] Step 2/7: Running Strategy Agent...');
            const contentStrategy = await this.agents.strategy.createContentStrategy(businessProfile, marketInsights);
            workflow.steps.push({ step: 2, agent: 'strategy', result: 'content_strategy', timestamp: new Date() });

            // Step 3: Content Agent - Generate Content Ideas
            console.log('[Orchestrator] Step 3/7: Running Content Agent...');
            const contentIdeas = await this.agents.content.generateContentIdeas(contentStrategy, contentStrategy.pillars, 5);
            workflow.steps.push({ step: 3, agent: 'content', result: 'content_ideas', timestamp: new Date() });

            // Step 4: Content Agent - Create Posts
            console.log('[Orchestrator] Step 4/7: Creating complete posts...');
            const generatedPosts = [];
            for (const idea of contentIdeas.ideas.slice(0, 3)) { // Limit to 3 posts for performance
                const post = await this.agents.content.createPost(idea, 'instagram', contentStrategy.brandVoice);
                generatedPosts.push({
                    ...post,
                    idea: idea.title,
                    contentPillar: idea.contentPillar,
                    targetAudience: idea.targetAudience
                });
            }
            workflow.steps.push({ step: 4, agent: 'content', result: 'generated_posts', timestamp: new Date() });

            // Step 5: Execution Agent - Optimize Scheduling
            console.log('[Orchestrator] Step 5/7: Running Execution Agent...');
            const audienceInsights = await this.agents.intelligence.analyzeAudienceInsights(businessProfile);
            const schedulingPlan = await this.agents.execution.optimizePostingSchedule(
                { posts: generatedPosts }, 
                audienceInsights, 
                { platform: 'instagram' }
            );
            workflow.steps.push({ step: 5, agent: 'execution', result: 'scheduling_plan', timestamp: new Date() });

            // Step 6: Engagement Agent - Create Engagement Strategy
            console.log('[Orchestrator] Step 6/7: Running Engagement Agent...');
            const engagementStrategy = await this.agents.engagement.createEngagementStrategy(
                audienceInsights, 
                contentStrategy, 
                ['instagram']
            );
            workflow.steps.push({ step: 6, agent: 'engagement', result: 'engagement_strategy', timestamp: new Date() });

            // Step 7: Analytics Agent - Setup Performance Tracking
            console.log('[Orchestrator] Step 7/7: Running Analytics Agent...');
            const trackingSetup = await this.agents.analytics.createMetricsDashboard(
                contentStrategy.kpis, 
                { platform: 'instagram' }, 
                ['content_manager', 'marketing_director']
            );
            workflow.steps.push({ step: 7, agent: 'analytics', result: 'tracking_setup', timestamp: new Date() });

            // Compile final result
            const result = {
                workflowId,
                businessProfile,
                marketInsights,
                contentStrategy,
                generatedPosts,
                schedulingPlan,
                engagementStrategy,
                trackingSetup,
                summary: {
                    postsGenerated: generatedPosts.length,
                    contentPillars: contentStrategy.pillars?.length || 0,
                    platforms: ['instagram'],
                    estimatedReach: schedulingPlan.estimatedReach || 'TBD',
                    nextSteps: [
                        'Review and approve generated content',
                        'Schedule posts according to optimization plan',
                        'Monitor engagement and adjust strategy',
                        'Analyze performance after 1 week'
                    ]
                }
            };

            workflow.result = result;
            workflow.status = 'completed';
            workflow.completedAt = new Date();
            
            this.workflowHistory.push(workflow);
            this.isProcessing = false;

            console.log(`[Orchestrator] Workflow ${workflowId} completed successfully`);
            return result;

        } catch (error) {
            this.isProcessing = false;
            console.error(`[Orchestrator] Workflow ${workflowId} failed:`, error);
            
            const failedWorkflow = {
                id: workflowId,
                type: 'content_generation',
                timestamp: new Date(),
                status: 'failed',
                error: error.message,
                businessProfile
            };
            
            this.workflowHistory.push(failedWorkflow);
            throw new Error(`Content generation workflow failed: ${error.message}`);
        }
    }

    // Strategy-only workflow
    async runStrategyGenerationWorkflow(businessProfile) {
        if (this.isProcessing) {
            throw new Error('Another workflow is currently in progress');
        }

        this.isProcessing = true;
        const workflowId = `strategy_${Date.now()}`;
        
        try {
            console.log(`[Orchestrator] Starting strategy generation workflow ${workflowId}`);

            // Intelligence + Strategy agents collaboration
            const marketInsights = await this.agents.intelligence.analyzeMarketTrends(businessProfile);
            const competitorAnalysis = await this.agents.intelligence.analyzeCompetitors(businessProfile);
            const audienceInsights = await this.agents.intelligence.analyzeAudienceInsights(businessProfile);
            
            const contentStrategy = await this.agents.strategy.createContentStrategy(businessProfile, marketInsights);
            const brandVoice = await this.agents.strategy.defineBrandVoice(businessProfile, audienceInsights);
            const contentPillars = await this.agents.strategy.createContentPillars(businessProfile, contentStrategy);

            const result = {
                workflowId,
                marketInsights,
                competitorAnalysis,
                audienceInsights,
                contentStrategy,
                brandVoice,
                contentPillars,
                summary: {
                    strategicFocus: contentStrategy.strategy?.focus || 'Brand awareness and engagement',
                    targetPlatforms: contentStrategy.platforms || ['instagram', 'linkedin'],
                    contentPillars: contentPillars.pillars?.length || 0,
                    recommendedFrequency: contentStrategy.contentMix?.frequency || 'Daily'
                }
            };

            this.isProcessing = false;
            console.log(`[Orchestrator] Strategy workflow ${workflowId} completed`);
            return result;

        } catch (error) {
            this.isProcessing = false;
            console.error(`[Orchestrator] Strategy workflow ${workflowId} failed:`, error);
            throw new Error(`Strategy generation workflow failed: ${error.message}`);
        }
    }

    // Performance analysis workflow
    async runPerformanceAnalysisWorkflow(performanceData, businessProfile) {
        if (this.isProcessing) {
            throw new Error('Another workflow is currently in progress');
        }

        this.isProcessing = true;
        const workflowId = `analysis_${Date.now()}`;
        
        try {
            console.log(`[Orchestrator] Starting performance analysis workflow ${workflowId}`);

            // Learning + Analytics agents collaboration
            const performanceAnalysis = await this.agents.learning.analyzeContentPerformance(performanceData, {});
            const optimizationRecommendations = await this.agents.learning.generateOptimizationRecommendations(
                performanceAnalysis, 
                businessProfile
            );
            
            const roiAnalysis = await this.agents.analytics.analyzeROI(
                performanceData, 
                { adSpend: 0, timeInvestment: 40 }, 
                { revenue: 10000, leads: 50 }
            );
            
            const performanceReport = await this.agents.analytics.generatePerformanceReport(
                performanceData, 
                '30d', 
                { engagement: 5, reach: 10000, conversions: 20 }
            );

            const result = {
                workflowId,
                performanceAnalysis,
                optimizationRecommendations,
                roiAnalysis,
                performanceReport,
                summary: {
                    overallPerformance: 'Good',
                    keyWins: performanceAnalysis.topPerformers || [],
                    improvementAreas: optimizationRecommendations.opportunities || [],
                    roi: roiAnalysis.directROI || 'Positive'
                }
            };

            this.isProcessing = false;
            console.log(`[Orchestrator] Performance analysis workflow ${workflowId} completed`);
            return result;

        } catch (error) {
            this.isProcessing = false;
            console.error(`[Orchestrator] Performance analysis workflow ${workflowId} failed:`, error);
            throw new Error(`Performance analysis workflow failed: ${error.message}`);
        }
    }

    // Get workflow history
    getWorkflowHistory(limit = 10) {
        return this.workflowHistory
            .slice(-limit)
            .reverse()
            .map(workflow => ({
                id: workflow.id,
                type: workflow.type,
                timestamp: workflow.timestamp,
                status: workflow.status || 'completed',
                stepsCompleted: workflow.steps?.length || 0,
                error: workflow.error
            }));
    }

    // Get specific agent
    getAgent(agentName) {
        return this.agents[agentName];
    }
}

module.exports = AgentOrchestrator;
