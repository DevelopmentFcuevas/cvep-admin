// 📦 Librerías externas
import React from 'react';                // Importación de React
// 📁 Íconos u otros recursos externos
import {motion} from "framer-motion";     // Librerías para animaciones

/* 
🧠 Sugerencias para crecer con este componente:
------------------------------------------------

* En StatCard podrías agregar una prop onClick para hacerlo interactivo si lo 
necesitás (por ejemplo, ir a detalles).
*/


// Componente de tarjeta de estadística, muestra un valor destacado con ícono y título.
// Recibe props:
// - name: título de la estadística
// - icon: ícono (componente de Lucide)
// - value: número o valor a mostrar
// - color: color personalizado para el ícono
const StatCard = ({name, icon:Icon, value, color}) => {
  return (
    // Tarjeta animada que se eleva ligeramente al pasar el mouse
    <motion.div
        className='bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700'
        whileHover={{ y: -5, boxShadow: "0 25px 50px -12px"}}
    >
        
        {/* Contenido principal con padding */}
        <div className='px-4 py-5 sm:p-6'>

            {/* Línea superior con ícono + nombre de la estadística */}
            <span className='flex items-center text-sm font-medium text-gray-400'>
                <Icon size={20} className="mr-2" style={{ color }} />
                {name}
            </span>

            {/* Valor numérico principal */}
            <p className='mt-1 text-3xl font-semibold text-gray-100'>{value}</p>
        </div>
    </motion.div>
  )
}


export default StatCard;