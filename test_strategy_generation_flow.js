#!/usr/bin/env node
/**
 * Test Script: AI Strategy Generation Flow
 * This script demonstrates the complete data flow from API call to AI agent response
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3000';
const AI_AGENTS_URL = 'http://localhost:8001';

// Test data
const testStrategyData = {
  objectives: ['brand_awareness', 'lead_generation', 'customer_engagement'],
  timeframe: '30d',
  platforms: ['instagram', 'linkedin', 'twitter', 'facebook'],
  targetAudience: 'Tech professionals and small business owners',
  businessGoals: 'Increase brand awareness and generate qualified leads',
  currentChallenges: 'Need consistent, engaging content that converts'
};

const testUser = {
  _id: 'test-user-123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com'
};

const testOrganization = {
  _id: 'test-org-456',
  name: 'Tech Solutions Inc',
  description: 'AI-powered business solutions',
  businessInfo: {
    industry: 'technology',
    businessType: 'b2b',
    companySize: '11-50',
    foundedYear: 2020,
    headquarters: {
      city: 'San Francisco',
      country: 'USA'
    }
  },
  brandSettings: {
    brandVoice: 'professional',
    contentStyle: 'modern',
    brandGuidelines: 'Clean, professional, innovative'
  },
  aiAgentConfig: {
    customInstructions: 'Focus on AI and automation benefits',
    agentPersonality: 'expert'
  },
  marketingStrategy: {
    targetAudience: 'Tech professionals and businesses',
    businessObjectives: ['brand_awareness', 'lead_generation'],
    postingFrequency: 'daily',
    geographicReach: 'National',
    contentCategories: ['educational', 'promotional']
  }
};

async function testStrategyGenerationFlow() {
  console.log('🚀 STARTING AI STRATEGY GENERATION FLOW TEST');
  console.log('=' * 60);
  
  try {
    // Step 1: Test API endpoint directly
    console.log('\n📡 STEP 1: Testing API Endpoint');
    console.log('-'.repeat(40));
    
    const apiResponse = await axios.post(`${API_BASE_URL}/api/ai-strategy/generate`, testStrategyData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('✅ API Response Status:', apiResponse.status);
    console.log('📊 API Response Data:', JSON.stringify(apiResponse.data, null, 2));
    
    // Step 2: Test AI Agents Service directly
    console.log('\n🤖 STEP 2: Testing AI Agents Service');
    console.log('-'.repeat(40));
    
    const aiAgentsResponse = await axios.post(`${AI_AGENTS_URL}/agents/test_strategy_agent/process`, {
      task_type: 'generate_strategy',
      organization_id: testOrganization._id,
      user_id: testUser._id,
      input_data: {
        ...testStrategyData,
        organization: testOrganization,
        socialProfiles: []
      },
      priority: 'high'
    });
    
    console.log('✅ AI Agents Response Status:', aiAgentsResponse.status);
    console.log('📊 AI Agents Response Data:', JSON.stringify(aiAgentsResponse.data, null, 2));
    
    // Step 3: Test individual AI tools
    console.log('\n🔧 STEP 3: Testing Individual AI Tools');
    console.log('-'.repeat(40));
    
    // Test analyze_business_objectives tool
    const businessObjectivesData = {
      objectives: testStrategyData.objectives,
      industry: testOrganization.businessInfo.industry,
      target_metrics: {
        engagement_rate: 0.05,
        reach: 10000,
        conversion_rate: 0.02
      }
    };
    
    console.log('🎯 Testing analyze_business_objectives tool:');
    console.log('Input:', JSON.stringify(businessObjectivesData, null, 2));
    
    // Test develop_audience_strategy tool
    const audienceData = {
      demographics: {
        age_groups: {
          '25-34': 0.4,
          '35-44': 0.35,
          '45+': 0.25
        }
      },
      interests: ['technology', 'business', 'innovation'],
      behaviors: ['active on LinkedIn', 'reads tech blogs', 'attends webinars'],
      pain_points: ['time management', 'scaling business', 'staying competitive']
    };
    
    console.log('\n👥 Testing develop_audience_strategy tool:');
    console.log('Input:', JSON.stringify(audienceData, null, 2));
    
    // Test create_content_calendar_strategy tool
    const calendarData = {
      platforms: testStrategyData.platforms,
      posting_frequency: {
        instagram: 7,
        linkedin: 5,
        twitter: 14,
        facebook: 5
      },
      content_pillars: ['educational', 'promotional', 'entertaining', 'behind_scenes']
    };
    
    console.log('\n📅 Testing create_content_calendar_strategy tool:');
    console.log('Input:', JSON.stringify(calendarData, null, 2));
    
    // Step 4: Show complete data flow
    console.log('\n📋 STEP 4: Complete Data Flow Summary');
    console.log('-'.repeat(40));
    
    console.log('1. Frontend Request Data:');
    console.log(JSON.stringify(testStrategyData, null, 2));
    
    console.log('\n2. Organization Context Data:');
    console.log(JSON.stringify(testOrganization, null, 2));
    
    console.log('\n3. AI Agents Task Data:');
    const taskData = {
      type: 'generate_strategy',
      objectives: testStrategyData.objectives,
      timeframe: testStrategyData.timeframe,
      platforms: testStrategyData.platforms,
      target_audience: testStrategyData.targetAudience,
      business_goals: testStrategyData.businessGoals,
      current_challenges: testStrategyData.currentChallenges,
      organization_context: {
        id: testOrganization._id,
        name: testOrganization.name,
        industry: testOrganization.businessInfo.industry,
        businessType: testOrganization.businessInfo.businessType,
        companySize: testOrganization.businessInfo.companySize,
        brandVoice: testOrganization.brandSettings.brandVoice,
        contentStyle: testOrganization.brandSettings.contentStyle,
        customInstructions: testOrganization.aiAgentConfig.customInstructions,
        agentPersonality: testOrganization.aiAgentConfig.agentPersonality
      },
      social_profiles: [],
      business_context: {
        industry: testOrganization.businessInfo.industry,
        business_type: testOrganization.businessInfo.businessType,
        company_size: testOrganization.businessInfo.companySize,
        brand_voice: testOrganization.brandSettings.brandVoice,
        content_style: testOrganization.brandSettings.contentStyle,
        custom_instructions: testOrganization.aiAgentConfig.customInstructions,
        agent_personality: testOrganization.aiAgentConfig.agentPersonality
      }
    };
    console.log(JSON.stringify(taskData, null, 2));
    
    console.log('\n4. AI Tools Input Data:');
    console.log('analyze_business_objectives:', JSON.stringify(businessObjectivesData, null, 2));
    console.log('develop_audience_strategy:', JSON.stringify(audienceData, null, 2));
    console.log('create_content_calendar_strategy:', JSON.stringify(calendarData, null, 2));
    
    console.log('\n✅ TEST COMPLETED SUCCESSFULLY');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

// Run the test
if (require.main === module) {
  testStrategyGenerationFlow();
}

module.exports = { testStrategyGenerationFlow, testStrategyData, testUser, testOrganization };




