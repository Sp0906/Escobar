import api from './axios';

export const saveDesign = (data) => api.post('/designs', data);
export const getUserDesigns = () => api.get('/designs');
export const getDesign = (id) => api.get(`/designs/${id}`);
export const updateDesign = (id, data) => api.put(`/designs/${id}`, data);
export const deleteDesign = (id) => api.delete(`/designs/${id}`);
export const uploadLogo = (formData) =>
  api.post('/designs/upload-logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
