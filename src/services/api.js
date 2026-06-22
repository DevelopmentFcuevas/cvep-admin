import axios from "axios";

/* 
🧠 Sugerencias para crecer con este componente:
------------------------------------------------
* En api.js, podés sumar interceptores de Axios para agregar tokens, manejar errores globales, etc.
*/


// Configuración base de Axios para todas las peticiones HTTP.
// Esto centraliza el uso de la API para facilitar mantenimiento y cambios de URL base.
const api = axios.create({
    //baseURL: 'http://localhost:8080/api', // Dirección base de tu backend
    //baseURL: 'http://127.0.0.1:8000/api', // Dirección base de tu backend
    
    baseURL: "http://127.0.0.1:8000/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },

});



// Obtener cantidad de países por estado
export const getPaisesPorEstado = (estado) =>
    api.get(`/paises/count/estado/${estado}`);

// Obtener cantidad de países creados por fecha
export const getPaisesPorFecha = (fecha) =>
    api.get(`/paises/count/fecha/${fecha}`);


// Obtener cantidad de departamentos por estado
export const getDepartamentosPorEstado = (estado) =>
    api.get(`/departamentos/count/estado/${estado}`);

// Obtener cantidad de departamentos creados por fecha
export const getDepartamentosPorFecha = (fecha) =>
    api.get(`/departamentos/count/fecha/${fecha}`);


// Obtener cantidad de ciudades por estado
export const getCiudadesPorEstado = (estado) =>
    api.get(`/ciudades/count/estado/${estado}`);

// Obtener cantidad de ciudades creados por fecha
export const getCiudadesPorFecha = (fecha) =>
    api.get(`/ciudades/count/fecha/${fecha}`);


// Obtener cantidad de barrios por estado
export const getBarriosPorEstado = (estado) =>
    api.get(`/barrios/count/estado/${estado}`);

// Obtener cantidad de barrios creados por fecha
export const getBarriosPorFecha = (fecha) =>
    api.get(`/barrios/count/fecha/${fecha}`);

export default api;