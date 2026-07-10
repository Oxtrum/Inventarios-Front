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
  IconBriefcase,
  IconBuildingStore,
  IconBoxSeam,
  IconTags,
  IconUsers,
  IconShield,
  IconShoppingCart,
  IconTransfer,
  IconRotate,
  IconClipboardList,
  IconHistory,
  IconAdjustments,
  IconLock,
  IconAlertTriangle,
  IconReportMoney,
  IconSettings,
  IconTemplate,
  IconWorld,
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
  const { user, logout, hasPermission } = useAuth()
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
              {hasPermission("productos:leer") && (
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
              )}
              {hasPermission("categorias:leer") && (
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
              )}
              {hasPermission("unidades:leer") && (
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
              )}
              {hasPermission("proveedores:leer") && (
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
              )}
              {hasPermission("tipos_producto:leer") && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Tipos de Producto"
                    isActive={isActive("/tipos-producto")}
                    onClick={() => navigate("/tipos-producto")}
                  >
                    <IconBoxSeam />
                    <span>Tipos de Producto</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {hasPermission("atributos:leer") && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Atributos"
                    isActive={isActive("/atributos")}
                    onClick={() => navigate("/atributos")}
                  >
                    <IconTags />
                    <span>Atributos</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {hasPermission("catalogo:leer") && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Catálogo Público"
                    isActive={isActive("/catalogo")}
                    onClick={() => navigate("/catalogo")}
                  >
                    <IconWorld />
                    <span>Catálogo Público</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Plantillas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {hasPermission("tipos_negocio:leer") && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Tipos de Negocio"
                    isActive={isActive("/tipos-negocio")}
                    onClick={() => navigate("/tipos-negocio")}
                  >
                    <IconBriefcase />
                    <span>Tipos de Negocio</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {hasPermission("plantillas:leer") && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Plantillas"
                    isActive={isActive("/plantillas")}
                    onClick={() => navigate("/plantillas")}
                  >
                    <IconTemplate />
                    <span>Plantillas</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Inventario</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {hasPermission("inventario:leer") && (
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
              )}
              {hasPermission("inventario:leer") && (
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
              )}
              {hasPermission("inventario:ajustar") && (
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
              )}
              {hasPermission("inventario:reservar") && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Reservas"
                    isActive={isActive("/inventario/reservas")}
                    onClick={() => navigate("/inventario/reservas")}
                  >
                    <IconLock />
                    <span>Reservas</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {hasPermission("conteos:leer") && (
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
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operaciones</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {hasPermission("compras:leer") && (
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
              )}
              {hasPermission("transferencias:leer") && (
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
              )}
              {hasPermission("devoluciones:leer") && (
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
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Reportes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {hasPermission("reportes:leer") && (
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
              )}
              {hasPermission("reportes:leer") && (
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
              )}
              {hasPermission("reportes:leer") && (
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
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configuración</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {hasPermission("configuraciones:leer") && (
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
              )}
              {hasPermission("usuarios:leer") && (
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
              )}
              {hasPermission("roles:leer") && (
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
              )}
              {hasPermission("sucursales:leer") && (
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
              )}
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
