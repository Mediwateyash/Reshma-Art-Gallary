import express from 'express';
import {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  getPurchaseList,
} from '../controllers/inventoryController.js';
import { addStock, removeStock } from '../controllers/stockController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply auth protection to all inventory routes
router.use(protect);

// Specific routes
router.get('/purchase-list', getPurchaseList);

// Item collection routes
router.route('/')
  .get(getInventoryItems)
  .post(createInventoryItem);

// Single item routes
router.route('/:id')
  .get(getInventoryItemById)
  .put(updateInventoryItem);

// Stock modification routes
router.post('/:id/add-stock', addStock);
router.post('/:id/remove-stock', removeStock);

export default router;
