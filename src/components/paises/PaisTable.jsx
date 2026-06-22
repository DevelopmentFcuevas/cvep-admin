// 📦 Librerías externas
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";						// Librería para animaciones
import { Link } from 'react-router-dom';					// Navegación interna con React Router
import toast from "react-hot-toast";
import dayjs from 'dayjs';                                  // Para manejar fechas fácilmente
// 📁 Íconos u otros recursos externos
import { Search, Pencil, Trash2, Eye } from "lucide-react";	// Íconos
import { useReactTable, 
	getCoreRowModel, 
	getSortedRowModel, 
	getPaginationRowModel, 
	flexRender } from '@tanstack/react-table';
// 🔧 Servicios (API, helpers, utilidades)
import axios from '../../services/api';						// Cliente Axios centralizado
// 🧩 Componentes comunes
import ConfirmModal from "../common/ConfirmModal";			// Modal de Confirmación
import ErrorMessage from "../common/ErrorMessage";			// Mensajes de Error
// Componentes específicos


/**
 * Componente que renderiza una tabla de países con búsqueda, ordenamiento y paginación.
 */
const PaisTable = () => {
	// Estado para el término de búsqueda
	const [searchTerm, setSearchTerm] = useState("");

	// Estado que almacena todos los registros obtenidos desde la API
    const [records, setRecords] = useState([]);

	// Estado que contiene los registros filtrados (por búsqueda), inicializado con un array vacío.
    const [filteredPaises, setFilteredPaises] = useState([]);

	// Estado para manejar la animación del loader mientras se obtienen los datos
	const [loading, setLoading] = useState(true);

	// Estado para manejar la lógica de ordenamiento de columnas
	const [sorting, setSorting] = useState([]);

	// Estado para manejar errores
	const [error, setError] = useState(null);

	// Estado que controla si el modal de confirmación está abierto o cerrado
	const [modalOpen, setModalOpen] = useState(false);

	// Estado que guarda el país seleccionado para eliminar (usado al abrir el modal)
	const [selectedPais, setSelectedPais] = useState(null);

	/**
	 * useEffect que se ejecuta una sola vez al montar el componente.
	 * Realiza la llamada a la API para obtener la lista de países.
	 */
	useEffect(() => {
		setLoading(true); // Mostrar el loader antes de iniciar la carga
		setError(null); // Limpiar errores anteriores

        axios.get('http://localhost:8080/api/paises')
            .then(response => {
                setRecords(response.data); 			// Guarda todos los países en estado original
                setFilteredPaises(response.data); 	// Inicializa la tabla con todos los países
            })
            .catch(error => {
                console.error('Error al obtener los datos:', error);
				setError("No se pudo cargar la lista de países. Inténtalo más tarde."); // Guarda el error, actualiza el estado de errores.
            })
			.finally(() => {
				setLoading(false); // Ocultar el loader una vez que se termina la carga
			});;
    }, []);

	
	/**
	 * Filtra la tabla en tiempo real con base al término de búsqueda.
	 * Filtra por el campo "name" (nombre del país).
	 */
	const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

		// Filtro por nombre (puedes agregar más campos si quieres)
        const filtered = records.filter(
            (pais) => pais.name.toLowerCase().includes(term) 
				|| pais.continente.toLowerCase().includes(term)
				|| pais.estado.toLowerCase().includes(term)
        );
        setFilteredPaises(filtered);
    };

	/**
	 * Formatea el nombre del continente:
	 * - lo convierte todo a minúsculas
	 * - reemplaza guiones bajos con espacios
	 * - y luego capitaliza la primera letra de cada palabra.
	 */
	const formatContinente = (value) => {
		return value.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
	};

	/**
	 * Maneja la eliminación de un país.
	 * - Llama a la API para eliminarlo
	 * - Muestra mensaje de éxito o error
	 * - Refresca la tabla si se elimina correctamente
	 */
	const handleDelete = async () => {
		try {
			await axios.delete(`paises/${selectedPais.id}`);
			toast.success("País eliminado correctamente");
			setModalOpen(false); // Cierra el modal

			// Refrescar la lista de países(Actualiza los datos tras la eliminación).
			const response = await axios.get("paises");
			setRecords(response.data);
			setFilteredPaises(response.data);

			// Mensaje amigable para el usuario
			setError(null); // Borra errores anteriores, si existían
		} catch (error) {
			console.error("Error al eliminar país:", error?.response?.data || error.message || error);
			setError("No se pudo eliminar el país. Verifica tu conexión o intenta más tarde.");
		}
	};

	/**
	 * Definición de columnas de la tabla.
	 * Cada columna puede tener una key (campo del objeto), un título y una forma 
	 * personalizada de renderizar el contenido.
	 */
	const columns = useMemo(() => [
		{
			accessorKey: 'id',
			header: '#Id',
			cell: (info) => <div className='text-sm text-gray-300'>{info.getValue()}</div>,
		},
		{
			accessorKey: 'name',
			header: 'País',
			cell: (info) => <div className='text-sm text-gray-300'>{info.getValue()}</div>,
		},
		{
			accessorKey: 'codigoIso2',
			header: 'Código ISO2',
			cell: (info) => <div className='text-sm text-gray-300'>{info.getValue()}</div>,
		},
		{
			accessorKey: 'codigoIso3',
			header: 'Código ISO3',
			cell: (info) => (<div className='text-sm text-gray-300'>{info.getValue()}</div>),
		},
		{
			accessorKey: 'capital',
			header: 'Capital',
			cell: (info) => <div className='text-sm text-gray-300'>{info.getValue()}</div>,
		},
		{
			accessorKey: 'poblacion',
			header: 'Cant. Población',
			cell: (info) => <div className='text-sm text-gray-300'>{info.getValue()}</div>,
		},
		{
			accessorKey: 'area',
			header: 'Area(en km²)',
			cell: (info) => <div className='text-sm text-gray-300'>{info.getValue()}</div>,
		},
		{
			accessorKey: 'idioma',
			header: 'Idioma oficial',
			cell: (info) => <div className='text-sm text-gray-300'>{info.getValue()}</div>,
		},
		{
			accessorKey: 'moneda',
			header: 'Moneda oficial',
			cell: (info) => <div className='text-sm text-gray-300'>{info.getValue()}</div>,
		},
		{
			accessorKey: 'dominioTld',
			header: 'Dominio TLD',
			cell: (info) => <div className='text-sm text-gray-300'>{info.getValue()}</div>,
		},
		{
			accessorKey: 'husoHorario',
			header: 'Huso Horario',
			cell: (info) => <div className='text-sm text-gray-300'>{info.getValue()}</div>,
		},
		{
			accessorKey: 'continente',
			header: 'Continente',
			cell: (info) => (
				<div className='text-sm text-gray-300'>
					{formatContinente(info.getValue())}
				</div>
			),
		},
		{
			accessorKey: 'estado',
			header: 'Estado',
			cell: ({ getValue }) => {
				const estado = getValue();
				return (
					<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${estado === 'ACTIVO' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
						{estado}
					</span>
				);
			},
		},
		{
			accessorKey: 'createdAt',
			header: 'Fecha Creación',
			cell: (info) => <div className='text-sm text-gray-300'>{ info.getValue() ? dayjs(info.getValue()).format('DD/MM/YYYY hh:mm:ss A') : '' }</div>,
		},
		{
			accessorKey: 'updatedAt',
			header: 'Fecha Actualización',
			cell: (info) => <div className='text-sm text-gray-300'>{ info.getValue() ? dayjs(info.getValue()).format('DD/MM/YYYY hh:mm:ss A') : '' }</div>,
		},
		{
			id: 'acciones',
			header: 'Acciones',
			cell: ({ row }) => {
				const pais = row.original;
		
				return (
					<div className='flex gap-2 text-gray-300'>
						<Link
							to={`/paises/${pais.id}`}
							className='hover:text-amber-400 flex items-center'
							title="Ver detalles"
						>
							<Eye size={18} />
						</Link>
						<Link
							to={`/paises/${pais.id}/edit`}
							className="hover:text-blue-400 flex items-center"
							title="Editar"
						>
							<Pencil size={18} />
						</Link>
						<button
    						className='hover:text-red-400'
    						title="Eliminar"
							onClick={() => {
								setSelectedPais(pais);
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
		data: filteredPaises,
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

	/**
	 * Si hay un error se muéstra al usuario.
	 */
	/* if (error) {
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
	} */
	{error && <ErrorMessage message={error} />}
	
	return (
		<motion.div
			className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			{/* Titulo de la pagina y buscador */}
			<div className='flex justify-between items-center mb-6'>
				<h2 className='text-xl font-semibold text-gray-100'>Listado de Países</h2>
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

			{/* Tabla de datos(Países) */}
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
				message={`¿Estás seguro que deseas eliminar el país "${selectedPais?.name}"? Esta acción no se puede deshacer.`}
			/>
		</motion.div>
	);
};

export default PaisTable;