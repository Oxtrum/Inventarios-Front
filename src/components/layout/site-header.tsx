import { useLocation } from "react-router-dom"
import { ConfigDrawer } from "@/components/config-drawer"
import { ThemeSwitch } from "@/components/theme-switch"
import { Header } from "@/components/layout/header"
import { SucursalSwitcher } from "@/components/shared/SucursalSwitcher"

const pageTitles: Record<string, string> = {
  "/dashboard": "Panel",
  "/productos": "Productos",
  "/categorias": "Categorías",
  "/unidades": "Unidades",
  "/proveedores": "Proveedores",
  "/sucursales": "Sucursales",
  "/usuarios": "Usuarios",
  "/roles": "Roles",
  "/compras": "Compras",
  "/inventario": "Inventario",
  "/reportes": "Reportes",
  "/configuracion": "Configuración",
}

export function SiteHeader() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || "Stock Core"

  return (
    <Header fixed className="border-b">
      <h1 className="text-base font-medium">{title}</h1>
      <div className="ms-auto flex items-center gap-2">
        <SucursalSwitcher />
        <ThemeSwitch />
        <ConfigDrawer />
      </div>
    </Header>
  )
}
