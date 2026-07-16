// 📦 Librerías externas
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';                                     // Navegación interna con React Router
// 📁 Íconos u otros recursos externos
import { List, Plus, Save, ArrowLeft, XCircle } from "lucide-react";                // Íconos
import worldGlobe from '../../assets/world-globe.png';                              // Imagen de ejemplo
// 🔧 Servicios (API, helpers, utilidades)
import axios from '../../services/api';                                             // Cliente Axios centralizado
import { createCategoriaProducto } from '../../modules/inventory/services/categoriaProductoService'; // Servicio para crear familia-producto
import { handleError } from '../../utils/handleError';                              // Helper global para manejar errores
// 🧩 Componentes comunes
import Header from '../../components/common/Header';                                // Título de la sección
import Breadcrumb from '../../components/common/Breadcrumb';                        // Migas de pan para la Ruta de navegación
import Section from '../../components/common/Section';
// Componentes específicos


/**
 * Página Crear Familia de Productos que muestra el formulario de familia de productos.
 * Se encarga de guardar datos de familia-producto hacia la API.
 */
const CategoriaProductoCreatePage = () => {

    const navigate = useNavigate();

    // Estado para mostrar mensajes globales al usuario (éxito o error)
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // 📊 Estado del formulario con los campos de familia-producto a crear.
    // Este estado mantiene los valores que el usuario ingresa en el formulario.
    const [form, setForm] = useState({
        nombre: '',
    });

    // Estado para almacenar el archivo de imagen de la bandera seleccionada por el usuario.
    // Esto se usa para hacer una vista previa antes de enviar la imagen al servidor.
    //const [bandera, setBandera] = useState(null);

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
    
    // ✅ Función para validar los campos del formulario antes de enviarlos al servidor.
    // Retorna `true` si todos los campos son válidos, `false` en caso contrario.
    const validateForm = () => {
        const newErrors = {};

        // Helper para detectar solo espacios o strings vacíos
        const isBlank = (value) => !value || value.trim() === '';

        // Nombre del familia_productos (obligatorio, solo letras, espacios y guiones)
        if (isBlank(form.nombre)) {
            newErrors.nombre = 'Por favor, ingresa el nombre de la categoría de producto.';
        } else if (!/^[\p{L}\s'-]{2,255}$/u.test(form.nombre.trim())) {
            newErrors.nombre = 'El nombre de la ca contiene caracteres inválidos o excede los 255 caracteres.';
        }
    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    

    // 🚀 Maneja el envío del formulario
    const handleSubmit = async (e) => {
        
        e.preventDefault();

        setMessage({ type: '', text: '' }); // Limpiar mensaje anterior
        if (!validateForm()) {
            setMessage({ 
                type: 'error', 
                text: 'Corrige los errores del formulario antes de continuar.' 
            });
            return;
        }

        setLoading(true);

        try {
            //Convertir algunos campos a mayúsculas automáticamente antes de enviar.
            const sanitizedForm = {
                ...form,
                nombre: form.nombre.trim(),
            };

            //await axios.post('/product-families', sanitizedForm);
            await createCategoriaProducto(sanitizedForm);
            setMessage({ 
                type: 'success', 
                text: '¡El registro de Categoría de productos se creó correctamente!' 
            });
            setTimeout(() => navigate('/categorias-productos'), 1500);
        } catch (error) {
            // Usar el helper global para traducir el error en un mensaje amigable
            const mensajeAmigable = handleError(error);
            setMessage({ 
                type: 'error', 
                text: mensajeAmigable 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
            {/* 🧭 Header superior de la página(Cabecera con título) */}
            <Header title='Crear Categoría de Productos' />

            {/* 🧷 Breadcrumb(Migas de pan para la Ruta de navegación) */}
            <Breadcrumb items={[
                { label: <><List className="inline w-4 h-4 mr-1"/> Listado</>, href: '/product-families' },
                { label: <><Plus className="inline w-4 h-4 mr-1"/> Crear</> }
            ]} />

            {/* 🧾 Formulario */}
			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <Section title="Datos de la Categoría de Productos" description="Completa el formulario para crear una nueva categoría de productos.">
                    
                    <div className="bg-blue-600/10 border border-blue-500 text-blue-200 p-4 rounded mb-6">
                        <p className="text-sm">
                            Aquí puedes crear categorías para organizar tus productos 
                            (ej: útiles, suministros, repuestos).
                        </p>
                    </div>

                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        {/* Formulario a la izquierda */}
                        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-2xl shadow-md">
                            {/* 🛎️ Mensajes de estado */}
                            {message.text && (
                                <div className={`mt-4 p-4 rounded-md text-white font-medium ${
                                    message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                                }`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* 🧱 Campos individuales generados dinámicamente */}
                                {/* pattern:"^[A-Za-zÁÉÍÓÚáéíóúÑñ\\s-]+$", */}
                                {[
                                    { name: 'nombre', label: 'Nombre de la categoría', placeholder: 'Ej: Útiles de oficina', maxLength: 50, description: 'Nombre que identifica la categoría dentro del sistema.', autoFocus: true },
                                ].map(({ name, label, type = 'text', placeholder, maxLength, pattern, inputMode, min, description, autoFocus }) => (
                                    <div key={name}>
                                        <label title={label} className="text-lg font-semibold text-gray-100">{label}</label>
                                        <input
                                            type={type}
                                            name={name}
                                            value={form[name]}
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

                            {/* ✅ Botón de envío */}
                            {/* <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className='bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition'
                                    disabled={loading}
                                >
                                    {/* Guardar 
                                    {loading ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div> */}

                            <div className="flex justify-between items-center mt-6">
                                {/* Volver */}
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
                                        {loading ? "Guardando..." : "Guardar Categoría"}
                                    </button>
                                </div>
                            </div>

                        </form>

                        {/* 🖼️ Vista previa de la bandera o imagen genérica estática a la derecha */}
                        <div className="hidden lg:flex items-center justify-center">
                            <img src={worldGlobe} alt="Ilustración mundo" className="w-3/4 max-w-sm opacity-80" />
                        </div>
                    </div>
                </Section>
			</main>
		</div>
    )
}

export default CategoriaProductoCreatePage;