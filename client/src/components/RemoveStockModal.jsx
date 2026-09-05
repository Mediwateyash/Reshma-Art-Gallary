import React, { useState, useEffect } from 'react';
import { X, MinusCircle, AlertCircle } from 'lucide-react';
import { inventoryApi } from '../services/api';

const REMOVE_REASONS = ['Used', 'Damaged', 'Sold', 'Correction', 'Other'];

export default function RemoveStockModal({ isOpen, onClose, item, onStockRemoved }) {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('Used');
  const [customReason, setCustomReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity('');
      setReason('Used');
      setCustomReason('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const currentQty = Number(item.quantity) || 0;
  const removedQty = Number(quantity) || 0;
  const newTotal = currentQty - (removedQty > 0 ? removedQty : 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const qty = Number(quantity);
    if (!qty || isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity greater than 0');
      return;
    }

    if (qty > currentQty) {
      setError(`Not enough stock. Available: ${currentQty}`);
      return;
    }

    const finalReason = reason === 'Other' ? customReason.trim() : reason;
    if (!finalReason) {
      setError('Please specify a reason');
      return;
    }

    setSubmitting(true);
    try {
      await inventoryApi.removeStock(item._id, {
        quantity: qty,
        reason: finalReason,
      });

      onStockRemoved?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to remove stock');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge badge-danger-bg">
              <MinusCircle size={20} className="text-danger" />
            </div>
            <div>
              <h2>Remove Stock</h2>
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
          {removedQty > 0 && (
            <div className="stock-preview-row new-total">
              <span>Remaining Stock:</span>
              <strong className={newTotal < 0 ? 'text-danger' : 'text-primary'}>
                {newTotal} {item.unit}
              </strong>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="remove-qty">Quantity to Remove ({item.unit}) *</label>
            <input
              id="remove-qty"
              type="number"
              min="0.01"
              max={currentQty}
              step="any"
              required
              placeholder="e.g. 2"
              value={quantity}
              onChange={(e) => {
                const val = e.target.value;
                setQuantity(val);
                if (Number(val) > currentQty) {
                  setError(`Not enough stock. Available: ${currentQty}`);
                } else {
                  setError('');
                }
              }}
              className="form-input"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="remove-reason">Reason *</label>
            <select
              id="remove-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="form-select"
            >
              {REMOVE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {reason === 'Other' && (
            <div className="form-group">
              <label htmlFor="custom-remove-reason">Specify Reason *</label>
              <input
                id="custom-remove-reason"
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
              className="btn btn-danger"
              disabled={submitting || (removedQty > currentQty)}
            >
              {submitting ? 'Removing...' : '- Remove Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
