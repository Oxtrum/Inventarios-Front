import { matchPath } from "react-router-dom"

export type PermissionRequirement = string | readonly string[]

export interface RoutePermissionRule {
  path: string
  permissions: readonly string[]
}

export const ROUTE_PERMISSIONS: readonly RoutePermissionRule[] = [
  { path: "/dashboard", permissions: ["reportes:leer"] },
  { path: "/productos/:id/variantes", permissions: ["productos:leer", "producto_variantes:leer"] },
  { path: "/productos", permissions: ["productos:leer"] },
  { path: "/categorias", permissions: ["categorias:leer"] },
  { path: "/unidades", permissions: ["unidades:leer"] },
  { path: "/proveedores", permissions: ["proveedores:leer"] },
  { path: "/sucursales", permissions: ["sucursales:leer"] },
  { path: "/usuarios", permissions: ["usuarios:leer"] },
  { path: "/roles/:id", permissions: ["roles:leer", "roles:permisos", "permisos:leer"] },
  { path: "/roles", permissions: ["roles:leer"] },
  { path: "/compras/nueva", permissions: ["compras:crear"] },
  { path: "/compras/:id", permissions: ["compras:leer"] },
  { path: "/compras", permissions: ["compras:leer"] },
  { path: "/transferencias/nueva", permissions: ["transferencias:crear"] },
  { path: "/transferencias/:id", permissions: ["transferencias:leer"] },
  { path: "/transferencias", permissions: ["transferencias:leer"] },
  { path: "/devoluciones/nueva", permissions: ["devoluciones:crear"] },
  { path: "/devoluciones/:id", permissions: ["devoluciones:leer"] },
  { path: "/devoluciones", permissions: ["devoluciones:leer"] },
  { path: "/conteos/:id", permissions: ["conteos:leer"] },
  { path: "/conteos", permissions: ["conteos:leer"] },
  { path: "/inventario/movimientos", permissions: ["inventario:leer"] },
  { path: "/inventario/ajustes", permissions: ["inventario:ajustar"] },
  { path: "/inventario/reservas", permissions: ["inventario:leer"] },
  { path: "/inventario", permissions: ["inventario:leer"] },
  { path: "/reportes/ejecutivo", permissions: ["reportes:leer", "reportes_ejecutivos:leer"] },
  { path: "/reportes/stock-bajo", permissions: ["reportes:leer"] },
  { path: "/reportes/kardex", permissions: ["reportes:leer", "productos:leer", "producto_variantes:leer"] },
  { path: "/reportes/valoracion", permissions: ["reportes:leer"] },
  { path: "/reportes", permissions: ["reportes:leer"] },
  { path: "/configuracion", permissions: ["configuraciones:leer"] },
  { path: "/tipos-negocio", permissions: ["tipos_negocio:leer"] },
  { path: "/atributos/:id", permissions: ["atributos:leer"] },
  { path: "/atributos", permissions: ["atributos:leer"] },
  { path: "/tipos-producto/:id", permissions: ["tipos_producto:leer", "tipos_producto:atributos", "atributos:leer"] },
  { path: "/tipos-producto", permissions: ["tipos_producto:leer"] },
  { path: "/plantillas", permissions: ["plantillas:leer"] },
  { path: "/catalogo", permissions: ["catalogo:leer"] },
] as const

const DEFAULT_PATHS = [
  "/dashboard",
  "/inventario",
  "/productos",
  "/catalogo",
  "/compras",
  "/transferencias",
  "/devoluciones",
  "/conteos",
  "/reportes",
  "/categorias",
  "/unidades",
  "/proveedores",
  "/configuracion",
  "/usuarios",
  "/roles",
  "/sucursales",
] as const

export function hasEveryPermission(
  permissions: readonly string[],
  requirement: PermissionRequirement
) {
  const required = typeof requirement === "string" ? [requirement] : requirement
  return required.every((permission) => permissions.includes(permission))
}

export function getRouteRule(pathname: string) {
  return ROUTE_PERMISSIONS.find((rule) =>
    matchPath({ path: rule.path, end: true }, pathname)
  )
}

export function canAccessPath(pathname: string, permissions: readonly string[]) {
  const rule = getRouteRule(pathname)
  return !rule || hasEveryPermission(permissions, rule.permissions)
}

export function getDefaultAuthorizedPath(permissions: readonly string[]) {
  return DEFAULT_PATHS.find((path) => canAccessPath(path, permissions)) ?? "/sin-acceso"
}
