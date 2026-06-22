// 📦 Librerías externas
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';                          // Navegación interna con React Router
import { Combobox } from '@headlessui/react';
// 📁 Íconos u otros recursos externos
import { List, Pencil } from "lucide-react";                                        // Íconos
import worldGlobe from '../../assets/world-globe.png';                              // Imagen de ejemplo
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
// 🔧 Servicios (API, helpers, utilidades)
import axios from '../../services/api';                                             // Cliente Axios centralizado
// 🧩 Componentes comunes
import Header from '../../components/common/Header';                                // Título de la sección
import Breadcrumb from '../../components/common/Breadcrumb';                        // Migas de pan para la Ruta de navegación
import Section from '../../components/common/Section';
// Componentes específicos


/**
 * 📝 Página de edición de una barrio.
 */
const BarrioEditPage = () => {

    // 📥 Extrae el ID de la URL para saber qué barrio editar
    const { id } = useParams();

    // 🔁 Navegación programática tras guardar
    const navigate = useNavigate();

    //  📊 Estado del formulario con los campos de la barrio a modificar.
    // Este estado mantiene los valores que el usuario ingresa en el formulario.
    const [form, setForm] = useState({
        name: '',
        ciudadId: '',   // 👈 barrio pertenece a ciudad
    });

    // 📌 Datos para selects
    const [paises, setPaises] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [ciudades, setCiudades] = useState([]);

    const [paisId, setPaisId] = useState('');
    const [departamentoId, setDepartamentoId] = useState('');
    const [ciudadId, setCiudadId] = useState('');

     // 🚀 Cargar países al inicio
    useEffect(() => {
        axios.get('/paises')
        .then(res => setPaises(res.data))
        .catch(err => console.error("Error al cargar países:", err));
    }, []);

    // 🚀 Cargar datos del barrio al inicio
    useEffect(() => {
        axios.get(`/barrios/${id}`)
            .then(res => {
                const barrio = res.data;

                setForm({
                    name: barrio.name,
                    ciudadId: barrio.ciudad.id
                });

                // Preseleccionar País y Departamento desde la ciudad
                const dep = barrio.ciudad.departamento;
                const pais = dep.pais;

                setPaisId(pais.id);
                setDepartamentoId(dep.id);
                setCiudadId(barrio.ciudad.id);
            })
            .catch(err => {
                console.error("Error al cargar barrio:", err);
                setMessage({ type: 'error', text: 'No se pudo cargar el barrio.' });
            });
    }, [id]);

    // 🚀 Cuando cambia país → cargar departamentos
    useEffect(() => {
        if (paisId) {
        axios.get(`/departamentos/pais/${paisId}`)
            .then(res => setDepartamentos(res.data))
            .catch(() => setDepartamentos([]));
        setDepartamentoId('');
        setCiudades([]);
        setForm(prev => ({ ...prev, ciudadId: '' }));
        }
    }, [paisId]);


    // 🚀 Cuando cambia departamento → cargar ciudades
    useEffect(() => {
        if (departamentoId) {
        axios.get(`/ciudades/departamento/${departamentoId}`)
            .then(res => setCiudades(res.data))
            .catch(() => setCiudades([]));
        setCiudadId('');
        setCiudades([]);
        setForm(prev => ({ ...prev, ciudadId: '' }));
        }
    }, [departamentoId]);
    
    // Estado para mostrar mensajes globales al usuario (éxito o error)
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // ❗ Estado para guardar los errores del formulario, clave: nombre del campo.
    // Guarda mensajes de error específicos para cada campo del formulario.
    const [errors, setErrors] = useState({});

    // Estado para indicar si se está realizando una operación (como guardar)
    // Permite deshabilitar el botón mientras se guarda para evitar múltiples envíos.
    const [loading, setLoading] = useState(false);
    

    // 📌 Maneja los cambios en los campos del formulario
    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // ✅ Función para validar los campos del formulario antes de enviarlos al servidor.
    // Retorna `true` si todos los campos son válidos, `false` en caso contrario.
    const validateForm = () => {
        const newErrors = {};

        // Helper para detectar solo espacios o strings vacíos
        const isBlank = (value) => {
            if (typeof value !== 'string') return !value && value !== 0;
            return value.trim() === '';
        };

        // Nombre de la barrio (obligatorio, solo letras, espacios y guiones)
        if (isBlank(form.name)) {
            newErrors.name = 'Por favor, ingresa el nombre de la barrio.';
        } else if (!/^[\p{L}\s'-]{2,255}$/u.test(form.name.trim())) {
            newErrors.name = 'El nombre contiene caracteres inválidos o excede los 255 caracteres.';
        }
    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    // 🚀 Maneja el envío del formulario
    const handleSubmit = e => {
        
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
                id: Number(id),
                name: form.name.trim(),
                ciudad: { id: Number(form.ciudadId) }
            };

            axios.put(`/barrios/${id}`, sanitizedForm);
            setMessage({ 
                type: 'success', 
                text: '¡El barrio se actualizo correctamente!' 
            });

            // Redirigir tras breve pausa
            setTimeout(() => navigate(`/barrios/${id}`), 1500);

        } catch (error) {
            console.error('Error en handleSubmit - No se pudo actualizar el barrio:', error);
            setMessage({ 
                type: 'error', 
                text: 'Ocurrió un error al actualizar el barrio. Intenta nuevamente más tarde.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
            {/* 🧭 Header superior de la página(Cabecera con título) */}
            <Header title={`Editar Barrio: ${form.name}`} />

            {/* 🧷 Breadcrumb(Migas de pan para la Ruta de navegación) */}
            <Breadcrumb items={[
                { label: <><List className="inline w-4 h-4 mr-1"/> Listado</>, href: '/ciudades' },
                { label: <><Pencil className="inline w-4 h-4 mr-1"/> Editar Barrio: {form.name}</> }
            ]} />

            {/* 🧾 Formulario */}
            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <Section title="Datos del Barrio">
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        {/* ✏️ Formulario de edición */}
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
                                
                                {/* Select País */}
                                <div>
                                    <label className="text-lg font-semibold text-gray-100">País</label>
                                    <select
                                        value={paisId}
                                        onChange={e => setPaisId(e.target.value)}
                                        className="mt-1 w-full rounded-md bg-gray-700 text-white p-2 border border-gray-600"
                                        required
                                    >
                                        <option value="">Seleccione un país</option>
                                        {paises.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Select Departamento */}
                                <div>
                                    <label className="text-lg font-semibold text-gray-100">Departamento</label>
                                    <select
                                        value={departamentoId}
                                        onChange={e => setDepartamentoId(e.target.value)}
                                        className="mt-1 w-full rounded-md bg-gray-700 text-white p-2 border border-gray-600"
                                        required
                                        disabled={!paisId}
                                    >
                                        <option value="">Seleccione un departamento</option>
                                        {departamentos.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Select Ciudad */}
                                <div>
                                    <label className="text-lg font-semibold text-gray-100">Ciudad</label>
                                    <select
                                        name="ciudadId"
                                        value={form.ciudadId}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-md bg-gray-700 text-white p-2 border border-gray-600"
                                        required
                                        disabled={!departamentoId}
                                    >
                                        <option value="">Seleccione una ciudad</option>
                                        {ciudades.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                

                                {/* 🧱 Campos individuales generados dinámicamente */}
                                {[
                                    { name: 'name', label: 'Nombre del barrio', placeholder: 'Ej: Barrio Herrera', maxLength: 50, pattern:"^[A-Za-zÁÉÍÓÚáéíóúÑñ\\s-]+$" },
                                ].map(({ name, label, type = 'text', placeholder, maxLength, pattern, inputMode, min }) => (
                                    <div key={name}>
                                        <label className="text-lg font-semibold text-gray-100">{label}</label>
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
                            {form.banderaUrl ? (
                                <img
                                    src={form.banderaUrl}
                                    alt={`Bandera de ${form.name}`}
                                    className="w-3/4 max-w-sm rounded shadow-lg"
                                />
                            ) : (
                                <img src={worldGlobe} alt="Ilustración mundo" className="w-3/4 max-w-sm opacity-80" />
                            )}
                        </div>
                    </div>
                </Section>
            </main>
        </div>
    );
};

export default BarrioEditPage;