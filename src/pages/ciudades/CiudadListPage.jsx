// 📦 Librerías externas
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';                                                     // Librería para animaciones
import dayjs from 'dayjs';                                                                  // Para manejar fechas fácilmente
import { Link } from 'react-router-dom';                                                    // Navegación interna con React Router
// 📁 Íconos u otros recursos externos
import { Flag, FlagOff, Goal, LandPlot, Home, List } from 'lucide-react';                   // Íconos para estadísticas
// 🔧 Servicios (API, helpers, utilidades)
import { getCiudadesPorEstado, getCiudadesPorFecha } from '../../services/api';             // Cliente Axios centralizado
// 🧩 Componentes comunes
import Header from '../../components/common/Header';                                        // Título de la sección
import StatCard from '../../components/common/StatCard';                                    // Tarjetas de estadísticas
import Breadcrumb from '../../components/common/Breadcrumb';                                // Migas de pan para la Ruta de navegación
// Componentes específicos
import CiudadTable from '../../components/ciudades/CiudadTable';                            // Tabla de datos (ahora de ciudades)


/**
 * Página principal que muestra el listado de ciudades junto con estadísticas rápidas.
 * Se encarga de obtener datos desde la API, renderizar tarjetas de resumen y una tabla interactiva.
 */
const CiudadListPage = () => {

    // Estado para mostrar mensajes de error al usuario final
    const [error, setError] = useState({ type: '', text: '' });
    
    // Estado local para guardar estadísticas calculadas desde la API
    const [stats, setStats] = useState({
        totalCiudades: 0,
        newCiudadesToday: 0,
        activeCiudades: 0,
        inactiveCiudades: 0,
    });
    // useEffect que se ejecuta al cargar la página para obtener datos de resumen desde la API
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [activosRes, inactivosRes, hoyRes] = await Promise.all([
                    getCiudadesPorEstado("ACTIVO"),
                    getCiudadesPorEstado("INACTIVO"),
                    getCiudadesPorFecha(dayjs().format('YYYY-MM-DD')),
                ]);

                // Validamos los datos esperados
                if (typeof activosRes.data !== 'number' || typeof inactivosRes.data !== 'number') {
                    setError({ 
                        type: 'error', 
                        text: 'Los datos de ciudades activos o inactivos no son numéricos.' 
                    });
                }

                // Calculamos el total
                const total = activosRes.data + inactivosRes.data;

                setStats({
                    totalCiudades: total,
                    newCiudadesToday: hoyRes.data,
                    activeCiudades: activosRes.data,
                    inactiveCiudades: inactivosRes.data,
                });
            } catch (error) {
                console.error("[ESTADÍSTICAS] Error al obtener estadísticas:", error);
                setError({ 
                    type: 'error', 
                    text: 'Hubo un problema al cargar las estadísticas de Ciudades. Por favor, intenta nuevamente más tarde.' 
                });
            }
        };

        fetchStats();
    }, []);

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            {/* 🧭 Header superior de la página(Cabecera con título) */}
            <Header title='Listado de Ciudades' />

            {/* 🧷 Breadcrumb(Migas de pan para la Ruta de navegación) */}
            <Breadcrumb items={[
                { label: <><Home className="inline w-4 h-4 mr-1"/> Inicio</>, href: '/' },
                { label: <><List className="inline w-4 h-4 mr-1"/> Listado</> }
            ]} />

            {/* 🛎️ Mensajes de estado */}
            {error.text && (
                <div className="bg-red-100 text-red-800 px-4 py-3 rounded mb-4">
                    {error.text}
                </div>
            )}

            {/* Contenido principal */}
            <main className=' max-w-7xl mx-auto py-6 px-4 lg:px-8 '>
                
                {/* Tarjetas con estadísticas rápidas */}
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 200 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard name="Total de Ciudades" icon={Flag} value={stats.totalCiudades.toLocaleString()} color='#6366F1' />
                    <StatCard name="Nuevas Ciudades Agregadas(hoy)" icon={LandPlot} value={stats.newCiudadesToday} color='#10B981' />
                    <StatCard name="Ciudades Activos" icon={Goal} value={stats.activeCiudades.toLocaleString()} color='#F59E0B' />
                    <StatCard name="Ciudades Inactivos" icon={FlagOff} value={stats.inactiveCiudades} color='#EF4444' />
                </motion.div>

                {/* Botón para agregar nueva ciudad */}
                <div className="flex justify-end mb-4">
                    <Link
                        to="/ciudades/nuevo"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        + Agregar
                    </Link>
                </div>

                {/* Tabla con datos detallados de ciudades */}
                <CiudadTable />
            </main>

        </div>
    )

}

export default CiudadListPage;