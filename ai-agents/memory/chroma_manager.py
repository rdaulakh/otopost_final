import asyncio
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
import json
import uuid
from chromadb import Client, Collection
from chromadb.config import Settings as ChromaSettings
from config.settings import settings, AgentType
from utils.logger import get_logger, log_memory_operation, log_error

logger = get_logger("chroma_manager")

class ChromaManager:
    """Manages Chroma vector database operations for AI agents."""
    
    def __init__(self):
        self.client: Optional[Client] = None
        self.collections: Dict[str, Collection] = {}
        self.is_connected = False
        
    async def initialize(self):
        """Initialize Chroma client and collections."""
        try:
            logger.info("Initializing Chroma vector database...")
            
            # Create Chroma client
            self.client = Client(ChromaSettings(
                chroma_server_host=settings.chroma_host,
                chroma_server_http_port=settings.chroma_port,
                anonymized_telemetry=False
            ))
            
            # Test connection
            await self._test_connection()
            
            # Setup collections
            await self._setup_collections()
            
            self.is_connected = True
            logger.info("Chroma vector database initialized successfully")
            
        except Exception as e:
            log_error(e, {"context": "Chroma initialization failed"})
            raise
    
    async def _test_connection(self):
        """Test Chroma database connection."""
        try:
            # Simple heartbeat test
            collections = self.client.list_collections()
            logger.info(f"Chroma connection successful. Found {len(collections)} existing collections.")
        except Exception as e:
            logger.error(f"Chroma connection failed: {str(e)}")
            raise
    
    async def _setup_collections(self):
        """Setup required collections for AI agents."""
        collection_configs = {
            "agent_memory": {
                "name": "agent_memory",
                "metadata": {"description": "Long-term memory for AI agents"}
            },
            "conversation_history": {
                "name": "conversation_history", 
                "metadata": {"description": "Conversation history and context"}
            },
            "knowledge_base": {
                "name": "knowledge_base",
                "metadata": {"description": "Organizational knowledge and insights"}
            },
            "content_templates": {
                "name": "content_templates",
                "metadata": {"description": "Content templates and examples"}
            },
            "performance_patterns": {
                "name": "performance_patterns",
                "metadata": {"description": "Learned performance patterns"}
            },
            "strategy_insights": {
                "name": "strategy_insights",
                "metadata": {"description": "Strategic insights and recommendations"}
            },
            "user_preferences": {
                "name": "user_preferences",
                "metadata": {"description": "User preferences and feedback"}
            }
        }
        
        for collection_key, config in collection_configs.items():
            try:
                # Try to get existing collection
                collection = self.client.get_collection(name=config["name"])
                logger.info(f"Found existing collection: {config['name']}")
            except:
                # Create new collection
                collection = self.client.create_collection(
                    name=config["name"],
                    metadata=config["metadata"]
                )
                logger.info(f"Created new collection: {config['name']}")
            
            self.collections[collection_key] = collection
    
    # Agent Memory Operations
    async def store_agent_memory(
        self,
        agent_type: AgentType,
        organization_id: str,
        memory_content: str,
        memory_type: str = "general",
        importance: float = 0.5,
        metadata: Optional[Dict] = None
    ) -> str:
        """Store memory for an AI agent."""
        try:
            collection = self.collections["agent_memory"]
            memory_id = str(uuid.uuid4())
            
            memory_metadata = {
                "agent_type": agent_type.value,
                "organization_id": organization_id,
                "memory_type": memory_type,
                "importance": importance,
                "created_at": datetime.utcnow().isoformat(),
                **(metadata or {})
            }
            
            collection.add(
                ids=[memory_id],
                documents=[memory_content],
                metadatas=[memory_metadata]
            )
            
            log_memory_operation("store", "agent_memory", 1, agent_type.value)
            return memory_id
            
        except Exception as e:
            log_error(e, {
                "context": "Failed to store agent memory",
                "agent_type": agent_type.value,
                "organization_id": organization_id
            })
            raise
    
    async def retrieve_agent_memory(
        self,
        agent_type: AgentType,
        organization_id: str,
        query: str,
        limit: int = 10,
        importance_threshold: float = 0.3
    ) -> List[Dict]:
        """Retrieve relevant memories for an AI agent."""
        try:
            collection = self.collections["agent_memory"]
            
            results = collection.query(
                query_texts=[query],
                n_results=limit,
                where={
                    "agent_type": agent_type.value,
                    "organization_id": organization_id,
                    "importance": {"$gte": importance_threshold}
                }
            )
            
            memories = []
            if results["documents"] and results["documents"][0]:
                for i, doc in enumerate(results["documents"][0]):
                    memories.append({
                        "id": results["ids"][0][i],
                        "content": doc,
                        "metadata": results["metadatas"][0][i],
                        "distance": results["distances"][0][i],
                        "relevance": 1 - results["distances"][0][i]
                    })
            
            log_memory_operation("retrieve", "agent_memory", len(memories), agent_type.value)
            return memories
            
        except Exception as e:
            log_error(e, {
                "context": "Failed to retrieve agent memory",
                "agent_type": agent_type.value,
                "organization_id": organization_id
            })
            return []
    
    # Conversation History Operations
    async def store_conversation(
        self,
        agent_type: AgentType,
        organization_id: str,
        user_id: str,
        conversation_content: str,
        session_id: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> str:
        """Store conversation history."""
        try:
            collection = self.collections["conversation_history"]
            conversation_id = str(uuid.uuid4())
            
            conversation_metadata = {
                "agent_type": agent_type.value,
                "organization_id": organization_id,
                "user_id": user_id,
                "session_id": session_id or str(uuid.uuid4()),
                "created_at": datetime.utcnow().isoformat(),
                **(metadata or {})
            }
            
            collection.add(
                ids=[conversation_id],
                documents=[conversation_content],
                metadatas=[conversation_metadata]
            )
            
            log_memory_operation("store", "conversation_history", 1, agent_type.value)
            return conversation_id
            
        except Exception as e:
            log_error(e, {
                "context": "Failed to store conversation",
                "agent_type": agent_type.value,
                "organization_id": organization_id
            })
            raise
    
    async def get_conversation_history(
        self,
        agent_type: AgentType,
        organization_id: str,
        user_id: str,
        session_id: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict]:
        """Get conversation history for context."""
        try:
            collection = self.collections["conversation_history"]
            
            where_clause = {
                "agent_type": agent_type.value,
                "organization_id": organization_id,
                "user_id": user_id
            }
            
            if session_id:
                where_clause["session_id"] = session_id
            
            results = collection.get(
                where=where_clause,
                limit=limit
            )
            
            conversations = []
            if results["documents"]:
                for i, doc in enumerate(results["documents"]):
                    conversations.append({
                        "id": results["ids"][i],
                        "content": doc,
                        "metadata": results["metadatas"][i]
                    })
            
            # Sort by creation time
            conversations.sort(key=lambda x: x["metadata"]["created_at"])
            
            log_memory_operation("retrieve", "conversation_history", len(conversations), agent_type.value)
            return conversations
            
        except Exception as e:
            log_error(e, {
                "context": "Failed to get conversation history",
                "agent_type": agent_type.value,
                "organization_id": organization_id
            })
            return []
    
    # Knowledge Base Operations
    async def store_knowledge(
        self,
        organization_id: str,
        knowledge_content: str,
        topic: str,
        category: str = "general",
        source: str = "system",
        confidence: float = 0.8,
        metadata: Optional[Dict] = None
    ) -> str:
        """Store organizational knowledge."""
        try:
            collection = self.collections["knowledge_base"]
            knowledge_id = str(uuid.uuid4())
            
            knowledge_metadata = {
                "organization_id": organization_id,
                "topic": topic,
                "category": category,
                "source": source,
                "confidence": confidence,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                **(metadata or {})
            }
            
            collection.add(
                ids=[knowledge_id],
                documents=[knowledge_content],
                metadatas=[knowledge_metadata]
            )
            
            log_memory_operation("store", "knowledge_base", 1)
            return knowledge_id
            
        except Exception as e:
            log_error(e, {
                "context": "Failed to store knowledge",
                "organization_id": organization_id
            })
            raise
    
    async def search_knowledge(
        self,
        organization_id: str,
        query: str,
        category: Optional[str] = None,
        limit: int = 5,
        confidence_threshold: float = 0.5
    ) -> List[Dict]:
        """Search organizational knowledge base."""
        try:
            collection = self.collections["knowledge_base"]
            
            where_clause = {
                "organization_id": organization_id,
                "confidence": {"$gte": confidence_threshold}
            }
            
            if category:
                where_clause["category"] = category
            
            results = collection.query(
                query_texts=[query],
                n_results=limit,
                where=where_clause
            )
            
            knowledge_items = []
            if results["documents"] and results["documents"][0]:
                for i, doc in enumerate(results["documents"][0]):
                    knowledge_items.append({
                        "id": results["ids"][0][i],
                        "content": doc,
                        "metadata": results["metadatas"][0][i],
                        "relevance": 1 - results["distances"][0][i]
                    })
            
            log_memory_operation("search", "knowledge_base", len(knowledge_items))
            return knowledge_items
            
        except Exception as e:
            log_error(e, {
                "context": "Failed to search knowledge",
                "organization_id": organization_id
            })
            return []
    
    # Content Template Operations
    async def store_content_template(
        self,
        organization_id: str,
        template_content: str,
        template_type: str,
        platform: str,
        category: str = "general",
        performance_score: float = 0.0,
        metadata: Optional[Dict] = None
    ) -> str:
        """Store content template."""
        try:
            collection = self.collections["content_templates"]
            template_id = str(uuid.uuid4())
            
            template_metadata = {
                "organization_id": organization_id,
                "template_type": template_type,
                "platform": platform,
                "category": category,
                "performance_score": performance_score,
                "usage_count": 0,
                "created_at": datetime.utcnow().isoformat(),
                **(metadata or {})
            }
            
            collection.add(
                ids=[template_id],
                documents=[template_content],
                metadatas=[template_metadata]
            )
            
            log_memory_operation("store", "content_templates", 1)
            return template_id
            
        except Exception as e:
            log_error(e, {
                "context": "Failed to store content template",
                "organization_id": organization_id
            })
            raise
    
    async def find_similar_templates(
        self,
        organization_id: str,
        content: str,
        platform: Optional[str] = None,
        template_type: Optional[str] = None,
        limit: int = 3
    ) -> List[Dict]:
        """Find similar content templates."""
        try:
            collection = self.collections["content_templates"]
            
            where_clause = {"organization_id": organization_id}
            if platform:
                where_clause["platform"] = platform
            if template_type:
                where_clause["template_type"] = template_type
            
            results = collection.query(
                query_texts=[content],
                n_results=limit,
                where=where_clause
            )
            
            templates = []
            if results["documents"] and results["documents"][0]:
                for i, doc in enumerate(results["documents"][0]):
                    templates.append({
                        "id": results["ids"][0][i],
                        "content": doc,
                        "metadata": results["metadatas"][0][i],
                        "similarity": 1 - results["distances"][0][i]
                    })
            
            log_memory_operation("search", "content_templates", len(templates))
            return templates
            
        except Exception as e:
            log_error(e, {
                "context": "Failed to find similar templates",
                "organization_id": organization_id
            })
            return []
    
    # Performance Pattern Operations
    async def store_performance_pattern(
        self,
        organization_id: str,
        pattern_description: str,
        pattern_type: str,
        platform: str,
        metric: str,
        value: float,
        confidence: float = 0.7,
        sample_size: int = 1,
        metadata: Optional[Dict] = None
    ) -> str:
        """Store performance pattern."""
        try:
            collection = self.collections["performance_patterns"]
            pattern_id = str(uuid.uuid4())
            
            pattern_metadata = {
                "organization_id": organization_id,
                "pattern_type": pattern_type,
                "platform": platform,
                "metric": metric,
                "value": value,
                "confidence": confidence,
                "sample_size": sample_size,
                "created_at": datetime.utcnow().isoformat(),
                **(metadata or {})
            }
            
            collection.add(
                ids=[pattern_id],
                documents=[pattern_description],
                metadatas=[pattern_metadata]
            )
            
            log_memory_operation("store", "performance_patterns", 1)
            return pattern_id
            
        except Exception as e:
            log_error(e, {
                "context": "Failed to store performance pattern",
                "organization_id": organization_id
            })
            raise
    
    async def get_performance_patterns(
        self,
        organization_id: str,
        pattern_type: Optional[str] = None,
        platform: Optional[str] = None,
        confidence_threshold: float = 0.5,
        limit: int = 10
    ) -> List[Dict]:
        """Get performance patterns for optimization."""
        try:
            collection = self.collections["performance_patterns"]
            
            where_clause = {
                "organization_id": organization_id,
                "confidence": {"$gte": confidence_threshold}
            }
            
            if pattern_type:
                where_clause["pattern_type"] = pattern_type
            if platform:
                where_clause["platform"] = platform
            
            results = collection.get(
                where=where_clause,
                limit=limit
            )
            
            patterns = []
            if results["documents"]:
                for i, doc in enumerate(results["documents"]):
                    patterns.append({
                        "id": results["ids"][i],
                        "description": doc,
                        "metadata": results["metadatas"][i]
                    })
            
            # Sort by confidence and value
            patterns.sort(key=lambda x: (x["metadata"]["confidence"], x["metadata"]["value"]), reverse=True)
            
            log_memory_operation("retrieve", "performance_patterns", len(patterns))
            return patterns
            
        except Exception as e:
            log_error(e, {
                "context": "Failed to get performance patterns",
                "organization_id": organization_id
            })
            return []
    
    # Utility Methods
    async def cleanup_old_memories(self, days: int = None):
        """Clean up old memories based on retention policy."""
        try:
            retention_days = days or settings.memory_retention_days
            cutoff_date = datetime.utcnow() - timedelta(days=retention_days)
            cutoff_iso = cutoff_date.isoformat()
            
            collections_to_clean = ["conversation_history", "agent_memory"]
            total_cleaned = 0
            
            for collection_name in collections_to_clean:
                collection = self.collections[collection_name]
                
                # Get old documents
                results = collection.get(
                    where={"created_at": {"$lt": cutoff_iso}}
                )
                
                if results["ids"]:
                    # Delete old documents
                    collection.delete(ids=results["ids"])
                    total_cleaned += len(results["ids"])
                    
                    logger.info(f"Cleaned {len(results['ids'])} old documents from {collection_name}")
            
            logger.info(f"Memory cleanup completed. Removed {total_cleaned} old documents.")
            return total_cleaned
            
        except Exception as e:
            log_error(e, {"context": "Memory cleanup failed"})
            return 0
    
    async def get_collection_stats(self) -> Dict[str, Dict]:
        """Get statistics for all collections."""
        try:
            stats = {}
            
            for name, collection in self.collections.items():
                try:
                    count = collection.count()
                    stats[name] = {
                        "document_count": count,
                        "name": collection.name
                    }
                except Exception as e:
                    stats[name] = {
                        "document_count": 0,
                        "error": str(e)
                    }
            
            return stats
            
        except Exception as e:
            log_error(e, {"context": "Failed to get collection stats"})
            return {}
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on Chroma database."""
        try:
            if not self.is_connected:
                return {"status": "disconnected"}
            
            stats = await self.get_collection_stats()
            total_documents = sum(
                stat.get("document_count", 0) 
                for stat in stats.values()
            )
            
            return {
                "status": "healthy",
                "collections": len(self.collections),
                "total_documents": total_documents,
                "collection_stats": stats
            }
            
        except Exception as e:
            log_error(e, {"context": "Chroma health check failed"})
            return {
                "status": "unhealthy",
                "error": str(e)
            }
    
    async def disconnect(self):
        """Disconnect from Chroma database."""
        try:
            self.collections.clear()
            self.client = None
            self.is_connected = False
            logger.info("Disconnected from Chroma database")
        except Exception as e:
            log_error(e, {"context": "Chroma disconnect failed"})

# Global Chroma manager instance
chroma_manager = ChromaManager()

