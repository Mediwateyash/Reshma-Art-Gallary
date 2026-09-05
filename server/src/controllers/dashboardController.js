import InventoryItem from '../models/InventoryItem.js';
import StockTransaction from '../models/StockTransaction.js';

// @desc    Get dashboard metrics, low stock items, and recent changes
// @route   GET /api/dashboard
// @access  Private
export const getDashboardData = async (req, res) => {
  try {
    const [
      totalItems,
      rawMaterials,
      finishedProducts,
      outOfStock,
      lowStock,
      lowStockItems,
      recentTransactions,
    ] = await Promise.all([
      InventoryItem.countDocuments({ isActive: true }),
      InventoryItem.countDocuments({ isActive: true, type: 'RAW_MATERIAL' }),
      InventoryItem.countDocuments({ isActive: true, type: 'FINISHED_PRODUCT' }),
      InventoryItem.countDocuments({ isActive: true, quantity: 0 }),
      InventoryItem.countDocuments({
        isActive: true,
        quantity: { $gt: 0 },
        $expr: { $lte: ['$quantity', '$minimumStock'] },
      }),
      InventoryItem.find({
        isActive: true,
        $expr: { $lte: ['$quantity', '$minimumStock'] },
      })
        .sort({ quantity: 1, name: 1 })
        .limit(10),
      StockTransaction.find()
        .populate('inventoryItem', 'name type unit category')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .limit(8),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalItems,
          rawMaterials,
          finishedProducts,
          lowStock,
          outOfStock,
        },
        lowStockItems,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error('getDashboardData error:', error);
    return res.status(500).json({ message: 'Error fetching dashboard data' });
  }
};
