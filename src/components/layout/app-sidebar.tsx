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
  IconReport,
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

        <SidebarGroup>
          <SidebarGroupLabel>Operaciones</SidebarGroupLabel>
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
                  tooltip="Reportes"
                  isActive={isActive("/reportes")}
                  onClick={() => navigate("/reportes")}
                >
                  <IconReport />
                  <span>Reportes</span>
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
                  tooltip="Configuración"
                  isActive={isActive("/configuracion")}
                  onClick={() => navigate("/configuracion")}
                >
                  <IconSettings />
                  <span>Configuración</span>
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
