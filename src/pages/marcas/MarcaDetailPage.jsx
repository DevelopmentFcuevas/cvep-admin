// 📦 Librerías externas
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';                  // Navegación interna con React Router
import dayjs from 'dayjs';                                                  // Para manejar fechas fácilmente
// 📁 Íconos u otros recursos externos
import { List, ZoomIn, ArrowLeft, FolderSearch, Sparkles, BadgeCheck, PanelsTopLeft } from "lucide-react";                     // Íconos
// 🔧 Servicios (API, helpers, utilidades)
import { getMarcaById } from '../../modules/inventory/services/marcaService';
// 🧩 Componentes comunes
import Header from '../../components/common/Header';                        // Título de la sección
import Breadcrumb from '../../components/common/Breadcrumb';                // Migas de pan para la Ruta de navegación
// Componentes específicos

/*
 * 🌍 Componente principal para mostrar los detalles de una marca específica. 
*/
const MarcaDetailPage = () => {

    // 🔁 Obtenemos el `id` desde la URL (ej: /marcas/123)
    const { id } = useParams();

    const navigate = useNavigate();

    // 🧠 Estado para guardar la información de la marca
    const [marca, setMarca] = useState(null); // Se inicializa como null mientras se carga

    // Estado para errores
    const [error, setError] = useState(null);

    const marcaNombre = marca?.name ?? marca?.nombre ?? 'Marca';
    const estadoValor = String(marca?.estado ?? '').trim().toUpperCase();
    const estadoTexto = estadoValor === 'ACTIVO' ? 'Activo' : estadoValor === 'INACTIVO' ? 'Inactivo' : 'No especificado';
    const isActivo = estadoValor === 'ACTIVO';

    // 📡 Petición para obtener los detalles de la marca
    useEffect(() => {
        if (!id) return;

        let isMounted = true;
        setError(null);

        getMarcaById(id)
            .then(res => {
                if (isMounted) {
                    setMarca(res?.data?.data ?? res?.data ?? null);
                }
            })
            .catch(err => {
                console.error("Error al obtener la marca: ", err);
                if (isMounted) {
                    setError("No se pudo cargar la información de la marca. Intenta nuevamente.");
                }
            });

        return () => {
            isMounted = false;
        };
    }, [id]); // Solo se vuelve a ejecutar si cambia el `id` de la URL

    // ⏳ Estado de carga
    if (!marca && !error) {
        return (
            <div className="flex justify-center items-center h-64 text-white">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                <span className="ml-4">Cargando información de la marca...</span>
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

    // ✅ Si ya se cargaron los datos de la marca, renderizamos la vista
    return (
        <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
            {/* 🧭 Header superior de la página(Cabecera con título) */}
            <Header title={`🔎 Detalles de: ${marca?.nombre || 'Marca'}`} />

            {/* 🧷 Breadcrumb(Migas de pan para la Ruta de navegación) */}
            <Breadcrumb items={[
                { label: <><List className="inline w-4 h-4 mr-1"/> Listado</>, href: '/marcas' },
                { label: <><ZoomIn className="inline w-4 h-4 mr-1"/> Detalles de {marcaNombre}</> }
            ]} />

            {/* 🧾 Contenido principal del detalle */}
            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>

                    <div className="bg-blue-600/10 border border-blue-500 text-blue-200 p-4 rounded mb-6">
                        <div className="flex items-start gap-3">
                            <FolderSearch className="w-5 h-5 mt-0.5 text-blue-300" />
                            <div>
                                <p className="text-sm font-medium">Aquí puedes revisar la información completa de la marca seleccionada.</p>
                                <p className="text-sm mt-1 text-blue-100/80">Esta vista te ayuda a confirmar los datos principales antes de editar o compartir la marca.</p>
                            </div>
                        </div>
                    </div>

                    <div className='w-full'>
                        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_0.8fr] gap-6">
                            <section className="rounded-2xl border border-gray-700 bg-gray-800/90 p-6 shadow-md">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-indigo-400" />
                                        <h2 className="text-xl font-semibold text-white">Información general</h2>
                                    </div>
                                    <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-indigo-300">
                                        Vista principal
                                    </span>
                                </div>

                                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="rounded-xl border border-gray-700 bg-gray-900/60 p-4">
                                        <p className="text-sm text-gray-400">Nombre</p>
                                        <p className="mt-1 text-lg font-semibold text-white">{marca.nombre}</p>
                                    </div>

                                    <div className="rounded-xl border border-gray-700 bg-gray-900/60 p-4">
                                        <p className="text-sm text-gray-400">Abreviatura</p>
                                        <p className="mt-1 text-lg font-semibold text-white">{marca.abreviatura || '—'}</p>
                                    </div>

                                    <div className="rounded-xl border border-gray-700 bg-gray-900/60 p-4 lg:col-span-2">
                                        <p className="text-sm text-gray-400">Descripción</p>
                                        <p className="mt-1 text-sm text-white whitespace-pre-line">{marca.descripcion || 'No hay descripción disponible.'}</p>
                                    </div>

                                    <div className="rounded-xl border border-gray-700 bg-gray-900/60 p-4">
                                        <p className="text-sm text-gray-400">Estado</p>
                                        <div className="mt-1">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                isActivo
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : estadoValor === 'INACTIVO'
                                                        ? 'bg-red-500/20 text-red-400'
                                                        : 'bg-gray-500/20 text-gray-300'
                                            }`}>
                                                {estadoTexto}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-gray-700 bg-gray-900/60 p-4">
                                        <p className="text-sm text-gray-400">Fecha de creación</p>
                                        <p className="mt-1 text-sm text-white">{marca.created_at ? dayjs(marca.created_at).format('DD/MM/YYYY hh:mm:ss A') : ''}</p>
                                    </div>

                                    <div className="rounded-xl border border-gray-700 bg-gray-900/60 p-4">
                                        <p className="text-sm text-gray-400">Fecha de actualización</p>
                                        <p className="mt-1 text-sm text-white">{marca.updated_at ? dayjs(marca.updated_at).format('DD/MM/YYYY hh:mm:ss A') : ''}</p>
                                    </div>
                                </div>
                            </section>

                            <aside className="space-y-4">
                                <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600/20 to-blue-600/10 p-5 shadow-md">
                                    <div className="flex items-center gap-2 text-indigo-300">
                                        <PanelsTopLeft className="w-5 h-5" />
                                        <h3 className="font-semibold text-white">Resumen</h3>
                                    </div>
                                    <ul className="mt-4 space-y-3 text-sm text-gray-300">
                                        <li className="flex items-start gap-2">
                                            <BadgeCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-400" />
                                            Se muestran los datos clave de forma ordenada.
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <BadgeCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-400" />
                                            El estado queda destacado visualmente para una lectura rápida.
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <BadgeCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-400" />
                                            La estructura está preparada para añadir más información luego.
                                        </li>
                                    </ul>
                                </div>

                                <button 
                                    onClick={() => navigate('/marcas')}
                                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Volver al listado
                                </button>
                            </aside>
                        </div>
                    </div>
            </main>
        </div>
    )
}

export default MarcaDetailPage;