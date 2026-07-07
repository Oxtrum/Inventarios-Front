export interface Transferencia {
  id: string
  organizacionId: string
  sucursalOrigenId: string
  sucursalDestinoId: string
  numero?: string
  estado: string
  observacion?: string
  creadoPorId?: string
  items: TransferenciaItem[]
  fechaCreacion: string
  fechaActualizacion: string
}

export interface TransferenciaItem {
  id: string
  transferenciaId: string
  productoId: string
  cantidad: number
}

export interface CreateTransferenciaInput {
  sucursalOrigenId: string
  sucursalDestinoId: string
  numero?: string
  observacion?: string
  items: CreateTransferenciaItem[]
}

export interface CreateTransferenciaItem {
  productoId: string
  cantidad: number
}
