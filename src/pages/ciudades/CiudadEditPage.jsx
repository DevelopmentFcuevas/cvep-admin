// 📦 Librerías externas
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';                          // Navegación interna con React Router
import { Combobox } from '@headlessui/react';
// 📁 Íconos u otros recursos externos
import { List, Pencil } from "lucide-react";                                          // Íconos
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
 * 📝 Página de edición de una ciudad.
 */
const CiudadEditPage = () => {

    // 📥 Extrae el ID de la URL para saber qué ciudad editar
    const { id } = useParams();

    // 🔁 Navegación programática tras guardar
    const navigate = useNavigate();

    //  📊 Estado del formulario con los campos de la ciudad a modificar.
    // Este estado mantiene los valores que el usuario ingresa en el formulario.
    const [form, setForm] = useState({
        name: '',
        codigoPostal: '',
        paisId: '',
		departamentoId: '',
    });
    
    // Estado para mostrar mensajes globales al usuario (éxito o error)
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // ❗ Estado para guardar los errores del formulario, clave: nombre del campo.
    // Guarda mensajes de error específicos para cada campo del formulario.
    const [errors, setErrors] = useState({});

    // Estado para indicar si se está realizando una operación (como guardar)
    // Permite deshabilitar el botón mientras se guarda para evitar múltiples envíos.
    const [loading, setLoading] = useState(false);
    
    // Estado para mostrar la lista de paises del Select.
    const [paises, setPaises] = useState([]);

    // Estado para mostrar la lista de departamentos del Select.
    const [departamentos, setDepartamentos] = useState([]);

    const [selectedPais, setSelectedPais] = useState(null);
	const [query, setQuery] = useState('');
    const filteredPaises = query === ''
		? paises
		: paises.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

    // 🚀 Obtener la ciudad y países al montar
	useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [resCiudad, resPaises] = await Promise.all([
                    axios.get(`/ciudades/${id}`),
                    axios.get('/paises'),
                ]);

                const ciudad = resCiudad.data;
                const paisId = ciudad.departamento?.pais?.id || '';
                const departamentoId = ciudad.departamento?.id || '';

                setPaises(resPaises.data);

                const paisActual = resPaises.data.find(p => p.id === paisId) || null;
                setSelectedPais(paisActual);

                setForm({
                    name: ciudad.name ?? '',
                    codigoPostal: ciudad.codigoPostal ?? '',
                    paisId,
                    departamentoId
                });

                if (paisId) {
                    const resDeps = await axios.get(`/departamentos/pais/${paisId}`);
                    setDepartamentos(resDeps.data);
                }
            } catch (error) {
                console.error("❌ Error al cargar datos:", error);
                setMessage({ type: 'error', text: 'Error al cargar datos de la ciudad.' });
            }
        };

        fetchInitialData();
    }, [id]);
    
    // 🔁 Cargar departamentos al cambiar país
	useEffect(() => {
		if (form.paisId) {
			axios.get(`/departamentos/pais/${form.paisId}`)
				.then(res => setDepartamentos(res.data))
				.catch(() => setDepartamentos([]));
		} else {
			setDepartamentos([]);
		}
	}, [form.paisId]);
    

    const handlePaisSelect = (pais) => {
		setSelectedPais(pais);
		setForm(prev => ({
			...prev,
			paisId: pais?.id || '',
			departamentoId: '', // Resetea el departamento
		}));
	};


    // 📌 Maneja los cambios en los campos del formulario
    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };
    
    /* // ❗ Estado para guardar los errores del formulario, clave: nombre del campo.
    // Guarda mensajes de error específicos para cada campo del formulario.
    const [errors, setErrors] = useState({});

    // Estado para indicar si se está realizando una operación (como guardar)
    // Permite deshabilitar el botón mientras se guarda para evitar múltiples envíos.
    const [loading, setLoading] = useState(false); */

    // ✅ Función para validar los campos del formulario antes de enviarlos al servidor.
    // Retorna `true` si todos los campos son válidos, `false` en caso contrario.
    const validateForm = () => {
        const newErrors = {};

        // Helper para detectar solo espacios o strings vacíos
        const isBlank = (value) => {
            if (typeof value !== 'string') return !value && value !== 0;
            return value.trim() === '';
        };

        // Nombre de la ciudad (obligatorio, solo letras, espacios y guiones)
        if (isBlank(form.name)) {
            newErrors.name = 'Por favor, ingresa el nombre de la ciudad.';
        } else if (!/^[\p{L}\s'-]{2,255}$/u.test(form.name.trim())) {
            newErrors.name = 'El nombre contiene caracteres inválidos o excede los 255 caracteres.';
        }

        // Código Postal (opcional, pero si lo llena, validar)
        if (!isBlank(form.codigoPostal)) {
            if (!/^\d{4,10}$/.test(form.codigoPostal.trim())) {
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
            //const sanitizedForm = {
            //    ...form,
            //    name: form.name.trim(),
            //    codigoPostal: form.codigoPostal.trim().toUpperCase(),
            //};
            const sanitizedForm = {
                id: Number(id),
                name: form.name.trim(),
                codigoPostal: form.codigoPostal.trim().toUpperCase(),
                departamento: { id: Number(form.departamentoId) }
            };

            axios.put(`/ciudades/${id}`, sanitizedForm);
            setMessage({ 
                type: 'success', 
                text: '¡La ciudad se actualizo correctamente!' 
            });

            // Redirigir tras breve pausa
            setTimeout(() => navigate(`/ciudades/${id}`), 1500);

        } catch (error) {
            console.error('Error en handleSubmit - No se pudo actualizar la ciudad:', error);
            setMessage({ 
                type: 'error', 
                text: 'Ocurrió un error al actualizar la ciudad. Intenta nuevamente más tarde.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
            {/* 🧭 Header superior de la página(Cabecera con título) */}
            <Header title={`Editar Ciudad: ${form.name}`} />

            {/* 🧷 Breadcrumb(Migas de pan para la Ruta de navegación) */}
            <Breadcrumb items={[
                { label: <><List className="inline w-4 h-4 mr-1"/> Listado</>, href: '/ciudades' },
                { label: <><Pencil className="inline w-4 h-4 mr-1"/> Editar Ciudad: {form.name}</> }
            ]} />

            {/* 🧾 Formulario */}
            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <Section title="Datos de la Ciudad">
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
                                {/* País con buscador */}
                                <div>
                                    <label className="text-lg font-semibold text-gray-100">País</label>
                                    <Combobox value={selectedPais} onChange={handlePaisSelect}>
                                        <div className="relative mt-1">
                                            <Combobox.Input
                                                className="w-full rounded-md bg-gray-700 text-white p-2 border border-gray-600 focus:outline-none"
                                                displayValue={(pais) => pais?.name || ''}
                                                onChange={(e) => setQuery(e.target.value)}
                                                placeholder="Buscar país..."
                                            />
                                            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                                            </Combobox.Button>
                                        </div>
                                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-gray-800 text-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                            {filteredPaises.length === 0 && query !== '' ? (
                                                <div className="px-4 py-2 text-gray-400">No se encontró ningún país.</div>
                                            ) : (
                                                filteredPaises.map((pais) => (
                                                    <Combobox.Option
                                                        key={pais.id}
                                                        value={pais}
                                                        className={({ active }) => `cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-indigo-600 text-white' : 'text-gray-300'}`}
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span className={`${selected ? 'font-medium' : 'font-normal'}`}>
                                                                    {pais.name}
                                                                </span>
                                                                {selected && (
                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                                        <CheckIcon className="h-5 w-5 text-indigo-400" />
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </Combobox.Option>
                                                ))
                                            )}
                                        </Combobox.Options>
                                    </Combobox>
                                    {errors.paisId && <p className="text-red-400 text-sm mt-1">{errors.paisId}</p>}
                                </div>

                                {/* Departamento */}
                                <div>
                                    <label className="text-lg font-semibold text-gray-100">Departamento</label>
                                    <select
                                        key={form.departamentoId}
                                        name="departamentoId"
                                        value={form.departamentoId}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-md bg-gray-700 text-white p-2 border border-gray-600"
                                        required
                                        disabled={!form.paisId}
                                    >
                                        <option value="">Seleccione un departamento</option>
                                        {departamentos.map(dep => (
                                            <option key={dep.id} value={dep.id}>{dep.name}</option>
                                        ))}
                                    </select>
                                    {errors.departamentoId && <p className="text-red-400 text-sm mt-1">{errors.departamentoId}</p>}
                                </div>

                                {/* 🧱 Campos individuales generados dinámicamente */}
                                {[
                                    { name: 'name', label: 'Nombre de la ciudad', placeholder: 'Ej: Ciudad del Este', maxLength: 50, pattern:"^[A-Za-zÁÉÍÓÚáéíóúÑñ\\s-]+$" },
                                    { name: 'codigoPostal', label: 'Código Postal', placeholder: 'Ej: 001518', maxLength: 6 },
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

export default CiudadEditPage;