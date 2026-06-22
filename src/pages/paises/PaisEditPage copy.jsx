// 📦 Librerías externas
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';                          // Navegación interna con React Router
// 📁 Íconos u otros recursos externos
import { List, Pencil } from "lucide-react";                                        // Íconos
import worldGlobe from '../../assets/world-globe.png';                              // Imagen de ejemplo
// 🔧 Servicios (API, helpers, utilidades)
import axios from '../../services/api';                                             // Cliente Axios centralizado
// 🧩 Componentes comunes
import Header from '../../components/common/Header';                                // Título de la sección
import Breadcrumb from '../../components/common/Breadcrumb';                        // Migas de pan para la Ruta de navegación
import Section from '../../components/common/Section';
// Componentes específicos


/**
 * 📝 Página de edición de un país.
 */
const PaisEditPage = () => {

    // 📥 Extrae el ID de la URL para saber qué país editar
    const { id } = useParams();

    // 🔁 Navegación programática tras guardar
    const navigate = useNavigate();

    // Estado para mostrar mensajes globales al usuario (éxito o error)
    const [message, setMessage] = useState({ type: '', text: '' });

    // Lista de monedas desde backend
    const [monedas, setMonedas] = useState([]);


    

    // ❗ Estado para guardar los errores del formulario, clave: nombre del campo.
    // Guarda mensajes de error específicos para cada campo del formulario.
    const [errors, setErrors] = useState({});

    // Estado para indicar si se está realizando una operación (como guardar)
    // Permite deshabilitar el botón mientras se guarda para evitar múltiples envíos.
    const [loading, setLoading] = useState(false);


    // 📡 Cargar datos actuales del país al montar el componente
    useEffect(() => {

        let mounted = true;

        // cargar monedas
        axios.get('/monedas')
            .then(res => { 
                if (mounted) setMonedas(res.data || []);
                
            })
            .catch(err => {
                console.error('No se pudieron cargar monedas', err);
            });

        // cargar pais
        axios.get(`/paises/${id}`)
            .then(res => {
                
                //// Limpiar valores nulos y convertirlos en cadenas vacías
                //const sanitized = Object.fromEntries(
                //    Object.entries(res.data).map(([key, value]) => [key, value ?? ''])
                //);
                //setForm(sanitized);

                if (!mounted) return;
                const data = res.data || {};

                // MAPEAR explícitamente SOLO los campos que quieres usar en el form
                // Así evitamos sobrescribir con objetos complejos (p.ej. paisMonedas)
                const mapped = {
                    name: data.name ?? '',
                    codigoIso2: data.codigoIso2 ?? '',
                    codigoIso3: data.codigoIso3 ?? '',
                    capital: data.capital ?? '',
                    poblacion: data.poblacion ?? '',
                    area: data.area ?? '',
                    idioma: data.idioma ?? '',
                    dominioTld: data.dominio_tld ?? data.dominioTld ?? '',
                    husoHorario: data.huso_horario ?? data.husoHorario ?? '',
                    continente: data.continente ?? 'SIN_ESPECIFICAR',
                    banderaUrl: data.banderaUrl ?? data.bandera_url ?? '' // ajusta según tu API
                };

                // detecta moneda por defecto: preferimos data.monedaId, sino usamos paisMonedas
                let monedaId = '';
                if (data.monedaId) {
                monedaId = String(data.monedaId);
                } else if (Array.isArray(data.paisMonedas) && data.paisMonedas.length > 0) {
                const primaria = data.paisMonedas.find(pm => pm.esPrimaria) || data.paisMonedas[0];
                if (primaria && primaria.moneda) {
                    monedaId = String(primaria.moneda.id ?? primaria.monedaId ?? '');
                }
                }

                setForm(prev => ({ ...prev, ...mapped, monedaId: monedaId || '' }));

                // Limpiar valores nulos y convertirlos en cadenas vacías
                //const sanitized = Object.fromEntries(
                //    Object.entries(data).map(([key, value]) => [key, value ?? ''])
                //);

            })
            .catch(err => {
                console.error("[❌ ERROR] No se pudo obtener datos del país:", err);
                setMessage({
                    type: 'error',
                    text: 'Ocurrió un error al cargar los datos del país. Por favor, intenta nuevamente.',
                });
            });

            return () => { mounted = false; };
    }, [id]);

    //  📊 Estado del formulario con los campos del país a modificar.
    // Este estado mantiene los valores que el usuario ingresa en el formulario.
    const [form, setForm] = useState({
        name: '',
        codigoIso2: '',
        codigoIso3: '',
        capital: '',
        poblacion: '',
        area: '',
        idioma: '',
        //moneda: '',
        monedaId: '',     // <-- nuevo: id de la moneda seleccionada
        dominioTld: '',
        husoHorario: '',
        continente: 'SIN_ESPECIFICAR',
    });


    // 🌍 Lista de continentes válidos (para el select)
    const CONTINENTES = [
        'ASIA', 
        'AFRICA', 
        'AMERICA_DEL_NORTE', 
        'AMERICA_DEL_SUR', 
        'ANTARTIDA', 
        'EUROPA', 
        'OCEANIA', 
        'SIN_ESPECIFICAR'
    ];
    
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
        //const isBlank = (value) => !value || value.trim() === '';
        const isBlank = (value) => {
            if (typeof value !== 'string') return !value && value !== 0;
            return value.trim() === '';
        };

        // Nombre del país (obligatorio, solo letras, espacios y guiones)
        if (isBlank(form.name)) {
            newErrors.name = 'Por favor, ingresa el nombre del país.';
        } else if (!/^[\p{L}\s'-]{2,255}$/u.test(form.name.trim())) {
            newErrors.name = 'El nombre contiene caracteres inválidos o excede los 255 caracteres.';
        }

        // Código ISO2 (opcional, pero si lo llena, validar)
        if (!isBlank(form.codigoIso2)) {
            if (!/^[A-Z]{2}$/.test(form.codigoIso2.trim())) {
                newErrors.codigoIso2 = 'Debe tener exactamente 2 letras mayúsculas sin espacios.';
            }
        }
        
        // Código ISO3 (opcional, pero si lo llena, validar)
        if (!isBlank(form.codigoIso3)) {
            if (!/^[A-Z]{3}$/.test(form.codigoIso3.trim())) {
                newErrors.codigoIso3 = 'Debe tener exactamente 3 letras mayúsculas sin espacios.';
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

        // Área (opcional, pero válida si se ingresa)
        if (!isBlank(form.area)) {
            const areaNum = Number(form.area);
            if (isNaN(areaNum) || areaNum < 0 || areaNum > 20_000_000) {
                newErrors.area = 'Ingresa un valor de área válido (0 - 20 millones km²).';
            }
        }

        // Idioma (opcional, pero válida si se ingresa)
        if (!isBlank(form.idioma)) {
            if (!/^[\p{L}\s'-]{2,100}$/u.test(form.idioma.trim())) {
                newErrors.idioma = 'El idioma contiene caracteres inválidos o es muy largo.';
            }
        }

        // Moneda (opcional, pero válida si se ingresa)
        //if (!isBlank(form.moneda)) {
        //    if (!/^[\p{L}\s'-]{2,100}$/u.test(form.moneda.trim())) {
        //        newErrors.moneda = 'La moneda contiene caracteres inválidos o es muy larga.';
        //    }
        //}
        // Opcional: validar que monedaId exista en la lista si no está vacío
        if (form.monedaId) {
            const found = monedas.some(m => String(m.id) === String(form.monedaId));
            if (!found) {
                newErrors.monedaId = 'Moneda seleccionada inválida.';
            }
        }

        // Dominio TLD (opcional, pero válida si se ingresa, empieza con punto y sigue con dos letras)
        if (!isBlank(form.dominioTld)) {
            if (!/^\.[a-z]{2,10}$/.test(form.dominioTld.trim())) {
                newErrors.dominioTld = 'Formato inválido. Debe comenzar con punto (.) seguido de letras (ej. .ar).';
            }
        }

        // Huso horario (opcional, pero válida si se ingresa)
        if (!isBlank(form.husoHorario)) {
            if (!/^[\w\-:+ ]{2,30}$/.test(form.husoHorario.trim())) {
                newErrors.husoHorario = 'El formato del huso horario no es válido.';
            }
        }
    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    

    // 🚀 Maneja el envío del formulario
    //const handleSubmit = e => {
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
                codigoIso2: form.codigoIso2.trim().toUpperCase(),
                codigoIso3: form.codigoIso3.trim().toUpperCase(),
                capital: form.capital.trim(),
                idioma: form.idioma.trim(),
                //moneda: form.moneda.trim(),
                //monedaId: form.monedaId || null,    // <-- incluir monedaId en el payload
                monedaId: form.monedaId ? Number(form.monedaId) : null,
                dominioTld: form.dominioTld.trim().toLowerCase(),
                husoHorario: form.husoHorario.trim(),
            };

            //axios.put(`/paises/${id}`, sanitizedForm);
            const res = await axios.put(`/paises/${id}`, sanitizedForm);
            setMessage({ 
                type: 'success', 
                text: '¡El país se actualizo correctamente!' 
            });

            // Redirigir tras breve pausa
            setTimeout(() => navigate(`/paises/${id}`), 1500);

        } catch (error) {

            const serverMsg = err?.response?.data?.message || err?.response?.data || null;

            console.error('Error en handleSubmit - No se pudo actualizar el país:', error);
            setMessage({ 
                type: 'error', 
                //text: 'Ocurrió un error al actualizar el país. Intenta nuevamente más tarde.' 
                text: serverMsg ? String(serverMsg) : 'Ocurrió un error al actualizar el país. Intenta nuevamente más tarde.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
            {/* 🧭 Header superior de la página(Cabecera con título) */}
            <Header title={`Editar País: ${form.name}`} />

            {/* 🧷 Breadcrumb(Migas de pan para la Ruta de navegación) */}
            <Breadcrumb items={[
                { label: <><List className="inline w-4 h-4 mr-1"/> Listado</>, href: '/paises' },
                { label: <><Pencil className="inline w-4 h-4 mr-1"/> Editar País: {form.name}</> }
            ]} />

            {/* 🧾 Formulario */}
            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <Section title="Datos del País">
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
                                {/* 🧱 Campos individuales generados dinámicamente */}
                                {[
                                    { name: 'name', label: 'Nombre del país', placeholder: 'Ej: Argentina', maxLength: 50, pattern:"^[A-Za-zÁÉÍÓÚáéíóúÑñ\\s-]+$" },
                                    { name: 'codigoIso2', label: 'Código ISO2', placeholder: 'Ej: AR', maxLength: 2, pattern: '[A-Z]{2}', inputMode: 'text' },
                                    { name: 'codigoIso3', label: 'Código ISO3', placeholder: 'Ej: ARG', maxLength: 3, pattern: '[A-Z]{3}', inputMode: 'text' },
                                    { name: 'capital', label: 'Capital', placeholder: 'Ej: Buenos Aires', maxLength: 50 },
                                    { name: 'poblacion', label: 'Población', type: 'number', placeholder: 'Ej: 45000000', inputMode: 'numeric', min: 0 },
                                    { name: 'area', label: 'Área (km²)', type: 'number', placeholder: 'Ej: 2780400', inputMode: 'numeric', min: 0 },
                                    { name: 'idioma', label: 'Idioma', placeholder: 'Ej: Español', maxLength: 30 },
                                    //{ name: 'moneda', label: 'Moneda', placeholder: 'Ej: Peso argentino', maxLength: 30 },
                                    { name: 'dominioTld', label: 'Dominio TLD', placeholder: 'Ej: .ar', pattern: '\\.[a-z]{2,3}', maxLength: 4 },
                                    { name: 'husoHorario', label: 'Huso horario', placeholder: 'Ej: GMT-3', pattern: 'GMT[+-]\\d{1,2}', maxLength: 6 },
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

                                {/* 🌍 Selector de continente */}
                                <div>
                                    <label className="text-lg font-semibold text-gray-100">Continente</label>
                                    <select
                                        name="continente"
                                        value={form.continente}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-md bg-gray-700 text-white p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {CONTINENTES.map(cont => (
                                            <option key={cont} value={cont}>{cont.replace(/_/g, ' ')}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* -------------------- NUEVO: select simple de monedas -------------------- */}
                                <div>
                                    <label className="text-lg font-semibold text-gray-100">Moneda principal</label>
                                    <select name="monedaId" value={form.monedaId ?? ''} onChange={handleChange}
                                        className="mt-1 w-full rounded-md bg-gray-700 text-white p-2 border border-gray-600">
                                        <option value="">-- Sin selección --</option>
                                        {monedas.map(m => <option key={m.id} value={m.id}>{m.name} {m.code ? `(${m.code})` : ''}</option>)}
                                    </select>
                                    {errors.monedaId && <p className="text-red-400 text-sm mt-1">{errors.monedaId}</p>}
                                    <p className="text-sm text-gray-400 mt-1">Selecciona la moneda relacionada por defecto para este país.</p>
                                    </div>
                                {/* ---------------------------------------------------------------------- */}

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

export default PaisEditPage;