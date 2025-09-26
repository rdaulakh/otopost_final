const AgentOrchestrator = require('../agents/AgentOrchestrator');
const Workflow = require('../models/workflowModel');
const Business = require('../models/businessModel');

class EnhancedOrchestrator {
    constructor() {
        this.orchestrator = new AgentOrchestrator();
        this.activeWorkflows = new Map();
    }

    async startContentGenerationWorkflow(userId, businessId, options = {}) {
        const workflowId = `content_${Date.now()}_${userId}`;
        
        try {
            // Get business profile
            const businessProfile = await Business.findById(businessId);
            if (!businessProfile) {
                throw new Error('Business profile not found');
            }

            // Create workflow record
            const workflow = new Workflow({
                workflowId,
                userId: userId,
                business: businessId,
                type: 'content_generation',
                status: 'in_progress',
                input: {
                    businessProfile: businessProfile.toObject(),
                    options
                },
                steps: []
            });

            await workflow.save();
            this.activeWorkflows.set(workflowId, workflow);

            console.log(`[Enhanced Orchestrator] Starting content generation workflow ${workflowId}`);

            // Run the actual workflow
            const startTime = Date.now();
            const result = await this.orchestrator.runContentGenerationWorkflow(businessProfile);
            const endTime = Date.now();

            // Update workflow with results
            workflow.status = 'completed';
            workflow.result = result;
            workflow.summary = result.summary;
            workflow.metrics = {
                totalDuration: endTime - startTime,
                agentsUsed: 7,
                stepsCompleted: 7,
                successRate: 100
            };

            await workflow.save();
            this.activeWorkflows.delete(workflowId);

            console.log(`[Enhanced Orchestrator] Workflow ${workflowId} completed successfully`);
            return {
                workflowId,
                status: 'completed',
                result,
                metrics: workflow.metrics
            };

        } catch (error) {
            console.error(`[Enhanced Orchestrator] Workflow ${workflowId} failed:`, error);
            
            // Update workflow with error
            const workflow = this.activeWorkflows.get(workflowId);
            if (workflow) {
                workflow.status = 'failed';
                workflow.error = {
                    message: error.message,
                    stack: error.stack,
                    timestamp: new Date()
                };
                await workflow.save();
                this.activeWorkflows.delete(workflowId);
            }

            throw error;
        }
    }

    async startStrategyGenerationWorkflow(userId, businessId, options = {}) {
        const workflowId = `strategy_${Date.now()}_${userId}`;
        
        try {
            const businessProfile = await Business.findById(businessId);
            if (!businessProfile) {
                throw new Error('Business profile not found');
            }

            const workflow = new Workflow({
                workflowId,
                userId: userId,
                business: businessId,
                type: 'strategy_generation',
                status: 'in_progress',
                input: {
                    businessProfile: businessProfile.toObject(),
                    options
                },
                steps: []
            });

            await workflow.save();
            this.activeWorkflows.set(workflowId, workflow);

            console.log(`[Enhanced Orchestrator] Starting strategy generation workflow ${workflowId}`);

            const startTime = Date.now();
            const result = await this.orchestrator.runStrategyGenerationWorkflow(businessProfile);
            const endTime = Date.now();

            workflow.status = 'completed';
            workflow.result = result;
            workflow.summary = result.summary;
            workflow.metrics = {
                totalDuration: endTime - startTime,
                agentsUsed: 3,
                stepsCompleted: 6,
                successRate: 100
            };

            await workflow.save();
            this.activeWorkflows.delete(workflowId);

            return {
                workflowId,
                status: 'completed',
                result,
                metrics: workflow.metrics
            };

        } catch (error) {
            console.error(`[Enhanced Orchestrator] Strategy workflow ${workflowId} failed:`, error);
            
            const workflow = this.activeWorkflows.get(workflowId);
            if (workflow) {
                workflow.status = 'failed';
                workflow.error = {
                    message: error.message,
                    stack: error.stack,
                    timestamp: new Date()
                };
                await workflow.save();
                this.activeWorkflows.delete(workflowId);
            }

            throw error;
        }
    }

    async startPerformanceAnalysisWorkflow(userId, businessId, performanceData, options = {}) {
        const workflowId = `analysis_${Date.now()}_${userId}`;
        
        try {
            const businessProfile = await Business.findById(businessId);
            if (!businessProfile) {
                throw new Error('Business profile not found');
            }

            const workflow = new Workflow({
                workflowId,
                userId: userId,
                business: businessId,
                type: 'performance_analysis',
                status: 'in_progress',
                input: {
                    businessProfile: businessProfile.toObject(),
                    performanceData,
                    options
                },
                steps: []
            });

            await workflow.save();
            this.activeWorkflows.set(workflowId, workflow);

            console.log(`[Enhanced Orchestrator] Starting performance analysis workflow ${workflowId}`);

            const startTime = Date.now();
            const result = await this.orchestrator.runPerformanceAnalysisWorkflow(performanceData, businessProfile);
            const endTime = Date.now();

            workflow.status = 'completed';
            workflow.result = result;
            workflow.summary = result.summary;
            workflow.metrics = {
                totalDuration: endTime - startTime,
                agentsUsed: 2,
                stepsCompleted: 4,
                successRate: 100
            };

            await workflow.save();
            this.activeWorkflows.delete(workflowId);

            return {
                workflowId,
                status: 'completed',
                result,
                metrics: workflow.metrics
            };

        } catch (error) {
            console.error(`[Enhanced Orchestrator] Performance analysis workflow ${workflowId} failed:`, error);
            
            const workflow = this.activeWorkflows.get(workflowId);
            if (workflow) {
                workflow.status = 'failed';
                workflow.error = {
                    message: error.message,
                    stack: error.stack,
                    timestamp: new Date()
                };
                await workflow.save();
                this.activeWorkflows.delete(workflowId);
            }

            throw error;
        }
    }

    async getWorkflowStatus(workflowId) {
        try {
            const workflow = await Workflow.findOne({ workflowId })
                .populate('business', 'businessName industry')
                .populate('user', 'name email');
            
            if (!workflow) {
                throw new Error('Workflow not found');
            }

            return {
                workflowId: workflow.workflowId,
                type: workflow.type,
                status: workflow.status,
                progress: {
                    stepsCompleted: workflow.steps.length,
                    totalSteps: this.getTotalStepsForType(workflow.type),
                    percentage: (workflow.steps.length / this.getTotalStepsForType(workflow.type)) * 100
                },
                business: workflow.business,
                user: workflow.user,
                createdAt: workflow.createdAt,
                updatedAt: workflow.updatedAt,
                metrics: workflow.metrics,
                error: workflow.error
            };
        } catch (error) {
            console.error('Error getting workflow status:', error);
            throw error;
        }
    }

    async getUserWorkflowHistory(userId, limit = 10) {
        try {
            return await Workflow.getRecentWorkflows(userId, limit);
        } catch (error) {
            console.error('Error getting user workflow history:', error);
            throw error;
        }
    }

    async getUserWorkflowStats(userId) {
        try {
            const stats = await Workflow.getUserStats(userId);
            const totalWorkflows = await Workflow.countDocuments({ userId: userId });
            
            return {
                totalWorkflows,
                statusBreakdown: stats,
                recentActivity: await this.getUserWorkflowHistory(userId, 5)
            };
        } catch (error) {
            console.error('Error getting user workflow stats:', error);
            throw error;
        }
    }

    getAgentsStatus() {
        const orchestratorStatus = this.orchestrator.getAllAgentsStatus();
        return {
            ...orchestratorStatus,
            activeWorkflows: this.activeWorkflows.size,
            enhancedFeatures: {
                persistentStorage: true,
                workflowTracking: true,
                userAnalytics: true,
                errorRecovery: true
            }
        };
    }

    getTotalStepsForType(workflowType) {
        const stepCounts = {
            'content_generation': 7,
            'strategy_generation': 6,
            'performance_analysis': 4,
            'engagement_optimization': 5
        };
        return stepCounts[workflowType] || 5;
    }

    async cancelWorkflow(workflowId) {
        try {
            const workflow = await Workflow.findOne({ workflowId });
            if (!workflow) {
                throw new Error('Workflow not found');
            }

            if (workflow.status === 'completed' || workflow.status === 'failed') {
                throw new Error('Cannot cancel completed or failed workflow');
            }

            workflow.status = 'cancelled';
            await workflow.save();

            this.activeWorkflows.delete(workflowId);
            
            return { success: true, message: 'Workflow cancelled successfully' };
        } catch (error) {
            console.error('Error cancelling workflow:', error);
            throw error;
        }
    }
}

// Create singleton instance
const enhancedOrchestrator = new EnhancedOrchestrator();

module.exports = enhancedOrchestrator;
