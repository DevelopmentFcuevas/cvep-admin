// 📦 Librerías externas
import React from 'react';
// 📁 Íconos u otros recursos externos
import { motion } from "framer-motion";         // Librerías para animaciones


const Section = ({ icon: Icon, title, children }) => (
    <motion.div
        className='bg-gray-800 bg-opacity-50 backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        {(Icon || title) && (
            <div className='flex items-center mb-4'>
                {Icon && <Icon className='text-indigo-400 mr-4' size='24' />}
                {title && <h2 className='text-xl font-semibold text-gray-100'>{title}</h2>}
            </div>
        )}
        {children}
    </motion.div>
);

export default Section;