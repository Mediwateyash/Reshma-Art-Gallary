import React, { useState, useEffect, useCallback } from 'react';
import { History, Search, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';
import { historyApi } from '../services/api';

export default function StockHistoryPage() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await historyApi.getHistory();
      if (res.success) {
        setHistory(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch stock history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();

    const handleUpdate = () => fetchHistory();
    window.addEventListener('inventoryUpdated', handleUpdate);
    return () => window.removeEventListener('inventoryUpdated', handleUpdate);
  }, [fetchHistory]);

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

  const filteredHistory = history.filter((tx) => {
    const itemName = tx.inventoryItem?.name || '';
    const reason = tx.reason || '';
    const matchesSearch =
      itemName.toLowerCase().includes(search.toLowerCase()) ||
      reason.toLowerCase().includes(search.toLowerCase());

    const matchesAction =
      filterAction === 'ALL' || tx.action === filterAction;

    return matchesSearch && matchesAction;
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title-with-badge">
            <h1 className="page-title">Stock History</h1>
            <span className="count-pill">{filteredHistory.length}</span>
          </div>
          <p className="page-subtitle">
            Complete audit trail of all additions and removals
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchHistory}>
          Refresh History
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by item name or reason (e.g. Purchase, Used)..."
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

        <div className="filter-pills-group">
          <button
            className={`filter-pill ${filterAction === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterAction('ALL')}
          >
            All Actions
          </button>
          <button
            className={`filter-pill ${filterAction === 'ADD' ? 'active' : ''}`}
            onClick={() => setFilterAction('ADD')}
          >
            + Add Stock
          </button>
          <button
            className={`filter-pill ${filterAction === 'REMOVE' ? 'active' : ''}`}
            onClick={() => setFilterAction('REMOVE')}
          >
            - Remove Stock
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content */}
      {loading && history.length === 0 ? (
        <div className="page-loading">
          <div className="spinner"></div>
          <p>Loading history records...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="empty-state-card">
          <History size={48} className="empty-icon" />
          <h3>No History Records Found</h3>
          <p>
            {search || filterAction !== 'ALL'
              ? 'No transactions match the selected filter.'
              : 'Stock transactions will appear here when you add or remove inventory items.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="desktop-view table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Action</th>
                  <th>Quantity</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((tx) => {
                  const isAdd = tx.action === 'ADD';
                  const item = tx.inventoryItem;
                  const unit = item?.unit || '';

                  return (
                    <tr key={tx._id}>
                      <td className="text-muted font-mono">{formatDate(tx.createdAt)}</td>
                      <td>
                        <span className="font-semibold">
                          {item?.name || 'Deleted Item'}
                        </span>
                      </td>
                      <td>
                        {item?.type === 'FINISHED_PRODUCT' ? (
                          <span className="type-pill type-pill-product">Finished</span>
                        ) : (
                          <span className="type-pill type-pill-material">Material</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`action-badge ${
                            isAdd ? 'action-badge-add' : 'action-badge-remove'
                          }`}
                        >
                          {isAdd ? (
                            <>
                              <ArrowUpRight size={14} /> ADD
                            </>
                          ) : (
                            <>
                              <ArrowDownRight size={14} /> REMOVE
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`tx-quantity font-semibold ${
                            isAdd ? 'text-success' : 'text-danger'
                          }`}
                        >
                          {isAdd ? `+${tx.quantity}` : `-${tx.quantity}`} {unit}
                        </span>
                      </td>
                      <td>
                        <span className="reason-badge">{tx.reason}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="mobile-view cards-list">
            {filteredHistory.map((tx) => {
              const isAdd = tx.action === 'ADD';
              const item = tx.inventoryItem;
              const unit = item?.unit || '';

              return (
                <div key={tx._id} className="mobile-history-card">
                  <div className="mobile-history-header">
                    <span className="mobile-history-date">{formatDate(tx.createdAt)}</span>
                    <span
                      className={`action-badge ${
                        isAdd ? 'action-badge-add' : 'action-badge-remove'
                      }`}
                    >
                      {isAdd ? '+ ADD' : '- REMOVE'}
                    </span>
                  </div>

                  <div className="mobile-history-body">
                    <div>
                      <h3 className="mobile-history-item-name">
                        {item?.name || 'Deleted Item'}
                      </h3>
                      <span className="text-muted text-xs">
                        {item?.type === 'FINISHED_PRODUCT' ? 'Finished Product' : 'Raw Material'}
                      </span>
                    </div>

                    <div className="mobile-history-qty-box">
                      <span
                        className={`font-semibold ${
                          isAdd ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {isAdd ? `+${tx.quantity}` : `-${tx.quantity}`} {unit}
                      </span>
                      <span className="reason-badge">{tx.reason}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
