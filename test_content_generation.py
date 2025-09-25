#!/usr/bin/env python3
"""
Test script to demonstrate content generation agent workflow
"""

import requests
import json
import time
from datetime import datetime

# Configuration
AI_AGENTS_URL = "http://localhost:8001"
ORGANIZATION_ID = "68ce935fcbbcac3f7e70e556"
USER_ID = "test-user-123"

def test_ai_agents_status():
    """Test if AI agents system is running"""
    print("🔍 Testing AI Agents System Status...")
    try:
        response = requests.get(f"{AI_AGENTS_URL}/agents", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ AI Agents System is running")
            print(f"   - Total Agents: {data['data']['summary']['totalAgents']}")
            print(f"   - Active Agents: {data['data']['summary']['activeAgents']}")
            print(f"   - System Status: {data['data']['summary']['systemStatus']}")
            return True
        else:
            print(f"❌ AI Agents System returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Failed to connect to AI Agents System: {e}")
        return False

def test_strategy_generation():
    """Test strategy generation"""
    print("\n🎯 Testing Strategy Generation...")
    
    strategy_data = {
        "objectives": ["brand_awareness", "lead_generation", "engagement"],
        "timeframe": "30d",
        "platforms": ["instagram", "linkedin", "twitter"],
        "target_audience": "small business owners and entrepreneurs",
        "business_goals": "Increase brand visibility, generate qualified leads, and build community engagement",
        "current_challenges": "Limited time for content creation, low engagement rates, inconsistent posting"
    }
    
    try:
        response = requests.post(
            f"{AI_AGENTS_URL}/agents/{ORGANIZATION_ID}_strategy_agent/process",
            json={
                "task_type": "generate_strategy",
                "organization_id": ORGANIZATION_ID,
                "user_id": USER_ID,
                "input_data": strategy_data,
                "priority": "high"
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                print("✅ Strategy generated successfully!")
                strategy = data['result']
                print(f"   - Strategy Name: {strategy['name']}")
                print(f"   - Confidence: {strategy['confidence']}%")
                print(f"   - Status: {strategy['status']}")
                print(f"   - Objectives: {len(strategy['strategy']['objectives'])} goals defined")
                print(f"   - Platforms: {len(strategy['strategy']['platformStrategies'])} platforms configured")
                return strategy
            else:
                print(f"❌ Strategy generation failed: {data}")
                return None
        else:
            print(f"❌ Strategy generation request failed with status {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Strategy generation error: {e}")
        return None

def test_content_generation(strategy=None):
    """Test content generation based on strategy"""
    print("\n📝 Testing Content Generation...")
    
    # Test different content types
    content_tests = [
        {
            "name": "Instagram Post - Brand Awareness",
            "data": {
                "type": "generate_content",
                "topic": "Building Your Brand Foundation",
                "platform": "instagram",
                "content_type": "post",
                "tone": "professional",
                "target_audience": "small business owners",
                "keywords": ["brand", "foundation", "business", "growth"],
                "call_to_action": "What foundation elements have been crucial for your business? Share below!",
                "strategy_context": {
                    "weekly_theme": "Brand Awareness & Foundation",
                    "platform_strategy": {
                        "focus": "Visual storytelling and brand aesthetics",
                        "contentMix": {"video": 60, "image": 30, "text": 10},
                        "keyHashtags": ["#business", "#growth", "#success", "#marketing"]
                    }
                }
            }
        },
        {
            "name": "LinkedIn Article - Thought Leadership",
            "data": {
                "type": "generate_content",
                "topic": "The Future of AI in Small Business Marketing",
                "platform": "linkedin",
                "content_type": "article",
                "tone": "authoritative",
                "target_audience": "business professionals",
                "keywords": ["AI", "marketing", "automation", "future", "business"],
                "call_to_action": "What are your thoughts on AI's role in business? Let's discuss!",
                "strategy_context": {
                    "weekly_theme": "Thought Leadership & Authority",
                    "platform_strategy": {
                        "focus": "Professional networking and B2B content",
                        "contentMix": {"text": 50, "image": 30, "video": 20},
                        "keyHashtags": ["#business", "#leadership", "#industry", "#professional"]
                    }
                }
            }
        },
        {
            "name": "Twitter Thread - Engagement",
            "data": {
                "type": "generate_content",
                "topic": "5 Quick Tips for Better Social Media Engagement",
                "platform": "twitter",
                "content_type": "thread",
                "tone": "casual",
                "target_audience": "small business owners",
                "keywords": ["engagement", "tips", "social media", "strategy"],
                "call_to_action": "Which tip resonates most with you?",
                "strategy_context": {
                    "weekly_theme": "Community Building & Interaction",
                    "platform_strategy": {
                        "focus": "Real-time engagement and thought leadership",
                        "contentMix": {"text": 40, "image": 40, "video": 20},
                        "keyHashtags": ["#business", "#tech", "#innovation", "#marketing"]
                    }
                }
            }
        }
    ]
    
    results = []
    
    for test in content_tests:
        print(f"\n   Testing: {test['name']}")
        try:
            response = requests.post(
                f"{AI_AGENTS_URL}/agents/{ORGANIZATION_ID}_content_agent/process",
                json={
                    "task_type": "generate_content",
                    "organization_id": ORGANIZATION_ID,
                    "user_id": USER_ID,
                    "input_data": test['data'],
                    "priority": "medium"
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data['success']:
                    result = data['result']
                    print(f"   ✅ Content generated successfully!")
                    print(f"      - Platform: {result.get('platform', 'N/A')}")
                    print(f"      - Type: {result.get('type', 'N/A')}")
                    print(f"      - Tone: {result.get('tone', 'N/A')}")
                    print(f"      - Content: {result.get('content', 'N/A')[:100]}...")
                    print(f"      - Hashtags: {result.get('hashtags', [])}")
                    results.append({
                        "test_name": test['name'],
                        "success": True,
                        "result": result
                    })
                else:
                    print(f"   ❌ Content generation failed: {data}")
                    results.append({
                        "test_name": test['name'],
                        "success": False,
                        "error": data
                    })
            else:
                print(f"   ❌ Request failed with status {response.status_code}")
                results.append({
                    "test_name": test['name'],
                    "success": False,
                    "error": f"HTTP {response.status_code}"
                })
        except Exception as e:
            print(f"   ❌ Content generation error: {e}")
            results.append({
                "test_name": test['name'],
                "success": False,
                "error": str(e)
            })
    
    return results

def test_automation_system():
    """Test automation and scheduling system"""
    print("\n⏰ Testing Automation System...")
    
    # Check if we can access automation endpoints
    automation_tests = [
        ("Health Check", f"{AI_AGENTS_URL}/health"),
        ("Agents Status", f"{AI_AGENTS_URL}/agents"),
    ]
    
    for test_name, url in automation_tests:
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                print(f"   ✅ {test_name}: Available")
            else:
                print(f"   ❌ {test_name}: HTTP {response.status_code}")
        except Exception as e:
            print(f"   ❌ {test_name}: {e}")

def demonstrate_workflow():
    """Demonstrate the complete content generation workflow"""
    print("🚀 AI Social Media Platform - Content Generation Agent Test")
    print("=" * 60)
    
    # Step 1: Check system status
    if not test_ai_agents_status():
        print("\n❌ Cannot proceed - AI Agents System is not available")
        return
    
    # Step 2: Generate strategy
    strategy = test_strategy_generation()
    if not strategy:
        print("\n❌ Cannot proceed - Strategy generation failed")
        return
    
    # Step 3: Generate content based on strategy
    content_results = test_content_generation(strategy)
    
    # Step 4: Test automation
    test_automation_system()
    
    # Summary
    print("\n📊 Test Summary")
    print("=" * 30)
    successful_tests = sum(1 for result in content_results if result['success'])
    total_tests = len(content_results)
    
    print(f"Content Generation Tests: {successful_tests}/{total_tests} successful")
    
    if successful_tests > 0:
        print("\n✅ Content Generation Agent is working!")
        print("\nHow it works:")
        print("1. Strategy Agent creates comprehensive social media strategies")
        print("2. Content Agent generates platform-specific content based on strategy")
        print("3. Content is optimized for each platform's best practices")
        print("4. Automated scheduling system manages content distribution")
        print("5. Analytics Agent tracks performance and optimizes future content")
    else:
        print("\n❌ Content Generation Agent needs attention")
    
    print(f"\nTest completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    demonstrate_workflow()






