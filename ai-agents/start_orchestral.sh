#!/bin/bash

# Start Orchestral AI Agents System
echo "🎼 Starting Orchestral AI Agents System..."
echo "=================================="

# Activate virtual environment
cd /home/ubuntu/ai-social-media-platform/ai-agents
source venv/bin/activate

# Set environment variables
export PYTHONPATH="/home/ubuntu/ai-social-media-platform/ai-agents:$PYTHONPATH"

# Start the orchestral system
python3 enhanced_main.py

