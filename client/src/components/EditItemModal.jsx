import React, { useState, useEffect } from 'react';
import { X, Edit2, AlertCircle, Info } from 'lucide-react';
import { inventoryApi } from '../services/api';

const UNIT_OPTIONS = [
  'Pieces',
  'Bottles',
  'Packets',
  'Boxes',
  'Rolls',
  'Meters',
  'Grams',
  'Kilograms',
  'Litres',
  'Custom',
];

export default function EditItemModal({ isOpen, onClose, item, onItemUpdated }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('RAW_MATERIAL');
  const [category, setCategory] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('Pieces');
  const [customUnit, setCustomUnit] = useState('');
  const [minimumStock, setMinimumStock] = useState('');
  const [description, setDescription] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (item && isOpen) {
      setName(item.name || '');
      setType(item.type || 'RAW_MATERIAL');
      setCategory(item.category || '');
      
      const isPredefined = UNIT_OPTIONS.filter((u) => u !== 'Custom').includes(item.unit);
      if (isPredefined) {
        setSelectedUnit(item.unit);
        setCustomUnit('');
      } else {
        setSelectedUnit('Custom');
        setCustomUnit(item.unit || '');
      }

      setMinimumStock(item.minimumStock !== undefined ? item.minimumStock : '');
      setDescription(item.description || '');
      setError('');
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Item name is required');
      return;
    }
    if (!category.trim()) {
      setError('Category is required');
      return;
    }

    const finalUnit = selectedUnit === 'Custom' ? customUnit.trim() : selectedUnit;
    if (!finalUnit) {
      setError('Please specify a valid unit');
      return;
    }

    const minStock = minimumStock === '' ? 0 : Number(minimumStock);
    if (isNaN(minStock) || minStock < 0) {
      setError('Minimum stock must be 0 or a positive number');
      return;
    }

    setSubmitting(true);
    try {
      await inventoryApi.updateItem(item._id, {
        name: name.trim(),
        type,
        category: category.trim(),
        unit: finalUnit,
        minimumStock: minStock,
        description: description.trim(),
      });

      onItemUpdated?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update item');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <Edit2 size={20} />
            </div>
            <h2>Edit Item Details</h2>
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

        <div className="info-banner">
          <Info size={16} />
          <span>
            Current Stock: <strong>{item.quantity} {item.unit}</strong>. Direct quantity editing is disabled to preserve audit history. Use <em>Add Stock</em> or <em>Remove Stock</em>.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="edit-item-name">Item Name *</label>
            <input
              id="edit-item-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-item-type">Type *</label>
              <select
                id="edit-item-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="form-select"
              >
                <option value="RAW_MATERIAL">Raw Material</option>
                <option value="FINISHED_PRODUCT">Finished Product</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="edit-item-category">Category *</label>
              <input
                id="edit-item-category"
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-item-unit">Unit *</label>
              <select
                id="edit-item-unit"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="form-select"
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="edit-item-min-stock">Minimum Stock *</label>
              <input
                id="edit-item-min-stock"
                type="number"
                min="0"
                step="any"
                required
                value={minimumStock}
                onChange={(e) => setMinimumStock(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {selectedUnit === 'Custom' && (
            <div className="form-group">
              <label htmlFor="edit-custom-unit">Custom Unit *</label>
              <input
                id="edit-custom-unit"
                type="text"
                required
                placeholder="e.g. Tubes, Bundles"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="edit-item-description">Description</label>
            <textarea
              id="edit-item-description"
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
            />
          </div>

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
              {submitting ? 'Saving...' : 'Update Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
