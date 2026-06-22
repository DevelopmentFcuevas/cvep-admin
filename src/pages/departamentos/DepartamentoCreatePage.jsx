// 📦 Librerías externas
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';                                         // Navegación interna con React Router
import { Combobox } from '@headlessui/react';
// 📁 Íconos u otros recursos externos
import { List, Plus } from "lucide-react";                                              // Íconos
import worldGlobe from '../../assets/world-globe.png';                                  // Imagen de ejemplo
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
// 🔧 Servicios (API, helpers, utilidades)
import axios from '../../services/api';                                                 // Cliente Axios centralizado
// 🧩 Componentes comunes
import Header from '../../components/common/Header';                                    // Título de la sección
import Breadcrumb from '../../components/common/Breadcrumb';                            // Migas de pan para la Ruta de navegación
import Section from '../../components/common/Section';
// Componentes específicos

/**
 * Página Crear Departamento que muestra el formulario de departamentos.
 * Se encarga de guardar datos de departamento hacia la API.
 */
const DepartamentoCreatePage = () => {
    
    const navigate = useNavigate();

    // Estado para mostrar mensajes globales al usuario (éxito o error)
    const [message, setMessage] = useState({ type: '', text: '' });

    // Estado para mostrar la lista de paises del Select.
    const [paises, setPaises] = useState([]);
    useEffect(() => {
        const fetchPaises = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/paises')
                setPaises(response.data);
            } catch (error) {
                console.error("[LISTA DE PAISES] Error al obtener el listado de países:", error);
                setMessage({ 
                    type: 'error', 
                    text: '¡No se pudo cargar la lista de países, verifique con el administrador!' 
                });
            }
        };

        fetchPaises();
    }, []);
    
    // 📊 Estado del formulario con los campos del departamento a crear.
    // Este estado mantiene los valores que el usuario ingresa en el formulario.
    const [form, setForm] = useState({
        name: '',
        codigoIso: '',
        capital: '',
        poblacion: '',
        superficie: '',
        region: 'SIN_ESPECIFICAR',
        pais: { id: '' },
    });

    // 🌍 Lista de regiones válidos (para el select)
    const REGIONES = ['ORIENTAL', 'OCCIDENTAL', 'SIN_ESPECIFICAR'];

    // Estado para el texto de búsqueda y el elemento seleccionado.
    const [selectedPais, setSelectedPais] = useState(null);

    const [query, setQuery] = useState('');
    
    // Cuando se carga la lista de países y el formulario tenga uno, se inicialíza.
    useEffect(() => {
        if (form.pais.id && paises.length > 0) {
            const found = paises.find(p => String(p.id) === String(form.pais.id));
            setSelectedPais(found || null);
        }
    }, [form.pais.id, paises]);
    const filteredPaises =
    query === ''
        ? paises
        : paises.filter((pais) =>
                pais.name.toLowerCase().includes(query.toLowerCase())
            );
    const handlePaisSelect = (pais) => {
        //setSelectedPais(pais);
        //setForm({ ...form, pais: { id: pais.id } });

        if (!pais) {
            setSelectedPais(null);
            setForm({ ...form, pais: { id: '' } });
            return;
        }

        setSelectedPais(pais);
        setForm({ ...form, pais: { id: pais.id } });

    };
    
    // 📌 Maneja los cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'pais.id') {
            setForm({ ...form, pais: { id: value } });
        } else {
            setForm({ ...form, [name]: value });
        }
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

        // Nombre del departamento (obligatorio, solo letras, espacios y guiones)
        if (isBlank(form.name)) {
            newErrors.name = 'Por favor, ingresa el nombre del departamento.';
        } else if (!/^[\p{L}\s'-]{2,255}$/u.test(form.name.trim())) {
            newErrors.name = 'El nombre contiene caracteres inválidos o excede los 255 caracteres.';
        }

        // Código ISO (opcional, pero si lo llena, validar)
        if (!isBlank(form.codigoIso)) {
            if (!/^[A-Z]{2}$/.test(form.codigoIso.trim())) {
                newErrors.codigoIso = 'Debe tener exactamente 2 letras mayúsculas sin espacios.';
            }
        }

        // Capital (opcional, pero si lo llena, validar)
        if (!isBlank(form.capital)) {
            if (!/^[\p{L}\s'-]{2,100}$/u.test(form.capital.trim())) {
                newErrors.capital = 'La capital contiene caracteres inválidos o es muy larga.';
            }
        }

        // Población (opcional, pero válida si se ingresa)
        if (!isBlank(form.poblacion)) {
            const poblacionNum = Number(form.poblacion);
            if (isNaN(poblacionNum) || poblacionNum < 0 || poblacionNum > 2_000_000_000) {
                newErrors.poblacion = 'Ingresa una población válida (0 - 2 mil millones).';
            }
        }

        // Superficie (opcional, pero válida si se ingresa)
        if (!isBlank(form.superficie)) {
            const superficieNum = Number(form.superficie);
            if (isNaN(superficieNum) || superficieNum < 0 || superficieNum > 20_000_000) {
                newErrors.area = 'Ingresa un valor de superficie válido (0 - 20 millones km²).';
            }
        }

        // 🌍 Validar país obligatorio
        if (!form.pais.id) {
            newErrors['pais.id'] = 'Debes seleccionar un país válido.';
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
                name: form.name.trim(),
                codigoIso: form.codigoIso.trim().toUpperCase(),
            };

            await axios.post('/departamentos', sanitizedForm);
            setMessage({ 
                type: 'success', 
                text: '¡El Departamento se creó correctamente!' 
            });
            setTimeout(() => navigate(`/departamentos`), 1500);
        } catch (error) {
            console.error('Error en handleSubmit - No se pudo crear el departamento:', error);
            setMessage({ 
                type: 'error', 
                text: 'Ocurrió un error al crear el departamento. Intenta nuevamente más tarde.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
            {/* 🧭 Header superior de la página(Cabecera con título) */}
            <Header title='Crear Departamento' />

            {/* 🧷 Breadcrumb(Migas de pan para la Ruta de navegación) */}
            <Breadcrumb items={[
                { label: <><List className="inline w-4 h-4 mr-1"/> Listado</>, href: '/departamentos' },
                { label: <><Plus className="inline w-4 h-4 mr-1"/> Crear</> }
            ]} />

            {/* 🧾 Formulario */}
			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <Section title="Datos del Departamento">
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
                                    { name: 'name', label: 'Nombre del departamento', placeholder: 'Ej: Alto Paraná', maxLength: 50, pattern:"^[A-Za-zÁÉÍÓÚáéíóúÑñ\\s-]+$" },
                                    { name: 'codigoIso', label: 'Código ISO', placeholder: 'Ej: AP', maxLength: 2, inputMode: 'text' },
                                    { name: 'capital', label: 'Capital', placeholder: 'Ej: Ciudad del Este', maxLength: 50 },
                                    { name: 'poblacion', label: 'Población', type: 'number', placeholder: 'Ej: 45000000', inputMode: 'numeric', min: 0 },
                                    { name: 'superficie', label: 'Superficie (km²)', type: 'number', placeholder: 'Ej: 2780400', inputMode: 'numeric', min: 0 },
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

                                {/* 🌍 Selector de Region */}
                                <div>
                                    <label className="text-sm text-gray-300">Region</label>
                                    <select
                                        name="region"
                                        value={form.region}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-md bg-gray-700 text-white p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {REGIONES.map((value) => (
                                            <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* 🌍 Selector de Pais */}
                                <div>
                                    <label className="text-sm text-gray-300">País</label>
                                    <Combobox value={selectedPais} onChange={handlePaisSelect}>
                                        <div className="relative mt-1">
                                            <div className="relative w-full cursor-default overflow-hidden rounded-md bg-gray-700 text-white border border-gray-600 focus-within:ring-2 focus-within:ring-indigo-500">
                                                <Combobox.Input 
                                                    className="w-full border-none py-2 pl-3 pr-10 bg-gray-700 text-white focus:ring-0"
                                                    displayValue={(pais) => pais ? pais.name : ''}
                                                    /* onChange={(event) => setQuery(event.target.value)} */
                                                    onChange={(event) => {
                                                        setQuery(event.target.value);
                                                        if (event.target.value === '') {
                                                            setSelectedPais(null);
                                                            setForm({ ...form, pais: { id: '' } });
                                                        }
                                                    }}
                                                    placeholder="Buscar país..."
                                                    required
                                                />
                                                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                </Combobox.Button>
                                            </div>
                                            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 text-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                {filteredPaises.length === 0 && query !== '' ? (
                                                    <div className="relative cursor-default select-none py-2 px-4 text-gray-400">
                                                        No se encontró ningún país.
                                                    </div>
                                                    ) : (
                                                        filteredPaises.map((pais) => (
                                                            <Combobox.Option
                                                                key={pais.id}
                                                                className={({ active }) =>
                                                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                                    active ? 'bg-indigo-600 text-white' : 'text-gray-300'
                                                                    }`
                                                                }
                                                                value={pais}
                                                            >
                                                                {({ selected, active }) => (
                                                                    <>
                                                                        <span
                                                                            className={`block truncate ${
                                                                            selected ? 'font-medium' : 'font-normal'
                                                                            }`}
                                                                        >
                                                                            {pais.name}
                                                                        </span>
                                                                        {selected ? (
                                                                            <span
                                                                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                                                active ? 'text-white' : 'text-indigo-400'
                                                                            }`}
                                                                            >
                                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                            </span>
                                                                        ) : null}
                                                                    </>
                                                                )}
                                                            </Combobox.Option>
                                                        ))
                                                    )}
                                            </Combobox.Options>
                                        </div>

                                    </Combobox>
                                    {errors['pais.id'] && (
                                        <p className="text-red-400 text-sm mt-1">{errors['pais.id']}</p>
                                    )}
                                </div>
                                {errors['pais.id'] && (
                                    <p className="text-red-400 text-sm mt-1">{errors['pais.id']}</p>
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
                        {/* Imagen estática a la derecha */}
                        <div className="hidden lg:flex items-center justify-center">
                            <img src={worldGlobe} alt="Ilustración mundo" className="w-3/4 max-w-sm opacity-80" />
                        </div>
                    </div>
                </Section>
			</main>
		</div>
    )
}

export default DepartamentoCreatePage;