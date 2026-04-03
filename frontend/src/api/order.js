import api from './axios';

export const getUserOrders = () => api.get('/orders');
export const getOrder = (id) => api.get(`/orders/${id}`);
export const cancelOrder = (id, reason) => api.put(`/orders/${id}/cancel`, { reason });
