import { fetchApi } from './api';

/**
 * Fetch inventory items with optional query filters
 * @param {object} params - { type, search, status, category, includeArchived }
 */
export const getInventory = async (params = {}) => {
  const query = new URLSearchParams();

  if (params.type) query.append('type', params.type);
  if (params.search) query.append('search', params.search);
  if (params.status) query.append('status', params.status);
  if (params.category) query.append('category', params.category);
  if (params.includeArchived) query.append('includeArchived', 'true');

  const queryString = query.toString();
  const endpoint = queryString ? `/inventory?${queryString}` : '/inventory';

  return await fetchApi(endpoint);
};

/**
 * Fetch a single inventory item by ID
 * @param {string} id 
 */
export const getInventoryItem = async (id) => {
  return await fetchApi(`/inventory/${id}`);
};

/**
 * Create a new inventory item
 * @param {object} itemData 
 */
export const createInventoryItem = async (itemData) => {
  return await fetchApi('/inventory', {
    method: 'POST',
    body: JSON.stringify(itemData),
  });
};

/**
 * Update an existing inventory item
 * @param {string} id 
 * @param {object} itemData 
 */
export const updateInventoryItem = async (id, itemData) => {
  return await fetchApi(`/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(itemData),
  });
};

/**
 * Soft delete (archive) an inventory item
 * @param {string} id 
 */
export const deleteInventoryItem = async (id) => {
  return await fetchApi(`/inventory/${id}`, {
    method: 'DELETE',
  });
};
