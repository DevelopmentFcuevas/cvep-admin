// 📦 Librerías externas
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';                                         // Librería para animaciones
import dayjs from 'dayjs';                                                      // Para manejar fechas fácilmente
import { Link } from 'react-router-dom';
// 📁 Íconos u otros recursos externos
import { Home, List, Plus } from "lucide-react";                                     // Íconos
import { Flag, FlagOff, LandPlot, Goal} from 'lucide-react';                   // Íconos para estadísticas
// 🔧 Servicios (API, helpers, utilidades)
import { getPaisesPorEstado, getPaisesPorFecha } from '../../services/api';     // Cliente Axios centralizado
// 🧩 Componentes comunes
import Header from '../../components/common/Header';                            // Título de la sección
import StatCard from '../../components/common/StatCard';                        // Tarjetas de estadísticas
import Breadcrumb from '../../components/common/Breadcrumb';                    // Migas de pan para la Ruta de navegación
// Componentes específicos
import PaisTable from '../../components/paises/PaisTable';                      // Tabla de datos (ahora de familia producto)
import FamiliaProductoTable from '../../components/familia_producto/FamiliaProductoTable';


/**
 * Página principal que muestra el listado de familia producto junto con estadísticas rápidas.
 * Se encarga de obtener datos desde la API, renderizar tarjetas de resumen y una tabla interactiva.
 */
const FamiliaProductoListPage = () => {

    // Estado para mostrar mensajes de error al usuario final
    //const [error, setError] = useState(null);
    const [error, setError] = useState({ type: '', text: '' });

    // Estado para mostrar mensajes globales al usuario (éxito o error)
    const [message, setMessage] = useState({ type: '', text: '' });

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            
            {/* 🧭 Header superior de la página(Cabecera con título) */}
            <Header title='Listado de Categorías de Productos' />

            {/* 🧷 Breadcrumb(Migas de pan para la Ruta de navegación) */}
            <Breadcrumb items={[
                { label: <><Home className="inline w-4 h-4 mr-1"/> Inicio</>, href: '/' },
                { label: <><List className="inline w-4 h-4 mr-1"/> Listado</> }
            ]} />

            {/* 🛎️ Mensajes de estado, mostrar mensaje de error si algo falló */}
            {error.text && (
                <div className="bg-red-100 text-red-800 px-4 py-3 rounded mb-4">
                    {error.text}
                </div>
            )}

            {/* Contenido principal */}
            <main className=' max-w-7xl mx-auto py-6 px-4 lg:px-8 '>

                {/* Botón para agregar nueva categoría de producto */}
               {/*  <div className="flex justify-end mb-4">
                    <Link
                        to="/product-families/create"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        + Agregar
                    </Link>
                </div> */}
                <div className="flex justify-end mb-4">
                    <Link
                        to="/product-families/create"
                        className="flex items-center overflow-hidden rounded-lg shadow bg-blue-600 hover:bg-blue-700 transition"
                    >
                        <span className="px-3 bg-blue-700 flex items-center">
                            <Plus size={18} />
                        </span>
                        <span className="px-4 py-2 font-semibold text-white">
                            Crear Categoría de Producto
                        </span>
                    </Link>
                </div>
                <div className="bg-blue-600/10 border border-blue-500 text-blue-200 p-4 rounded mb-6" role="status">
                    <p className="text-sm">
                        Aquí puedes crear y gestionar las categorías que agrupan tus productos.
                    </p>
                </div>
                {/* Tabla con datos detallados de familia producto */}
                <FamiliaProductoTable />
            </main>

        </div>
    )
}

export default FamiliaProductoListPage;