
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // In local development browser, connect to local Express server
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api';
  }

  // Default to live production Render backend for Vercel, PWA, and mobile apps
  return 'https://reshma-art-gallary.onrender.com/api';
};

const API_BASE = getApiBaseUrl();

/**
 * Generic API request helper
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // If unauthorized, clear token so app redirects to login
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    const error = new Error(data.message || 'An error occurred');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Authentication API
export const authApi = {
  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getMe: () => apiRequest('/auth/me'),
};

// Inventory API
export const inventoryApi = {
  getItems: (params = {}) => {
    const query = new URLSearchParams();
    if (params.type) query.append('type', params.type);
    if (params.search) query.append('search', params.search);
    const queryString = query.toString();
    return apiRequest(`/inventory${queryString ? `?${queryString}` : ''}`);
  },
  getItemById: (id) => apiRequest(`/inventory/${id}`),
  createItem: (itemData) =>
    apiRequest('/inventory', {
      method: 'POST',
      body: JSON.stringify(itemData),
    }),
  updateItem: (id, itemData) =>
    apiRequest(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    }),
  addStock: (id, { quantity, reason }) =>
    apiRequest(`/inventory/${id}/add-stock`, {
      method: 'POST',
      body: JSON.stringify({ quantity, reason }),
    }),
  removeStock: (id, { quantity, reason }) =>
    apiRequest(`/inventory/${id}/remove-stock`, {
      method: 'POST',
      body: JSON.stringify({ quantity, reason }),
    }),
  getPurchaseList: () => apiRequest('/inventory/purchase-list'),
};

// Stock History API
export const historyApi = {
  getHistory: () => apiRequest('/history'),
};

// Dashboard API
export const dashboardApi = {
  getDashboardData: () => apiRequest('/dashboard'),
};
