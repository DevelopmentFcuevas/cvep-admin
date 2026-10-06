// 📦 Librerías externas
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';                                     // Navegación interna con React Router
// 📁 Íconos u otros recursos externos
import { List,
    Plus, 
    Save, 
    ArrowLeft, 
    XCircle, 
    FolderPlus, 
    Sparkles, 
    Lightbulb, 
    BadgeCheck } from "lucide-react";                                                 // Íconos
// 🔧 Servicios (API, helpers, utilidades)
import { createUnidadMedida } from '../../modules/inventory/services/unidadMedidaService'; // Servicio para crear unidad-medida
import { handleError } from '../../utils/handleError';                              // Helper global para manejar errores
// 🧩 Componentes comunes
import Header from '../../components/common/Header';                                // Título de la sección
import Breadcrumb from '../../components/common/Breadcrumb';                        // Migas de pan para la Ruta de navegación
import Section from '../../components/common/Section';
// Componentes específicos

// Campos del formulario para crear una unidad de medida
const FORM_FIELDS = [
    { name: 'nombre', label: 'Nombre de la unidad de medida', placeholder: 'Ej: Kilogramos', maxLength: 255, description: 'Nombre que identifica la unidad de medida dentro del sistema.', autoFocus: true },
    { name: 'descripcion', label: 'Descripción de la unidad de medida', placeholder: 'Ej: Unidad de medida para peso', maxLength: 255, description: 'Descripción de la unidad de medida.', autoFocus: false },
    { name: 'sigla', label: 'Sigla de la unidad de medida', placeholder: 'Ej: kg', maxLength: 10, description: 'Sigla que representa la unidad de medida.', autoFocus: false },
    { name: 'decimal', label: 'Decimales', placeholder: 'Ej: 2', maxLength: 2, description: 'Número de decimales para la unidad de medida.', autoFocus: false, type: 'number', min: 0, inputMode: 'numeric' },
];

// Función para crear el estado inicial del formulario basado en los campos definidos
const createInitialFormState = () => Object.fromEntries(FORM_FIELDS.map(({ name }) => [name, '']));

/**
 * Página Crear Unidades de Medida que muestra el formulario de unidad de medida.
 * Se encarga de guardar datos de Unidad de Medida hacia la API.
 */
const UnidadMedidaCreatePage = () => {

    // Hook de navegación para redirigir a otras páginas
    const navigate = useNavigate();
    
    // Estado para mostrar mensajes globales al usuario (éxito o error)
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // 📊 Estado del formulario con los campos de unidad de medida a crear.
    // Este estado mantiene los valores que el usuario ingresa en el formulario.
    const [form, setForm] = useState(createInitialFormState);

    // 📌 Maneja los cambios en los campos del formulario
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // ❗ Estado para guardar los errores del formulario, clave: nombre del campo.
    // Guarda mensajes de error específicos para cada campo del formulario.
    const [errors, setErrors] = useState({});

    // Estado para indicar si se está realizando una operación (como guardar)
    // Permite deshabilitar el botón mientras se guarda para evitar múltiples envíos.
    const [loading, setLoading] = useState(false);

    // Referencia para evitar múltiples envíos del formulario mientras se está procesando la solicitud.
    const submittingRef = useRef(false);
    
    // ✅ Función para validar los campos del formulario antes de enviarlos al servidor.
    // Retorna `true` si todos los campos son válidos, `false` en caso contrario.
    const validateForm = () => {
        const newErrors = {};

        // Helper para detectar solo espacios o strings vacíos
        const isBlank = (value) => !value || value.trim() === '';

        // Nombre de la unidad de medida (obligatorio, solo letras, espacios y guiones)
        if (isBlank(form.nombre)) {
            newErrors.nombre = 'Por favor, ingresa el nombre de la unidad de medida.';
        } else if (!/^[\p{L}\s'-]{2,255}$/u.test(form.nombre.trim())) {
            newErrors.nombre = 'El nombre de la unidad de medida contiene caracteres inválidos o excede los 255 caracteres.';
        }

        // Descripción de la unidad de medida (opcional, solo letras, espacios y guiones)
        if (form.descripcion && form.descripcion.trim().length > 255) {
            newErrors.descripcion = 'La descripción no puede exceder los 255 caracteres.';
        }

        // Sigla de la unidad de medida (opcional, solo letras, espacios y guiones)
        if (form.sigla && form.sigla.trim().length > 10) {
            newErrors.sigla = 'La sigla no puede exceder los 10 caracteres.';
        }
        
        // Decimales de la unidad de medida (opcional, solo números enteros entre 0 y 2)
        if (form.decimal && !/^\d+$/.test(form.decimal.trim())) {
            newErrors.decimal = 'Los decimales deben ser un número entero.';
        } else if (form.decimal && (parseInt(form.decimal, 10) < 0 || parseInt(form.decimal, 10) > 2)) {
            newErrors.decimal = 'Los decimales deben estar entre 0 y 2.';
        }

        // Actualiza el estado de errores y retorna si el formulario es válido
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    // 🚀 Maneja el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading || submittingRef.current) return;
        
        setMessage({ type: '', text: '' }); // Limpiar mensaje anterior
        if (!validateForm()) {
            setMessage({ 
                type: 'error', 
                text: 'Corrige los errores del formulario antes de continuar.' 
            });
            return;
        }

        // Evitar múltiples envíos mientras se procesa la solicitud
        submittingRef.current = true;

        // Indicar que se está procesando la solicitud (deshabilita el botón de envío)
        setLoading(true);

        try {
            // Normalizar los valores antes de enviarlos al backend.
            const sanitizedForm = Object.fromEntries(
                Object.entries(form).map(([key, value]) => [
                    key,
                    typeof value === 'string' ? value.trim() : value,
                ])
            );

            // Llamar al servicio para crear la unidad de medida en el backend
            await createUnidadMedida(sanitizedForm);
            setMessage({ 
                type: 'success', 
                text: '¡El registro de Unidad de Medida se creó correctamente!' 
            });
            setTimeout(() => navigate('/unidades-medida'), 1500);
        } catch (error) {
            // Usar el helper global para traducir el error en un mensaje amigable
            const mensajeAmigable = handleError(error);
            setMessage({ 
                type: 'error', 
                text: mensajeAmigable 
            });
        } finally {
            submittingRef.current = false;
            setLoading(false);
        }
    };

    return (
        <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
            {/* 🧭 Header superior de la página(Cabecera con título) */}
            <Header title='➕ Crear Unidad de Medida' />

            {/* 🧷 Breadcrumb(Migas de pan para la Ruta de navegación) */}
            <Breadcrumb items={[
                { label: <><List className="inline w-4 h-4 mr-1"/> Listado</>, href: '/unidades-medida' },
                { label: <><Plus className="inline w-4 h-4 mr-1"/> Crear</> }
            ]} />

            {/* 🧾 Formulario */}
			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <Section icon={FolderPlus} title="📝 Datos de la Unidad de Medida" description="Completa el formulario para crear una nueva unidad de medida.">
                    
                    {/* Mensaje informativo sobre la sección */}
                    <div className="bg-blue-600/10 border border-blue-500 text-blue-200 p-4 rounded mb-6">
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 mt-0.5 text-blue-300" />
                            <div>
                                <p className="text-sm font-medium">Aquí puedes crear unidades de medida para organizar tus productos de forma clara y ordenada.</p>
                                <p className="text-sm mt-1 text-blue-100/80">Ejemplos: kilogramos, litros, metros, unidades.</p>
                            </div>
                        </div>
                    </div>

                    <div className='w-full'>
                        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_0.8fr] gap-6">
                            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-2xl shadow-md">
                                {/* 🛎️ Mensajes de estado */}
                                {message.text && (
                                    <div className={`mt-4 p-4 rounded-md text-white font-medium ${
                                        message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                                    }`}>
                                        {message.text}
                                    </div>
                                )}

                                {/* 🧱 Campos del formulario */}
                                <div className="space-y-5">
                                    <section className="rounded-2xl border border-gray-700 bg-gray-900/60 p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-sm font-semibold text-white">Información básica</h3>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    Define la unidad de medida.
                                                </p>
                                            </div>
                                            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-indigo-300">
                                                Formulario de Unidad de Medida
                                            </span>
                                        </div>

                                        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div className="lg:col-span-2">
                                                {/* 🧱 Campos individuales generados dinámicamente */}
                                                {FORM_FIELDS.map(({ name, label, type = 'text', placeholder, maxLength, pattern, inputMode, min, description, autoFocus }) => (
                                                    <div key={name} className="w-full">
                                                        <label title={label} className="text-lg font-semibold text-gray-100">{label}</label>
                                                        <input
                                                            type={type}
                                                            name={name}
                                                            value={form[name] ?? ''}
                                                            onChange={handleChange}
                                                            autoFocus={!!autoFocus}
                                                            className="mt-1 w-full rounded-md bg-gray-700 text-white p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            placeholder={placeholder}
                                                            maxLength={maxLength}
                                                            pattern={pattern}
                                                            inputMode={inputMode}
                                                            min={min}
                                                        />
                                                        {description && (
                                                            <p className="text-xs text-gray-400 mt-1">{description}</p>
                                                        )}

                                                        {errors[name] && (
                                                            <p className="text-red-400 text-sm mt-1">{errors[name]}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* ✅ Botón de envío */}
                                <div className="flex justify-between items-center mt-6">
                                    {/* Volver */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/unidades-medida')}
                                            disabled={loading}
                                            className="flex items-center gap-2 bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            <ArrowLeft size={18}/> Volver
                                        </button>
                                        {/* Limpiar formulario */}
                                        <button
                                            type="button"
                                            onClick={() => setForm(createInitialFormState())}
                                            disabled={loading}
                                            className="flex items-center gap-2 bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            <XCircle size={18}/> Limpiar
                                        </button>
                                        {/* Guardar */}
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className='bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed'
                                        >
                                            <Save size={18}/>
                                            {loading ? "Guardando..." : "Guardar Unidad de Medida"}
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
                                        Usa nombres claros y fáciles de identificar.
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <BadgeCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-400" />
                                        Mantén una estructura sencilla para futuras unidades de medida.
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <BadgeCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-400" />
                                        Usar nombres claros y consistentes facilitan la búsqueda y el mantenimiento del catálogo.
                                        {/* Usa nombres que faciliten la búsqueda y mantenimiento del catálogo. */}
                                    </li>
                                </ul>
                            </aside>
                        </div>
                    </div>
                </Section>
			</main>
		</div>
    )
}

export default UnidadMedidaCreatePage;
