export interface LoginRequest {
  codigoOrganizacion: string
  email: string
  contrasena: string
}

export interface LoginResponse {
  token: string
  usuario: UsuarioSesion
  permisos: string[]
  alcanceDatos?: AlcanceDatos
  sucursalPrincipalId?: string | null
  sucursalesPermitidas?: SucursalPermitida[]
}

export type AlcanceDatos = "organizacion" | "sucursales"

export interface SucursalPermitida {
  id: string
  codigo?: string
  nombre: string
}

export interface UsuarioSesion {
  id: string
  organizacionId: string
  email: string
  nombres?: string
  apellidos?: string
  rolId: string
  rolCodigo: string
  fechaCreacion: string
  alcanceDatos?: AlcanceDatos
  sucursalPrincipalId?: string | null
  sucursalesPermitidas?: SucursalPermitida[]
}

export interface AuthContextData {
  usuarioId: string
  organizacionId: string
  rolId: string
  rolCodigo: string
  permisos: string[]
  alcanceDatos?: AlcanceDatos
  sucursalPrincipalId?: string | null
  sucursalesPermitidas?: SucursalPermitida[]
}
