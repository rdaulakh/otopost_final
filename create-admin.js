const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-social-media-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// AdminUser schema (simplified version)
const adminUserSchema = new mongoose.Schema({
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
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  permissions: {
    type: [String],
    default: ['all']
  },
  activity: {
    lastLoginAt: Date,
    loginCount: { type: Number, default: 0 },
    lastActiveAt: Date
  }
});

// Add password comparison method
adminUserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const AdminUser = mongoose.model('AdminUser', adminUserSchema);

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('adminpass123', 12);

    // Create admin user
    const admin = new AdminUser({
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      permissions: ['all'],
      activity: {
        lastLoginAt: new Date(),
        loginCount: 0,
        lastActiveAt: new Date()
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

createAdmin();




