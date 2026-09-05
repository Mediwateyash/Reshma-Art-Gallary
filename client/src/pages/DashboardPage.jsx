import React, { useState, useEffect, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Boxes,
  Palette,
  AlertTriangle,
  XCircle,
  Plus,
  ShoppingCart,
  ArrowRight,
  TrendingUp,
  Package,
  Clock,
  PlusCircle,
} from 'lucide-react';
import { dashboardApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import AddStockModal from '../components/AddStockModal';

export default function DashboardPage() {
  const { openAddItem } = useOutletContext() || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stock modal state
  const [activeStockItem, setActiveStockItem] = useState(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardApi.getDashboardData();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    // Listen to global updates
    const handleUpdate = () => fetchDashboard();
    window.addEventListener('inventoryUpdated', handleUpdate);
    return () => window.removeEventListener('inventoryUpdated', handleUpdate);
  }, [fetchDashboard]);

  const handleOpenAddStock = (item) => {
    setActiveStockItem(item);
    setIsStockModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !data) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Loading gallery dashboard...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="page-error">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchDashboard}>
          Retry
        </button>
      </div>
    );
  }

  const stats = data?.stats || {
    totalItems: 0,
    rawMaterials: 0,
    finishedProducts: 0,
    lowStock: 0,
    outOfStock: 0,
  };

  const lowStockItems = data?.lowStockItems || [];
  const recentTransactions = data?.recentTransactions || [];

  return (
    <div className="page-container dashboard-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Gallery Dashboard</h1>
          <p className="page-subtitle">Real-time inventory summary and stock alerts</p>
        </div>

        <div className="quick-actions-bar">
          <button
            className="btn btn-primary"
            onClick={() => openAddItem && openAddItem()}
          >
            <Plus size={18} />
            <span>Add Item</span>
          </button>
          <Link to="/raw-materials" className="btn btn-secondary">
            <Boxes size={18} />
            <span>View Inventory</span>
          </Link>
          <Link to="/purchase-list" className="btn btn-warning-outline">
            <ShoppingCart size={18} />
            <span>Purchase List ({stats.lowStock + stats.outOfStock})</span>
          </Link>
        </div>
      </div>

      {/* Metrics Stat Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Items</span>
            <div className="stat-icon-badge stat-icon-primary">
              <Package size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.totalItems}</div>
          <div className="stat-footer">
            <Link to="/raw-materials" className="stat-link">
              View all inventory &rarr;
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Raw Materials</span>
            <div className="stat-icon-badge stat-icon-info">
              <Boxes size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.rawMaterials}</div>
          <div className="stat-footer">
            <Link to="/raw-materials" className="stat-link">
              View materials &rarr;
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Finished Products</span>
            <div className="stat-icon-badge stat-icon-accent">
              <Palette size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.finishedProducts}</div>
          <div className="stat-footer">
            <Link to="/finished-products" className="stat-link">
              View products &rarr;
            </Link>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-header">
            <span className="stat-label">Low Stock</span>
            <div className="stat-icon-badge stat-icon-warning">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="stat-value text-warning">{stats.lowStock}</div>
          <div className="stat-footer">
            <Link to="/purchase-list" className="stat-link">
              Reorder needed &rarr;
            </Link>
          </div>
        </div>

        <div className="stat-card stat-card-danger">
          <div className="stat-header">
            <span className="stat-label">Out of Stock</span>
            <div className="stat-icon-badge stat-icon-danger">
              <XCircle size={20} />
            </div>
          </div>
          <div className="stat-value text-danger">{stats.outOfStock}</div>
          <div className="stat-footer">
            <Link to="/purchase-list" className="stat-link">
              Urgent restock &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard Two Column Sections */}
      <div className="dashboard-grid">
        {/* Section 1: Low Stock Items */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">
              <AlertTriangle size={20} className="text-warning" />
              <h2>Low Stock Items</h2>
            </div>
            <Link to="/purchase-list" className="card-header-link">
              <span>View Purchase List</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="dashboard-card-body">
            {lowStockItems.length === 0 ? (
              <div className="empty-state-simple">
                <p>✨ All inventory items are currently well-stocked!</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Current</th>
                      <th>Minimum</th>
                      <th>Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.map((item) => (
                      <tr key={item._id}>
                        <td className="font-semibold">{item.name}</td>
                        <td className="text-muted">{item.category}</td>
                        <td>
                          <strong>{item.quantity}</strong> {item.unit}
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
                        <td className="text-right">
                          <button
                            className="btn btn-xs btn-primary"
                            onClick={() => handleOpenAddStock(item)}
                          >
                            <PlusCircle size={14} />
                            <span>Add Stock</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Recent Stock Changes */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">
              <Clock size={20} className="text-primary" />
              <h2>Recent Stock Changes</h2>
            </div>
            <Link to="/history" className="card-header-link">
              <span>Full History</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="dashboard-card-body">
            {recentTransactions.length === 0 ? (
              <div className="empty-state-simple">
                <p>No recent stock transactions recorded.</p>
              </div>
            ) : (
              <div className="recent-transactions-list">
                {recentTransactions.map((tx) => {
                  const isAdd = tx.action === 'ADD';
                  const itemName = tx.inventoryItem?.name || 'Deleted Item';
                  const unit = tx.inventoryItem?.unit || 'units';

                  return (
                    <div key={tx._id} className="transaction-item-row">
                      <div className="tx-left">
                        <div
                          className={`tx-badge ${
                            isAdd ? 'tx-badge-add' : 'tx-badge-remove'
                          }`}
                        >
                          {isAdd ? `+${tx.quantity}` : `-${tx.quantity}`} {unit}
                        </div>
                        <div className="tx-details">
                          <span className="tx-item-name">{itemName}</span>
                          <span className="tx-reason-tag">{tx.reason}</span>
                        </div>
                      </div>
                      <div className="tx-right">
                        <span className="tx-date">{formatDate(tx.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Stock Modal */}
      <AddStockModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        item={activeStockItem}
        onStockAdded={() => {
          fetchDashboard();
          window.dispatchEvent(new Event('inventoryUpdated'));
        }}
      />
    </div>
  );
}
