// 📦 Librerías externas
import React from 'react';                              // Importación de React
import { Link } from 'react-router-dom';                // Navegación interna con React Router
// 📁 Íconos u otros recursos externos
import { ChevronRight } from 'lucide-react';            // Importación de íconos desde `lucide-react`, una librería de íconos modernos.


const Breadcrumb = ({ items }) => {
    return (
        <nav className="flex text-sm text-gray-400 bg-gradient-to-r from-gray-800 to-gray-700 p-2 rounded-lg shadow mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex flex-wrap items-center space-x-1">
                {items.map((item, index) => (
                    <li key={index} className="inline-flex items-center">
                        {item.href ? (
                            <Link to={item.href} className="hover:text-indigo-400 flex items-center">
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-gray-200">{item.label}</span>
                        )}
                        {index < items.length - 1 && (
                            <ChevronRight className="w-4 h-4 mx-1" />
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;