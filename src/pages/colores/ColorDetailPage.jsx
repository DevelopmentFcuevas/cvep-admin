import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import Breadcrumb from '../../components/common/Breadcrumb';
import Header from '../../components/common/Header';
import { getColorById } from '../../modules/inventory/services/colorService';
import { handleError } from '../../utils/handleError';

const ColorDetailPage = () => {
    const { id } = useParams();
    const [color, setColor] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        getColorById(id)
            .then((response) => {
                if (active) setColor(response?.data?.data ?? response?.data ?? null);
            })
            .catch((requestError) => {
                if (active) setError(handleError(requestError));
            });
        return () => { active = false; };
    }, [id]);

    return (
        <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
            <Header title={`Detalle del color${color?.nombre ? `: ${color.nombre}` : ''}`} />
            <Breadcrumb items={[{ label: 'Colores', href: '/colores' }, { label: 'Detalle' }]} />
            <main className="max-w-4xl mx-auto py-6 px-4 lg:px-8">
                {error ? <div role="alert" className="rounded-md border border-red-500/50 bg-red-500/10 p-4 text-red-300">{error}</div> : !color ? <p className="py-10 text-center text-gray-300">Cargando color...</p> : (
                    <section className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                        <div className="flex items-center gap-4 border-b border-gray-700 pb-5">
                            <span className="h-12 w-12 shrink-0 rounded border border-gray-500" style={{ backgroundColor: color.codigo_color || 'transparent' }} />
                            <div>
                                <h2 className="text-xl font-semibold text-white">{color.nombre}</h2>
                                <p className="text-sm text-gray-400">{color.codigo_color || 'Sin código de color'}</p>
                            </div>
                        </div>
                        <dl className="grid grid-cols-1 gap-5 py-5 sm:grid-cols-2">
                            <div><dt className="text-sm text-gray-400">Estado</dt><dd className="mt-1 text-white">{color.estado || 'ACTIVO'}</dd></div>
                            <div><dt className="text-sm text-gray-400">ID</dt><dd className="mt-1 text-white">{color.id}</dd></div>
                            <div><dt className="text-sm text-gray-400">Creado</dt><dd className="mt-1 text-white">{color.created_at ? new Date(color.created_at).toLocaleString() : '—'}</dd></div>
                            <div><dt className="text-sm text-gray-400">Actualizado</dt><dd className="mt-1 text-white">{color.updated_at ? new Date(color.updated_at).toLocaleString() : '—'}</dd></div>
                        </dl>
                        <div className="flex flex-wrap gap-3 border-t border-gray-700 pt-5">
                            <Link to="/colores" className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-500"><ArrowLeft size={18} /> Volver</Link>
                            <Link to={`/colores/${color.id}/edit`} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"><Pencil size={18} /> Editar</Link>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default ColorDetailPage;