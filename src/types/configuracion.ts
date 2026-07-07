export interface Configuracion {
  id: string
  organizacionId: string
  sucursalId?: string
  clave: string
  valor: unknown
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CreateConfiguracionInput {
  sucursalId?: string
  clave: string
  valor: unknown
}

export interface UpdateConfiguracionInput {
  sucursalId?: string
  clave?: string
  valor?: unknown
}
