// 📦 Librerías externas
import React, { useState } from 'react';                    // Importación de React y hooks
import { Link, useLocation } from 'react-router-dom';        // Navegación interna con React Router
// 📁 Íconos u otros recursos externos
import { BarChart2, 
    DollarSign, 
    Menu, 
    Settings, 
    ShoppingBag, 
    ShoppingCart, 
    TrendingUp,  
    MapPin, 
    Globe,
    Building,
    MapPinHouse,
    ChevronDown } from 'lucide-react';                           // Importación de íconos desde `lucide-react`, una librería de íconos modernos.
import { AnimatePresence, motion } from 'framer-motion';    // Librerías para animaciones (animación de transición del sidebar y textos)

/* 
🧠 Consejos extra:
-------------------
* Si querés resaltar el ítem actual, podés usar useLocation() de react-router-dom y compararlo con item.href .
* Podrías extraer cada SidebarItem como un componente propio si el código crece.
* Si en un futuro sumás autenticación o roles, podés filtrar los SIDEBAR_ITEMS según permisos del usuario.
*/


/* 
    Lista de elementos que van en el sidebar (menú lateral),
    cada uno con:
    - nombre visible
    - ícono
    - color del ícono
    - ruta de navegación (href)
*/
const SIDEBAR_SECTIONS = [
    {
        title: "GENERAL",
        groups: [{
            label: "Dashboard",
            items: [
                { name: "Overview", icon: BarChart2, color: "#6366f1", href: "/" },
                { name: "Products", icon: ShoppingBag, color: "#8B5CF6", href: "/products" },
                { name: "Sales", icon: DollarSign, color: "#10B981", href: "/sales" },
                { name: "Orders", icon: ShoppingCart, color: "#F59E0B", href: "/orders" },
                { name: "Analytics", icon: TrendingUp, color: "#3B82F6", href: "/analytics" }
            ]
        }]
    },
    {
        title: "CATÁLOGO",
        groups: [{
            label: "Administración de productos",
            items: [
                { name: "Productos", icon: ShoppingBag, color: "#8B5CF6", href: "/productos" },
                { name: "Categorías", icon: ShoppingBag, color: "#8B5CF6", href: "/categorias-productos" },
                { name: "Marcas", icon: ShoppingBag, color: "#8B5CF6", href: "/marcas" },
                { name: "Colores", icon: ShoppingBag, color: "#8B5CF6", href: "/colores" },
                { name: "Unidades de medida", icon: ShoppingBag, color: "#8B5CF6", href: "/unidades-medida" }
            ]
        }, {
            label: "Ubicaciones",
            items: [
                { name: "Países", icon: Globe, color: "#EC4899", href: "/paises" },
                { name: "Departamentos", icon: MapPin, color: "#EC4899", href: "/departamentos" },
                { name: "Ciudades", icon: Building, color: "#EC4899", href: "/ciudades" },
                { name: "Barrios", icon: MapPinHouse, color: "#EC4899", href: "/barrios" }
            ]
        }]
    },
    {
        title: "CONFIGURACIÓN",
        groups: [{
            label: "Cuenta",
            items: [{ name: "Settings", icon: Settings, color: "#6EE7B7", href: "/settings" }]
        }]
    }
];

// Componente del sidebar (menú lateral)
const Sidebar = () => {
    
    // Estado local para controlar si el sidebar está abierto o colapsado
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [openGroups, setOpenGroups] = useState(() => (
        SIDEBAR_SECTIONS.flatMap((section) => section.groups.map((group) => group.label))
    ));
    const location = useLocation();

    const toggleGroup = (groupLabel) => {
        setOpenGroups((currentGroups) => currentGroups.includes(groupLabel)
            ? currentGroups.filter((label) => label !== groupLabel)
            : [...currentGroups, groupLabel]
        );
    };

    return (
        // Contenedor del sidebar con animaciones al cambiar de tamaño
        <motion.div className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 
                                ${ isSidebarOpen ? "w-64" : "w-20"}
                                `}
                    animate={{ width: isSidebarOpen ? 256 : 80 }}
        >
            
            {/* Estilo visual del contenedor lateral */}
            <div className='h-full bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700'>
                
                {/* Botón para abrir/cerrar el sidebar */}
                <motion.button
                    whileHover={{ scale:1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className='p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit'>
                    <Menu size={24} />
                </motion.button>
                
                {/* Navegación del menú */}
                <nav className='mt-8 flex-grow'>
                    
                    {/* Renderiza cada ítem del menú */}
                    {SIDEBAR_SECTIONS.map((section) => (
                        <div key={section.title} className="mb-6">
                            <AnimatePresence>
                                {isSidebarOpen && (
                                    <motion.p
                                        className="px-3 mb-2 text-[10px] font-bold tracking-[0.16em] text-gray-500 whitespace-nowrap"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        {section.title}
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            {section.groups.map((group) => (
                                <div key={group.label} className="mb-4 last:mb-0">
                                    <button
                                        type="button"
                                        onClick={() => toggleGroup(group.label)}
                                        aria-expanded={openGroups.includes(group.label)}
                                        className={`w-full flex items-center px-3 mb-1 text-xs font-semibold text-gray-400 hover:text-gray-200 transition-colors ${!isSidebarOpen ? "justify-center" : "justify-between"}`}
                                        title={!isSidebarOpen ? group.label : undefined}
                                    >
                                        {isSidebarOpen && <span className="whitespace-nowrap">{group.label}</span>}
                                        <ChevronDown size={14} className={`text-gray-500 transition-transform ${openGroups.includes(group.label) ? "" : "rotate-[-90deg]"}`} />
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {openGroups.includes(group.label) && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                {group.items.map((item) => {
                                                    const isActive = item.href === "/"
                                                        ? location.pathname === "/"
                                                        : location.pathname.startsWith(item.href);
                                                    return (
                                                        <Link key={item.href} to={item.href} title={!isSidebarOpen ? item.name : undefined}>
                                                            <motion.div
                                                                whileHover={{ x: isSidebarOpen ? 2 : 0 }}
                                                                className={`flex items-center p-3 text-sm font-medium rounded-lg transition-colors mb-1 ${isActive ? "bg-gray-700 text-white shadow-sm" : "text-gray-300 hover:bg-gray-700/70 hover:text-white"} ${!isSidebarOpen ? "justify-center" : ""}`}
                                                            >
                                                                <item.icon size={19} style={{ color: item.color, minWidth: "19px" }} />
                                                                <AnimatePresence>
                                                                    {isSidebarOpen && (
                                                                        <motion.span
                                                                            className="ml-3 whitespace-nowrap overflow-hidden"
                                                                            initial={{ opacity: 0, width: 0 }}
                                                                            animate={{ opacity: 1, width: "auto" }}
                                                                            exit={{ opacity: 0, width: 0 }}
                                                                            transition={{ duration: 0.2, delay: 0.15 }}
                                                                        >
                                                                            {item.name}
                                                                        </motion.span>
                                                                    )}
                                                                </AnimatePresence>
                                                            </motion.div>
                                                        </Link>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    ))}
                </nav>
            </div>
        </motion.div>
    )
}

export default Sidebar;