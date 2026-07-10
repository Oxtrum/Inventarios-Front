export interface TipoProducto {
  id: string
  organizacionId: string
  tipoNegocioId?: string
  codigo: string
  nombre: string
  descripcion?: string
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CreateTipoProductoInput {
  tipoNegocioId?: string
  codigo: string
  nombre: string
  descripcion?: string
}

export interface UpdateTipoProductoInput {
  tipoNegocioId?: string
  codigo?: string
  nombre?: string
  descripcion?: string
}

export interface TipoProductoAtributo {
  id: string
  tipoProductoId: string
  atributoId: string
  requerido: boolean
  defineVariante: boolean
  orden: number
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CreateTipoProductoAtributoInput {
  atributoId: string
  requerido: boolean
  defineVariante: boolean
  orden: number
}

export interface UpdateTipoProductoAtributoInput {
  requerido?: boolean
  defineVariante?: boolean
  orden?: number
}
