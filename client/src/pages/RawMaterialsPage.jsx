import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Boxes,
  Search,
  Plus,
  Edit2,
  PlusCircle,
  MinusCircle,
  AlertCircle,
} from 'lucide-react';
import { inventoryApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import AddStockModal from '../components/AddStockModal';
import RemoveStockModal from '../components/RemoveStockModal';
import EditItemModal from '../components/EditItemModal';

export default function RawMaterialsPage() {
  const { openAddItem } = useOutletContext() || {};
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [isRemoveStockOpen, setIsRemoveStockOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await inventoryApi.getItems({
        type: 'RAW_MATERIAL',
        search: search.trim(),
      });
      if (res.success) {
        setItems(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch raw materials');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMaterials();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchMaterials]);

  useEffect(() => {
    const handleUpdate = () => fetchMaterials();
    window.addEventListener('inventoryUpdated', handleUpdate);
    return () => window.removeEventListener('inventoryUpdated', handleUpdate);
  }, [fetchMaterials]);

  const handleOpenAddStock = (item) => {
    setSelectedItem(item);
    setIsAddStockOpen(true);
  };

  const handleOpenRemoveStock = (item) => {
    setSelectedItem(item);
    setIsRemoveStockOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title-with-badge">
            <h1 className="page-title">Raw Materials</h1>
            <span className="count-pill">{items.length}</span>
          </div>
          <p className="page-subtitle">
            Crafting supplies, canvases, paints, yarns, and art media
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => openAddItem && openAddItem('RAW_MATERIAL')}
        >
          <Plus size={18} />
          <span>+ Add Raw Material</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search raw materials by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button
              className="clear-search-btn"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content */}
      {loading && items.length === 0 ? (
        <div className="page-loading">
          <div className="spinner"></div>
          <p>Loading raw materials...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state-card">
          <Boxes size={48} className="empty-icon" />
          <h3>No Raw Materials Found</h3>
          <p>
            {search
              ? `No raw materials match "${search}". Try clearing the search.`
              : 'You have not added any raw materials yet. Start by adding your first material.'}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => openAddItem && openAddItem('RAW_MATERIAL')}
          >
            <Plus size={18} />
            <span>Add Raw Material</span>
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="desktop-view table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Material Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Minimum Stock</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="item-name-cell">
                        <span className="font-semibold">{item.name}</span>
                        {item.description && (
                          <span className="item-desc-sub">{item.description}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="category-tag">{item.category}</span>
                    </td>
                    <td>
                      <span className="quantity-highlight font-semibold">
                        {item.quantity} {item.unit}
                      </span>
                    </td>
                    <td className="text-muted">
                      {item.minimumStock} {item.unit}
                    </td>
                    <td>
                      <StatusBadge
                        quantity={item.quantity}
                        minimumStock={item.minimumStock}
                      />
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-xs btn-outline-success"
                          onClick={() => handleOpenAddStock(item)}
                          title="Add Stock"
                        >
                          <PlusCircle size={14} />
                          <span>Add</span>
                        </button>
                        <button
                          className="btn btn-xs btn-outline-danger"
                          onClick={() => handleOpenRemoveStock(item)}
                          title="Remove Stock"
                          disabled={item.quantity === 0}
                        >
                          <MinusCircle size={14} />
                          <span>Remove</span>
                        </button>
                        <button
                          className="btn btn-xs btn-secondary"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Details"
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="mobile-view cards-list">
            {items.map((item) => (
              <div key={item._id} className="mobile-item-card">
                <div className="mobile-card-header">
                  <div>
                    <h3 className="mobile-card-title">{item.name}</h3>
                    <span className="category-tag">{item.category}</span>
                  </div>
                  <StatusBadge
                    quantity={item.quantity}
                    minimumStock={item.minimumStock}
                  />
                </div>

                {item.description && (
                  <p className="mobile-card-desc">{item.description}</p>
                )}

                <div className="mobile-card-details">
                  <div className="detail-box">
                    <span className="detail-label">Current Stock</span>
                    <span className="detail-value text-primary font-semibold">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  <div className="detail-box">
                    <span className="detail-label">Minimum Level</span>
                    <span className="detail-value text-muted">
                      {item.minimumStock} {item.unit}
                    </span>
                  </div>
                </div>

                <div className="mobile-card-actions">
                  <button
                    className="btn btn-sm btn-outline-success flex-1"
                    onClick={() => handleOpenAddStock(item)}
                  >
                    <PlusCircle size={15} />
                    <span>+ Add</span>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger flex-1"
                    onClick={() => handleOpenRemoveStock(item)}
                    disabled={item.quantity === 0}
                  >
                    <MinusCircle size={15} />
                    <span>- Remove</span>
                  </button>
                  <button
                    className="btn btn-sm btn-secondary flex-1"
                    onClick={() => handleOpenEdit(item)}
                  >
                    <Edit2 size={15} />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      <AddStockModal
        isOpen={isAddStockOpen}
        onClose={() => setIsAddStockOpen(false)}
        item={selectedItem}
        onStockAdded={() => {
          fetchMaterials();
          window.dispatchEvent(new Event('inventoryUpdated'));
        }}
      />

      <RemoveStockModal
        isOpen={isRemoveStockOpen}
        onClose={() => setIsRemoveStockOpen(false)}
        item={selectedItem}
        onStockRemoved={() => {
          fetchMaterials();
          window.dispatchEvent(new Event('inventoryUpdated'));
        }}
      />

      <EditItemModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        item={selectedItem}
        onItemUpdated={() => {
          fetchMaterials();
          window.dispatchEvent(new Event('inventoryUpdated'));
        }}
      />
    </div>
  );
}
