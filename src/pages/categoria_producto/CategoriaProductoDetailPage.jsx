// 📦 Librerías externas
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';                  // Navegación interna con React Router
import dayjs from 'dayjs';                                                  // Para manejar fechas fácilmente
// 📁 Íconos u otros recursos externos
import { List, ZoomIn, ArrowLeft } from "lucide-react";                     // Íconos
import worldGlobe from '../../assets/world-globe.png';                      // Imagen de ejemplo
// 🔧 Servicios (API, helpers, utilidades)
import { getCategoriaProductoById } from '../../modules/inventory/services/categoriaProductoService';
// 🧩 Componentes comunes
import Header from '../../components/common/Header';                        // Título de la sección
import Breadcrumb from '../../components/common/Breadcrumb';                // Migas de pan para la Ruta de navegación
// Componentes específicos

/*
 * 🌍 Componente principal para mostrar los detalles de una categoría de producto específica. 
*/
const CategoriaProductoDetailPage = () => {

    // 🔁 Obtenemos el `id` desde la URL (ej: /categorias-productos/123)
    const { id } = useParams();

    const navigate = useNavigate();

    // 🧠 Estado para guardar la información de la categoria de producto
    const [categoriaProducto, setCategoriaProducto] = useState(null); // Se inicializa como null mientras se carga

    // Estado para errores
    const [error, setError] = useState(null);

    const categoriaNombre = categoriaProducto?.name ?? categoriaProducto?.nombre ?? 'Categoría de producto';

    // 📡 Petición para obtener los detalles de la categoría de producto
    useEffect(() => {
        if (!id) return;

        let isMounted = true;
        setError(null);

        getCategoriaProductoById(id)
            .then(res => {
                if (isMounted) {
                    setCategoriaProducto(res?.data?.data ?? res?.data ?? null);
                }
            })
            .catch(err => {
                console.error("Error al obtener la categoría de producto: ", err);
                if (isMounted) {
                    setError("No se pudo cargar la información de la categoría de producto. Intenta nuevamente.");
                }
            });

        return () => {
            isMounted = false;
        };
    }, [id]); // Solo se vuelve a ejecutar si cambia el `id` de la URL

    // ⏳ Estado de carga
    if (!categoriaProducto && !error) {
        return (
            <div className="flex justify-center items-center h-64 text-white">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                <span className="ml-4">Cargando información de la categoría de producto...</span>
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

    // ✅ Si ya se cargaron los datos de la categoría de producto, renderizamos la vista
    return (
        <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
            {/* 🧭 Header superior de la página(Cabecera con título) */}
            {/* <Header title={`Detalles de: ${categoriaNombre}`} /> */}
            <Header title={`Detalles de: ${categoriaProducto?.nombre || 'Categoría de producto'}`} />

            {/* 🧷 Breadcrumb(Migas de pan para la Ruta de navegación) */}
            <Breadcrumb items={[
                { label: <><List className="inline w-4 h-4 mr-1"/> Listado</>, href: '/categorias-productos' },
                { label: <><ZoomIn className="inline w-4 h-4 mr-1"/> Detalles de {categoriaNombre}</> }
            ]} />

            {/* 🧾 Contenido principal del detalle */}
            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>

                    <button 
                        onClick={() => navigate('/categorias-productos')}
                        className="mb-6 inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al listado
                    </button>

                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        {/* ℹ️ Columna de Detalles */}
                        <div className="bg-gray-800 p-6 rounded-2xl text-white shadow space-y-4">
                            <h2 className="text-2xl font-bold mb-4">Información General</h2>
                            {/* <p><strong>Nombre:</strong> {categoriaNombre}</p> */}
                            <p><strong>Nombre:</strong> {categoriaProducto.nombre}</p>
                            <p><strong>Estado:</strong> {categoriaProducto.estado}</p>
                            <p><strong>Fecha de Creación:</strong> {categoriaProducto.created_at ? dayjs(categoriaProducto.created_at).format('DD/MM/YYYY hh:mm:ss A') : '' }</p>
                            <p><strong>Fecha de Actualización:</strong> {categoriaProducto.updated_at ? dayjs(categoriaProducto.updated_at).format('DD/MM/YYYY hh:mm:ss A') : '' }</p>
                        </div>

                        {/* 🖼️🌐 Columna derecha con imagen (bandera o ilustración) */}
                        <div className="hidden lg:flex items-center justify-center">
                            {categoriaProducto.banderaUrl ? (
                                <img src={categoriaProducto.banderaUrl} alt={`Bandera de ${categoriaNombre}`} className="w-3/4 max-w-sm rounded shadow-lg" />
                            ) : (
                                <img src={worldGlobe} alt="Ilustración mundo" className="w-3/4 max-w-sm opacity-80" />
                            )}
                        </div>
                    </div>
            </main>
        </div>
    )
}

export default CategoriaProductoDetailPage;