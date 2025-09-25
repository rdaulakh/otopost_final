#!/bin/bash

# Set environment variables
export OPENAI_API_KEY="your-openai-api-key-here"
export ANTHROPIC_API_KEY="your-anthropic-api-key-here"
export MONGODB_URL="mongodb://localhost:27017/social_media_ai"
export REDIS_URL="redis://localhost:6379"
export DEFAULT_MODEL="gpt-4-turbo-preview"
export FALLBACK_MODEL="gpt-3.5-turbo"
export MAX_TOKENS="4000"
export TEMPERATURE="0.7"
export ENVIRONMENT="production"
export DEBUG="false"
export PORT="8001"

# Start the AI agents service
cd /home/ubuntu/ai-social-media-platform/ai-agents
/home/ubuntu/ai-social-media-platform/ai-agents/venv/bin/python main.py


