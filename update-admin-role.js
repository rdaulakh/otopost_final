const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-social-media-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// UserClaude schema (simplified version)
const userClaudeSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: { 
    type: String, 
    enum: ['customer', 'admin', 'moderator'], 
    default: 'customer' 
  }
});

const UserClaude = mongoose.model('UserClaude', userClaudeSchema);

async function updateAdminRole() {
  try {
    // Find and update the admin user
    const result = await UserClaude.findOneAndUpdate(
      { email: 'admin@example.com' },
      { role: 'admin' },
      { new: true }
    );

    if (result) {
      console.log('Admin user role updated successfully:', result.email, 'Role:', result.role);
    } else {
      console.log('Admin user not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin role:', error);
    process.exit(1);
  }
}

updateAdminRole();



