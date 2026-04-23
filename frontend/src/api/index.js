import api from './axios'

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

export const productsApi = {
  browse: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
}

export const supplierApi = {
  getDashboard: () => api.get('/supplier/dashboard'),
  getProducts: () => api.get('/supplier/products'),
  addProduct: (data) => api.post('/supplier/products', data),
  updateProduct: (id, data) => api.put(`/supplier/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/supplier/products/${id}`),
  getOrders: (params) => api.get('/supplier/orders', { params }),
  updateOrderStatus: (id, status) =>
    api.put(`/supplier/orders/${id}/status`, { status }),
}

export const retailerApi = {
  getDashboard: () => api.get('/retailer/dashboard'),
  placeOrder: (data) => api.post('/retailer/orders', data),
  getOrders: (params) => api.get('/retailer/orders', { params }),
}
