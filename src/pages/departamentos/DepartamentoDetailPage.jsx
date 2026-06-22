// 📦 Librerías externas
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';                                      // Navegación interna con React Router
import dayjs from 'dayjs';                                                                      // Para manejar fechas fácilmente
// 📁 Íconos u otros recursos externos
import { List, ZoomIn, ArrowLeft } from "lucide-react";                                         // Íconos
import worldGlobe from '../../assets/world-globe.png';                                          // Imagen de ejemplo
// 🔧 Servicios (API, helpers, utilidades)
import axios from '../../services/api';                                                         // Cliente Axios centralizado
// 🧩 Componentes comunes
import Header from '../../components/common/Header';
import Breadcrumb from '../../components/common/Breadcrumb';
// Componentes específicos

/*
 * 🌍 Componente principal para mostrar los detalles de un departamento específico. 
*/
const DepartamentoDetailPage = () => {

    // 🔁 Obtenemos el `id` desde la URL (ej: /departamentos/123)
    const { id } = useParams();

    const navigate = useNavigate();

    // Estado para errores
    const [error, setError] = useState(null);

    // 🧠 Estado para guardar la información del departamento
    const [departamento, setDepartamento] = useState(null);
    // 📡 Petición para obtener los detalles del departamento
    useEffect(() => {
        axios.get(`/departamentos/${id}`) // Llama al endpoint correspondiente
            .then(res => setDepartamento(res.data)) // Almacena los datos del país en el estado
            .catch(err => {
                console.error("Error al obtener departamento:", err);
                setError("No se pudo cargar la información del departamento. Intenta nuevamente.");
            }); // Log de error técnico para el desarrollador

    }, [id]);

    // ⏳ Estado de carga
    if (!departamento && !error) {
        return (
            <div className="flex justify-center items-center h-64 text-white">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                <span className="ml-4">Cargando información del departamento...</span>
            </div>
        );
    }

    // ⚠️ Estado de error
    if (error) {
        return (
            <div className="text-red-400 text-center py-10 text-lg">
                {error}
            </div>
        );
    }

    // ✅ Si ya se cargaron los datos del departamento, renderizamos la vista
    return (
        <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
            {/* 🧭 Header superior de la página(Cabecera con título) */}
            <Header title={`Detalles de ${departamento.name}`} />

            {/* 🧷 Breadcrumb(Migas de pan para la Ruta de navegación) */}
            <Breadcrumb items={[
                { label: <><List className="inline w-4 h-4 mr-1"/> Listado</>, href: '/departamentos' },
                { label: <><ZoomIn className="inline w-4 h-4 mr-1"/> Detalles de {departamento.name}</> }
            ]} />

            {/* 🧾 Contenido principal del detalle */}
            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>

                <button 
                    onClick={() => navigate('/departamentos')}
                    className="mb-6 inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al listado
                </button>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    {/* ℹ️ Columna de Detalles */}
                    <div className="bg-gray-800 p-6 rounded-2xl text-white shadow space-y-4">
                        <h2 className="text-2xl font-bold mb-4">Información General</h2>
                        <p><strong>Nombre:</strong> {departamento.name}</p>
                        <p><strong>Código ISO:</strong> {departamento.codigoIso}</p>
                        <p><strong>Capital:</strong> {departamento.capital}</p>
                        <p><strong>Region:</strong> {departamento.region.replace(/_/g, ' ')}</p>
                        <p><strong>Poblacion:</strong> {departamento.poblacion}</p>
                        <p><strong>Superficie:</strong> {departamento.superficie}</p>
                        <p><strong>País:</strong> {departamento.pais?.name || 'No especificado'}</p>
                        <p><strong>Estado:</strong> {departamento.estado}</p>
                        <p><strong>Fecha Creación:</strong> { departamento.createdAt ? dayjs(departamento.createdAt).format('DD/MM/YYYY hh:mm:ss A') : '' }</p>
                        <p><strong>Fecha Actualización:</strong> { departamento.updatedAt ? dayjs(departamento.updatedAt).format('DD/MM/YYYY hh:mm:ss A') : '' }</p>
                    </div>

                   {/* 🖼️🌐 Columna derecha con imagen (bandera o ilustración) */}
                    <div className="hidden lg:flex items-center justify-center">
                        {departamento.banderaUrl ? (
                            <img src={departamento.banderaUrl} alt={`Bandera de ${departamento.name}`} className="w-3/4 max-w-sm rounded shadow-lg" />
                        ) : (
                            <img src={worldGlobe} alt="Ilustración mundo" className="w-3/4 max-w-sm opacity-80" />
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default DepartamentoDetailPage;