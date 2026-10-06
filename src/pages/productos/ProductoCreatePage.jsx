// 📦 Librerías externas
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';                                         // Navegación interna con React Router
// 📁 Íconos u otros recursos externos
import { List,
    Plus, 
    Save, 
    ArrowLeft, 
    XCircle, 
    FolderPlus, 
    Sparkles, 
    Lightbulb, 
    BadgeCheck } from "lucide-react";                                                   // Íconos
// 🔧 Servicios (API, helpers, utilidades)
import { createProducto } from '../../modules/inventory/services/productoService';      // Servicio para crear producto
import { getMarcas } from '../../modules/inventory/services/marcaService';
import { getCategoriasProducto } from '../../modules/inventory/services/categoriaProductoService';
import { getUnidadesMedida } from '../../modules/inventory/services/unidadMedidaService';
import { getColores } from '../../modules/inventory/services/colorService';
import { getPaises } from '../../modules/public/services/paisService';                  // Servicio para obtener países
import { handleError } from '../../utils/handleError';                                  // Helper global para manejar errores
// 🧩 Componentes comunes
import Header from '../../components/common/Header';                                    // Título de la sección
import Breadcrumb from '../../components/common/Breadcrumb';                            // Migas de pan para la Ruta de navegación
import Section from '../../components/common/Section';
// Componentes específicos

const FORM_FIELDS = [
    { name: 'nombre', label: 'Nombre del producto', placeholder: 'Ej: Computadora', maxLength: 255, description: 'Nombre que identifica el producto dentro del sistema.', autoFocus: true },
    { name: 'codigo_barras', label: 'Código de barras', placeholder: 'Ej: 7701234567890', maxLength: 255 },
    { name: 'descripcion', label: 'Descripción del producto', placeholder: 'Describe el producto', type: 'textarea' },
    { name: 'modelo', label: 'Modelo', placeholder: 'Ej: ProBook 450' },
    { name: 'serie', label: 'Serie', placeholder: 'Ej: ABC-123' },
    { name: 'notas', label: 'Notas', placeholder: 'Notas adicionales', type: 'textarea' },
    { name: 'peso', label: 'Peso', placeholder: 'Ej: 2.50', type: 'number', inputMode: 'decimal', min: '0', step: '0.01' },
    { name: 'volumen', label: 'Volumen', placeholder: 'Ej: 1.25', type: 'number', inputMode: 'decimal', min: '0', step: '0.01' },
];

const RELATION_FIELDS = [
    { name: 'marca_id', label: 'Marca', emptyLabel: 'Selecciona una marca' },
    { name: 'pais_id', label: 'País', emptyLabel: 'Selecciona un país' },
    { name: 'categoria_producto_id', label: 'Categoría de producto', emptyLabel: 'Selecciona una categoría' },
    { name: 'unidad_medida_id', label: 'Unidad de medida', emptyLabel: 'Selecciona una unidad' },
    { name: 'color_id', label: 'Color', emptyLabel: 'Sin color', required: false },
];

// Función para crear el estado inicial del formulario basado en los campos definidos
const createInitialFormState = () => Object.fromEntries(
    [...FORM_FIELDS, ...RELATION_FIELDS].map(({ name }) => [name, ''])
);

/**
 * Página Crear Productos que muestra el formulario de producto.
 * Se encarga de guardar datos de Producto hacia la API.
 */
const ProductoCreatePage = () => {

    // Hook de navegación para redirigir a otras páginas
    const navigate = useNavigate();

    // Estado para mostrar mensajes globales al usuario (éxito o error)
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // 📊 Estado del formulario con los campos de marca a crear.
    // Este estado mantiene los valores que el usuario ingresa en el formulario.
    const [form, setForm] = useState(createInitialFormState);

    // Estado para almacenar las opciones de los campos select (marcas, países, categorías, unidades)
    const [options, setOptions] = useState({ marcas: [], paises: [], categorias: [], unidades: [], colores: [] });
    
    // Estado para indicar si las opciones están cargando, para mostrar un spinner o mensaje de carga en los selects
    const [loadingOptions, setLoadingOptions] = useState(true);

    // useEffect para cargar las opciones de los campos select al montar el componente
    useEffect(() => {
        const loadOptions = async () => {
            try {
                // Cargar todas las opciones de manera concurrente para optimizar el tiempo de carga
                const [marcasResponse, paisesResponse, categoriasResponse, unidadesResponse, coloresResponse] = await Promise.all([
                    getMarcas(),
                    getPaises(),
                    getCategoriasProducto(),
                    getUnidadesMedida(),
                    getColores(),
                ]);
                const getItems = (response) => response.data?.data ?? response.data ?? [];
                setOptions({
                    marcas: getItems(marcasResponse),
                    paises: getItems(paisesResponse),
                    categorias: getItems(categoriasResponse),
                    unidades: getItems(unidadesResponse),
                    colores: getItems(coloresResponse).filter((color) => String(color.estado ?? 'ACTIVO').toUpperCase() === 'ACTIVO'),
                });
            } catch (error) {
                setMessage({ type: 'error', text: handleError(error) });
            } finally {
                setLoadingOptions(false);
            }
        };
        loadOptions();
    }, []);

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

        // Nombre del producto (obligatorio, solo letras, espacios y guiones)
        if (isBlank(form.nombre)) {
            newErrors.nombre = 'Por favor, ingresa el nombre del producto.';
        } else if (!/^[\p{L}\s'-]{2,255}$/u.test(form.nombre.trim())) {
            newErrors.nombre = 'El nombre del producto contiene caracteres inválidos o excede los 255 caracteres.';
        }

        if (form.descripcion && form.descripcion.trim().length > 255) {
            newErrors.descripcion = 'La descripción no puede exceder los 255 caracteres.';
        }

        RELATION_FIELDS.forEach(({ name, label, required = true }) => {
            if (required && !form[name]) {
                newErrors[name] = `${label} es obligatorio.`;
            }
        });

        ['peso', 'volumen'].forEach((name) => {
            if (form[name] && (!Number.isFinite(Number(form[name])) || Number(form[name]) < 0)) {
                newErrors[name] = 'Debe ser un número decimal mayor o igual a cero.';
            }
        });

        //if (form.abreviatura && form.abreviatura.trim().length > 10) {
        //    newErrors.abreviatura = 'La abreviatura no puede exceder los 10 caracteres.';
        //}
    
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

        submittingRef.current = true;
        setLoading(true);

        try {
            // Normalizar los valores antes de enviarlos al backend.
            const sanitizedForm = Object.fromEntries(
                Object.entries(form).map(([key, value]) => [
                    key,
                    ['peso', 'volumen', ...RELATION_FIELDS.map(({ name }) => name)].includes(key)
                        ? (value === '' ? null : Number(value))
                        : typeof value === 'string' ? value.trim() : value,
                ])
            );

            await createProducto(sanitizedForm);
            setMessage({ 
                type: 'success', 
                text: '¡El registro de Producto se creó correctamente!' 
            });
            setTimeout(() => navigate('/productos'), 1500);
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
            <Header title='➕ Crear Producto' />

            {/* 🧷 Breadcrumb(Migas de pan para la Ruta de navegación) */}
            <Breadcrumb items={[
                { label: <><List className="inline w-4 h-4 mr-1"/> Listado</>, href: '/productos' },
                { label: <><Plus className="inline w-4 h-4 mr-1"/> Crear</> }
            ]} />

            {/* 🧾 Formulario */}
			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <Section icon={FolderPlus} title="📝 Datos del Producto" description="Completa el formulario para crear un nuevo producto.">
                    
                    {/* Mensaje informativo sobre la sección */}
                    <div className="bg-blue-600/10 border border-blue-500 text-blue-200 p-4 rounded mb-6">
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 mt-0.5 text-blue-300" />
                            <div>
                                <p className="text-sm font-medium">Aquí puedes crear productos para organizar tu inventario de forma clara y ordenada.</p>
                                <p className="text-sm mt-1 text-blue-100/80">Ejemplos: Zapatillas, Camisetas, Pantalones</p>
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
                                                    Define el producto.
                                                </p>
                                            </div>
                                            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-indigo-300">
                                                Formulario de Producto
                                            </span>
                                        </div>

                                        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div className="lg:col-span-2">
                                                {/* 🧱 Campos individuales generados dinámicamente */}
                                                {FORM_FIELDS.map(({ name, label, type = 'text', placeholder, maxLength, pattern, inputMode, min, step, options, description, autoFocus }) => (
                                                    <div key={name} className="w-full">
                                                        <label title={label} className="text-lg font-semibold text-gray-100">{label}</label>
                                                        {type === 'select' ? (
                                                            <select
                                                                name={name}
                                                                value={form[name] ?? ''}
                                                                onChange={handleChange}
                                                                className="mt-1 w-full rounded-md bg-gray-700 text-white p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            >
                                                                <option value="">{placeholder}</option>
                                                                {options.map((option) => (
                                                                    <option key={option} value={option}>{option}</option>
                                                                ))}
                                                            </select>
                                                        ) : type === 'textarea' ? (
                                                            <textarea
                                                                name={name}
                                                                value={form[name] ?? ''}
                                                                onChange={handleChange}
                                                                className="mt-1 w-full rounded-md bg-gray-700 text-white p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                                placeholder={placeholder}
                                                            />
                                                        ) : (
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
                                                                step={step}
                                                            />
                                                        )}
                                                        {description && (
                                                            <p className="text-xs text-gray-400 mt-1">{description}</p>
                                                        )}

                                                        {errors[name] && (
                                                            <p className="text-red-400 text-sm mt-1">{errors[name]}</p>
                                                        )}
                                                    </div>
                                                ))}

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                                                    {RELATION_FIELDS.map(({ name, label, emptyLabel }) => {
                                                        const optionKey = {
                                                            marca_id: 'marcas',
                                                            pais_id: 'paises',
                                                            categoria_producto_id: 'categorias',
                                                            unidad_medida_id: 'unidades',
                                                            color_id: 'colores',
                                                        }[name];

                                                        return (
                                                            <div key={name}>
                                                                <label title={label} className="text-lg font-semibold text-gray-100">{label}</label>
                                                                <select
                                                                    name={name}
                                                                    value={form[name] ?? ''}
                                                                    onChange={handleChange}
                                                                    disabled={loadingOptions}
                                                                    className="mt-1 w-full rounded-md bg-gray-700 text-white p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                                                                >
                                                                    <option value="">{loadingOptions ? 'Cargando opciones...' : emptyLabel}</option>
                                                                    {options[optionKey].map((option) => (
                                                                        <option key={option.id} value={option.id}>
                                                                            {option.nombre ?? option.name ?? option.descripcion ?? `Opción ${option.id}`}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                {name === 'color_id' && <p className="text-xs text-gray-400 mt-1">Opcional. Selecciona un color del catálogo.</p>}
                                                                {errors[name] && <p className="text-red-400 text-sm mt-1">{errors[name]}</p>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
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
                                            onClick={() => navigate('/productos')}
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
                                            {loading ? "Guardando..." : "Guardar Producto"}
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
                                        Mantén una estructura sencilla para futuros productos.
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <BadgeCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-400" />
                                        Usar nombres claros y consistentes facilitan la búsqueda y el mantenimiento del catálogo.
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

export default ProductoCreatePage;