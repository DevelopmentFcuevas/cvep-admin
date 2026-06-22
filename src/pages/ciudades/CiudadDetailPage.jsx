// 📦 Librerías externas
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';                  // Navegación interna con React Router
import dayjs from 'dayjs';                                                  // Para manejar fechas fácilmente
// 📁 Íconos u otros recursos externos
import { List, ZoomIn, ArrowLeft } from "lucide-react";                     // Íconos
import worldGlobe from '../../assets/world-globe.png';                      // Imagen de ejemplo
// 🔧 Servicios (API, helpers, utilidades)
import axios from '../../services/api';                                     // Cliente Axios centralizado
// 🧩 Componentes comunes
import Header from '../../components/common/Header';                        // Título de la sección
import Breadcrumb from '../../components/common/Breadcrumb';                // Migas de pan para la Ruta de navegación
// Componentes específicos

/*
 * 🌍 Componente principal para mostrar los detalles de una ciudad específica. 
*/
const CiudadDetailPage = () => {

    // 🔁 Obtenemos el `id` desde la URL (ej: /ciudades/123)
    const { id } = useParams();

    const navigate = useNavigate();

    // 🧠 Estado para guardar la información de la ciudad
    const [ciudad, setCiudad] = useState(null); // Se inicializa como null mientras se carga

    // Estado para errores
    const [error, setError] = useState(null);

    // 📡 Petición para obtener los detalles de la ciudad
    useEffect(() => {
        axios.get(`/ciudades/${id}`) // Llama al endpoint correspondiente
            .then(res => setCiudad(res.data)) // Almacena los datos de la ciudad en el estado
            .catch(err => {
                console.error("Error al obtener la ciudad:", err);
                setError("No se pudo cargar la información de la ciudad. Intenta nuevamente.");
            }); // Log de error técnico para el desarrollador
    }, [id]); // Solo se vuelve a ejecutar si cambia el `id` de la URL

    // ⏳ Mientras se cargan los datos, mostramos un mensaje simple
    //if (!ciudad) {
    //    return <div className="text-white">Cargando...</div>;
    //}

    //if (error) {
    //    return <div className="text-red-400 text-center py-10">{error}</div>;
    //}

    // ⏳ Estado de carga
    if (!ciudad && !error) {
        return (
            <div className="flex justify-center items-center h-64 text-white">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                <span className="ml-4">Cargando información de la ciudad...</span>
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

    // ✅ Si ya se cargaron los datos de la ciudad, renderizamos la vista
    return (
        <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
            {/* 🧭 Header superior de la página(Cabecera con título) */}
            <Header title={`Detalles de: ${ciudad.name}`} />

            {/* 🧷 Breadcrumb(Migas de pan para la Ruta de navegación) */}
            <Breadcrumb items={[
                { label: <><List className="inline w-4 h-4 mr-1"/> Listado</>, href: '/ciudades' },
                { label: <><ZoomIn className="inline w-4 h-4 mr-1"/> Detalles de {ciudad.name}</> }
            ]} />

            {/* 🧾 Contenido principal del detalle */}
            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>

                    <button 
                        onClick={() => navigate('/ciudades')}
                        className="mb-6 inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al listado
                    </button>

                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        {/* ℹ️ Columna de Detalles */}
                        <div className="bg-gray-800 p-6 rounded-2xl text-white shadow space-y-4">
                            <h2 className="text-2xl font-bold mb-4">Información General</h2>
                            <p><strong>Nombre:</strong> {ciudad.name}</p>
                            <p><strong>Código Postal:</strong> {ciudad.codigoPostal}</p>
                            <p><strong>Departamento:</strong> {ciudad.departamento?.name || 'No especificado'}</p>
                            <p><strong>País:</strong> {ciudad.departamento.pais?.name || 'No especificado'}</p>
                            <p><strong>Estado:</strong> {ciudad.estado}</p>
                            <p><strong>Fecha Creación:</strong> { ciudad.createdAt ? dayjs(ciudad.createdAt).format('DD/MM/YYYY hh:mm:ss A') : '' }</p>
                            <p><strong>Fecha Actualización:</strong> { ciudad.updatedAt ? dayjs(ciudad.updatedAt).format('DD/MM/YYYY hh:mm:ss A') : '' }</p>
                        </div>

                        {/* 🖼️🌐 Columna derecha con imagen (bandera o ilustración) */}
                        <div className="hidden lg:flex items-center justify-center">
                            {ciudad.banderaUrl ? (
                                <img src={ciudad.banderaUrl} alt={`Bandera de ${ciudad.name}`} className="w-3/4 max-w-sm rounded shadow-lg" />
                            ) : (
                                <img src={worldGlobe} alt="Ilustración mundo" className="w-3/4 max-w-sm opacity-80" />
                            )}
                        </div>
                    </div>
            </main>
        </div>
    )
}

export default CiudadDetailPage;