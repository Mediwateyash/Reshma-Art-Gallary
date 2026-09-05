import InventoryItem from '../models/InventoryItem.js';
import StockTransaction from '../models/StockTransaction.js';

// @desc    Add stock to an item
// @route   POST /api/inventory/:id/add-stock
// @access  Private
export const addStock = async (req, res) => {
  try {
    const { quantity, reason } = req.body;
    const addQty = Number(quantity);

    if (!addQty || isNaN(addQty) || addQty <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number greater than 0' });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Reason for adding stock is required' });
    }

    const item = await InventoryItem.findById(req.params.id);
    if (!item || !item.isActive) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Update quantity
    item.quantity = (item.quantity || 0) + addQty;
    await item.save();

    // Record transaction
    const transaction = await StockTransaction.create({
      inventoryItem: item._id,
      action: 'ADD',
      quantity: addQty,
      reason: reason.trim(),
      createdBy: req.user?._id,
    });

    return res.status(200).json({
      success: true,
      data: {
        item,
        transaction,
      },
      message: `Successfully added ${addQty} ${item.unit} to ${item.name}`,
    });
  } catch (error) {
    console.error('addStock error:', error);
    return res.status(500).json({ message: error.message || 'Error adding stock' });
  }
};

// @desc    Remove stock from an item
// @route   POST /api/inventory/:id/remove-stock
// @access  Private
export const removeStock = async (req, res) => {
  try {
    const { quantity, reason } = req.body;
    const removeQty = Number(quantity);

    if (!removeQty || isNaN(removeQty) || removeQty <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number greater than 0' });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Reason for removing stock is required' });
    }

    const item = await InventoryItem.findById(req.params.id);
    if (!item || !item.isActive) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Validate available stock
    if (item.quantity < removeQty) {
      return res.status(400).json({
        message: `Not enough stock. Available: ${item.quantity}`,
      });
    }

    // Update quantity
    item.quantity = item.quantity - removeQty;
    await item.save();

    // Record transaction
    const transaction = await StockTransaction.create({
      inventoryItem: item._id,
      action: 'REMOVE',
      quantity: removeQty,
      reason: reason.trim(),
      createdBy: req.user?._id,
    });

    return res.status(200).json({
      success: true,
      data: {
        item,
        transaction,
      },
      message: `Successfully removed ${removeQty} ${item.unit} from ${item.name}`,
    });
  } catch (error) {
    console.error('removeStock error:', error);
    return res.status(500).json({ message: error.message || 'Error removing stock' });
  }
};
