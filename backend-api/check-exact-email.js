const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-social-media-platform';

async function checkExactEmail() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for exact email check');

    const db = mongoose.connection.db;
    
    // Check adminusers collection with exact email
    const adminUser = await db.collection('adminusers').findOne({ email: 'adm@example.com' });
    console.log('AdminUser with exact email:', adminUser);
    
    // Check adminusers collection with case insensitive
    const adminUserCaseInsensitive = await db.collection('adminusers').findOne({ 
      email: { $regex: /^adm@example\.com$/i } 
    });
    console.log('AdminUser case insensitive:', adminUserCaseInsensitive);
    
    // List all admin users
    const allAdminUsers = await db.collection('adminusers').find({}).toArray();
    console.log('All admin users:');
    allAdminUsers.forEach((admin, index) => {
      console.log(`Admin ${index + 1}:`, {
        _id: admin._id,
        email: admin.email,
        emailLength: admin.email ? admin.email.length : 0,
        emailBytes: admin.email ? Buffer.from(admin.email).toString('hex') : 'null'
      });
    });
    
  } catch (error) {
    console.error('Error checking exact email:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

checkExactEmail();



