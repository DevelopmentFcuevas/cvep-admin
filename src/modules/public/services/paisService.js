/*
 * 
 * Servicio para gestionar los países en el 
 * módulo de public.
 * 
*/
import api from '../../../services/api'; // Importa la instancia de Axios configurada para la API

// Endpoint base para los países.
const ENDPOINT = "/paises";

// 📥 Listar
export const getPaises = () => api.get(ENDPOINT);

// 📥 Obtener por ID
export const getPaisById = (id) => api.get(`${ENDPOINT}/${id}`);

// ➕ Crear
export const createPais = (data) => api.post(ENDPOINT, data);

// ✏️ Actualizar
export const updatePais = (id, data) => api.put(`${ENDPOINT}/${id}`, data);

// ❌ Eliminar
export const deletePais = async (id) => {
    const res = await api.delete(`${ENDPOINT}/${id}`);
    return res.data;
};
