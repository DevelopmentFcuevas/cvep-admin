import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, List, Save } from 'lucide-react';
import Breadcrumb from '../../components/common/Breadcrumb';
import Header from '../../components/common/Header';
import Section from '../../components/common/Section';
import { createColor, getColorById, updateColor } from '../../modules/inventory/services/colorService';
import { handleError } from '../../utils/handleError';

const INITIAL_FORM = { nombre: '', codigo_color: '', estado: 'ACTIVO' };

const ColorFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(INITIAL_FORM);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const submittingRef = useRef(false);
    const editing = Boolean(id);

    useEffect(() => {
        if (!id) return undefined;
        let active = true;
        getColorById(id)
            .then((response) => {
                if (!active) return;
                const color = response?.data?.data ?? response?.data ?? {};
                setForm({
                    nombre: color.nombre ?? '',
                    codigo_color: color.codigo_color ?? '',
                    estado: color.estado ?? 'ACTIVO',
                });
            })
            .catch((error) => {
                if (active) setMessage({ type: 'error', text: handleError(error) });
            });
        return () => { active = false; };
    }, [id]);

    const handleChange = (event) => {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (loading || submittingRef.current) return;
        if (!form.nombre.trim()) {
            setMessage({ type: 'error', text: 'El nombre del color es obligatorio.' });
            return;
        }

        submittingRef.current = true;
        setLoading(true);
        setMessage({ type: '', text: '' });
        const payload = {
            nombre: form.nombre.trim(),
            codigo_color: form.codigo_color.trim() || null,
            estado: form.estado,
        };

        try {
            if (editing) {
                await updateColor(id, payload);
                setMessage({ type: 'success', text: 'El color se actualizó correctamente.' });
                setTimeout(() => navigate(`/colores/${id}`), 900);
            } else {
                await createColor(payload);
                setMessage({ type: 'success', text: 'El color se creó correctamente.' });
                setTimeout(() => navigate('/colores'), 900);
            }
        } catch (error) {
            setMessage({ type: 'error', text: handleError(error) });
        } finally {
            submittingRef.current = false;
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
            <Header title={editing ? `Editar color: ${form.nombre || 'Color'}` : 'Crear color'} />
            <Breadcrumb items={[
                { label: <><List className="inline w-4 h-4 mr-1" /> Colores</>, href: '/colores' },
                { label: editing ? 'Editar' : 'Crear' },
            ]} />
            <main className="max-w-4xl mx-auto py-6 px-4 lg:px-8">
                <Section title="Datos del color" description="Administra el nombre, código visual y estado del color.">
                    <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-gray-700 bg-gray-800 p-6">
                        {message.text && <div role="status" className={`rounded-md p-3 text-white ${message.type === 'success' ? 'bg-green-700' : 'bg-red-700'}`}>{message.text}</div>}
                        <div>
                            <label htmlFor="nombre" className="block text-sm font-semibold text-gray-100">Nombre</label>
                            <input id="nombre" name="nombre" value={form.nombre} onChange={handleChange} maxLength={255} required className="mt-1 w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="codigo_color" className="block text-sm font-semibold text-gray-100">Código de color <span className="font-normal text-gray-400">(opcional)</span></label>
                            <div className="mt-1 flex gap-3">
                                <input aria-label="Vista previa del color" type="color" value={/^#[\da-f]{6}$/i.test(form.codigo_color) ? form.codigo_color : '#000000'} onChange={(event) => setForm((current) => ({ ...current, codigo_color: event.target.value }))} className="h-10 w-14 cursor-pointer rounded border border-gray-600 bg-gray-700 p-1" />
                                <input id="codigo_color" name="codigo_color" value={form.codigo_color} onChange={handleChange} maxLength={30} placeholder="Ej: #000080" className="min-w-0 flex-1 rounded-md border border-gray-600 bg-gray-700 p-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="estado" className="block text-sm font-semibold text-gray-100">Estado</label>
                            <select id="estado" name="estado" value={form.estado} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="ACTIVO">Activo</option>
                                <option value="INACTIVO">Inactivo</option>
                            </select>
                        </div>
                        <div className="flex flex-wrap gap-3 pt-2">
                            <button type="button" onClick={() => navigate('/colores')} className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-500"><ArrowLeft size={18} /> Volver</button>
                            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"><Save size={18} />{loading ? 'Guardando...' : 'Guardar color'}</button>
                        </div>
                    </form>
                </Section>
            </main>
        </div>
    );
};

export default ColorFormPage;