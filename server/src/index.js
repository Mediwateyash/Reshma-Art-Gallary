import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { seedAdmin } from './utils/seedAdmin.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to database
  await connectDB();

  // Seed initial admin if needed
  await seedAdmin();

  // Start HTTP server
  app.listen(PORT, () => {
    console.log(`🚀 Reshma's Art Gallery Server running on http://localhost:${PORT}`);
    console.log(`🩺 Health check available at http://localhost:${PORT}/api/health`);
  });
};

startServer();
