export interface Usuario {
  id: string
  organizacionId: string
  rolId?: string
  rolCodigo?: string
  email: string
  nombres?: string
  apellidos?: string
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
}

export interface UpdateUsuarioRolInput {
  rolId: string
}

export interface ResetPasswordInput {
  contrasena: string
}
