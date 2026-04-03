import api from './axios';

export const getAdminStats = () => api.get('/admin/stats');
export const getAllOrders = (params) => api.get('/admin/orders', { params });
export const updateOrderStatus = (id, data) => api.put(`/admin/orders/${id}/status`, data);
export const getAllUsers = () => api.get('/admin/users');
export const getReadyMadeDesigns = () => api.get('/admin/ready-made');
export const uploadReadyMade = (formData) =>
  api.post('/admin/ready-made', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteReadyMade = (id) => api.delete(`/admin/ready-made/${id}`);
