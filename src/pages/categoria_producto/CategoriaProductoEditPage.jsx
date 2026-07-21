// 📦 Librerías externas
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// 📁 Íconos u otros recursos externos
import { List, Pencil, Save, ArrowLeft, XCircle } from "lucide-react";
import worldGlobe from '../../assets/world-globe.png';
// 🔧 Servicios (API, helpers, utilidades)
import { getCategoriaProductoById, updateCategoriaProducto } from '../../modules/inventory/services/categoriaProductoService';
// 🧩 Componentes comunes
import Header from '../../components/common/Header';
import Breadcrumb from '../../components/common/Breadcrumb';
import Section from '../../components/common/Section';
// Componentes específicos

/**
 * 📝 Página de edición de una categoría de producto.
 */
const CategoriaProductoEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({ nombre: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!id) return;

        let isMounted = true;

        getCategoriaProductoById(id)
            .then((res) => {
                if (!isMounted) return;

                const categoria = res?.data?.data ?? res?.data ?? {};
                setForm({
                    nombre: categoria.nombre ?? categoria.name ?? '',
                });
            })
            .catch((err) => {
                console.error('Error al cargar la categoría de producto:', err);
                if (isMounted) {
                    setMessage({ type: 'error', text: 'No se pudo cargar la categoría de producto.' });
                }
            });

        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const newErrors = {};
        const isBlank = (value) => typeof value !== 'string' ? !value && value !== 0 : value.trim() === '';

        if (isBlank(form.nombre)) {
            newErrors.nombre = 'Por favor, ingresa el nombre de la categoría.';
        } else if (!/^[\p{L}\s'-]{2,255}$/u.test(form.nombre.trim())) {
            newErrors.nombre = 'El nombre contiene caracteres inválidos o excede los 255 caracteres.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage({ type: '', text: '' });
        if (!validateForm()) {
            setMessage({ type: 'error', text: 'Corrige los errores del formulario antes de continuar.' });
            return;
        }

        setLoading(true);

        try {
            const sanitizedForm = {
                nombre: form.nombre.trim(),
            };

            await updateCategoriaProducto(id, sanitizedForm);
            setMessage({ type: 'success', text: '¡La categoría se actualizó correctamente!' });
            setTimeout(() => navigate(`/categorias-productos/${id}`), 1500);
        } catch (error) {
            console.error('Error en handleSubmit - No se pudo actualizar la categoría:', error);
            setMessage({
                type: 'error',
                text: 'Ocurrió un error al actualizar la categoría. Intenta nuevamente más tarde.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
            <Header title={`Editar Categoría: ${form.nombre || 'Categoría'}`} />

            <Breadcrumb items={[
                { label: <><List className="inline w-4 h-4 mr-1"/> Listado</>, href: '/categorias-productos' },
                { label: <><Pencil className="inline w-4 h-4 mr-1"/> Editar Categoría: {form.nombre || 'Categoría'}</> }
            ]} />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <Section title="Datos de la Categoría">
                    <div className="bg-blue-600/10 border border-blue-500 text-blue-200 p-4 rounded mb-6">
                        <p className="text-sm">
                            Aquí puedes actualizar el nombre de la categoría de productos.
                        </p>
                    </div>

                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-2xl shadow-md">
                            {message.text && (
                                <div className={`mt-4 p-4 rounded-md text-white font-medium ${
                                    message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                                }`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="text-lg font-semibold text-gray-100">Nombre de la categoría</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={form.nombre}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-md bg-gray-700 text-white p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Ej: Útiles de oficina"
                                        maxLength={50}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Nombre que identifica la categoría dentro del sistema.</p>
                                    {errors.nombre && (
                                        <p className="text-red-400 text-sm mt-1">{errors.nombre}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-6">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/categorias-productos')}
                                        className="flex items-center gap-2 bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        <ArrowLeft size={18}/> Volver
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setForm({ nombre: '' })}
                                        className="flex items-center gap-2 bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        <XCircle size={18}/> Limpiar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className='bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition flex items-center gap-2'
                                    >
                                        <Save size={18}/>
                                        {loading ? 'Guardando...' : 'Guardar Categoría'}
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div className="hidden lg:flex items-center justify-center">
                            <img src={worldGlobe} alt="Ilustración mundo" className="w-3/4 max-w-sm opacity-80" />
                        </div>
                    </div>
                </Section>
            </main>
        </div>
    );
};

export default CategoriaProductoEditPage;