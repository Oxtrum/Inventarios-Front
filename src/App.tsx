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
import ReporteEjecutivoPage from "@/pages/reportes/ejecutivo"
import ConfiguracionPage from "@/pages/configuracion"
import TiposNegocioPage from "@/pages/tipos-negocio"
import AtributosPage from "@/pages/atributos"
import AtributoDetailPage from "@/pages/atributos/detalle"
import TiposProductoPage from "@/pages/tipos-producto"
import TipoProductoDetailPage from "@/pages/tipos-producto/detalle"
import ProductoVariantesPage from "@/pages/productos/variantes"
import PlantillasPage from "@/pages/plantillas"
import CatalogoPage from "@/pages/catalogo"
import { useAuth } from "@/context/auth-provider"
import { getDefaultAuthorizedPath } from "@/lib/access-control"
import { RequirePermission } from "@/components/shared/RequirePermission"

function AuthorizedHome() {
  const { permisos } = useAuth()
  return <Navigate to={getDefaultAuthorizedPath(permisos)} replace />
}

function NoAccessPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 text-center text-sm text-muted-foreground">
      Tu usuario no tiene vistas habilitadas. Solicita permisos a un administrador.
    </div>
  )
}

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
                  <Route path="/" element={<AuthorizedHome />} />
                  <Route path="/sin-acceso" element={<NoAccessPage />} />
                  <Route path="/dashboard" element={<RequirePermission permiso="reportes:leer"><DashboardPage /></RequirePermission>} />
                  <Route path="/productos" element={<RequirePermission permiso="productos:leer"><ProductosPage /></RequirePermission>} />
                  <Route path="/categorias" element={<RequirePermission permiso="categorias:leer"><CategoriasPage /></RequirePermission>} />
                  <Route path="/unidades" element={<RequirePermission permiso="unidades:leer"><UnidadesPage /></RequirePermission>} />
                  <Route path="/proveedores" element={<RequirePermission permiso="proveedores:leer"><ProveedoresPage /></RequirePermission>} />
                  <Route path="/sucursales" element={<RequirePermission permiso="sucursales:leer"><SucursalesPage /></RequirePermission>} />
                  <Route path="/usuarios" element={<RequirePermission permiso="usuarios:leer"><UsuariosPage /></RequirePermission>} />
                  <Route path="/roles" element={<RequirePermission permiso="roles:leer"><RolesPage /></RequirePermission>} />
                  <Route path="/roles/:id" element={<RequirePermission permiso="roles:leer"><RolDetailPage /></RequirePermission>} />
                  <Route path="/compras" element={<RequirePermission permiso="compras:leer"><ComprasPage /></RequirePermission>} />
                  <Route path="/compras/nueva" element={<RequirePermission permiso="compras:crear"><CompraFormPage /></RequirePermission>} />
                  <Route path="/compras/:id" element={<RequirePermission permiso="compras:leer"><CompraDetailPage /></RequirePermission>} />
                  <Route path="/transferencias" element={<RequirePermission permiso="transferencias:leer"><TransferenciasPage /></RequirePermission>} />
                  <Route path="/transferencias/nueva" element={<RequirePermission permiso="transferencias:crear"><TransferenciaFormPage /></RequirePermission>} />
                  <Route path="/transferencias/:id" element={<RequirePermission permiso="transferencias:leer"><TransferenciaDetailPage /></RequirePermission>} />
                  <Route path="/devoluciones" element={<RequirePermission permiso="devoluciones:leer"><DevolucionesPage /></RequirePermission>} />
                  <Route path="/devoluciones/nueva" element={<RequirePermission permiso="devoluciones:crear"><DevolucionFormPage /></RequirePermission>} />
                  <Route path="/devoluciones/:id" element={<RequirePermission permiso="devoluciones:leer"><DevolucionDetailPage /></RequirePermission>} />
                  <Route path="/conteos" element={<RequirePermission permiso="conteos:leer"><ConteosPage /></RequirePermission>} />
                  <Route path="/conteos/:id" element={<RequirePermission permiso="conteos:leer"><ConteoDetailPage /></RequirePermission>} />
                  <Route path="/inventario" element={<RequirePermission permiso="inventario:leer"><InventarioPage /></RequirePermission>} />
                  <Route path="/inventario/movimientos" element={<RequirePermission permiso="inventario:leer"><MovimientosPage /></RequirePermission>} />
                  <Route path="/inventario/ajustes" element={<RequirePermission permiso="inventario:ajustar"><AjustesPage /></RequirePermission>} />
                  <Route path="/inventario/reservas" element={<RequirePermission permiso="inventario:leer"><ReservasPage /></RequirePermission>} />
                  <Route path="/reportes" element={<RequirePermission permiso="reportes:leer"><ReportesPage /></RequirePermission>} />
                  <Route path="/reportes/ejecutivo" element={<RequirePermission permiso="reportes:leer"><RequirePermission permiso="reportes_ejecutivos:leer"><ReporteEjecutivoPage /></RequirePermission></RequirePermission>} />
                  <Route path="/reportes/stock-bajo" element={<RequirePermission permiso="reportes:leer"><StockBajoPage /></RequirePermission>} />
                  <Route path="/reportes/kardex" element={<RequirePermission permiso="reportes:leer"><KardexPage /></RequirePermission>} />
                  <Route path="/reportes/valoracion" element={<RequirePermission permiso="reportes:leer"><ValoracionPage /></RequirePermission>} />
                  <Route path="/configuracion" element={<RequirePermission permiso="configuraciones:leer"><ConfiguracionPage /></RequirePermission>} />
                  <Route path="/tipos-negocio" element={<RequirePermission permiso="tipos_negocio:leer"><TiposNegocioPage /></RequirePermission>} />
                  <Route path="/atributos" element={<RequirePermission permiso="atributos:leer"><AtributosPage /></RequirePermission>} />
                  <Route path="/atributos/:id" element={<RequirePermission permiso="atributos:leer"><AtributoDetailPage /></RequirePermission>} />
                  <Route path="/tipos-producto" element={<RequirePermission permiso="tipos_producto:leer"><TiposProductoPage /></RequirePermission>} />
                  <Route path="/tipos-producto/:id" element={<RequirePermission permiso="tipos_producto:leer"><TipoProductoDetailPage /></RequirePermission>} />
                  <Route path="/productos/:id/variantes" element={<RequirePermission permiso="producto_variantes:leer"><ProductoVariantesPage /></RequirePermission>} />
                  <Route path="/plantillas" element={<RequirePermission permiso="plantillas:leer"><PlantillasPage /></RequirePermission>} />
                  <Route path="/catalogo" element={<RequirePermission permiso="catalogo:leer"><CatalogoPage /></RequirePermission>} />
                  <Route path="*" element={<AuthorizedHome />} />
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
