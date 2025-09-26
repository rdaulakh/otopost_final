const mongoose = require('mongoose');
const User = require('./models/User');

// Test script to verify profile saving functionality
async function testProfileSave() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-media-platform');
    console.log('✅ Connected to MongoDB');

    // Find a test user
    const testUser = await User.findOne({ email: { $exists: true } });
    
    if (!testUser) {
      console.log('❌ No users found in database');
      return;
    }

    console.log('👤 Found test user:', testUser.email);
    console.log('📊 Current profile data:');
    console.log({
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      email: testUser.email,
      phone: testUser.phone,
      company: testUser.company,
      jobTitle: testUser.jobTitle,
      location: testUser.location,
      bio: testUser.bio,
      website: testUser.website,
      timezone: testUser.preferences?.timezone
    });

    // Test updating profile
    const updateData = {
      firstName: 'Test',
      lastName: 'User',
      phone: '+1234567890',
      company: 'Test Company',
      jobTitle: 'Test Developer',
      location: 'Test City',
      bio: 'This is a test bio',
      website: 'https://test.com',
      timezone: 'UTC'
    };

    console.log('\n🔄 Testing profile update...');
    
    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      testUser._id,
      {
        $set: {
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          phone: updateData.phone,
          company: updateData.company,
          jobTitle: updateData.jobTitle,
          location: updateData.location,
          bio: updateData.bio,
          website: updateData.website,
          'preferences.timezone': updateData.timezone
        }
      },
      { new: true }
    );

    if (updatedUser) {
      console.log('✅ Profile updated successfully!');
      console.log('📊 Updated profile data:');
      console.log({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        company: updatedUser.company,
        jobTitle: updatedUser.jobTitle,
        location: updatedUser.location,
        bio: updatedUser.bio,
        website: updatedUser.website,
        timezone: updatedUser.preferences?.timezone
      });
    } else {
      console.log('❌ Failed to update profile');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testProfileSave();
