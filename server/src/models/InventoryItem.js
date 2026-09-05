import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Item type is required'],
      enum: ['RAW_MATERIAL', 'FINISHED_PRODUCT'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      default: 0,
      min: [0, 'Quantity cannot be negative'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
    },
    minimumStock: {
      type: Number,
      required: [true, 'Minimum stock level is required'],
      default: 0,
      min: [0, 'Minimum stock cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual status field: OUT OF STOCK, LOW STOCK, IN STOCK
inventoryItemSchema.virtual('status').get(function () {
  if (this.quantity === 0) return 'OUT OF STOCK';
  if (this.quantity <= this.minimumStock) return 'LOW STOCK';
  return 'IN STOCK';
});

// Virtual needToPurchase field
inventoryItemSchema.virtual('needToPurchase').get(function () {
  if (this.quantity <= this.minimumStock) {
    return Math.max(0, this.minimumStock - this.quantity);
  }
  return 0;
});

inventoryItemSchema.set('toJSON', { virtuals: true });
inventoryItemSchema.set('toObject', { virtuals: true });

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

export default InventoryItem;
