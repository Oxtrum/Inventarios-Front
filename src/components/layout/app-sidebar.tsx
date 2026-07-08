"use client"

import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  IconDashboard,
  IconDatabase,
  IconHelp,
  IconInnerShadowTop,
  IconPackage,
  IconCategory,
  IconRuler,
  IconTruck,
  IconBuildingStore,
  IconUsers,
  IconShield,
  IconShoppingCart,
  IconTransfer,
  IconRotate,
  IconClipboardList,
  IconHistory,
  IconAdjustments,
  IconAlertTriangle,
  IconReportMoney,
  IconSettings,
  IconSearch,
} from "@tabler/icons-react"

import { useLayout } from "@/context/layout-provider"
import { useAuth } from "@/context/auth-provider"
import { NavMain } from "@/components/layout/nav-main"
import { NavSecondary } from "@/components/layout/nav-secondary"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { collapsible, variant } = useLayout()
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => location.pathname === path

  const navMain = [
    { title: "Panel", url: "/dashboard", icon: IconDashboard },
  ]

  return (
    <Sidebar collapsible={collapsible} variant={variant} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              onClick={() => navigate("/dashboard")}
            >
              <a>
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Stock Core</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} onItemClick={navigate} />

        <SidebarGroup>
          <SidebarGroupLabel>Catálogo</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Productos"
                  isActive={isActive("/productos")}
                  onClick={() => navigate("/productos")}
                >
                  <IconPackage />
                  <span>Productos</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Categorías"
                  isActive={isActive("/categorias")}
                  onClick={() => navigate("/categorias")}
                >
                  <IconCategory />
                  <span>Categorías</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Unidades"
                  isActive={isActive("/unidades")}
                  onClick={() => navigate("/unidades")}
                >
                  <IconRuler />
                  <span>Unidades</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Proveedores"
                  isActive={isActive("/proveedores")}
                  onClick={() => navigate("/proveedores")}
                >
                  <IconTruck />
                  <span>Proveedores</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Inventario</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Stock"
                  isActive={isActive("/inventario")}
                  onClick={() => navigate("/inventario")}
                >
                  <IconDatabase />
                  <span>Stock</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Movimientos"
                  isActive={isActive("/inventario/movimientos")}
                  onClick={() => navigate("/inventario/movimientos")}
                >
                  <IconHistory />
                  <span>Movimientos</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Ajustes"
                  isActive={isActive("/inventario/ajustes")}
                  onClick={() => navigate("/inventario/ajustes")}
                >
                  <IconAdjustments />
                  <span>Ajustes</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Conteos"
                  isActive={isActive("/conteos")}
                  onClick={() => navigate("/conteos")}
                >
                  <IconClipboardList />
                  <span>Conteos</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operaciones</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Compras"
                  isActive={isActive("/compras")}
                  onClick={() => navigate("/compras")}
                >
                  <IconShoppingCart />
                  <span>Compras</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Transferencias"
                  isActive={isActive("/transferencias")}
                  onClick={() => navigate("/transferencias")}
                >
                  <IconTransfer />
                  <span>Transferencias</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Devoluciones"
                  isActive={isActive("/devoluciones")}
                  onClick={() => navigate("/devoluciones")}
                >
                  <IconRotate />
                  <span>Devoluciones</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Reportes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Stock Bajo"
                  isActive={isActive("/reportes/stock-bajo")}
                  onClick={() => navigate("/reportes/stock-bajo")}
                >
                  <IconAlertTriangle />
                  <span>Stock Bajo</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Kardex"
                  isActive={isActive("/reportes/kardex")}
                  onClick={() => navigate("/reportes/kardex")}
                >
                  <IconHistory />
                  <span>Kardex</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Valoración"
                  isActive={isActive("/reportes/valoracion")}
                  onClick={() => navigate("/reportes/valoracion")}
                >
                  <IconReportMoney />
                  <span>Valoración</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configuración</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="General"
                  isActive={isActive("/configuracion")}
                  onClick={() => navigate("/configuracion")}
                >
                  <IconSettings />
                  <span>General</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Usuarios"
                  isActive={isActive("/usuarios")}
                  onClick={() => navigate("/usuarios")}
                >
                  <IconUsers />
                  <span>Usuarios</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Roles"
                  isActive={isActive("/roles")}
                  onClick={() => navigate("/roles")}
                >
                  <IconShield />
                  <span>Roles</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Sucursales"
                  isActive={isActive("/sucursales")}
                  onClick={() => navigate("/sucursales")}
                >
                  <IconBuildingStore />
                  <span>Sucursales</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <NavSecondary
          items={[
            { title: "Ayuda", url: "#", icon: IconHelp },
            { title: "Buscar", url: "#", icon: IconSearch },
          ]}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.nombres || user?.email || "Usuario",
            email: user?.email || "",
            avatar: "",
          }}
          onLogout={logout}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
