require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const Tourist = require('./models/Tourist');
const Incident = require('./models/Incident');
const Geofence = require('./models/Geofence');

/**
 * Database Seeding Script
 * Populates the database with sample data for testing
 */

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({ username: { $in: ['admin', 'officer1', 'tourist1', 'tourist_john'] } });
    await Tourist.deleteMany({});
    await Incident.deleteMany({});
    await Geofence.deleteMany({});

    // Seed Users
    console.log('👥 Creating users...');
    const admin = new User({
      username: 'admin',
      email: 'admin@travira.com',
      password: 'admin123',
      role: 'admin',
      status: 'active',
      verified: true
    });
    await admin.save();

    const officer = new User({
      username: 'officer1',
      email: 'officer1@travira.com',
      password: 'officer123',
      role: 'officer',
      status: 'active',
      verified: true
    });
    await officer.save();

    const tourist1 = new User({
      username: 'tourist1',
      email: 'tourist1@travira.com',
      password: 'tourist123',
      role: 'tourist',
      status: 'active',
      verified: true
    });
    await tourist1.save();

    const touristJohn = new User({
      username: 'tourist_john',
      email: 'john@example.com',
      password: 'tourist123',
      role: 'tourist',
      status: 'active',
      verified: true
    });
    await touristJohn.save();

    console.log('✅ Users created: admin, officer1, tourist1, tourist_john');

    // Seed Tourists
    console.log('🗺️  Creating tourist tracking data...');
    const tourists = [
      new Tourist({
        touristId: 'T-001',
        userId: tourist1._id,
        name: 'John Doe',
        location: { lat: 28.6139, lng: 77.2090 },
        safetyScore: 85,
        status: 'active'
      }),
      new Tourist({
        touristId: 'T-002',
        name: 'Jane Smith',
        location: { lat: 28.6129, lng: 77.2295 },
        safetyScore: 92,
        status: 'active'
      }),
      new Tourist({
        touristId: 'T-003',
        name: 'Bob Johnson',
        location: { lat: 28.6169, lng: 77.2090 },
        safetyScore: 67,
        status: 'high-risk'
      }),
      new Tourist({
        touristId: 'T-004',
        userId: touristJohn._id,
        name: 'Tourist John',
        location: { lat: 28.6195, lng: 77.2088 },
        safetyScore: 88,
        status: 'active'
      })
    ];
    
    await Tourist.insertMany(tourists);
    console.log(`✅ Created ${tourists.length} tourists`);

    // Seed Incidents
    console.log('🚨 Creating incidents...');
    const incidents = [
      new Incident({
        incidentId: 'INC-2024-001',
        type: 'Medical Emergency',
        location: 'Tourism Zone A',
        coordinates: { lat: 28.6139, lng: 77.2090 },
        severity: 'High',
        status: 'In Progress',
        touristId: 'T-001',
        tourist: 'John Doe',
        assignedOfficer: 'Officer-123',
        assignedOfficerId: officer._id,
        description: 'Tourist reported chest pain during sightseeing'
      }),
      new Incident({
        incidentId: 'INC-2024-002',
        type: 'Lost Tourist',
        location: 'Heritage Site B',
        coordinates: { lat: 28.6129, lng: 77.2295 },
        severity: 'Medium',
        status: 'Resolved',
        touristId: 'T-002',
        tourist: 'Jane Smith',
        assignedOfficer: 'Officer-456',
        description: 'Tourist separated from group, found safe',
        resolvedAt: new Date()
      }),
      new Incident({
        incidentId: 'INC-2024-003',
        type: 'Security Threat',
        location: 'Market Area C',
        coordinates: { lat: 28.6169, lng: 77.2090 },
        severity: 'High',
        status: 'Open',
        touristId: 'T-003',
        tourist: 'Bob Johnson',
        assignedOfficer: 'Emergency Response Team',
        description: 'Suspicious activity reported near tourist'
      })
    ];
    
    await Incident.insertMany(incidents);
    console.log(`✅ Created ${incidents.length} incidents`);

    // Seed Geofences
    console.log('📍 Creating geofences...');
    const geofences = [
      new Geofence({
        name: 'Red Fort Safe Zone',
        type: 'safe_zone',
        description: 'Protected tourist area around Red Fort',
        geometry: {
          type: 'Circle',
          coordinates: [77.2410, 28.6562],
          radius: 500
        },
        riskLevel: 2,
        active: true,
        alertEnabled: false
      }),
      new Geofence({
        name: 'Restricted Military Area',
        type: 'restricted_area',
        description: 'No entry - Military installation',
        geometry: {
          type: 'Circle',
          coordinates: [77.2500, 28.6600],
          radius: 1000
        },
        riskLevel: 9,
        active: true,
        alertEnabled: true
      }),
      new Geofence({
        name: 'High Crime Area',
        type: 'high_risk',
        description: 'Area with elevated security concerns',
        geometry: {
          type: 'Circle',
          coordinates: [77.2300, 28.6400],
          radius: 750
        },
        riskLevel: 7,
        active: true,
        alertEnabled: true
      }),
      new Geofence({
        name: 'India Gate Tourist Zone',
        type: 'tourist_attraction',
        description: 'Popular tourist destination with security',
        geometry: {
          type: 'Circle',
          coordinates: [77.2295, 28.6129],
          radius: 400
        },
        riskLevel: 3,
        active: true,
        alertEnabled: false
      })
    ];
    
    await Geofence.insertMany(geofences);
    console.log(`✅ Created ${geofences.length} geofences`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('  Admin:    username: admin     password: admin123');
    console.log('  Officer:  username: officer1  password: officer123');
    console.log('  Tourist:  username: tourist1  password: tourist123');
    console.log('  Tourist:  username: tourist_john  password: tourist123');
    console.log('\n🔗 Start the server with: npm start');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
