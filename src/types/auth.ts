export interface LoginRequest {
  codigoOrganizacion: string
  email: string
  contrasena: string
}

export interface LoginResponse {
  token: string
  usuario: UsuarioSesion
  permisos: string[]
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
}

export interface AuthContextData {
  usuarioId: string
  organizacionId: string
  rolId: string
  rolCodigo: string
  permisos: string[]
}
