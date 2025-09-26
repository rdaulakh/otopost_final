const mongoose = require('mongoose');

const initDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_social_media_platform';
    await mongoose.connect(mongoUri);
    
    console.log('Connected to MongoDB');
    
    // Create basic indexes
    await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.db.collection('organizations').createIndex({ slug: 1 }, { unique: true });
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
};

module.exports = { initDatabase };

