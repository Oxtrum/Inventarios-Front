export interface Producto {
  id: string
  organizacionId: string
  categoriaId?: string
  unidadId?: string
  codigo?: string
  nombre: string
  descripcion?: string
  costo: number
  precio: number
  stockMinimo: number
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CreateProductoInput {
  categoriaId?: string
  unidadId?: string
  codigo?: string
  nombre: string
  descripcion?: string
  costo?: number
  precio?: number
  stockMinimo?: number
}

export interface UpdateProductoInput {
  categoriaId?: string
  unidadId?: string
  codigo?: string
  nombre?: string
  descripcion?: string
  costo?: number
  precio?: number
  stockMinimo?: number
}
