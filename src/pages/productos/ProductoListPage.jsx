// 📦 Librerías externas
import React from 'react';
import { Link } from 'react-router-dom';
// 📁 Íconos u otros recursos externos
import { Home, List, Plus, PackageOpen, FolderTree } from "lucide-react";                                     // Íconos
// 🔧 Servicios (API, helpers, utilidades)

// 🧩 Componentes comunes
import Header from '../../components/common/Header';                            // Título de la sección
import Breadcrumb from '../../components/common/Breadcrumb';                    // Migas de pan para la Ruta de navegación
// Componentes específicos
//import MarcaTable from '../../components/marca/MarcaTable';// Tabla de datos con paginación, búsqueda y acciones CRUD
import ProductoTable from '../../components/productos/ProductoTable';// Tabla de datos con paginación, búsqueda y acciones CRUD

/**
 * Página principal que muestra el listado de productos.
 * Se encarga de obtener datos desde la API, y una tabla interactiva.
 */
const ProductoListPage = () => {

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            
            {/* 🧭 Header superior de la página(Cabecera con título) */}
            <Header title='📋 Listado de Productos' />

            {/* 🧷 Breadcrumb(Migas de pan para la Ruta de navegación) */}
            <Breadcrumb items={[
                { label: <><Home className="inline w-4 h-4 mr-1"/> Inicio</>, href: '/' },
                { label: <><List className="inline w-4 h-4 mr-1"/> Listado</> }
            ]} />

            {/* Contenido principal */}
            <main className=' max-w-7xl mx-auto py-6 px-4 lg:px-8 '>

                {/* Botón para agregar nuevo producto */}
                <div className="flex justify-end mb-4">
                    <Link
                        to="/productos/create"
                        className="flex items-center overflow-hidden rounded-lg shadow bg-blue-600 hover:bg-blue-700 transition"
                    >
                        <span className="px-3 bg-blue-700 flex items-center">
                            <Plus size={18} />
                        </span>
                        <span className="px-4 py-2 font-semibold text-white">
                            Crear Producto
                        </span>
                    </Link>
                </div>
                
                {/* Mensaje informativo sobre la sección */}
                <div className="bg-blue-600/10 border border-blue-500 text-blue-200 p-4 rounded mb-6" role="status">
                    <div className="flex items-start gap-3">
                        <FolderTree className="w-5 h-5 mt-0.5 text-blue-300" />
                        <div>
                            <p className="text-sm font-medium">Aquí puedes ver, organizar y administrar todos los productos.</p>
                            <p className="text-sm mt-1 text-blue-100/80">Usa esta vista para revisar el estado de cada producto y crear nuevas cuando sea necesario.</p>
                        </div>
                    </div>
                </div>

                {/* Tabla con datos detallados de productos */}
                <ProductoTable />
            </main>

        </div>
    )
}

export default ProductoListPage;