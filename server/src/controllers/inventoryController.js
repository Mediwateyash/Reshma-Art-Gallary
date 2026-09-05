import InventoryItem from '../models/InventoryItem.js';
import StockTransaction from '../models/StockTransaction.js';

// @desc    Get all inventory items (with optional type and search filter)
// @route   GET /api/inventory
// @access  Private
export const getInventoryItems = async (req, res) => {
  try {
    const { type, search } = req.query;
    const filter = { isActive: true };

    if (type && ['RAW_MATERIAL', 'FINISHED_PRODUCT'].includes(type.toUpperCase())) {
      filter.type = type.toUpperCase();
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { category: searchRegex }];
    }

    const items = await InventoryItem.find(filter).sort({ name: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error('getInventoryItems error:', error);
    return res.status(500).json({ message: 'Error fetching inventory items' });
  }
};

// @desc    Get single inventory item by ID
// @route   GET /api/inventory/:id
// @access  Private
export const getInventoryItemById = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);

    if (!item || !item.isActive) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('getInventoryItemById error:', error);
    return res.status(500).json({ message: 'Error fetching inventory item' });
  }
};

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private
export const createInventoryItem = async (req, res) => {
  try {
    const { name, type, category, quantity, unit, minimumStock, description } = req.body;

    if (!name || !type || !category || !unit) {
      return res.status(400).json({
        message: 'Name, type, category, and unit are required fields',
      });
    }

    const initialQuantity = Number(quantity) || 0;
    const minStockLevel = Number(minimumStock) || 0;

    if (initialQuantity < 0) {
      return res.status(400).json({ message: 'Initial quantity cannot be negative' });
    }

    if (minStockLevel < 0) {
      return res.status(400).json({ message: 'Minimum stock cannot be negative' });
    }

    const normalizedType = type.toUpperCase() === 'FINISHED_PRODUCT' ? 'FINISHED_PRODUCT' : 'RAW_MATERIAL';

    const newItem = await InventoryItem.create({
      name: name.trim(),
      type: normalizedType,
      category: category.trim(),
      quantity: initialQuantity,
      unit: unit.trim(),
      minimumStock: minStockLevel,
      description: (description || '').trim(),
      isActive: true,
    });

    // If initial quantity is greater than zero, record Opening Stock transaction
    if (initialQuantity > 0) {
      await StockTransaction.create({
        inventoryItem: newItem._id,
        action: 'ADD',
        quantity: initialQuantity,
        reason: 'Opening Stock',
        createdBy: req.user?._id,
      });
    }

    return res.status(201).json({
      success: true,
      data: newItem,
      message: 'Item created successfully',
    });
  } catch (error) {
    console.error('createInventoryItem error:', error);
    return res.status(500).json({ message: error.message || 'Error creating inventory item' });
  }
};

// @desc    Update an existing inventory item (name, type, category, unit, minStock, description)
// @route   PUT /api/inventory/:id
// @access  Private
// NOTE: Direct quantity editing is strictly forbidden to preserve history integrity
export const updateInventoryItem = async (req, res) => {
  try {
    const { name, type, category, unit, minimumStock, description } = req.body;

    const item = await InventoryItem.findById(req.params.id);
    if (!item || !item.isActive) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    if (name) item.name = name.trim();
    if (type && ['RAW_MATERIAL', 'FINISHED_PRODUCT'].includes(type.toUpperCase())) {
      item.type = type.toUpperCase();
    }
    if (category) item.category = category.trim();
    if (unit) item.unit = unit.trim();
    if (minimumStock !== undefined && minimumStock !== null) {
      const minStockNum = Number(minimumStock);
      if (minStockNum < 0) {
        return res.status(400).json({ message: 'Minimum stock cannot be negative' });
      }
      item.minimumStock = minStockNum;
    }
    if (description !== undefined) item.description = description.trim();

    await item.save();

    return res.status(200).json({
      success: true,
      data: item,
      message: 'Item updated successfully',
    });
  } catch (error) {
    console.error('updateInventoryItem error:', error);
    return res.status(500).json({ message: error.message || 'Error updating inventory item' });
  }
};

// @desc    Get purchase list (items with quantity <= minimumStock)
// @route   GET /api/inventory/purchase-list
// @access  Private
export const getPurchaseList = async (req, res) => {
  try {
    const items = await InventoryItem.find({
      isActive: true,
      $expr: { $lte: ['$quantity', '$minimumStock'] },
    }).sort({ quantity: 1, name: 1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error('getPurchaseList error:', error);
    return res.status(500).json({ message: 'Error fetching purchase list' });
  }
};
