import mongoose from 'mongoose';
import dns from 'node:dns';

// Ensure DNS SRV resolution works across diverse network environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (dnsErr) {
  // If setServers is restricted, continue with system defaults
}

/**
 * Mask sensitive credentials in MongoDB connection string for safe logging
 * @param {string} uri 
 * @returns {string} masked uri
 */
export const maskMongoUri = (uri) => {
  if (!uri) return 'undefined';
  return uri.replace(/\/\/(.*?)@/, '//***:***@');
};

/**
 * Get human-readable connection state
 * @returns {string}
 */
export const getDatabaseStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };
  const stateCode = mongoose.connection.readyState;
  return states[stateCode] || 'unknown';
};

/**
 * Initialize MongoDB connection
 */
export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not defined in environment variables.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} (${maskMongoUri(mongoUri)})`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
  }
};

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose default connection open');
});

mongoose.connection.on('error', (err) => {
  console.error(`⚠️ Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose default connection disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed through app termination');
  process.exit(0);
});
