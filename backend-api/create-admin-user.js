const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const AdminUser = require('./src/models/AdminUser');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-social-media-platform';

async function createAdminUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for admin user creation');

    const email = 'adm@example.com';
    const password = 'adminpass123';
    const firstName = 'Admin';
    const lastName = 'User';

    let adminUser = await AdminUser.findOne({ email });

    if (adminUser) {
      console.log(`Admin user with email ${email} already exists. Updating password.`);
      adminUser.password = password; // Let the pre-save hook hash it
      adminUser.isActive = true;
      await adminUser.save();
      console.log(`Admin user updated successfully: ${email}`);
      
      // Test the password after update
      const testMatch = await adminUser.comparePassword(password);
      console.log('Password test after update:', testMatch);
    } else {
      // Create admin user - let the pre-save hook hash the password
      adminUser = new AdminUser({
        email: email,
        password: password, // Let the pre-save hook hash it
        firstName: firstName,
        lastName: lastName,
        role: 'admin',
        isActive: true,
        permissions: ['all'],
        activity: {
          loginCount: 0,
          lastLoginAt: new Date()
        }
      });

      await adminUser.save();
      console.log(`Admin user created successfully: ${email}`);
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

createAdminUser();