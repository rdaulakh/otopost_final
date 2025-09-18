require('dotenv').config();
const mongoose = require('mongoose');
const AdminUser = require('./src/models/AdminUser');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/ai-social-media', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await AdminUser.findOne({ email: 'admin@aisocialmedia.com' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create new admin user
    const adminUser = new AdminUser({
      email: 'admin@aisocialmedia.com',
      password: 'admin123',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      department: 'administration',
      jobTitle: 'Super Administrator',
      isActive: true,
      isEmailVerified: true,
      preferences: {
        timezone: 'UTC',
        language: 'en',
        theme: 'light'
      }
    });

    // Set default permissions for super_admin role
    adminUser.setDefaultPermissions();
    
    await adminUser.save();
    console.log('Admin user created successfully:', adminUser.email);
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await createAdminUser();
  await mongoose.connection.close();
  console.log('Database connection closed');
};

main();
