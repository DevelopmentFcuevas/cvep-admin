// 📦 Librerías externas
import React, { useState, useEffect } from 'react';
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
 * Página Crear Ciudad que muestra el formulario de ciudades.
 * Se encarga de guardar datos de ciudad hacia la API.
 */
const CiudadCreatePage = () => {

    const navigate = useNavigate();

    // Estado para mostrar mensajes globales al usuario (éxito o error)
    const [message, setMessage] = useState({ type: '', text: '' });

    // Estado para mostrar la lista de paises del Select.
    const [paises, setPaises] = useState([]);

    // Obtener lista de países al cargar la página.
    useEffect(() => {
        axios.get('/paises')
            .then(res => setPaises(res.data)) //setea en la variable 'paises'.
            .catch(err => console.error("Error al obtener países:", err));
    }, []);
    

    // Estado para mostrar la lista de departamentos del Select.
    const [departamentos, setDepartamentos] = useState([]);


    // 📊 Estado del formulario con los campos del ciudad a crear.
    // Este estado mantiene los valores que el usuario ingresa en el formulario.
    const [form, setForm] = useState({
        name: '',
        codigoPostal: '',
        paisId: '',
        departamentoId: '',
    });

    // Obtener departamentos cuando cambia el país
    useEffect(() => {
        if (!form.paisId) {
            setDepartamentos([]);
            setForm(prev => ({ ...prev, departamentoId: '' }));
            return;
        }

        axios.get(`/departamentos/pais/${form.paisId}`)
            .then(res => setDepartamentos(res.data))
            .catch(err => {
                console.error("Error al obtener departamentos:", err);
                setDepartamentos([]);
            });
    }, [form.paisId]);


    // Estado para almacenar el archivo de imagen de la bandera seleccionada por el usuario.
    // Esto se usa para hacer una vista previa antes de enviar la imagen al servidor.
    const [bandera, setBandera] = useState(null);

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

        // Nombre de la ciudad (obligatorio, solo letras, espacios y guiones)
        if (isBlank(form.name)) {
            newErrors.name = 'Por favor, ingresa el nombre de la ciudad.';
        } else if (!/^[\p{L}\s'-]{2,255}$/u.test(form.name.trim())) {
            newErrors.name = 'El nombre contiene caracteres inválidos o excede los 255 caracteres.';
        }

        // Código Postal (opcional, pero si lo llena, validar)
        if (!isBlank(form.codigoPostal)) {
            //if (!/^[\p{L}\s'-]{2,100}$/u.test(form.codigoPostal.trim())) {
            if (!/^\d{4,10}$/.test(form.codigoPostal.trim())) {   
                //newErrors.codigoPostal = 'El código postal contiene caracteres inválidos o es muy larga.';
                newErrors.codigoPostal = 'El código postal debe contener solo números entre 4 y 10 dígitos.';
            }
        }

        if (!form.paisId) {
            newErrors.paisId = 'Debe seleccionar un país.';
        }
        if (!form.departamentoId) {
            newErrors.departamentoId = 'Debe seleccionar un departamento.';
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
            // Convertir algunos campos a mayúsculas automáticamente antes de enviar.
            const sanitizedForm = {
                ...form,
                name: form.name.trim(),
                codigoPostal: form.codigoPostal.trim(),
                pais: { id: parseInt(form.paisId) },
                departamento: { id: parseInt(form.departamentoId) }
            };

            await axios.post('/ciudades', sanitizedForm);
            setMessage({ 
                type: 'success', 
                text: '¡La ciudad se creó correctamente!' 
            });
            setTimeout(() => navigate('/ciudades'), 1500);
        } catch (error) {
            console.error('Error en handleSubmit - No se pudo crear la ciudad:', error);
            setMessage({ 
                type: 'error', 
                text: 'Ocurrió un error al crear la ciudad. Intenta nuevamente más tarde.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
            {/* 🧭 Header superior de la página(Cabecera con título) */}
            <Header title='Crear Ciudad' />

            {/* 🧷 Breadcrumb(Migas de pan para la Ruta de navegación) */}
            <Breadcrumb items={[
                { label: <><List className="inline w-4 h-4 mr-1"/> Listado</>, href: '/ciudades' },
                { label: <><Plus className="inline w-4 h-4 mr-1"/> Crear</> }
            ]} />

            {/* 🧾 Formulario */}
			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <Section title="Datos de la Ciudad">
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
                                {/* 🌍 Selector de país */}
                                <div>
                                    <label className="text-lg font-semibold text-gray-100">País</label>
                                    <select
                                        name="paisId"
                                        value={form.paisId}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-md bg-gray-700 text-white p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">Seleccione un país</option>
                                        {paises.map(pais => (
                                            <option key={pais.id} value={pais.id}>{pais.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                {/* 🌍 Selector de departamento */}
                                <div>
                                    <label className="text-lg font-semibold text-gray-100">Departamento</label>
                                    <select
                                        name="departamentoId"
                                        value={form.departamentoId}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-md bg-gray-700 text-white p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                        disabled={!form.paisId}
                                    >
                                        <option value="">Seleccione un departamento</option>
                                        {departamentos.map(dep => (
                                            <option key={dep.id} value={dep.id}>{dep.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* 🧱 Campos individuales generados dinámicamente */}
                                {[
                                    { name: 'name', label: 'Nombre de la ciudad', placeholder: 'Ej: Ciudad del Este', maxLength: 50, pattern:"^[A-Za-zÁÉÍÓÚáéíóúÑñ\\s-]+$" },
                                    { name: 'codigoPostal', label: 'Código Postal', placeholder: 'Ej: 001518', maxLength: 6 },
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

                                {/* Archivo de Bandera */}
                                <div>
                                    <label className="text-sm text-gray-300">Bandera</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setBandera(e.target.files[0])}
                                        className="mt-1 w-full rounded-md bg-gray-50 p-2 text-gray-800 border border-gray-300"
                                    />
                                </div>
                                {bandera && (
                                    <img src={URL.createObjectURL(bandera)} alt="Vista previa" className="mt-2 w-32 h-auto rounded shadow" />
                                )}
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

export default CiudadCreatePage;