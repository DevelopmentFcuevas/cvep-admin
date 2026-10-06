import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Home, List, Pencil, Plus, Trash2 } from 'lucide-react';
import Breadcrumb from '../../components/common/Breadcrumb';
import Header from '../../components/common/Header';
import { deleteColor, getColores } from '../../modules/inventory/services/colorService';
import { handleError } from '../../utils/handleError';

const ColorListPage = () => {
    const [colores, setColores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    const loadColores = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getColores();
            const data = response?.data?.data ?? response?.data ?? [];
            setColores(Array.isArray(data) ? data : []);
            setError('');
        } catch (requestError) {
            setError(handleError(requestError));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadColores();
    }, [loadColores]);

    const handleDelete = async (color) => {
        if (!window.confirm(`¿Eliminar el color "${color.nombre}"?`)) return;
        setDeletingId(color.id);
        try {
            await deleteColor(color.id);
            setColores((current) => current.filter((item) => item.id !== color.id));
        } catch (requestError) {
            setError(handleError(requestError));
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
            <Header title="Catálogo de colores" />
            <Breadcrumb items={[
                { label: <><Home className="inline w-4 h-4 mr-1" /> Inicio</>, href: '/' },
                { label: <><List className="inline w-4 h-4 mr-1" /> Colores</> },
            ]} />
            <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                <div className="flex justify-end mb-4">
                    <Link to="/colores/create" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
                        <Plus size={18} /> Crear color
                    </Link>
                </div>
                {error && <div role="alert" className="mb-4 rounded-md border border-red-500/50 bg-red-500/10 p-3 text-red-300">{error}</div>}
                <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
                    <table className="w-full text-left text-sm text-gray-200">
                        <thead className="bg-gray-700/80 text-xs uppercase text-gray-300">
                            <tr>
                                <th className="px-4 py-3">Color</th>
                                <th className="px-4 py-3">Nombre</th>
                                <th className="px-4 py-3">Código</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loading ? (
                                <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">Cargando colores...</td></tr>
                            ) : colores.length === 0 ? (
                                <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No hay colores registrados.</td></tr>
                            ) : colores.map((color) => (
                                <tr key={color.id} className="hover:bg-gray-700/40">
                                    <td className="px-4 py-3">
                                        <span className="block h-6 w-6 rounded border border-gray-500" style={{ backgroundColor: color.codigo_color || 'transparent' }} title={color.codigo_color || 'Sin código'} />
                                    </td>
                                    <td className="px-4 py-3 font-medium text-white">{color.nombre}</td>
                                    <td className="px-4 py-3">{color.codigo_color || '—'}</td>
                                    <td className="px-4 py-3">{color.estado || 'ACTIVO'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-3">
                                            <Link aria-label={`Ver ${color.nombre}`} title="Ver" to={`/colores/${color.id}`} className="text-sky-300 hover:text-sky-200"><Eye size={18} /></Link>
                                            <Link aria-label={`Editar ${color.nombre}`} title="Editar" to={`/colores/${color.id}/edit`} className="text-amber-300 hover:text-amber-200"><Pencil size={18} /></Link>
                                            <button aria-label={`Eliminar ${color.nombre}`} title="Eliminar" type="button" disabled={deletingId === color.id} onClick={() => handleDelete(color)} className="text-red-300 hover:text-red-200 disabled:opacity-50"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default ColorListPage;