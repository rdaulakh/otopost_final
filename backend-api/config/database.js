const mongoose = require('mongoose');
const redis = require('redis');

// MongoDB Configuration
const connectMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_social_media';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Redis Configuration
const connectRedis = async () => {
  try {
    const redisURL = process.env.REDIS_URL || 'redis://localhost:6379';
    const client = redis.createClient({ url: redisURL });
    
    await client.connect();
    console.log('Redis connected successfully');
    
    return client;
  } catch (error) {
    console.error('Redis connection error:', error);
    return null;
  }
};

// Database Health Check
const checkDatabaseHealth = async () => {
  try {
    // Check MongoDB
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check Redis
    const redisClient = await connectRedis();
    const redisStatus = redisClient ? 'connected' : 'disconnected';
    
    return {
      mongodb: mongoStatus,
      redis: redisStatus,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      mongodb: 'error',
      redis: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = {
  connectMongoDB,
  connectRedis,
  checkDatabaseHealth
};
