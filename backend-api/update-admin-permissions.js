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

// Update admin user permissions
const updateAdminPermissions = async () => {
  try {
    // Find the existing admin user
    const adminUser = await AdminUser.findOne({ email: 'admin@aisocialmedia.com' });
    if (!adminUser) {
      console.log('Admin user not found');
      return;
    }

    console.log('Found admin user:', adminUser.email);
    console.log('Current role:', adminUser.role);
    console.log('Current permissions:', adminUser.permissions);

    // Set default permissions for super_admin role
    adminUser.setDefaultPermissions();
    
    await adminUser.save();
    console.log('Admin user permissions updated successfully');
    console.log('New permissions:', adminUser.permissions);
    
  } catch (error) {
    console.error('Error updating admin permissions:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await updateAdminPermissions();
  await mongoose.connection.close();
  console.log('Database connection closed');
};

main();
