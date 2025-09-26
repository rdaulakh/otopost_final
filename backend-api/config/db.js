const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[DATABASE] Successfully connected to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DATABASE] Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
