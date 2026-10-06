/*
 * 
 * Servicio para gestionar las marcas en el 
 * módulo de inventario.
 * 
*/
import api from '../../../services/api'; // Importa la instancia de Axios configurada para la API

// Endpoint base para las marcas.
const ENDPOINT = "/marcas";

// 📥 Listar
export const getMarcas = () => api.get(ENDPOINT);

// 📥 Obtener por ID
export const getMarcaById = (id) => api.get(`${ENDPOINT}/${id}`);

// ➕ Crear
export const createMarca = (data) => api.post(ENDPOINT, data);

// ✏️ Actualizar
export const updateMarca = (id, data) => api.put(`${ENDPOINT}/${id}`, data);

// ❌ Eliminar
export const deleteMarca = async (id) => {
    const res = await api.delete(`${ENDPOINT}/${id}`);
    return res.data;
};
