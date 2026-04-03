import api from './axios';

export const getCart = () => api.get('/cart');
export const addToCart = (data) => api.post('/cart', data);
export const updateCartItem = (itemId, data) => api.put(`/cart/${itemId}`, data);
export const removeFromCart = (itemId) => api.delete(`/cart/${itemId}`);
export const clearCart = () => api.delete('/cart/clear');
