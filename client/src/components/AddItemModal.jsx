import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
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

export default function AddItemModal({ isOpen, onClose, onItemAdded, defaultType = 'RAW_MATERIAL' }) {
  const [name, setName] = useState('');
  const [type, setType] = useState(defaultType);
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('Pieces');
  const [customUnit, setCustomUnit] = useState('');
  const [minimumStock, setMinimumStock] = useState('');
  const [description, setDescription] = useState('');
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync default type when opened
  React.useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setError('');
    }
  }, [isOpen, defaultType]);

  if (!isOpen) return null;

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

    const initialQty = quantity === '' ? 0 : Number(quantity);
    if (isNaN(initialQty) || initialQty < 0) {
      setError('Quantity must be 0 or a positive number');
      return;
    }

    const minStock = minimumStock === '' ? 0 : Number(minimumStock);
    if (isNaN(minStock) || minStock < 0) {
      setError('Minimum stock must be 0 or a positive number');
      return;
    }

    setSubmitting(true);
    try {
      await inventoryApi.createItem({
        name: name.trim(),
        type,
        category: category.trim(),
        quantity: initialQty,
        unit: finalUnit,
        minimumStock: minStock,
        description: description.trim(),
      });

      // Reset form
      setName('');
      setCategory('');
      setQuantity('');
      setSelectedUnit('Pieces');
      setCustomUnit('');
      setMinimumStock('');
      setDescription('');
      
      onItemAdded?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create inventory item');
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
              <Plus size={20} />
            </div>
            <h2>Add New Item</h2>
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

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="item-name">Item Name *</label>
            <input
              id="item-name"
              type="text"
              required
              placeholder="e.g. Wool, Acrylic Paint, Handcrafted Vase"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="item-type">Type *</label>
              <select
                id="item-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="form-select"
              >
                <option value="RAW_MATERIAL">Raw Material</option>
                <option value="FINISHED_PRODUCT">Finished Product</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="item-category">Category *</label>
              <input
                id="item-category"
                type="text"
                required
                placeholder="e.g. Craft Material, Paint, Handmade Flower"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="item-quantity">Initial Quantity</label>
              <input
                id="item-quantity"
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="form-input"
              />
              <span className="form-hint">Recorded as Opening Stock</span>
            </div>

            <div className="form-group">
              <label htmlFor="item-unit">Unit *</label>
              <select
                id="item-unit"
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
          </div>

          {selectedUnit === 'Custom' && (
            <div className="form-group">
              <label htmlFor="custom-unit">Custom Unit *</label>
              <input
                id="custom-unit"
                type="text"
                required
                placeholder="e.g. Tubes, Bundles, Sets"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="item-min-stock">Minimum Stock Alert Level *</label>
            <input
              id="item-min-stock"
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 5"
              value={minimumStock}
              onChange={(e) => setMinimumStock(e.target.value)}
              className="form-input"
            />
            <span className="form-hint">
              Triggers Low Stock warning when stock drops to or below this quantity.
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="item-description">Description (Optional)</label>
            <textarea
              id="item-description"
              rows="2"
              placeholder="Color, brand, dimensions, notes..."
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
              {submitting ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
