/*
    * Servicio para gestionar las categorías de productos en el módulo de inventario.
*/
import api from '../../../services/api';

const ENDPOINT = "/product-categories";

// 📥 Listar
//export const getCategoriasProducto = () => api.get('/product-families');
export const getCategoriasProducto = () => api.get(ENDPOINT);
//export const getCategoriasProducto = async () => {
//    const res = await api.get(ENDPOINT);
//    return res.data;
//};

// 📥 Obtener por ID
//export const getFamiliaProductoById = (id) => api.get(`/familias-categories/${id}`);
export const getCategoriaProductoById = (id) => api.get(`${ENDPOINT}/${id}`);

// ➕ Crear
//export const createCategoriaProducto = (data) => api.post('/product-families', data);
export const createCategoriaProducto = (data) => api.post(ENDPOINT, data);

//export const createCategoriaProducto = async (data) => {
//    const res = await api.post(ENDPOINT, data);
//    return res.data;
//};


//export const updateFamiliaProducto = (id, data) => api.put(`/familias-categories/${id}`, data);
export const updateCategoriaProducto = (id, data) => api.put(`${ENDPOINT}/${id}`, data);

//export const deleteFamiliaProducto = (id) => api.delete(`/familias-categories/${id}`);
// ❌ Eliminar
export const deleteCategoriaProducto = async (id) => {
    const res = await api.delete(`${ENDPOINT}/${id}`);
    return res.data;
};