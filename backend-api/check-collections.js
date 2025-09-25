const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-social-media-platform';

async function checkCollections() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for collection check');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('Available collections:');
    collections.forEach(col => {
      console.log('-', col.name);
    });
    
    // Check adminusers collection specifically
    const adminUsers = await db.collection('adminusers').find({}).toArray();
    console.log('\nAdminUsers in adminusers collection:', adminUsers.length);
    
    // Check userclaudes collection
    const userClaudes = await db.collection('userclaudes').find({}).toArray();
    console.log('UserClaudes in userclaudes collection:', userClaudes.length);
    
    // Check if there are any admin users in userclaudes
    const adminInUserClaudes = await db.collection('userclaudes').find({ role: 'admin' }).toArray();
    console.log('Admin users in userclaudes collection:', adminInUserClaudes.length);
    
  } catch (error) {
    console.error('Error checking collections:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

checkCollections();



