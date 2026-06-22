// 📦 Librerías externas
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';                                     // Navegación interna con React Router
// 📁 Íconos u otros recursos externos
import { List, Plus } from "lucide-react";                                          // Íconos
import worldGlobe from '../../assets/world-globe.png';                              // Imagen de ejemplo
// 🔧 Servicios (API, helpers, utilidades)
import axios from '../../services/api';                                             // Cliente Axios centralizado
// 🧩 Componentes comunes
import Header from '../../components/common/Header';                                // Título de la sección
import Breadcrumb from '../../components/common/Breadcrumb';                        // Migas de pan para la Ruta de navegación
import Section from '../../components/common/Section';
// Componentes específicos


/**
 * Página Crear Familia de Productos que muestra el formulario de familia de productos.
 * Se encarga de guardar datos de familia-producto hacia la API.
 */
const FamiliaProductoCreatePage = () => {

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
            newErrors.nombre = 'Por favor, ingresa el nombre de la familia de producto.';
        } else if (!/^[\p{L}\s'-]{2,255}$/u.test(form.nombre.trim())) {
            newErrors.nombre = 'El nombre contiene caracteres inválidos o excede los 255 caracteres.';
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

            await axios.post('/product-families', sanitizedForm);
            setMessage({ 
                type: 'success', 
                text: '¡El registro de familia de productos se creó correctamente!' 
            });
            setTimeout(() => navigate('/familias-producto'), 1500);
        } catch (error) {
            console.error('Error en handleSubmit - No se pudo crear el familia_productos:', error);
            if (error.response) {
                // El backend respondió con un código 4xx o 5xx
                //const backendMessage = error.response.data?.message || 'Error desconocido desde el servidor.';
                const backendMessage = 
                    typeof error.response.data === 'string'
                        ? error.response.data
                        : error.response.data?.message || 'Error desconocido desde el servidor.';
                setMessage({ 
                    type: 'error', 
                    text: backendMessage 
                });
            } else if (error.request) {
                // No hubo respuesta del servidor
                setMessage({ 
                    type: 'error', 
                    text: 'No se pudo conectar con el servidor. Verifica tu conexión.' 
                });
            } else {
                // Error al configurar la solicitud
                setMessage({ 
                    type: 'error', 
                    text: 'Error interno al procesar la solicitud.' 
                });
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
            {/* 🧭 Header superior de la página(Cabecera con título) */}
            <Header title='Crear Familia de Productos' />

            {/* 🧷 Breadcrumb(Migas de pan para la Ruta de navegación) */}
            <Breadcrumb items={[
                { label: <><List className="inline w-4 h-4 mr-1"/> Listado</>, href: '/familias-producto' },
                { label: <><Plus className="inline w-4 h-4 mr-1"/> Crear</> }
            ]} />

            {/* 🧾 Formulario */}
			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <Section title="Datos del Producto Familia" description="Completa el formulario para crear una nueva familia de productos.">
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
                                {[
                                    { name: 'nombre', label: 'Nombre de la familia producto', placeholder: 'Ej: Útiles', maxLength: 50, pattern:"^[A-Za-zÁÉÍÓÚáéíóúÑñ\\s-]+$" },
                                ].map(({ name, label, type = 'text', placeholder, maxLength, pattern, inputMode, min }) => (
                                    <div key={name}>
                                        <label title={label} className="text-lg font-semibold text-gray-100">{label}</label>
                                        <input
                                            type={type}
                                            name={name}
                                            value={form[name]}
                                            onChange={handleChange}
                                            className="mt-1 w-full rounded-md bg-gray-700 text-white p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder={placeholder}
                                            maxLength={maxLength}
                                            pattern={pattern}
                                            inputMode={inputMode}
                                            min={min}
                                        />
                                        {errors[name] && (
                                            <p className="text-red-400 text-sm mt-1">{errors[name]}</p>
                                        )}
                                    </div>
                                ))}

                            </div>

                            {/* ✅ Botón de envío */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className='bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition'
                                    disabled={loading}
                                >
                                    {/* Guardar */}
                                    {loading ? 'Guardando...' : 'Guardar'}
                                </button>
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

export default FamiliaProductoCreatePage;