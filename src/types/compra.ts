export interface Compra {
  id: string
  organizacionId: string
  sucursalId: string
  proveedorId?: string
  numero?: string
  estado: string
  observacion?: string
  total: number
  creadoPorId?: string
  items: CompraItem[]
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CompraItem {
  id: string
  compraId: string
  productoId: string
  productoVarianteId: string
  cantidad: number
  costoUnitario: number
  subtotal: number
}

export interface CreateCompraInput {
  sucursalId: string
  proveedorId?: string
  numero?: string
  observacion?: string
  items: CreateCompraItem[]
}

export interface CreateCompraItem {
  productoId: string
  productoVarianteId?: string
  cantidad: number
  costoUnitario: number
}
