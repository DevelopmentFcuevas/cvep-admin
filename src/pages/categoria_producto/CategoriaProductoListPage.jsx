// 📦 Librerías externas
import React from 'react';
import { Link } from 'react-router-dom';
// 📁 Íconos u otros recursos externos
import { Home, List, Plus } from "lucide-react";                                     // Íconos
// 🔧 Servicios (API, helpers, utilidades)

// 🧩 Componentes comunes
import Header from '../../components/common/Header';                            // Título de la sección
import Breadcrumb from '../../components/common/Breadcrumb';                    // Migas de pan para la Ruta de navegación
// Componentes específicos
import CategoriaProductoTable from '../../components/categoria_producto/CategoriaProductoTable';// Tabla de datos (ahora de familia producto)


/**
 * Página principal que muestra el listado de categorías de producto.
 * Se encarga de obtener datos desde la API, y una tabla interactiva.
 */
const CategoriaProductoListPage = () => {

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            
            {/* 🧭 Header superior de la página(Cabecera con título) */}
            <Header title='Listado de Categorías de Productos' />

            {/* 🧷 Breadcrumb(Migas de pan para la Ruta de navegación) */}
            <Breadcrumb items={[
                { label: <><Home className="inline w-4 h-4 mr-1"/> Inicio</>, href: '/' },
                { label: <><List className="inline w-4 h-4 mr-1"/> Listado</> }
            ]} />

            {/* Contenido principal */}
            <main className=' max-w-7xl mx-auto py-6 px-4 lg:px-8 '>

                {/* Botón para agregar nueva categoría de producto */}
                <div className="flex justify-end mb-4">
                    <Link
                        to="/categorias-productos/create"
                        className="flex items-center overflow-hidden rounded-lg shadow bg-blue-600 hover:bg-blue-700 transition"
                    >
                        <span className="px-3 bg-blue-700 flex items-center">
                            <Plus size={18} />
                        </span>
                        <span className="px-4 py-2 font-semibold text-white">
                            Crear Categoría de Producto
                        </span>
                    </Link>
                </div>
                <div className="bg-blue-600/10 border border-blue-500 text-blue-200 p-4 rounded mb-6" role="status">
                    <p className="text-sm">
                        Aquí puedes crear y gestionar las categorías que agrupan tus productos.
                    </p>
                </div>

                {/* Tabla con datos detallados de categoría de producto */}
                <CategoriaProductoTable />
            </main>

        </div>
    )
}

export default CategoriaProductoListPage;