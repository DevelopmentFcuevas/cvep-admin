// 📦 Librerías externas
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';                   // Navegación interna con React Router
import dayjs from 'dayjs';                                                   // Para manejar fechas fácilmente
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
 * 🌍 Componente principal para mostrar los detalles de un país específico. 
*/
const PaisDetailPage = () => {

    // 🔁 Obtenemos el `id` desde la URL (ej: /paises/123)
    const { id } = useParams();

    const navigate = useNavigate();

    // 🧠 Estado para guardar la información del país
    const [pais, setPais] = useState(null); // Se inicializa como null mientras se carga

    // Estado para errores
    const [error, setError] = useState(null);

    // 📡 Petición para obtener los detalles del país
    //useEffect(() => {
    //    axios.get(`/paises/${id}`) // Llama al endpoint correspondiente
    //        .then(res => setPais(res.data)) // Almacena los datos del país en el estado
    //        .catch(err => {
    //            console.error("Error al obtener país:", err);
    //            setError("No se pudo cargar la información del país. Intenta nuevamente.");
    //        }); // Log de error técnico para el desarrollador
    //}, [id]); // Solo se vuelve a ejecutar si cambia el `id` de la URL
    useEffect(() => {
        axios.get(`/paises/${id}`)
            .then(res => {
                setPais(res.data);
                
                // Request para obtener moneda principal
                return axios.get(`/pais-monedas/${id}/true`);
            })
            .then(res => {
                console.log("Respuesta moneda:", res.data);

                setPais(prev => ({
                    ...prev,
                    //moneda: res.data.name
                    moneda: res.data.moneda?.name || "Sin moneda"
                }));
            })
        .catch(err => setError("Error al obtener datos"));
    }, [id]);
    
    
    
    
    // ⏳ Mientras se cargan los datos, mostramos un mensaje simple
    //if (!pais) {
    //    return <div className="text-white">Cargando...</div>;
    //}

    //if (error) {
    //    return <div className="text-red-400 text-center py-10">{error}</div>;
    //}

    // ⏳ Estado de carga
    if (!pais && !error) {
        return (
            <div className="flex justify-center items-center h-64 text-white">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                <span className="ml-4">Cargando información del país...</span>
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

    // ✅ Si ya se cargaron los datos del país, renderizamos la vista
    return (
        <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
            {/* 🧭 Header superior de la página(Cabecera con título) */}
            <Header title={`Detalles de: ${pais.name}`} />

            {/* 🧷 Breadcrumb(Migas de pan para la Ruta de navegación) */}
            <Breadcrumb items={[
                { label: <><List className="inline w-4 h-4 mr-1"/> Listado</>, href: '/paises' },
                { label: <><ZoomIn className="inline w-4 h-4 mr-1"/> Detalles de {pais.name}</> }
            ]} />

            {/* 🧾 Contenido principal del detalle */}
            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>

                    <button 
                        onClick={() => navigate('/paises')}
                        className="mb-6 inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al listado
                    </button>

                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        {/* ℹ️ Columna de Detalles */}
                        <div className="bg-gray-800 p-6 rounded-2xl text-white shadow space-y-4">
                            <h2 className="text-2xl font-bold mb-4">Información General</h2>
                            <p><strong>Nombre:</strong> {pais.name}</p>
                            <p><strong>Código ISO2:</strong> {pais.codigoIso2}</p>
                            <p><strong>Código ISO3:</strong> {pais.codigoIso3}</p>
                            <p><strong>Capital:</strong> {pais.capital}</p>
                            <p><strong>Continente:</strong> {pais.continente.replace(/_/g, ' ')}</p>
                            <p><strong>Idioma:</strong> {pais.idioma}</p>
                            <p><strong>Moneda:</strong> {pais.moneda}</p>
                            <p><strong>Dominio TLD:</strong> {pais.dominioTld}</p>
                            <p><strong>Estado:</strong> {pais.estado}</p>
                            <p><strong>Fecha Creación:</strong> { pais.createdAt ? dayjs(pais.createdAt).format('DD/MM/YYYY hh:mm:ss A') : '' }</p>
                            <p><strong>Fecha Actualización:</strong> { pais.updatedAt ? dayjs(pais.updatedAt).format('DD/MM/YYYY hh:mm:ss A') : '' }</p>
                        </div>

                        {/* 🖼️🌐 Columna derecha con imagen (bandera o ilustración) */}
                        <div className="hidden lg:flex items-center justify-center">
                            {pais.banderaUrl ? (
                                <img src={pais.banderaUrl} alt={`Bandera de ${pais.name}`} className="w-3/4 max-w-sm rounded shadow-lg" />
                            ) : (
                                <img src={worldGlobe} alt="Ilustración mundo" className="w-3/4 max-w-sm opacity-80" />
                            )}
                        </div>
                    </div>
            </main>
        </div>
    )
}

export default PaisDetailPage;