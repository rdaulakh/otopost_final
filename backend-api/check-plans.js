const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ai-social-media-platform')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Check Plan data
    const Plan = mongoose.model('Plan', new mongoose.Schema({}, { strict: false }));
    const plans = await Plan.find({});
    console.log('\n=== Available Plans ===');
    plans.forEach(plan => {
      console.log(`Plan ID: ${plan.planId}`);
      console.log(`Name: ${plan.name}`);
      console.log(`Price: $${plan.pricing?.monthly?.amount || 'N/A'}/month`);
      console.log('---');
    });
    
    // Check if there's a plan that matches "new-ai-plan"
    const newAiPlan = await Plan.findOne({ planId: 'new-ai-plan' });
    if (newAiPlan) {
      console.log('\n=== New AI Plan Found ===');
      console.log('Plan ID:', newAiPlan.planId);
      console.log('Name:', newAiPlan.name);
      console.log('Price:', newAiPlan.pricing?.monthly?.amount);
    } else {
      console.log('\n=== No "new-ai-plan" found in Plan collection ===');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });






