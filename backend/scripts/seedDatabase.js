import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Station } from '../models/Station.js';
import { Alert } from '../models/Alert.js';
import { ResponseLog } from '../models/ResponseLog.js';
import { initialStations, initialAlerts, initialResponseLogs } from '../services/seedData.js';

dotenv.config();

const seedDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.log('====================================================');
    console.log('⚠️  MONGODB_URI is not set in environment variables.');
    console.log('   The MERN backend will use its high-speed In-Memory Resilient Store.');
    console.log('   To seed MongoDB, set MONGODB_URI in backend/.env');
    console.log('====================================================');
    process.exit(0);
  }

  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);

    console.log('Clearing existing collections...');
    await Station.deleteMany({});
    await Alert.deleteMany({});
    await ResponseLog.deleteMany({});

    console.log('Seeding Stations...');
    await Station.insertMany(initialStations);
    console.log(`✓ Inserted ${initialStations.length} station records.`);

    console.log('Seeding Alerts...');
    await Alert.insertMany(initialAlerts);
    console.log(`✓ Inserted ${initialAlerts.length} alert records.`);

    console.log('Seeding Response Logs...');
    await ResponseLog.insertMany(initialResponseLogs);
    console.log(`✓ Inserted ${initialResponseLogs.length} response log records.`);

    console.log('====================================================');
    console.log('🎉 FloodGuard AI MongoDB Database Seeded Successfully!');
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
