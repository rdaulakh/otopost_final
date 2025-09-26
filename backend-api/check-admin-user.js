const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const AdminUser = require('./src/models/AdminUser');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-social-media-platform';

async function checkAdminUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for admin user check');

    const email = 'adm@example.com';
    const adminUser = await AdminUser.findOne({ email });
    
    if (adminUser) {
      console.log('Admin user found:');
      console.log('- Email:', adminUser.email);
      console.log('- Role:', adminUser.role);
      console.log('- Is Active:', adminUser.isActive);
      console.log('- Has Password:', !!adminUser.password);
      console.log('- Password Length:', adminUser.password ? adminUser.password.length : 0);
    } else {
      console.log('No admin user found with email:', email);
    }
  } catch (error) {
    console.error('Error checking admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

checkAdminUser();



