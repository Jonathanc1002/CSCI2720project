const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function seedUsers() {
  console.log('=== Seeding Demo Users ===');
  
  try {
    // Check if demo users already exist
    const existingUsers = await User.find({
      username: { $in: ['demouser', 'admin'] }
    });
    
    if (existingUsers.length >= 2) {
      console.log('Demo users already exist - skipping seed');
      return;
    }
    
    // Create demo users with hashed passwords
    const demoUsers = [
      {
        username: 'demouser',
        password: await bcrypt.hash('password', 10),
        isAdmin: false,
        favoriteLocations: []
      },
      {
        username: 'admin',
        password: await bcrypt.hash('admin', 10),
        isAdmin: true,
        favoriteLocations: []
      }
    ];
    
    // Insert only users that don't exist
    for (const userData of demoUsers) {
      const exists = await User.findOne({ username: userData.username });
      if (!exists) {
        await User.create(userData);
        console.log(`✓ Created user: ${userData.username}`);
      } else {
        console.log(`- User already exists: ${userData.username}`);
      }
    }
    
    console.log('=== User Seeding Complete ===');
  } catch (err) {
    console.error('Failed to seed users:', err.message);
    throw err;
  }
}

module.exports = seedUsers;
