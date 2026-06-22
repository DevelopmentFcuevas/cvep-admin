// 📦 Librerías externas
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';                                         // Librería para animaciones
import dayjs from 'dayjs';                                                      // Para manejar fechas fácilmente
import { Link } from 'react-router-dom';
// 📁 Íconos u otros recursos externos
import { Home, List } from "lucide-react";                                     // Íconos
import { Flag, FlagOff, LandPlot, Goal} from 'lucide-react';                   // Íconos para estadísticas
// 🔧 Servicios (API, helpers, utilidades)
import { getPaisesPorEstado, getPaisesPorFecha } from '../../services/api';     // Cliente Axios centralizado
// 🧩 Componentes comunes
import Header from '../../components/common/Header';                            // Título de la sección
import StatCard from '../../components/common/StatCard';                        // Tarjetas de estadísticas
import Breadcrumb from '../../components/common/Breadcrumb';                    // Migas de pan para la Ruta de navegación
// Componentes específicos
import PaisTable from '../../components/paises/PaisTable';                      // Tabla de datos (ahora de países)


/**
 * Página principal que muestra el listado de países junto con estadísticas rápidas.
 * Se encarga de obtener datos desde la API, renderizar tarjetas de resumen y una tabla interactiva.
 */
const PaisListPage = () => {

    // Estado para mostrar mensajes de error al usuario final
    //const [error, setError] = useState(null);
    const [error, setError] = useState({ type: '', text: '' });

    // Estado para mostrar mensajes globales al usuario (éxito o error)
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Estado local para guardar estadísticas calculadas desde la API
    const [stats, setStats] = useState({
        totalPaises: 0,
        newPaisesToday: 0,
        activePaises: 0,
        inactivePaises: 0,
    });
    // useEffect que se ejecuta al cargar la página para obtener datos de resumen desde la API
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [activosRes, inactivosRes, hoyRes] = await Promise.all([
                    getPaisesPorEstado("ACTIVO"),
                    getPaisesPorEstado("INACTIVO"),
                    getPaisesPorFecha(dayjs().format('YYYY-MM-DD')),
                ]);

                // Validamos los datos esperados
                if (typeof activosRes.data !== 'number' || typeof inactivosRes.data !== 'number') {
                    console.error("[ESTADÍSTICAS] Respuesta no válida del servidor:", { activosRes, inactivosRes });
                    setMessage({ 
                        type: 'error', 
                        text: 'Los datos de países activos o inactivos no son numéricos.' 
                    });
                    setError({ 
                        type: 'error', 
                        text: 'Los datos de países activos o inactivos no son numéricos.' 
                    });
                }

                // Calculamos el total
                const total = activosRes.data + inactivosRes.data;

                setStats({
                    totalPaises: total,
                    newPaisesToday: hoyRes.data,
                    activePaises: activosRes.data,
                    inactivePaises: inactivosRes.data,
                });
            } catch (error) {
                console.error("[ESTADÍSTICAS] Error al obtener estadísticas:", error);
                setMessage({ 
                    type: 'error', 
                    text: 'Hubo un problema al cargar las estadísticas de Países. Por favor, intenta nuevamente más tarde.' 
                });
                setError({ 
                    type: 'error', 
                    text: 'Hubo un problema al cargar las estadísticas de Países. Por favor, intenta nuevamente más tarde.' 
                });
            }
        };

        fetchStats();
    }, []);

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            
            {/* 🧭 Header superior de la página(Cabecera con título) */}
            <Header title='Listado de Países' />

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
                
                {/* Tarjetas con estadísticas principales */}
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 200 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard name="Total de Países" icon={Flag} value={stats.totalPaises.toLocaleString()} color='#6366F1' />
                    <StatCard name="Nuevos Países Agregados(hoy)" icon={LandPlot} value={stats.newPaisesToday} color='#10B981' />
                    <StatCard name="Países Activos" icon={Goal} value={stats.activePaises.toLocaleString()} color='#F59E0B' />
                    <StatCard name="Países Inactivos" icon={FlagOff} value={stats.inactivePaises} color='#EF4444' />
                </motion.div>

                {/* Botón para agregar nuevo país */}
                <div className="flex justify-end mb-4">
                    <Link
                        to="/paises/nuevo"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        + Agregar
                    </Link>
                </div>

                {/* Tabla con datos detallados de países */}
                <PaisTable />
            </main>

        </div>
    )
}

export default PaisListPage;