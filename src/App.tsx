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
import ComprasPage from "@/pages/compras"
import CompraFormPage from "@/pages/compras/nueva"
import CompraDetailPage from "@/pages/compras/detalle"
import TransferenciasPage from "@/pages/transferencias"
import DevolucionesPage from "@/pages/devoluciones"
import ConteosPage from "@/pages/conteos"
import InventarioPage from "@/pages/inventario"
import MovimientosPage from "@/pages/inventario/movimientos"
import AjustesPage from "@/pages/inventario/ajustes"
import ReportesPage from "@/pages/reportes"
import StockBajoPage from "@/pages/reportes/stock-bajo"
import KardexPage from "@/pages/reportes/kardex"
import ValoracionPage from "@/pages/reportes/valoracion"
import ConfiguracionPage from "@/pages/configuracion"

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
                  <Route path="/compras" element={<ComprasPage />} />
                  <Route path="/compras/nueva" element={<CompraFormPage />} />
                  <Route path="/compras/:id" element={<CompraDetailPage />} />
                  <Route path="/transferencias" element={<TransferenciasPage />} />
                  <Route path="/devoluciones" element={<DevolucionesPage />} />
                  <Route path="/conteos" element={<ConteosPage />} />
                  <Route path="/inventario" element={<InventarioPage />} />
                  <Route path="/inventario/movimientos" element={<MovimientosPage />} />
                  <Route path="/inventario/ajustes" element={<AjustesPage />} />
                  <Route path="/reportes" element={<ReportesPage />} />
                  <Route path="/reportes/stock-bajo" element={<StockBajoPage />} />
                  <Route path="/reportes/kardex" element={<KardexPage />} />
                  <Route path="/reportes/valoracion" element={<ValoracionPage />} />
                  <Route path="/configuracion" element={<ConfiguracionPage />} />
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
