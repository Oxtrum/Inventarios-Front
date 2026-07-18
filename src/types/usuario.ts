import type { AlcanceDatos, SucursalPermitida } from "@/types/auth"

export interface Usuario {
  id: string
  organizacionId: string
  rolId?: string
  rolCodigo?: string
  email: string
  nombres?: string
  apellidos?: string
  alcanceDatos: AlcanceDatos
  sucursalPrincipalId?: string | null
  cantidadSucursales: number
  activo: boolean
  ultimoLogin?: string
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CreateUsuarioInput {
  rolId: string
  email: string
  contrasena: string
  nombres?: string
  apellidos?: string
  alcanceDatos: AlcanceDatos
  sucursalPrincipalId?: string | null
  sucursalIds: string[]
}

export interface UsuarioAlcance {
  usuarioId: string
  alcanceDatos: AlcanceDatos
  sucursalPrincipalId?: string | null
  sucursalesPermitidas: SucursalPermitida[]
}

export interface UpdateUsuarioAlcanceInput {
  alcanceDatos: AlcanceDatos
  sucursalPrincipalId?: string | null
  sucursalIds: string[]
}

export interface UpdateUsuarioRolInput {
  rolId: string
}

export interface ResetPasswordInput {
  contrasena: string
}
