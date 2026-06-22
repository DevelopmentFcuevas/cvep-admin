// 📦 Librerías externas
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";						// Librería para animaciones
import { Link } from 'react-router-dom';					// Navegación interna con React Router
import toast from "react-hot-toast";
import dayjs from 'dayjs';                                  // Para manejar fechas fácilmente
// 📁 Íconos u otros recursos externos
import { Search, Pencil, Trash2, Eye, Hash, Tag, Calendar, RefreshCw, Settings, Shield, Activity } from "lucide-react";	// Íconos
import { useReactTable, 
	getCoreRowModel, 
	getSortedRowModel, 
	getPaginationRowModel, 
	flexRender } from '@tanstack/react-table';
// 🔧 Servicios (API, helpers, utilidades)
import axios from '../../services/api';						// Cliente Axios centralizado
import { getFamiliasProducto } from '../../modules/inventory/services/familiaProductoService';	// Servicios específicos de familia producto
import { handleError } from '../../utils/handleError';		// Helper para manejar errores
// 🧩 Componentes comunes
import ConfirmModal from "../common/ConfirmModal";			// Modal de Confirmación
import ErrorMessage from "../common/ErrorMessage";			// Mensajes de Error
// Componentes específicos



/**
 * Componente que renderiza una tabla de familia productos con búsqueda, ordenamiento y paginación.
 */
const FamiliaProductoTable = () => {
	// Estado para el término de búsqueda
	const [searchTerm, setSearchTerm] = useState("");

	// Estado que almacena todos los registros obtenidos desde la API
    const [records, setRecords] = useState([]);

	// Estado que contiene los registros filtrados (por búsqueda), inicializado con un array vacío.
    const [filteredFamiliaProducto, setFilteredFamiliaProducto] = useState([]);

	// Estado para manejar la animación del loader mientras se obtienen los datos
	const [loading, setLoading] = useState(true);

	// Estado para manejar la lógica de ordenamiento de columnas
	const [sorting, setSorting] = useState([]);

	// Estado para manejar errores
	const [error, setError] = useState(null);

	// Estado que controla si el modal de confirmación está abierto o cerrado
	const [modalOpen, setModalOpen] = useState(false);

	// Estado que guarda familia de producto seleccionado para eliminar (usado al abrir el modal)
	const [selectedFamiliaProducto, setSelectedFamiliaProducto] = useState(null);

	/**
	 * useEffect que se ejecuta una sola vez al montar el componente.
	 * Realiza la llamada a la API para obtener la lista de familia productos.
	 */
	/*useEffect(() => {
		setLoading(true); // Mostrar el loader antes de iniciar la carga
		setError(null); // Limpiar errores anteriores

		axios.get('http://127.0.0.1:8000/api/product-families')
			.then(response => {
    			if (response.data.success) {
        			setRecords(response.data.data);
        			setFilteredFamiliaProducto(response.data.data);
    			} else {
        			throw new Error("Respuesta inválida del servidor");
    			}
			})
			.catch(error => {
    			if (error.response) {
        			setError(error.response.data.message || "Error del servidor");
					console.error('Error del servidor', error.response.data);
    			} else if (error.request) {
        			setError("No hay conexión con el servidor");
					console.error('No se recibió respuesta del servidor', error.request);
    			} else {
        			setError("Error inesperado");
					console.error('Error al configurar la solicitud', error.message);
    			}
			})
			.finally(() => {
            	setLoading(false); // Ocultar el loader después de que la solicitud se complete (ya sea éxito o error)
        	});
    }, []);*/
	useEffect(() => {
		setLoading(true); // Mostrar el loader antes de iniciar la carga

		getFamiliasProducto()
			.then(response => {
    			if (response.data.success) {
        			setRecords(response.data.data);
        			setFilteredFamiliaProducto(response.data.data);
    			} else {
        			throw new Error("No pudimos obtener los datos. Intenta nuevamente.");
    			}
			})
			.catch(handleError) // Usar el helper global de manejo de errores
			.finally(() => {
            	setLoading(false); // Ocultar el loader después de que la solicitud se complete (ya sea éxito o error)
        	});
    }, []);
	
	/**
	 * Filtra la tabla en tiempo real con base al término de búsqueda.
	 * Filtra por el campo "name" (nombre de la familia producto).
	 */
	const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

		// Filtro por nombre (puedes agregar más campos si quieres)
        const filtered = records.filter(
            (familiaProducto) => familiaProducto.nombre.toLowerCase().includes(term) 
				/* || familiaProducto.continente.toLowerCase().includes(term)
				|| familiaProducto.estado.toLowerCase().includes(term) */
        );
        setFilteredFamiliaProducto(filtered);
    };

	/**
	 * Maneja la eliminación de un familia producto.
	 * - Llama a la API para eliminarlo
	 * - Muestra mensaje de éxito o error
	 * - Refresca la tabla si se elimina correctamente
	 */
	const handleDelete = async () => {
		try {
			await axios.delete(`product-families/${selectedFamiliaProducto.id}`);
			toast.success("Categoría de Productos eliminado correctamente");
			setModalOpen(false); // Cierra el modal

			// Refrescar la lista de familia producto(Actualiza los datos tras la eliminación).
			const response = await axios.get("product-families");
			setRecords(response.data.data);
			setFilteredFamiliaProducto(response.data.data);

			// Mensaje amigable para el usuario
			setError(null); // Borra errores anteriores, si existían
		} catch (error) {
			console.error("Error al eliminar Categoría de Productos:", error?.response?.data || error.message || error);
			setError("No se pudo eliminar Categoría de Productos. Verifica tu conexión o intenta más tarde.");
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
	 */
	const columns = useMemo(() => [
		{
			accessorKey: 'id',
			/* header: '#Id', */
			header: () => (
				<span className="flex items-center gap-1">
					<Hash size={14} /> ID
				</span>
			),
			cell: (info) => <div className='text-sm text-gray-300'>{info.getValue()}</div>,
		},
		{
			accessorKey: 'nombre',
			/* header: 'Nombre', */
			header: () => (
				<span className="flex items-center gap-1">
					<Tag size={14} /> Nombre de la categoría
				</span>
			),
			cell: (info) => <div className='text-sm text-gray-300'>{info.getValue()}</div>,
		},
		{
			accessorKey: 'estado',
			// header: 'Estado',
			header: () => (
				<span className="flex items-center gap-1">
					<Shield size={14} /> Estado
				</span>
			),
			cell: (info) => <EstadoBadge estado={info.getValue()} />,
		},
		{
			accessorKey: 'created_at',
			// header: 'Fecha Creación',
			header: () => (
				<span className="flex items-center gap-1">
					<Calendar size={14} /> Fecha de creación
				</span>
			),
			cell: (info) => <div className='text-sm text-gray-300'>{ info.getValue() ? dayjs(info.getValue()).format('DD/MM/YYYY hh:mm:ss A') : '' }</div>,
		},
		{
			accessorKey: 'updated_at',
			// header: 'Fecha Actualización',
			header: () => (
				<span className="flex items-center gap-1">
					<RefreshCw size={14} /> Última actualización
				</span>
			),
			cell: (info) => <div className='text-sm text-gray-300'>{ info.getValue() ? dayjs(info.getValue()).format('DD/MM/YYYY hh:mm:ss A') : '' }</div>,
		},
		{
			id: 'acciones',
			/* header: 'Acciones', */
			header: () => (
				<span className="flex items-center gap-1">
					<Settings size={14} /> Acciones
				</span>
			),
			cell: ({ row }) => {
				const familiaProducto = row.original;
		
				return (
					<div className='flex gap-2 text-gray-300'>
						<Link
							to={`/product-families/${familiaProducto.id}`}
							className='hover:text-amber-400 flex items-center'
							title="Ver detalles"
						>
							<Eye size={18} />
						</Link>
						<Link
							to={`/product-families/${familiaProducto.id}/edit`}
							className="hover:text-blue-400 flex items-center"
							title="Editar"
						>
							<Pencil size={18} />
						</Link>
						<button
    						className='hover:text-red-400'
    						title="Eliminar"
							onClick={() => {
								setSelectedFamiliaProducto(familiaProducto);
								setModalOpen(true);
							}}
						>
							<Trash2 size={18} />
						</button>
					</div>
				);
			},
		},
	], []);

	/**
	 * Configuración de la tabla usando TanStack Table v8.
	 * Permite manejar ordenamiento, paginación y renderizado.
	 */
	const table = useReactTable({
		data: filteredFamiliaProducto,
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
	
	
	if (!loading && filteredFamiliaProducto.length === 0) {
        return (
            <div className="bg-blue-500/10 border border-blue-500 text-blue-400 p-4 rounded">
                📦 Aún no hay Categorías de Productos registradas.
                <Link
                    to="/product-families/create"
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
			{/*
			if (error) {
				return (
					<div className="flex justify-center items-center h-64">
						<div className="text-center">
							<p className="text-red-400 text-lg font-medium mb-2">{error}</p>
							<p className="text-gray-400 text-sm">
								Por favor, revisa tu conexión o contacta al soporte si el problema persiste.
							</p>
						</div>
					</div>
				);
			} */}
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
					<h2 className='text-xl font-semibold text-gray-100'>📦 Administrar Categorías de Productos</h2>
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

				{/* Tabla de datos(Categorías de Productos) */}
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
										<td key={cell.id} className='px-6 py-4 whitespace-nowrap'>
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
					message={`¿Estás seguro que deseas eliminar Categoría de Productos "${selectedFamiliaProducto?.name}"? Esta acción no se puede deshacer.`}
				/>
			</motion.div>
		</>
	);
};

export default FamiliaProductoTable;