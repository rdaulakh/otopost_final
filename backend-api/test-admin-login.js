const mongoose = require('mongoose');
require('dotenv').config();

const AdminUser = require('./src/models/AdminUser');
const jwtManager = require('./src/utils/jwt');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-social-media-platform';

async function testAdminLogin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for admin login test');

    const email = 'adm@example.com';
    const password = 'adminpass123';
    
    // Find admin user
    const admin = await AdminUser.findOne({ email }).select('+password');
    console.log('Admin found:', !!admin);
    
    if (admin) {
      console.log('Admin details:', {
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        hasPassword: !!admin.password
      });
      
      // Test password
      const passwordMatch = await admin.comparePassword(password);
      console.log('Password match:', passwordMatch);
      
      if (passwordMatch) {
        // Generate token
        const tokens = jwtManager.generateAdminTokens({
          adminId: admin._id,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions
        });
        
        console.log('Token generated successfully');
        console.log('Token preview:', tokens.accessToken.substring(0, 50) + '...');
        
        // Test token verification
        const decoded = jwtManager.verifyAdminToken(tokens.accessToken);
        console.log('Token verification successful:', decoded);
      }
    }
  } catch (error) {
    console.error('Error testing admin login:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

testAdminLogin();
