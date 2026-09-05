import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import inventoryRoutes from './inventoryRoutes.js';

const apiRouter = Router();

// Mount health route: /api/health
apiRouter.use('/', healthRoutes);

// Mount authentication routes: /api/auth
apiRouter.use('/auth', authRoutes);

// Mount inventory routes: /api/inventory
apiRouter.use('/inventory', inventoryRoutes);

export default apiRouter;
