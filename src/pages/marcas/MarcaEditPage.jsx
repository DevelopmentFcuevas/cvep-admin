// 📦 Librerías externas
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// 📁 Íconos u otros recursos externos
import { List, 
    Pencil, 
    Save, 
    ArrowLeft, 
    XCircle, 
    Sparkles, 
    FolderCog, 
    Lightbulb, 
    BadgeCheck } from "lucide-react";
// 🔧 Servicios (API, helpers, utilidades)
import { getMarcaById, 
    updateMarca } from '../../modules/inventory/services/marcaService';
// 🧩 Componentes comunes
import Header from '../../components/common/Header';
import Breadcrumb from '../../components/common/Breadcrumb';
import Section from '../../components/common/Section';
// Componentes específicos

/**
 * 📝 Página de edición de una marca.
 */
const initialFormState = { nombre: '', descripcion: '', sigla: '' };

const MarcaEditPage = () => {

    // Obtener el ID de la marca desde los parámetros de la URL
    const { id } = useParams();

    // Hook de navegación para redirigir a otras páginas
    const navigate = useNavigate();

    // Estado para manejar el formulario de edición de marca
    const [form, setForm] = useState(initialFormState);
    
    // Estado para mostrar mensajes globales al usuario (éxito o error) 
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Estado para manejar errores de validación del formulario
    const [errors, setErrors] = useState({});
    
    // Estado para indicar si se está realizando una operación (como guardar)
    // Permite deshabilitar el botón mientras se guarda para evitar múltiples envíos.
    const [loading, setLoading] = useState(false);
    
    // Referencia para evitar múltiples envíos del formulario mientras se está procesando la solicitud.
    const submittingRef = useRef(false);

    // 📡 Cargar la marca al montar el componente
    useEffect(() => {
        if (!id) return;

        let isMounted = true;

        // Llamada a la API para obtener los datos de la marca por su ID
        getMarcaById(id)
            .then((res) => {
                if (!isMounted) return;

                // Manejo de la respuesta de la API y actualización del estado del formulario
                const marca = res?.data?.data ?? res?.data ?? {};
                setForm({
                    nombre: marca.nombre ?? marca.name ?? '',
                    descripcion: marca.descripcion ?? '',
                    abreviatura: marca.abreviatura ?? '',
                });
            })
            .catch((err) => {
                console.error('Error al cargar la marca:', err);
                if (isMounted) {
                    setMessage({ type: 'error', text: 'No se pudo cargar la marca.' });
                }
            });

        return () => {
            isMounted = false;
        };

    }, [id]);

    // Maneja los cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Validación del nombre de la marca (obligatorio, solo letras, espacios y guiones)
        const isBlank = (value) => typeof value !== 'string' ? !value && value !== 0 : value.trim() === '';

        // Validación del nombre de la marca (obligatorio, solo letras, espacios y guiones)
        if (isBlank(form.nombre)) {
            newErrors.nombre = 'Por favor, ingresa el nombre de la marca.';
        } else if (!/^[\p{L}\s'-]{2,255}$/u.test(form.nombre.trim())) {
            newErrors.nombre = 'El nombre contiene caracteres inválidos o excede los 255 caracteres.';
        }

        // Validación de la descripción de la marca (opcional, solo letras, espacios y guiones)
        if (form.descripcion && form.descripcion.trim().length > 255) {
            newErrors.descripcion = 'La descripción no puede exceder los 255 caracteres.';
        }

        // Validación de la abreviatura de la marca (opcional, solo letras, espacios y guiones)
        if (form.abreviatura && form.abreviatura.trim().length > 10) {
            newErrors.abreviatura = 'La abreviatura no puede exceder los 10 caracteres.';
        }

        // Actualiza el estado de errores y retorna si el formulario es válido
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Maneja el envío del formulario para actualizar la marca
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading || submittingRef.current) return;

        setMessage({ type: '', text: '' });
        if (!validateForm()) {
            setMessage({ type: 'error', text: 'Corrige los errores del formulario antes de continuar.' });
            return;
        }

        // Evitar múltiples envíos mientras se procesa la solicitud
        submittingRef.current = true;
        setLoading(true);

        try {
            const sanitizedForm = {
                nombre: form.nombre.trim(),
                descripcion: form.descripcion?.trim() || '',
                abreviatura: form.abreviatura?.trim() || '',
            };

            // Llamada a la API para actualizar la marca
            await updateMarca(id, sanitizedForm);
            setMessage({ type: 'success', text: '¡La marca se actualizó correctamente!' });
            setTimeout(() => navigate(`/marcas/${id}`), 1500);
        } catch (error) {
            console.error('Error en handleSubmit - No se pudo actualizar la marca:', error);
            setMessage({
                type: 'error',
                text: 'Ocurrió un error al actualizar la marca. Intenta nuevamente más tarde.',
            });
        } finally {
            submittingRef.current = false;
            setLoading(false);
        }
    };

    return (
        <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
            {/* 🧭 Header superior de la página(Cabecera con título) */}
            <Header title={`✏️ Editar Marca: ${form.nombre || 'Marca'}`} />

            <Breadcrumb items={[
                { label: <><List className="inline w-4 h-4 mr-1"/> Listado</>, href: '/marcas' },
                { label: <><Pencil className="inline w-4 h-4 mr-1"/> Editar Marca: {form.nombre || 'Marca'}</> }
            ]} />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <Section icon={FolderCog} title="📝 Datos de la Marca" description="Actualiza el nombre de la marca y mantén la información ordenada.">
                    {/* Mensaje informativo sobre la sección */}
                    <div className="bg-blue-600/10 border border-blue-500 text-blue-200 p-4 rounded mb-6">
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 mt-0.5 text-blue-300" />
                            <div>
                                <p className="text-sm font-medium">Aquí puedes actualizar los datos de la marca para mantenerla organizada.</p>
                                <p className="text-sm mt-1 text-blue-100/80">Ajusta el dato principal cuando necesites corregir o mejorar la clasificación del producto.</p>
                            </div>
                        </div>
                    </div>

                    <div className='w-full'>
                        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_0.8fr] gap-6">
                            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-2xl shadow-md">
                                {message.text && (
                                    <div className={`mt-4 p-4 rounded-md text-white font-medium ${
                                        message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                                    }`}>
                                        {message.text}
                                    </div>
                                )}

                                <div className="space-y-5">
                                    <section className="rounded-2xl border border-gray-700 bg-gray-900/60 p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-sm font-semibold text-white">Información básica</h3>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    Actualiza la marca.
                                                </p>
                                            </div>
                                            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-indigo-300">
                                                Formulario de Marca
                                            </span>
                                        </div>

                                        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div className="lg:col-span-2">
                                                <label className="text-lg font-semibold text-gray-100">Nombre de la marca</label>
                                                <input
                                                    type="text"
                                                    name="nombre"
                                                    value={form.nombre}
                                                    onChange={handleChange}
                                                    className="mt-1 w-full rounded-md bg-gray-700 text-white p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="Ej: Útiles de oficina"
                                                    maxLength={255}
                                                />
                                                <p className="text-xs text-gray-400 mt-1">Nombre que identifica la marca dentro del sistema.</p>
                                                {errors.nombre && (
                                                    <p className="text-red-400 text-sm mt-1">{errors.nombre}</p>
                                                )}
                                            </div>

                                            <div className="lg:col-span-2">
                                                <label className="text-lg font-semibold text-gray-100">Descripción de la marca</label>
                                                <input
                                                    type="text"
                                                    name="descripcion"
                                                    value={form.descripcion}
                                                    onChange={handleChange}
                                                    className="mt-1 w-full rounded-md bg-gray-700 text-white p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="Ej: Categoría de productos para uso en el área de oficina"
                                                    maxLength={255}
                                                />
                                                <p className="text-xs text-gray-400 mt-1">Descripción de la marca.</p>
                                                {errors.descripcion && (
                                                    <p className="text-red-400 text-sm mt-1">{errors.descripcion}</p>
                                                )}
                                            </div>

                                            <div className="lg:col-span-2">
                                                <label className="text-lg font-semibold text-gray-100">Abreviatura de la marca</label>
                                                <input
                                                    type="text"
                                                    name="abreviatura"
                                                    value={form.abreviatura}
                                                    onChange={handleChange}
                                                    className="mt-1 w-full rounded-md bg-gray-700 text-white p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="Ej: UO"
                                                    maxLength={10}
                                                />
                                                <p className="text-xs text-gray-400 mt-1">Abreviatura que representa la marca.</p>
                                                {errors.abreviatura && (
                                                    <p className="text-red-400 text-sm mt-1">{errors.abreviatura}</p>
                                                )}
                                            </div>

                                        </div>
                                    </section>
                                </div>

                                <div className="flex justify-between items-center mt-6">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/marcas')}
                                            disabled={loading}
                                            className="flex items-center gap-2 bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            <ArrowLeft size={18}/> Volver
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setForm(initialFormState)}
                                            disabled={loading}
                                            className="flex items-center gap-2 bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            <XCircle size={18}/> Limpiar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className='bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed'
                                        >
                                            <Save size={18}/>
                                            {loading ? 'Guardando...' : 'Guardar Marca'}
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {/* 📝 Panel lateral con consejos rápidos */}
                            <aside className="bg-gradient-to-br from-indigo-600/20 to-blue-600/10 border border-indigo-500/40 rounded-2xl p-5 shadow-md">
                                <div className="flex items-center gap-2 text-indigo-300 mb-3">
                                    <Lightbulb className="w-5 h-5" />
                                    <h3 className="font-semibold text-white">Consejos rápidos</h3>
                                </div>
                                <ul className="space-y-3 text-sm text-gray-300">
                                    <li className="flex items-start gap-2">
                                        <BadgeCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-400" />
                                        Mantén nombres claros para facilitar la búsqueda posterior.
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <BadgeCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-400" />
                                        Actualiza la marca cuando cambie su propósito o clasificación.
                                    </li>
                                    
                                </ul>
                            </aside>
                        </div>
                    </div>
                </Section>
            </main>
        </div>
    );
};

export default MarcaEditPage;