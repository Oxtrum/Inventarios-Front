export interface Devolucion {
  id: string
  organizacionId: string
  sucursalId: string
  proveedorId: string
  compraId?: string
  numero?: string
  estado: string
  motivo?: string
  total: number
  creadoPorId?: string
  items: DevolucionItem[]
  fechaCreacion: string
  fechaActualizacion: string
}

export interface DevolucionItem {
  id: string
  devolucionId: string
  productoId: string
  productoVarianteId: string
  cantidad: number
  costoUnitario: number
  subtotal: number
}

export interface CreateDevolucionInput {
  sucursalId: string
  proveedorId: string
  compraId?: string
  numero?: string
  motivo?: string
  items: CreateDevolucionItem[]
}

export interface CreateDevolucionItem {
  productoId: string
  productoVarianteId?: string
  cantidad: number
  costoUnitario: number
}
