/*
 * 
 * Servicio para gestionar las categorías de productos en el 
 * módulo de inventario.
 * 
*/
import api from '../../../services/api'; // Importa la instancia de Axios configurada para la API

// Endpoint base para las categorías de productos.
const ENDPOINT = "/product-categories";

// 📥 Listar
export const getCategoriasProducto = () => api.get(ENDPOINT);

// 📥 Obtener por ID
export const getCategoriaProductoById = (id) => api.get(`${ENDPOINT}/${id}`);

// ➕ Crear
export const createCategoriaProducto = (data) => api.post(ENDPOINT, data);

// ✏️ Actualizar
export const updateCategoriaProducto = (id, data) => api.put(`${ENDPOINT}/${id}`, data);

// ❌ Eliminar
export const deleteCategoriaProducto = async (id) => {
    const res = await api.delete(`${ENDPOINT}/${id}`);
    return res.data;
};
