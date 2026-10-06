/** 
 * unidadMedidaService.js
 * 
 * Este archivo contiene funciones para interactuar con la API relacionada con las unidades de medida.
 * Proporciona métodos para listar, obtener, crear, actualizar y eliminar unidades de medida.
*/

import api from '../../../services/api'; // Importa la instancia de Axios configurada para la API

// Endpoint base para las unidades de medida.
const ENDPOINT = "/unidad-medidas";

// 📥 Listar
export const getUnidadesMedida = () => api.get(ENDPOINT);

// 📥 Obtener por ID
export const getUnidadMedidaById = (id) => api.get(`${ENDPOINT}/${id}`);

// ➕ Crear
export const createUnidadMedida = (data) => api.post(ENDPOINT, data);

// ✏️ Actualizar
export const updateUnidadMedida = (id, data) => api.put(`${ENDPOINT}/${id}`, data);

// ❌ Eliminar
export const deleteUnidadMedida = async (id) => {
    const res = await api.delete(`${ENDPOINT}/${id}`);
    return res.data;
};
