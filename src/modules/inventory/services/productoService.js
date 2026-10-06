/*
 * 
 * Servicio para gestionar los productos en el 
 * módulo de inventario.
 * 
*/
import api from '../../../services/api'; // Importa la instancia de Axios configurada para la API

// Endpoint base para los productos.
const ENDPOINT = "/products"; // Hace referencia a la ruta de la API para productos

const normalizeProductoPayload = (data) => {
    const payload = { ...data };
    delete payload.color;
    if (Object.hasOwn(payload, 'color_id')) {
        payload.color_id = payload.color_id === '' || payload.color_id == null
            ? null
            : Number(payload.color_id);
    }
    return payload;
};

// 📥 Listar
export const getProductos = () => api.get(ENDPOINT);

// 📥 Obtener por ID
export const getProductoById = (id) => api.get(`${ENDPOINT}/${id}`);

// ➕ Crear
export const createProducto = (data) => api.post(ENDPOINT, normalizeProductoPayload(data));

// ✏️ Actualizar
export const updateProducto = (id, data) => api.put(`${ENDPOINT}/${id}`, normalizeProductoPayload(data));

// ❌ Eliminar
export const deleteProducto = async (id) => {
    const res = await api.delete(`${ENDPOINT}/${id}`);
    return res.data;
};
