import mongoose from 'mongoose';

let isMongoConnected = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log('[Database] Running in High-Speed In-Memory Resilient Store mode (MONGODB_URI not set).');
    return;
  }
  
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 1500,
      connectTimeoutMS: 1500,
    });
    isMongoConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isMongoConnected = false;
    console.warn(`[Database] Local MongoDB unavailable (${error.message}). Running in In-Memory Resilient Store mode.`);
  }
};

export const getDbStatus = () => ({
  connected: isMongoConnected,
  type: isMongoConnected ? 'MongoDB Live' : 'In-Memory Resilient Store',
  timestamp: new Date().toISOString()
});
