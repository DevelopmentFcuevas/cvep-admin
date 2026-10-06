// 📦 Librerías externas
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";						// Librería para animaciones
import { Link } from 'react-router-dom';					// Navegación interna con React Router
import toast from "react-hot-toast";
import dayjs from 'dayjs';                                  // Para manejar fechas fácilmente
// 📁 Íconos u otros recursos externos
import { Search, 
    Pencil, 
    Trash2, 
    Eye, 
    Hash, 
    Tag, 
    Type,
    FileText,
    Calendar, 
    RefreshCw, 
    Settings, 
    Shield, } from "lucide-react";							// Íconos
import { useReactTable, 
    getCoreRowModel, 
    getSortedRowModel, 
    getPaginationRowModel, 
    flexRender } from '@tanstack/react-table';				// Librería para tablas avanzadas con React
// 🔧 Servicios (API, helpers, utilidades)
import { getUnidadesMedida, deleteUnidadMedida } from '../../modules/inventory/services/unidadMedidaService';	// Servicios específicos de unidad de medida
import { handleError } from '../../utils/handleError';		// Helper para manejar errores
// 🧩 Componentes comunes
import ConfirmModal from "../common/ConfirmModal";			// Modal de Confirmación
// Componentes específicos


/**
 * Componente que renderiza una tabla de unidades de medida con búsqueda, ordenamiento y paginación.
 */
const UnidadMedidaTable = () => {
    // Estado para el término de búsqueda
    const [searchTerm, setSearchTerm] = useState("");

    // Estado que almacena todos los registros obtenidos desde la API
    const [records, setRecords] = useState([]);

    // Estado que contiene los registros filtrados (por búsqueda), inicializado con un array vacío.
    const [filteredUnidadMedida, setFilteredUnidadMedida] = useState([]);

    // Estado para manejar la animación del loader mientras se obtienen los datos
    const [loading, setLoading] = useState(true);

    // Estado para manejar la lógica de ordenamiento de columnas
    const [sorting, setSorting] = useState([]);

    // Estado para manejar errores
    const [error, setError] = useState(null);

    // Estado que controla si el modal de confirmación está abierto o cerrado
    const [modalOpen, setModalOpen] = useState(false);

    // Estado que guarda unidad de medida seleccionada para eliminar (usado al abrir el modal)
    const [selectedUnidadMedida, setSelectedUnidadMedida] = useState(null);

    /**
     * useEffect que se ejecuta una sola vez al montar el componente.
     * Realiza la llamada a la API para obtener la lista de familia productos.
     */
    useEffect(() => {
        setLoading(true); // Mostrar el loader antes de iniciar la carga
        setError(null); // Limpiar error anterior antes de la nueva carga

        getUnidadesMedida()
            .then(response => {
                if (response.data.success) {
                    setRecords(response.data.data);
                    setFilteredUnidadMedida(response.data.data);
                } else {
                    throw new Error("No pudimos obtener los datos. Intenta nuevamente.");
                }
            })
            .catch((error) => handleError(error, setError)) // Usar el helper global con setError
            .finally(() => {
                setLoading(false); // Ocultar el loader después de que la solicitud se complete
            });
    }, []);

    /**
     * Filtra la tabla en tiempo real con base al término de búsqueda.
     * Filtra por el campo "nombre" (nombre de la unidad de medida).
     */
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = records.filter((unidadMedida) => {
            return [
                unidadMedida.nombre,
                unidadMedida.descripcion,
                unidadMedida.sigla,
            ].some((value) =>
                typeof value === 'string' && value.toLowerCase().includes(term)
            );
        });
        setFilteredUnidadMedida(filtered);
    };

    /**
     * Maneja la eliminación de una unidad de medida.
     * - Llama al servicio para eliminarlo
     * - Muestra mensaje de éxito o error
     * - Refresca la tabla si se elimina correctamente
     */
    const handleDelete = async () => {
        if (!selectedUnidadMedida?.id) return;

        try {
            await deleteUnidadMedida(selectedUnidadMedida.id);
            toast.success("La Unidad de Medida fue eliminada correctamente", { duration: 2500 });
            await new Promise((resolve) => setTimeout(resolve, 1200));
            setModalOpen(false); // Cierra el modal

            // Refrescar la lista de unidades de medida usando el servicio
            const response = await getUnidadesMedida();
            const data = response?.data?.data ?? response?.data ?? [];
            setRecords(data);
            setFilteredUnidadMedida(data);

            // Mensaje amigable para el usuario
            setError(null); // Borra errores anteriores, si existían
        } catch (error) {
            console.error("Error al eliminar Unidad de Medida:", error?.response?.data || error.message || error);
            setError("No se pudo eliminar la Unidad de Medida. Verifica tu conexión o intenta más tarde.");
        }
    };

    /**
     * Componente para mostrar el estado con badge de color.
     */
    const EstadoBadge = ({ estado }) => {
        return (
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                estado === "ACTIVO"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
            }`}>
                {estado === "ACTIVO" ? "Activo" : "Inactivo"}
            </span>
        );
    };

    /**
     * Definición de columnas de la tabla.
     * Cada columna puede tener una key (campo del objeto), un título y una forma 
     * personalizada de renderizar el contenido.
     * Por ejemplo, la columna de "estado" usa un badge de color según el valor.
     * La columna de "acciones" tiene botones para ver, editar y eliminar.
     * Cada columna puede ser ordenable, y se puede personalizar el formato de fecha.
     * Se usa useMemo para memorizar la definición de columnas y evitar recalcularla en cada render.
     * Cada acción de la tabla (ver, editar, eliminar) está asociada a un ícono y un tooltip para mejorar la UX.
     * Cada accesorKey corresponde a un campo del objeto familiaProducto que viene de la API.
     * La columna de "acciones" no tiene accessorKey porque no corresponde a un campo del objeto, sino a botones de acción.
     * Se puede agregar más columnas según se necesite, por ejemplo, descripción, cantidad de productos asociados, etc.
     */
    const columns = useMemo(() => [
        {
            id: 'acciones',
            header: () => (
                <span className="flex items-center gap-1">
                    <Settings size={14} /> Acciones
                </span>
            ),
            cell: ({ row }) => {
                const unidadMedida = row.original;
        
                return (
                    <div className='flex gap-2 text-gray-300'>
                        <Link
                            to={`/unidades-medida/${unidadMedida.id}`}
                            className='hover:text-amber-400 flex items-center'
                            title="Ver detalles"
                        >
                            <Eye size={18} />
                        </Link>
                        <Link
                            to={`/unidades-medida/${unidadMedida.id}/edit`}
                            className="hover:text-blue-400 flex items-center"
                            title="Editar"
                        >
                            <Pencil size={18} />
                        </Link>
                        <button
                            className='hover:text-red-400'
                            title="Eliminar"
                            onClick={() => {
                                setSelectedUnidadMedida(unidadMedida);
                                setModalOpen(true);
                            }}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                );
            },
        },
        {
            accessorKey: 'id',
            header: () => (
                <span className="flex items-center gap-1">
                    <Hash size={14} /> ID
                </span>
            ),
            cell: (info) => <div className='text-sm text-gray-300'>{info.getValue()}</div>,
        },
        {
            accessorKey: 'nombre',
            header: () => (
                <span className="flex items-center gap-1">
                    <Tag size={16} /> Nombre unidad de medida
                </span>
            ),
            cell: (info) => <div className='text-sm text-gray-300'>{info.getValue()}</div>,
        },
        {
            accessorKey: 'sigla',
            header: () => (
                <span className="flex items-center gap-1">
                    <Hash size={16} /> Sigla
                </span>
            ),
            cell: (info) => <div className='text-sm text-gray-300 min-w-[90px]'>{info.getValue() ?? '-'}</div>,
            meta: { width: '110px' },
        },
        {
            accessorKey: 'descripcion',
            header: () => (
                <span className="flex items-center gap-1">
                    <FileText size={16} /> Descripción
                </span>
            ),
            cell: (info) => <div className='text-sm text-gray-300 min-w-[220px] max-w-[350px] truncate'>{info.getValue() ?? '-'}</div>,
            meta: { width: '280px' },
        },
    {
            accessorKey: 'decimal',
            header: () => (
                <span className="flex items-center gap-1">
                    <Hash size={16} /> Decimales
                </span>
            ),
            cell: (info) => <div className='text-sm text-gray-300'>{info.getValue()}</div>,
        },
        {
            accessorKey: 'estado',
            header: () => (
                <span className="flex items-center gap-1">
                    <Shield size={14} /> Estado
                </span>
            ),
            cell: (info) => <EstadoBadge estado={info.getValue()} />,
        },
        {
            accessorKey: 'created_at',
            header: () => (
                <span className="flex items-center gap-1">
                    <Calendar size={14} /> Fecha de creación
                </span>
            ),
            cell: (info) => <div className='text-sm text-gray-300'>{ info.getValue() ? dayjs(info.getValue()).format('DD/MM/YYYY HH:mm:ss A') : '' }</div>,
        },
        {
            accessorKey: 'updated_at',
            header: () => (
                <span className="flex items-center gap-1">
                    <RefreshCw size={14} /> Última actualización
                </span>
            ),
            cell: (info) => <div className='text-sm text-gray-300'>{ info.getValue() ? dayjs(info.getValue()).format('DD/MM/YYYY HH:mm:ss A') : '' }</div>,
        },
        
    ], []);

    /**
     * Configuración de la tabla usando TanStack Table v8.
     * Permite manejar ordenamiento, paginación y renderizado.
     */
    const table = useReactTable({
        data: filteredUnidadMedida,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    /**
     * Renderiza un loader mientras se están cargando los datos.
     */
    if (loading) {
        // Mostrar spinner si los datos aún se están cargando
        return (
            /* Un simple loader animado con Tailwind. */
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-t-2 border-blue-500"></div>
            </div>
        );
    }
    
    /*
     * Renderiza un mensaje si no hay registros disponibles.
     * Esto puede ocurrir si la API no devuelve datos o si el filtro de búsqueda no encuentra coincidencias.
     * Se ofrece un enlace para crear una nueva unidad de medida.
    */
    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded mb-4">
                ⚠️ {error}
            </div>
        );
    }

    if (!loading && records.length === 0) {		
        return (
            <div className="bg-blue-500/10 border border-blue-500 text-blue-400 p-4 rounded">
                📦 Aún no hay Unidades de Medida registradas.
                <Link
                    to="/unidades-medida/create"
                    className="ml-2 underline text-blue-300"
                >
                    Crear nueva
                </Link>
            </div>
        );
    }

    
    return (
        <>
            {/* 
            /**
            * Si hay un error se muéstra al usuario.
            * Aquí se puede personalizar el mensaje o incluso mostrar un componente más elaborado con sugerencias 
            * para resolver el problema.
             * Por ejemplo, si el error es de conexión, se podría mostrar un mensaje específico para eso.
             * Si el error viene del servidor, se podría mostrar el mensaje que envía el backend (si es seguro hacerlo).
             */}
            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded mb-4">
                    ⚠️ {error}
                </div>
            )}

            <motion.div
                className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                {/* Titulo de la pagina y buscador */}
                <div className='flex justify-between items-center mb-6'>
                    <h2 className='text-xl font-semibold text-gray-100'>📦 Administrar Unidades de Medida</h2>
                    <div className='relative'>
                        <input
                            type='text'
                            placeholder='Buscar...'
                            className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
                    </div>
                </div>

                {/* Tabla de datos(Unidades de Medida) */}
                <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-700'>
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer select-none'
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {{
                                                asc: ' ↑',
                                                desc: ' ↓',
                                            }[header.column.getIsSorted()] ?? ''}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className='divide-y divide-gray-700'>
                            {table.getRowModel().rows.map(row => (
                                <motion.tr 
                                    key={row.id} 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    transition={{ duration: 0.3 }}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className='px-4 py-4 whitespace-nowrap align-top'>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </motion.tr>
                            ))}

                            {/* Mensaje si no hay resultados */}
                            {table.getRowModel().rows.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-400">
                                        No se encontraron resultados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Paginación */}
                <div className='flex justify-between items-center mt-4 text-sm text-gray-300'>
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className='px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50'
                    >
                        Anterior
                    </button>
                    <span>
                        Página {table.getState().pagination.pageIndex + 1} de{' '}
                        {table.getPageCount()}
                    </span>
                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className='px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50'
                    >
                        Siguiente
                    </button>
                </div>
                
                <ConfirmModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onConfirm={handleDelete}
                    message={`¿Estás seguro que deseas eliminar la Unidad de Medida: "${selectedUnidadMedida?.nombre ?? selectedUnidadMedida?.name ?? ''}"? Esta acción no se puede deshacer.`}
                />
            </motion.div>
        </>
    );
};

export default UnidadMedidaTable;