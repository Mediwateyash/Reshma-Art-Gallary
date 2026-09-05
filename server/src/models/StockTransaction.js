import mongoose from 'mongoose';

const stockTransactionSchema = new mongoose.Schema(
  {
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: [true, 'Inventory item reference is required'],
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: ['ADD', 'REMOVE'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

const StockTransaction = mongoose.model('StockTransaction', stockTransactionSchema);

export default StockTransaction;
