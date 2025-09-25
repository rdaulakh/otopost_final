const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const AdminUser = require('./src/models/AdminUser');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-social-media-platform';

async function testPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for password test');

    const email = 'adm@example.com';
    const password = 'adminpass123';
    
    const adminUser = await AdminUser.findOne({ email }).select('+password');
    
    if (adminUser) {
      console.log('Admin user found');
      console.log('Testing password comparison...');
      
      const isMatch = await adminUser.comparePassword(password);
      console.log('Password match:', isMatch);
      
      // Also test with bcrypt directly
      const directMatch = await bcrypt.compare(password, adminUser.password);
      console.log('Direct bcrypt match:', directMatch);
    } else {
      console.log('No admin user found');
    }
  } catch (error) {
    console.error('Error testing password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

testPassword();



