const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-social-media-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Plan schema (simplified version)
const planSchema = new mongoose.Schema({
  planId: String,
  name: String,
  features: mongoose.Schema.Types.Mixed,
  featureList: [String]
});

const Plan = mongoose.model('Plan', planSchema);

async function fixPlanFeatures() {
  try {
    // Find the existing plan
    const plan = await Plan.findOne({ planId: 'test-plan-1' });
    
    if (plan) {
      // Add featureList array based on the features object
      const featureList = [
        '50 Monthly Posts',
        '100 AI Generations',
        '2 Social Accounts',
        '5GB Storage',
        '30 Days Analytics Retention',
        'AI Agents',
        'Analytics Dashboard'
      ];
      
      plan.featureList = featureList;
      await plan.save();
      
      console.log('Plan updated with featureList:', plan.planId);
      console.log('FeatureList:', plan.featureList);
    } else {
      console.log('Plan not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating plan:', error);
    process.exit(1);
  }
}

fixPlanFeatures();



