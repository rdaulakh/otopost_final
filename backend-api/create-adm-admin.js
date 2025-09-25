const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-social-media-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// UserClaude schema (simplified version)
const userClaudeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: { 
    type: String, 
    enum: ['customer', 'admin', 'moderator'], 
    default: 'customer' 
  },
  username: String,
  firstName: String,
  lastName: String,
  stats: {
    loginCount: { type: Number, default: 0 },
    lastLoginAt: Date
  }
});

// Add password comparison method
userClaudeSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const UserClaude = mongoose.model('UserClaude', userClaudeSchema);

async function createAdmAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await UserClaude.findOne({ email: 'adm@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists with email adm@example.com');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('adminpass123', 12);

    // Create admin user
    const admin = new UserClaude({
      email: 'adm@example.com',
      password: hashedPassword,
      role: 'admin',
      username: 'Adm Admin',
      firstName: 'Admin',
      lastName: 'User',
      stats: {
        loginCount: 0,
        lastLoginAt: new Date()
      }
    });

    await admin.save();
    console.log('Admin user created successfully:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmAdmin();
