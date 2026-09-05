import express from 'express';
import { getStockHistory } from '../controllers/historyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getStockHistory);

export default router;
