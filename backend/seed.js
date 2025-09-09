const mongoose = require('mongoose');
const User = require('./models/User');

const seedData = async () => {
  try {
    // Connect to MongoDB
  await mongoose.connect('mongodb://localhost:27017/travira', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing users (optional - uncomment if needed)
    // await User.deleteMany({});
    // console.log('Cleared existing users');

    // Create default admin user
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const adminUser = new User({
        username: 'admin',
        email: 'admin@guardianeagle.com',
        password: 'admin123',
        role: 'admin',
        status: 'active',
        verified: true,
        location: 'Delhi, India'
      });

      await adminUser.save();
      console.log('✅ Default admin user created');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create sample officer users
    const officers = [
      {
        username: 'officer1',
        email: 'officer1@tourism.gov',
        password: 'officer123',
        role: 'officer',
        status: 'pending',
        verified: false,
        location: 'Mumbai, India'
      },
      {
        username: 'officer2',
        email: 'officer2@police.gov',
        password: 'officer123',
        role: 'officer',
        status: 'active',
        verified: true,
        location: 'Bangalore, India'
      }
    ];

    for (const officerData of officers) {
      const exists = await User.findOne({ username: officerData.username });
      if (!exists) {
        const officer = new User(officerData);
        await officer.save();
        console.log(`✅ Officer user created: ${officerData.username}`);
      } else {
        console.log(`ℹ️  Officer ${officerData.username} already exists`);
      }
    }

    // Create sample tourist users
    const tourists = [
      {
        username: 'tourist_john',
        email: 'john.doe@email.com',
        password: 'tourist123',
        role: 'tourist',
        status: 'active',
        verified: true,
        location: 'New York, USA'
      },
      {
        username: 'tourist_jane',
        email: 'jane.smith@email.com',
        password: 'tourist123',
        role: 'tourist',
        status: 'active',
        verified: true,
        location: 'London, UK'
      },
      {
        username: 'tourist_bob',
        email: 'bob.johnson@email.com',
        password: 'tourist123',
        role: 'tourist',
        status: 'active',
        verified: true,
        location: 'Sydney, Australia'
      }
    ];

    for (const touristData of tourists) {
      const exists = await User.findOne({ username: touristData.username });
      if (!exists) {
        const tourist = new User(touristData);
        await tourist.save();
        console.log(`✅ Tourist user created: ${touristData.username}`);
      } else {
        console.log(`ℹ️  Tourist ${touristData.username} already exists`);
      }
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin: admin / admin123');
    console.log('   Officer: officer1 / officer123 (pending approval)');
    console.log('   Officer: officer2 / officer123 (active)');
    console.log('   Tourist: tourist_john / tourist123');
    console.log('   Tourist: tourist_jane / tourist123');
    console.log('   Tourist: tourist_bob / tourist123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
};

// Run the seeding script
seedData();
