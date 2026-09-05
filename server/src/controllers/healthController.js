import { getDatabaseStatus } from '../config/db.js';

/**
 * Health check controller
 * @route GET /api/health
 */
export const getHealth = (req, res) => {
  const dbStatus = getDatabaseStatus();

  res.status(200).json({
    success: true,
    message: "Reshma's Art Gallery API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      connected: dbStatus === 'connected'
    }
  });
};
