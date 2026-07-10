export interface TipoNegocio {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CreateTipoNegocioInput {
  codigo: string
  nombre: string
  descripcion?: string
}

export interface UpdateTipoNegocioInput {
  codigo?: string
  nombre?: string
  descripcion?: string
}
