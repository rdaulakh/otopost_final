const { ChromaClient } = require('chromadb');
const logger = require('../utils/logger');

class ChromaSetup {
  constructor() {
    this.client = null;
    this.collections = new Map();
    this.isConnected = false;
    this.serverUrl = process.env.CHROMA_SERVER_URL || 'http://localhost:8000';
  }

  async initialize() {
    try {
      logger.info('Initializing Chroma vector database...');

      // Create Chroma client
      await this.createClient();
      
      // Setup collections for AI agents
      await this.setupCollections();
      
      // Initialize embedding functions
      await this.setupEmbeddingFunctions();

      logger.info('Chroma setup completed successfully');
      return true;
    } catch (error) {
      logger.logError(error, { context: 'Chroma setup failed' });
      throw error;
    }
  }

  async createClient() {
    try {
      this.client = new ChromaClient({
        path: this.serverUrl
      });

      // Test connection
      const version = await this.client.version();
      logger.info(`Connected to Chroma server version: ${version}`);
      
      this.isConnected = true;
    } catch (error) {
      logger.logError(error, { context: 'Failed to connect to Chroma server' });
      
      // If Chroma server is not running, provide setup instructions
      if (error.code === 'ECONNREFUSED') {
        logger.warn('Chroma server is not running. To start Chroma server:');
        logger.warn('1. Install Chroma: pip install chromadb');
        logger.warn('2. Start server: chroma run --host 0.0.0.0 --port 8000');
        logger.warn('3. Or use Docker: docker run -p 8000:8000 chromadb/chroma');
      }
      
      throw error;
    }
  }

  async setupCollections() {
    logger.info('Setting up Chroma collections for AI agents...');

    const agentTypes = [
      'intelligence_agent',
      'strategy_agent',
      'content_agent',
      'execution_agent',
      'learning_agent',
      'engagement_agent',
      'analytics_agent'
    ];

    const collectionConfigs = {
      // Agent memory collections
      agent_memory: {
        name: 'agent_memory',
        metadata: {
          description: 'Long-term memory for AI agents',
          hnsw_space: 'cosine'
        },
        embedding_function: 'default'
      },
      
      // Conversation history
      conversation_history: {
        name: 'conversation_history',
        metadata: {
          description: 'Conversation history for context',
          hnsw_space: 'cosine'
        },
        embedding_function: 'default'
      },
      
      // Knowledge base
      knowledge_base: {
        name: 'knowledge_base',
        metadata: {
          description: 'Organizational knowledge and best practices',
          hnsw_space: 'cosine'
        },
        embedding_function: 'default'
      },
      
      // Content templates
      content_templates: {
        name: 'content_templates',
        metadata: {
          description: 'Content templates and examples',
          hnsw_space: 'cosine'
        },
        embedding_function: 'default'
      },
      
      // Performance patterns
      performance_patterns: {
        name: 'performance_patterns',
        metadata: {
          description: 'Learned performance patterns and insights',
          hnsw_space: 'cosine'
        },
        embedding_function: 'default'
      }
    };

    for (const [key, config] of Object.entries(collectionConfigs)) {
      try {
        // Try to get existing collection
        let collection;
        try {
          collection = await this.client.getCollection({
            name: config.name
          });
          logger.info(`Collection '${config.name}' already exists`);
        } catch (error) {
          // Collection doesn't exist, create it
          collection = await this.client.createCollection({
            name: config.name,
            metadata: config.metadata
          });
          logger.info(`Created collection '${config.name}'`);
        }
        
        this.collections.set(key, collection);
      } catch (error) {
        logger.logError(error, { 
          context: `Failed to setup collection '${config.name}'` 
        });
      }
    }

    logger.info(`Setup ${this.collections.size} Chroma collections`);
  }

  async setupEmbeddingFunctions() {
    logger.info('Setting up embedding functions...');
    
    // Note: ChromaDB uses default embedding function (sentence-transformers)
    // For production, you might want to use custom embedding models
    
    const embeddingConfig = {
      model: 'all-MiniLM-L6-v2', // Default sentence transformer model
      dimensions: 384, // Dimensions for the default model
      maxTokens: 512
    };

    // Store embedding configuration for reference
    try {
      const configCollection = this.collections.get('agent_memory');
      if (configCollection) {
        await configCollection.add({
          ids: ['embedding_config'],
          documents: [JSON.stringify(embeddingConfig)],
          metadatas: [{
            type: 'system_config',
            created_at: new Date().toISOString()
          }]
        });
      }
    } catch (error) {
      logger.logError(error, { context: 'Failed to store embedding config' });
    }

    logger.info('Embedding functions setup completed');
  }

  // AI Agent Memory Operations
  async storeAgentMemory(organizationId, agentType, memory) {
    try {
      const collection = this.collections.get('agent_memory');
      if (!collection) {
        throw new Error('Agent memory collection not found');
      }

      const memoryId = `${organizationId}_${agentType}_${Date.now()}`;
      
      await collection.add({
        ids: [memoryId],
        documents: [memory.content],
        metadatas: [{
          organization_id: organizationId,
          agent_type: agentType,
          memory_type: memory.type,
          importance: memory.importance || 0.5,
          created_at: new Date().toISOString(),
          ...memory.metadata
        }]
      });

      logger.info(`Stored memory for ${agentType} in organization ${organizationId}`);
      return memoryId;
    } catch (error) {
      logger.logError(error, { 
        context: 'Failed to store agent memory',
        organizationId,
        agentType 
      });
      return null;
    }
  }

  async retrieveAgentMemory(organizationId, agentType, query, limit = 10) {
    try {
      const collection = this.collections.get('agent_memory');
      if (!collection) {
        throw new Error('Agent memory collection not found');
      }

      const results = await collection.query({
        queryTexts: [query],
        nResults: limit,
        where: {
          organization_id: organizationId,
          agent_type: agentType
        }
      });

      return results.documents[0]?.map((doc, index) => ({
        content: doc,
        metadata: results.metadatas[0][index],
        distance: results.distances[0][index],
        id: results.ids[0][index]
      })) || [];
    } catch (error) {
      logger.logError(error, { 
        context: 'Failed to retrieve agent memory',
        organizationId,
        agentType,
        query 
      });
      return [];
    }
  }

  // Conversation History Operations
  async storeConversation(organizationId, agentType, conversation) {
    try {
      const collection = this.collections.get('conversation_history');
      if (!collection) {
        throw new Error('Conversation history collection not found');
      }

      const conversationId = `${organizationId}_${agentType}_conv_${Date.now()}`;
      
      await collection.add({
        ids: [conversationId],
        documents: [conversation.content],
        metadatas: [{
          organization_id: organizationId,
          agent_type: agentType,
          user_id: conversation.userId,
          session_id: conversation.sessionId,
          turn_count: conversation.turnCount || 1,
          created_at: new Date().toISOString()
        }]
      });

      return conversationId;
    } catch (error) {
      logger.logError(error, { 
        context: 'Failed to store conversation',
        organizationId,
        agentType 
      });
      return null;
    }
  }

  async getConversationHistory(organizationId, agentType, sessionId, limit = 20) {
    try {
      const collection = this.collections.get('conversation_history');
      if (!collection) {
        throw new Error('Conversation history collection not found');
      }

      const results = await collection.get({
        where: {
          organization_id: organizationId,
          agent_type: agentType,
          session_id: sessionId
        },
        limit: limit
      });

      return results.documents?.map((doc, index) => ({
        content: doc,
        metadata: results.metadatas[index],
        id: results.ids[index]
      })) || [];
    } catch (error) {
      logger.logError(error, { 
        context: 'Failed to get conversation history',
        organizationId,
        agentType,
        sessionId 
      });
      return [];
    }
  }

  // Knowledge Base Operations
  async storeKnowledge(organizationId, knowledge) {
    try {
      const collection = this.collections.get('knowledge_base');
      if (!collection) {
        throw new Error('Knowledge base collection not found');
      }

      const knowledgeId = `${organizationId}_kb_${Date.now()}`;
      
      await collection.add({
        ids: [knowledgeId],
        documents: [knowledge.content],
        metadatas: [{
          organization_id: organizationId,
          topic: knowledge.topic,
          category: knowledge.category,
          source: knowledge.source,
          confidence: knowledge.confidence || 0.8,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]
      });

      return knowledgeId;
    } catch (error) {
      logger.logError(error, { 
        context: 'Failed to store knowledge',
        organizationId 
      });
      return null;
    }
  }

  async searchKnowledge(organizationId, query, category = null, limit = 5) {
    try {
      const collection = this.collections.get('knowledge_base');
      if (!collection) {
        throw new Error('Knowledge base collection not found');
      }

      const whereClause = { organization_id: organizationId };
      if (category) {
        whereClause.category = category;
      }

      const results = await collection.query({
        queryTexts: [query],
        nResults: limit,
        where: whereClause
      });

      return results.documents[0]?.map((doc, index) => ({
        content: doc,
        metadata: results.metadatas[0][index],
        relevance: 1 - results.distances[0][index], // Convert distance to relevance
        id: results.ids[0][index]
      })) || [];
    } catch (error) {
      logger.logError(error, { 
        context: 'Failed to search knowledge',
        organizationId,
        query 
      });
      return [];
    }
  }

  // Content Template Operations
  async storeContentTemplate(organizationId, template) {
    try {
      const collection = this.collections.get('content_templates');
      if (!collection) {
        throw new Error('Content templates collection not found');
      }

      const templateId = `${organizationId}_template_${Date.now()}`;
      
      await collection.add({
        ids: [templateId],
        documents: [template.content],
        metadatas: [{
          organization_id: organizationId,
          template_type: template.type,
          platform: template.platform,
          category: template.category,
          performance_score: template.performanceScore || 0,
          usage_count: 0,
          created_at: new Date().toISOString()
        }]
      });

      return templateId;
    } catch (error) {
      logger.logError(error, { 
        context: 'Failed to store content template',
        organizationId 
      });
      return null;
    }
  }

  async findSimilarTemplates(organizationId, content, platform = null, limit = 3) {
    try {
      const collection = this.collections.get('content_templates');
      if (!collection) {
        throw new Error('Content templates collection not found');
      }

      const whereClause = { organization_id: organizationId };
      if (platform) {
        whereClause.platform = platform;
      }

      const results = await collection.query({
        queryTexts: [content],
        nResults: limit,
        where: whereClause
      });

      return results.documents[0]?.map((doc, index) => ({
        content: doc,
        metadata: results.metadatas[0][index],
        similarity: 1 - results.distances[0][index],
        id: results.ids[0][index]
      })) || [];
    } catch (error) {
      logger.logError(error, { 
        context: 'Failed to find similar templates',
        organizationId,
        content 
      });
      return [];
    }
  }

  // Performance Pattern Operations
  async storePerformancePattern(organizationId, pattern) {
    try {
      const collection = this.collections.get('performance_patterns');
      if (!collection) {
        throw new Error('Performance patterns collection not found');
      }

      const patternId = `${organizationId}_pattern_${Date.now()}`;
      
      await collection.add({
        ids: [patternId],
        documents: [pattern.description],
        metadatas: [{
          organization_id: organizationId,
          pattern_type: pattern.type,
          platform: pattern.platform,
          metric: pattern.metric,
          value: pattern.value,
          confidence: pattern.confidence || 0.7,
          sample_size: pattern.sampleSize || 1,
          created_at: new Date().toISOString()
        }]
      });

      return patternId;
    } catch (error) {
      logger.logError(error, { 
        context: 'Failed to store performance pattern',
        organizationId 
      });
      return null;
    }
  }

  // Utility Methods
  async getCollectionStats() {
    try {
      const stats = {};
      
      for (const [name, collection] of this.collections) {
        const count = await collection.count();
        stats[name] = {
          documentCount: count,
          name: collection.name
        };
      }

      return stats;
    } catch (error) {
      logger.logError(error, { context: 'Failed to get collection stats' });
      return {};
    }
  }

  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: 'disconnected' };
      }

      const version = await this.client.version();
      const stats = await this.getCollectionStats();
      
      return {
        status: 'healthy',
        version,
        collections: Object.keys(stats).length,
        totalDocuments: Object.values(stats).reduce((sum, stat) => sum + stat.documentCount, 0),
        serverUrl: this.serverUrl
      };
    } catch (error) {
      logger.logError(error, { context: 'Chroma health check failed' });
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  async clearOrganizationData(organizationId) {
    try {
      logger.warn(`Clearing all Chroma data for organization: ${organizationId}`);
      
      for (const [name, collection] of this.collections) {
        try {
          // Get all documents for the organization
          const results = await collection.get({
            where: { organization_id: organizationId }
          });
          
          if (results.ids && results.ids.length > 0) {
            await collection.delete({
              ids: results.ids
            });
            logger.info(`Cleared ${results.ids.length} documents from ${name} collection`);
          }
        } catch (error) {
          logger.logError(error, { 
            context: `Failed to clear ${name} collection for organization`,
            organizationId 
          });
        }
      }

      logger.info(`Completed clearing Chroma data for organization: ${organizationId}`);
    } catch (error) {
      logger.logError(error, { 
        context: 'Failed to clear organization data from Chroma',
        organizationId 
      });
    }
  }

  async disconnect() {
    try {
      // ChromaDB client doesn't have explicit disconnect method
      this.client = null;
      this.collections.clear();
      this.isConnected = false;
      logger.info('Chroma client disconnected');
    } catch (error) {
      logger.logError(error, { context: 'Chroma disconnect failed' });
    }
  }
}

module.exports = ChromaSetup;

