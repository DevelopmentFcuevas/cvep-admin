import api from '../../../services/api';

const ENDPOINT = '/colores';

export const getColores = () => api.get(ENDPOINT);
export const getColorById = (id) => api.get(`${ENDPOINT}/${id}`);
export const createColor = (data) => api.post(ENDPOINT, data);
export const updateColor = (id, data) => api.put(`${ENDPOINT}/${id}`, data);
export const deleteColor = (id) => api.delete(`${ENDPOINT}/${id}`);