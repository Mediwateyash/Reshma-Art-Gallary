import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Printer, CheckSquare, Square, AlertCircle, PlusCircle } from 'lucide-react';
import { inventoryApi } from '../services/api';
import AddStockModal from '../components/AddStockModal';

export default function PurchaseListPage() {
  const [items, setItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add stock modal
  const [activeStockItem, setActiveStockItem] = useState(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const fetchPurchaseList = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await inventoryApi.getPurchaseList();
      if (res.success) {
        setItems(res.data);
        // By default select all low stock items for easy printing
        setSelectedIds(new Set(res.data.map((item) => item._id)));
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch purchase list');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchaseList();

    const handleUpdate = () => fetchPurchaseList();
    window.addEventListener('inventoryUpdated', handleUpdate);
    return () => window.removeEventListener('inventoryUpdated', handleUpdate);
  }, [fetchPurchaseList]);

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i._id)));
    }
  };

  const toggleSelectItem = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenAddStock = (item) => {
    setActiveStockItem(item);
    setIsStockModalOpen(true);
  };

  // Calculate items to print based on selection
  const printItems = items.filter((i) => selectedIds.has(i._id));

  return (
    <div className="page-container purchase-page">
      {/* Printable Sheet (visible on print only or on-screen) */}
      <div className="print-header-only">
        <h1>Reshma's Art Gallery — Purchase Order List</h1>
        <p>Generated on: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
      </div>

      {/* Screen Page Header */}
      <div className="page-header no-print">
        <div>
          <div className="page-title-with-badge">
            <h1 className="page-title">Purchase List</h1>
            <span className="count-pill">{items.length}</span>
          </div>
          <p className="page-subtitle">
            Items at or below minimum stock requiring replenishment
          </p>
        </div>

        <div className="page-header-actions">
          <button
            className="btn btn-primary print-trigger-btn"
            onClick={handlePrint}
            disabled={items.length === 0 || selectedIds.size === 0}
          >
            <Printer size={18} />
            <span>Print Purchase List ({selectedIds.size})</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-error no-print">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="page-loading no-print">
          <div className="spinner"></div>
          <p>Analyzing stock levels for purchase list...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state-card no-print">
          <ShoppingCart size={48} className="empty-icon" />
          <h3>Purchase List is Empty</h3>
          <p>
            All raw materials and finished products are currently at or above their minimum required stock levels!
          </p>
        </div>
      ) : (
        <>
          {/* Action Bar for selection */}
          <div className="purchase-controls-bar no-print">
            <button className="select-all-btn" onClick={toggleSelectAll}>
              {selectedIds.size === items.length ? (
                <CheckSquare size={18} className="text-primary" />
              ) : (
                <Square size={18} className="text-muted" />
              )}
              <span>
                {selectedIds.size === items.length
                  ? 'Deselect All Items'
                  : 'Select All Items'}
              </span>
            </button>
            <span className="selection-count-text">
              {selectedIds.size} of {items.length} selected for print
            </span>
          </div>

          {/* Desktop Table */}
          <div className="desktop-view table-responsive print-table-container">
            <table className="data-table purchase-table">
              <thead>
                <tr>
                  <th className="no-print" style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.size === items.length && items.length > 0}
                      onChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
                  <th>Item Name</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Minimum Stock</th>
                  <th className="highlight-column">Need to Purchase</th>
                  <th className="no-print text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isSelected = selectedIds.has(item._id);
                  const needToPurchase = Math.max(0, item.minimumStock - item.quantity);

                  return (
                    <tr
                      key={item._id}
                      className={`${!isSelected ? 'unselected-row' : ''}`}
                    >
                      <td className="no-print">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectItem(item._id)}
                          aria-label={`Select ${item.name}`}
                        />
                      </td>
                      <td className="font-semibold">{item.name}</td>
                      <td>
                        {item.type === 'FINISHED_PRODUCT' ? (
                          <span className="type-pill type-pill-product">Finished</span>
                        ) : (
                          <span className="type-pill type-pill-material">Material</span>
                        )}
                      </td>
                      <td className="text-muted">{item.category}</td>
                      <td>
                        <span className={item.quantity === 0 ? 'text-danger font-semibold' : 'text-warning font-semibold'}>
                          {item.quantity} {item.unit}
                        </span>
                      </td>
                      <td className="text-muted">
                        {item.minimumStock} {item.unit}
                      </td>
                      <td className="highlight-column font-semibold text-primary">
                        {needToPurchase} {item.unit}
                      </td>
                      <td className="no-print text-right">
                        <button
                          className="btn btn-xs btn-outline-success"
                          onClick={() => handleOpenAddStock(item)}
                        >
                          <PlusCircle size={14} />
                          <span>Add Stock</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="mobile-view cards-list no-print">
            {items.map((item) => {
              const isSelected = selectedIds.has(item._id);
              const needToPurchase = Math.max(0, item.minimumStock - item.quantity);

              return (
                <div
                  key={item._id}
                  className={`mobile-purchase-card ${
                    isSelected ? 'selected-card' : ''
                  }`}
                >
                  <div className="mobile-purchase-header">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectItem(item._id)}
                      />
                      <span className="font-semibold">{item.name}</span>
                    </label>
                    <span className="category-tag">{item.category}</span>
                  </div>

                  <div className="mobile-purchase-grid">
                    <div className="purchase-stat-box">
                      <span className="label">Current</span>
                      <span className={item.quantity === 0 ? 'value text-danger' : 'value text-warning'}>
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    <div className="purchase-stat-box">
                      <span className="label">Minimum</span>
                      <span className="value text-muted">
                        {item.minimumStock} {item.unit}
                      </span>
                    </div>
                    <div className="purchase-stat-box highlight-box">
                      <span className="label">To Purchase</span>
                      <span className="value text-primary font-bold">
                        {needToPurchase} {item.unit}
                      </span>
                    </div>
                  </div>

                  <div className="mobile-purchase-footer">
                    <button
                      className="btn btn-sm btn-outline-success btn-block"
                      onClick={() => handleOpenAddStock(item)}
                    >
                      <PlusCircle size={15} />
                      <span>+ Restock Item</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add Stock Modal */}
      <AddStockModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        item={activeStockItem}
        onStockAdded={() => {
          fetchPurchaseList();
          window.dispatchEvent(new Event('inventoryUpdated'));
        }}
      />
    </div>
  );
}
