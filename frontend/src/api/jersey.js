import api from './axios';

export const getJerseys = (params) => api.get('/jerseys', { params });
export const getJersey = (id) => api.get(`/jerseys/${id}`);
export const uploadJerseyTemplate = (formData) =>
  api.post('/jerseys', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateJersey = (id, data) => api.put(`/jerseys/${id}`, data);
export const deleteJersey = (id) => api.delete(`/jerseys/${id}`);
