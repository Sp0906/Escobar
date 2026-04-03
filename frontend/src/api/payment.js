import api from './axios';

export const getRazorpayKey = () => api.get('/payment/key');
export const createRazorpayOrder = (data) => api.post('/payment/create-order', data);
export const verifyPayment = (data) => api.post('/payment/verify', data);
