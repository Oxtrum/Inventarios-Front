export interface Categoria {
  id: string
  organizacionId: string
  nombre: string
  codigo: string
  descripcion?: string
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CreateCategoriaInput {
  nombre: string
  codigo: string
  descripcion?: string
}

export interface UpdateCategoriaInput {
  nombre?: string
  codigo?: string
  descripcion?: string
}
