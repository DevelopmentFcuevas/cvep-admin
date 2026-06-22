/*
    * Servicio para gestionar las familias de productos en el módulo de inventario.
*/
import api from '../../../services/api';

export const getFamiliasProducto = () => api.get('/product-families');

export const getFamiliaProductoById = (id) => api.get(`/familias-producto/${id}`);

export const createFamiliaProducto = (data) => api.post('/product-families', data);

export const updateFamiliaProducto = (id, data) => api.put(`/familias-producto/${id}`, data);

export const deleteFamiliaProducto = (id) => api.delete(`/familias-producto/${id}`);