import React, { useState, useEffect } from 'react';
import { X, PlusCircle, AlertCircle } from 'lucide-react';
import { inventoryApi } from '../services/api';

const ADD_REASONS = ['Purchase', 'Returned', 'Correction', 'Other'];

export default function AddStockModal({ isOpen, onClose, item, onStockAdded }) {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('Purchase');
  const [customReason, setCustomReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity('');
      setReason('Purchase');
      setCustomReason('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const qty = Number(quantity);
    if (!qty || isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity greater than 0');
      return;
    }

    const finalReason = reason === 'Other' ? customReason.trim() : reason;
    if (!finalReason) {
      setError('Please specify a reason');
      return;
    }

    setSubmitting(true);
    try {
      await inventoryApi.addStock(item._id, {
        quantity: qty,
        reason: finalReason,
      });

      onStockAdded?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add stock');
    } finally {
      setSubmitting(false);
    }
  };

  const currentQty = Number(item.quantity) || 0;
  const addedQty = Number(quantity) || 0;
  const newTotal = currentQty + (addedQty > 0 ? addedQty : 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge badge-success-bg">
              <PlusCircle size={20} className="text-success" />
            </div>
            <div>
              <h2>Add Stock</h2>
              <span className="modal-subtitle">{item.name}</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="stock-preview-card">
          <div className="stock-preview-row">
            <span>Current Stock:</span>
            <strong>{currentQty} {item.unit}</strong>
          </div>
          {addedQty > 0 && (
            <div className="stock-preview-row new-total">
              <span>New Stock:</span>
              <strong className="text-success">{newTotal} {item.unit}</strong>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="add-qty">Quantity to Add ({item.unit}) *</label>
            <input
              id="add-qty"
              type="number"
              min="0.01"
              step="any"
              required
              placeholder="e.g. 5"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="form-input"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="add-reason">Reason *</label>
            <select
              id="add-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="form-select"
            >
              {ADD_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {reason === 'Other' && (
            <div className="form-group">
              <label htmlFor="custom-add-reason">Specify Reason *</label>
              <input
                id="custom-add-reason"
                type="text"
                required
                placeholder="Enter custom reason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="form-input"
              />
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Adding...' : '+ Add Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
