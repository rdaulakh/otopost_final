#!/usr/bin/env python3
"""
Content Generation Guide - How to Generate Content in the Automated System
Shows all the different ways to trigger content generation
"""

import requests
import json
from datetime import datetime

# Configuration
AI_AGENTS_URL = "http://localhost:8001"
ORGANIZATION_ID = "68ce935fcbbcac3f7e70e556"
USER_ID = "demo-user-123"

def show_automated_content_generation():
    """Show how automated content generation works"""
    print("🤖 AUTOMATED CONTENT GENERATION")
    print("=" * 50)
    
    print("\n📅 The system automatically generates content through:")
    print("1. **Scheduled Tasks** (Running automatically)")
    print("   - Daily content generation at optimal times")
    print("   - Weekly content calendar refresh")
    print("   - Monthly strategy reviews and updates")
    
    print("\n2. **Event-Triggered Generation**")
    print("   - When new strategies are created")
    print("   - When performance thresholds are met")
    print("   - When trending topics are detected")
    
    print("\n3. **Strategy-Based Automation**")
    print("   - Content generated based on weekly themes")
    print("   - Platform-specific optimization")
    print("   - Brand voice consistency maintained")

def show_manual_content_generation():
    """Show how to manually trigger content generation"""
    print("\n🎯 MANUAL CONTENT GENERATION")
    print("=" * 50)
    
    print("\nYou can manually generate content in several ways:")
    
    print("\n1. **Direct API Calls** (For developers)")
    print("   - Call the Content Agent directly")
    print("   - Specify exact content requirements")
    print("   - Get immediate results")
    
    print("\n2. **Strategy-Based Generation**")
    print("   - Create a strategy first")
    print("   - Generate content based on strategy context")
    print("   - Maintain consistency with business goals")
    
    print("\n3. **Quick Content Generation**")
    print("   - Generate single posts for specific platforms")
    print("   - Perfect for urgent content needs")
    print("   - Still maintains brand voice consistency")

def demonstrate_manual_generation():
    """Demonstrate manual content generation methods"""
    print("\n🚀 MANUAL CONTENT GENERATION DEMONSTRATION")
    print("=" * 60)
    
    # Method 1: Quick Single Post Generation
    print("\n1️⃣ QUICK SINGLE POST GENERATION")
    print("-" * 40)
    
    quick_content_data = {
        "type": "generate_content",
        "topic": "AI-Powered Business Automation",
        "platform": "instagram",
        "content_type": "post",
        "tone": "professional",
        "target_audience": "small business owners",
        "keywords": ["AI", "automation", "business", "efficiency"],
        "call_to_action": "How has automation helped your business? Share below!"
    }
    
    try:
        response = requests.post(
            f"{AI_AGENTS_URL}/agents/{ORGANIZATION_ID}_content_agent/process",
            json={
                "task_type": "generate_content",
                "organization_id": ORGANIZATION_ID,
                "user_id": USER_ID,
                "input_data": quick_content_data,
                "priority": "high"
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                result = data['result']
                print("✅ Quick content generated successfully!")
                print(f"   Platform: {result.get('platform', 'N/A')}")
                print(f"   Content: {result.get('content', 'N/A')}")
                print(f"   Hashtags: {', '.join(result.get('hashtags', []))}")
            else:
                print(f"❌ Quick generation failed: {data}")
        else:
            print(f"❌ Request failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Method 2: Strategy-Based Generation
    print("\n2️⃣ STRATEGY-BASED CONTENT GENERATION")
    print("-" * 40)
    
    # First create a strategy
    strategy_data = {
        "objectives": ["brand_awareness", "engagement"],
        "timeframe": "7d",
        "platforms": ["instagram", "linkedin"],
        "target_audience": "tech entrepreneurs",
        "business_goals": "Build thought leadership in AI space",
        "current_challenges": "Need engaging content that drives discussion"
    }
    
    try:
        # Create strategy
        strategy_response = requests.post(
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
        
        if strategy_response.status_code == 200:
            strategy_data_result = strategy_response.json()
            if strategy_data_result['success']:
                strategy = strategy_data_result['result']
                print("✅ Strategy created successfully!")
                
                # Now generate content based on strategy
                strategy_content_data = {
                    "type": "generate_content",
                    "topic": "The Future of AI in Business",
                    "platform": "linkedin",
                    "content_type": "article",
                    "tone": "authoritative",
                    "target_audience": "tech entrepreneurs",
                    "keywords": ["AI", "future", "business", "innovation"],
                    "call_to_action": "What's your vision for AI in business? Let's discuss!",
                    "strategy_context": {
                        "strategy_id": strategy.get('name', 'unknown'),
                        "weekly_theme": "Thought Leadership",
                        "platform_strategy": strategy.get('strategy', {}).get('platformStrategies', [{}])[0],
                        "business_objectives": strategy_data['objectives']
                    }
                }
                
                content_response = requests.post(
                    f"{AI_AGENTS_URL}/agents/{ORGANIZATION_ID}_content_agent/process",
                    json={
                        "task_type": "generate_content",
                        "organization_id": ORGANIZATION_ID,
                        "user_id": USER_ID,
                        "input_data": strategy_content_data,
                        "priority": "high"
                    },
                    timeout=30
                )
                
                if content_response.status_code == 200:
                    content_data = content_response.json()
                    if content_data['success']:
                        result = content_data['result']
                        print("✅ Strategy-based content generated!")
                        print(f"   Platform: {result.get('platform', 'N/A')}")
                        print(f"   Content: {result.get('content', 'N/A')}")
                        print(f"   Hashtags: {', '.join(result.get('hashtags', []))}")
                    else:
                        print(f"❌ Strategy-based generation failed: {content_data}")
                else:
                    print(f"❌ Content request failed: {content_response.status_code}")
            else:
                print(f"❌ Strategy creation failed: {strategy_data_result}")
        else:
            print(f"❌ Strategy request failed: {strategy_response.status_code}")
    except Exception as e:
        print(f"❌ Strategy-based generation error: {e}")

def show_content_generation_methods():
    """Show all available content generation methods"""
    print("\n📋 ALL CONTENT GENERATION METHODS")
    print("=" * 50)
    
    print("\n🔄 AUTOMATED METHODS (No manual intervention needed)")
    print("1. **Scheduled Content Generation**")
    print("   - Runs automatically based on time schedules")
    print("   - Generates content for upcoming days/weeks")
    print("   - Maintains consistent posting schedule")
    
    print("\n2. **Event-Triggered Generation**")
    print("   - Content generated when specific events occur")
    print("   - New strategy created → Content generated")
    print("   - Performance threshold met → Optimization content")
    print("   - Trending topic detected → Relevant content")
    
    print("\n3. **Strategy-Driven Automation**")
    print("   - Content automatically generated based on active strategies")
    print("   - Weekly themes and objectives drive content creation")
    print("   - Platform-specific optimization applied automatically")
    
    print("\n🎯 MANUAL METHODS (You trigger when needed)")
    print("1. **Quick Content Generation**")
    print("   - Generate single posts for immediate use")
    print("   - Perfect for urgent content needs")
    print("   - Still maintains brand voice consistency")
    
    print("\n2. **Strategy-Based Generation**")
    print("   - Create strategy first, then generate content")
    print("   - Ensures content aligns with business goals")
    print("   - Best for planned content campaigns")
    
    print("\n3. **Bulk Content Generation**")
    print("   - Generate multiple pieces of content at once")
    print("   - Create content calendars for weeks/months")
    print("   - Efficient for content planning")
    
    print("\n4. **Platform-Specific Generation**")
    print("   - Generate content optimized for specific platforms")
    print("   - Instagram, LinkedIn, Twitter, Facebook")
    print("   - Each platform gets optimized content")

def show_how_to_use_each_method():
    """Show how to use each content generation method"""
    print("\n🛠️ HOW TO USE EACH METHOD")
    print("=" * 50)
    
    print("\n🤖 AUTOMATED METHODS (Set and forget)")
    print("1. **Scheduled Generation**")
    print("   - Already configured and running")
    print("   - No action needed from you")
    print("   - Content appears automatically")
    
    print("\n2. **Event-Triggered Generation**")
    print("   - Happens automatically when events occur")
    print("   - No manual intervention required")
    print("   - System handles everything")
    
    print("\n🎯 MANUAL METHODS (You control when)")
    print("1. **Via API (For developers)**")
    print("   - POST to: http://localhost:8001/agents/{agent_id}/process")
    print("   - Include content requirements in request body")
    print("   - Get immediate content response")
    
    print("\n2. **Via Frontend Interface**")
    print("   - Use the customer dashboard")
    print("   - Click 'Generate Content' button")
    print("   - Fill in content requirements")
    print("   - Get generated content instantly")
    
    print("\n3. **Via Strategy Creation**")
    print("   - Create a new strategy first")
    print("   - System automatically generates content")
    print("   - Content aligns with strategy objectives")

def main():
    """Main function to demonstrate content generation methods"""
    print("🚀 CONTENT GENERATION GUIDE")
    print("=" * 60)
    print("How to Generate Content in the Automated System")
    print("=" * 60)
    
    # Show automated methods
    show_automated_content_generation()
    
    # Show manual methods
    show_manual_content_generation()
    
    # Show all methods
    show_content_generation_methods()
    
    # Show how to use each method
    show_how_to_use_each_method()
    
    # Demonstrate manual generation
    demonstrate_manual_generation()
    
    print("\n" + "=" * 60)
    print("✅ CONTENT GENERATION GUIDE COMPLETE")
    print("=" * 60)
    
    print("\n🎉 SUMMARY:")
    print("• The system is AUTOMATED - content generates itself")
    print("• You can also MANUALLY trigger content generation when needed")
    print("• Both methods maintain brand voice and strategy consistency")
    print("• Choose the method that fits your immediate needs")
    
    print(f"\nGuide completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()






