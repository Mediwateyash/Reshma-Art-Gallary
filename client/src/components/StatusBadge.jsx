import React from 'react';

export const getStockStatus = (quantity, minimumStock) => {
  const qty = Number(quantity) || 0;
  const min = Number(minimumStock) || 0;

  if (qty === 0) {
    return {
      label: 'OUT OF STOCK',
      className: 'badge-out-of-stock',
    };
  }
  if (qty <= min) {
    return {
      label: 'LOW STOCK',
      className: 'badge-low-stock',
    };
  }
  return {
    label: 'IN STOCK',
    className: 'badge-in-stock',
  };
};

export default function StatusBadge({ quantity, minimumStock }) {
  const status = getStockStatus(quantity, minimumStock);

  return (
    <span className={`status-badge ${status.className}`}>
      {status.label}
    </span>
  );
}
