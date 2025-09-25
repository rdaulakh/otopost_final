const axios = require('axios');

const API_BASE = 'https://digiads.digiaeon.com/api';

async function testProfileSave() {
  try {
    // First, let's register a test user to get a valid token
    console.log('🔐 Registering test user...');
    const registerResponse = await axios.post(`${API_BASE}/auth/customer/register`, {
      firstName: 'Test',
      lastName: 'User',
      email: `test-profile-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      organizationName: 'Test Organization'
    });
    
    console.log('✅ User registered successfully');
    const token = registerResponse.data.token;
    
    // Now test profile update with all the new fields
    console.log('📝 Testing profile update with new fields...');
    const profileData = {
      firstName: 'Updated',
      lastName: 'User',
      phone: '+1234567890',
      jobTitle: 'Software Engineer',
      website: 'https://example.com',
      bio: 'This is a test bio for the user profile.',
      location: 'San Francisco, CA',
      timezone: 'America/Los_Angeles'
    };
    
    const updateResponse = await axios.put(`${API_BASE}/users/profile`, profileData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Profile updated successfully');
    console.log('📊 Response data:', JSON.stringify(updateResponse.data, null, 2));
    
    // Now test getting the profile to verify the fields were saved
    console.log('🔍 Fetching updated profile...');
    const getProfileResponse = await axios.get(`${API_BASE}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Profile fetched successfully');
    console.log('📊 User data:', JSON.stringify(getProfileResponse.data.data.user, null, 2));
    
    // Verify all fields are present
    const user = getProfileResponse.data.data.user;
    const fieldsToCheck = ['jobTitle', 'website', 'bio', 'location', 'phoneNumber'];
    
    console.log('🔍 Verifying saved fields...');
    fieldsToCheck.forEach(field => {
      if (user[field]) {
        console.log(`✅ ${field}: ${user[field]}`);
    } else {
        console.log(`❌ ${field}: Missing or empty`);
    }
    });
    
    console.log('🎉 Profile save test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
}

testProfileSave();

