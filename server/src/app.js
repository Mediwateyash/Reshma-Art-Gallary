import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();

// Middleware
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or matching origin
      if (
        !origin ||
        origin === allowedOrigin ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('https://localhost') ||
        origin.startsWith('capacitor://')
      ) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive API access
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root & /api Overview Route
const apiOverviewHandler = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Reshma's Art Gallery REST API is running",
    healthCheck: '/api/health',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/login',
      inventory: '/api/inventory',
      history: '/api/history',
      dashboard: '/api/dashboard',
    },
  });
};

app.get('/', apiOverviewHandler);
app.get('/api', apiOverviewHandler);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
  });
});

export default app;
