// Importación de las rutas y componentes necesarios para la navegación
import { Route, Routes } from "react-router-dom";

// Importación de las páginas que componen la aplicación
import OverViewPage from "./pages/OverViewPage";
import ProductsPage from "./pages/ProductsPage";
import Sidebar from "./components/common/Sidebar";
import PaisListPage from "./pages/paises/PaisListPage";
import SalesPage from "./pages/SalesPage";
import OrdersPage from "./pages/OrdersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import PaisCreatePage from "./pages/paises/PaisCreatePage";
import PaisDetailPage from "./pages/paises/PaisDetailPage";
import PaisEditPage from "./pages/paises/PaisEditPage";
import DepartamentoListPage from "./pages/departamentos/DepartamentoListPage";
import DepartamentoDetailPage from "./pages/departamentos/DepartamentoDetailPage";
import DepartamentoCreatePage from "./pages/departamentos/DepartamentoCreatePage";
import DepartamentoEditPage from "./pages/departamentos/DepartamentoEditPage";
import CiudadListPage from "./pages/ciudades/CiudadListPage";
import CiudadCreatePage from "./pages/ciudades/CiudadCreatePage";
import CiudadDetailPage from "./pages/ciudades/CiudadDetailPage";
import CiudadEditPage from "./pages/ciudades/CiudadEditPage";
import BarrioListPage from "./pages/barrios/BarrioListPage";
import BarrioCreatePage from "./pages/barrios/BarrioCreatePage";
import BarrioDetailPage from "./pages/barrios/BarrioDetailPage";
import BarrioEditPage from "./pages/barrios/BarrioEditPage";
import CategoriaProductoListPage from "./pages/categoria_producto/CategoriaProductoListPage";
import CategoriaProductoCreatePage from "./pages/categoria_producto/CategoriaProductoCreatePage";
import CategoriaProductoDetailPage from "./pages/categoria_producto/CategoriaProductoDetailPage";
import CategoriaProductoEditPage from "./pages/categoria_producto/CategoriaProductoEditPage";

/* 
  Tip para modificar fácil:
  -------------------------
  * Si querés agregar una nueva sección, solo hacés 3 pasos:
  1. Crear un nuevo archivo en pages/, por ejemplo ReportsPage.jsx.
  2. Agregar la ruta:
  import ReportsPage from "./pages/ReportsPage";
  <Route path="/reports" element={<ReportsPage />} />
  3. Agregar el enlace en Sidebar.
*/

// Componente principal de la aplicación
function App() {
  return (
    // Contenedor principal de la app, usa flex para que Sidebar y el contenido estén en fila
    <div className='flex h-screen bg-gray-900 text-gray-100 overflow-hidden'>

      {/* Fondo decorativo con gradiente y efecto blur (difuminado) */}
      <div className="fixed inset-0 z-0">
        
        {/* Capa de color degradado */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80"></div>
        
        {/* Capa con efecto de desenfoque */}
        <div className="absolute inset-0 backdrop-blur-sm"></div>

      </div>
      
      {/* Componente de navegación lateral (sidebar) que contiene enlaces a las distintas secciones */}
      <Sidebar />

      {/* Sistema de rutas: cada path carga una página específica */}
      <Routes>
        
        {/* Página principal o dashboard general */}
        <Route path="/" element={<OverViewPage />} />

        {/* Página de productos */}
        <Route path="/products" element={<ProductsPage />} />

        {/* Páginas de pais */}
        <Route path="/paises" element={<PaisListPage />} />
        <Route path="/paises/nuevo" element={<PaisCreatePage />} />
        <Route path="/paises/:id" element={<PaisDetailPage />} />
        <Route path="/paises/:id/edit" element={<PaisEditPage />} />

        {/* Páginas de departamento */}
        <Route path="/departamentos" element={<DepartamentoListPage />} />
        <Route path="/departamentos/:id" element={<DepartamentoDetailPage />} />
        <Route path="/departamentos/nuevo" element={<DepartamentoCreatePage />} />
        <Route path="/departamentos/:id/edit" element={<DepartamentoEditPage />} />

        {/* Páginas de ciudad */}
        <Route path="/ciudades" element={<CiudadListPage />} />
        <Route path="/ciudades/nuevo" element={<CiudadCreatePage />} />
        <Route path="/ciudades/:id" element={<CiudadDetailPage />} />
        <Route path="/ciudades/:id/edit" element={<CiudadEditPage />} />

        {/* Páginas de barrios */}
        <Route path="/barrios" element={<BarrioListPage />} />
        <Route path="/barrios/nuevo" element={<BarrioCreatePage />} />
        <Route path="/barrios/:id" element={<BarrioDetailPage />} />
        <Route path="/barrios/:id/edit" element={<BarrioEditPage />} />

        {/* Páginas de categorías de productos */}
        <Route path="/categorias-productos" element={<CategoriaProductoListPage />} />
        <Route path="/categorias-productos/create" element={<CategoriaProductoCreatePage />} />
        <Route path="/categorias-productos/:id" element={<CategoriaProductoDetailPage />} />
        <Route path="/categorias-productos/:id/edit" element={<CategoriaProductoEditPage />} />

        {/* Página de ventas */}
        <Route path="/sales" element={<SalesPage />} />

        {/* Página de órdenes/pedidos */}
        <Route path="/orders" element={<OrdersPage />} />

        {/* Página de analíticas (gráficos, estadísticas, etc.) */}
        <Route path="/analytics" element={<AnalyticsPage />} />

        {/* Página de configuración */}
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>

    </div>
  )
}

export default App;