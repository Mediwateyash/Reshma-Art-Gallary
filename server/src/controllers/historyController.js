import StockTransaction from '../models/StockTransaction.js';

// @desc    Get all stock transactions history
// @route   GET /api/history
// @access  Private
export const getStockHistory = async (req, res) => {
  try {
    const transactions = await StockTransaction.find()
      .populate('inventoryItem', 'name type unit category minimumStock quantity')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(200);

    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error('getStockHistory error:', error);
    return res.status(500).json({ message: 'Error fetching stock transaction history' });
  }
};
