const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-social-media-platform';

async function testAdminPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for admin password test');

    const db = mongoose.connection.db;
    
    // Get admin user from AdminUser collection
    const adminUser = await db.collection('adminusers').findOne({ email: 'admin@example.com' });
    console.log('AdminUser found:', !!adminUser);
    
    if (adminUser) {
      console.log('AdminUser details:', {
        email: adminUser.email,
        role: adminUser.role,
        isActive: adminUser.isActive,
        hasPassword: !!adminUser.password,
        passwordLength: adminUser.password ? adminUser.password.length : 0
      });
      
      // Test password with different passwords
      const passwords = ['adminpass123', 'admin123', 'password', 'admin'];
      
      for (const password of passwords) {
        const match = await bcrypt.compare(password, adminUser.password);
        console.log(`Password "${password}" match:`, match);
      }
    }
    
  } catch (error) {
    console.error('Error testing admin password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

testAdminPassword();



