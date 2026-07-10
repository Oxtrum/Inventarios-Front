import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/context/theme-provider"
import { AuthProvider } from "@/context/auth-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import ProtectedLayout from "@/components/layout/protected-layout"
import LoginPage from "@/pages/login"
import DashboardPage from "@/pages/dashboard"
import ProductosPage from "@/pages/productos"
import CategoriasPage from "@/pages/categorias"
import UnidadesPage from "@/pages/unidades"
import ProveedoresPage from "@/pages/proveedores"
import SucursalesPage from "@/pages/sucursales"
import UsuariosPage from "@/pages/usuarios"
import RolesPage from "@/pages/roles"
import RolDetailPage from "@/pages/roles/detalle"
import ComprasPage from "@/pages/compras"
import CompraFormPage from "@/pages/compras/nueva"
import CompraDetailPage from "@/pages/compras/detalle"
import TransferenciasPage from "@/pages/transferencias"
import TransferenciaFormPage from "@/pages/transferencias/nueva"
import TransferenciaDetailPage from "@/pages/transferencias/detalle"
import DevolucionesPage from "@/pages/devoluciones"
import DevolucionFormPage from "@/pages/devoluciones/nueva"
import DevolucionDetailPage from "@/pages/devoluciones/detalle"
import ConteosPage from "@/pages/conteos"
import ConteoDetailPage from "@/pages/conteos/detalle"
import InventarioPage from "@/pages/inventario"
import MovimientosPage from "@/pages/inventario/movimientos"
import AjustesPage from "@/pages/inventario/ajustes"
import ReservasPage from "@/pages/inventario/reservas"
import ReportesPage from "@/pages/reportes"
import StockBajoPage from "@/pages/reportes/stock-bajo"
import KardexPage from "@/pages/reportes/kardex"
import ValoracionPage from "@/pages/reportes/valoracion"
import ConfiguracionPage from "@/pages/configuracion"
import OrganizacionesPage from "@/pages/organizaciones"
import TiposNegocioPage from "@/pages/tipos-negocio"
import AtributosPage from "@/pages/atributos"
import AtributoDetailPage from "@/pages/atributos/detalle"
import TiposProductoPage from "@/pages/tipos-producto"
import TipoProductoDetailPage from "@/pages/tipos-producto/detalle"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="system">
          <TooltipProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedLayout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/productos" element={<ProductosPage />} />
                  <Route path="/categorias" element={<CategoriasPage />} />
                  <Route path="/unidades" element={<UnidadesPage />} />
                  <Route path="/proveedores" element={<ProveedoresPage />} />
                  <Route path="/sucursales" element={<SucursalesPage />} />
                  <Route path="/usuarios" element={<UsuariosPage />} />
                  <Route path="/roles" element={<RolesPage />} />
                  <Route path="/roles/:id" element={<RolDetailPage />} />
                  <Route path="/compras" element={<ComprasPage />} />
                  <Route path="/compras/nueva" element={<CompraFormPage />} />
                  <Route path="/compras/:id" element={<CompraDetailPage />} />
                  <Route path="/transferencias" element={<TransferenciasPage />} />
                  <Route path="/transferencias/nueva" element={<TransferenciaFormPage />} />
                  <Route path="/transferencias/:id" element={<TransferenciaDetailPage />} />
                  <Route path="/devoluciones" element={<DevolucionesPage />} />
                  <Route path="/devoluciones/nueva" element={<DevolucionFormPage />} />
                  <Route path="/devoluciones/:id" element={<DevolucionDetailPage />} />
                  <Route path="/conteos" element={<ConteosPage />} />
                  <Route path="/conteos/:id" element={<ConteoDetailPage />} />
                  <Route path="/inventario" element={<InventarioPage />} />
                  <Route path="/inventario/movimientos" element={<MovimientosPage />} />
                  <Route path="/inventario/ajustes" element={<AjustesPage />} />
                  <Route path="/inventario/reservas" element={<ReservasPage />} />
                  <Route path="/reportes" element={<ReportesPage />} />
                  <Route path="/reportes/stock-bajo" element={<StockBajoPage />} />
                  <Route path="/reportes/kardex" element={<KardexPage />} />
                  <Route path="/reportes/valoracion" element={<ValoracionPage />} />
                  <Route path="/configuracion" element={<ConfiguracionPage />} />
                  <Route path="/organizaciones" element={<OrganizacionesPage />} />
                  <Route path="/tipos-negocio" element={<TiposNegocioPage />} />
                  <Route path="/atributos" element={<AtributosPage />} />
                  <Route path="/atributos/:id" element={<AtributoDetailPage />} />
                  <Route path="/tipos-producto" element={<TiposProductoPage />} />
                  <Route path="/tipos-producto/:id" element={<TipoProductoDetailPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
