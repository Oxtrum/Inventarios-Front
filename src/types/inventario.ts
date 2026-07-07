import type { MovementType } from "./common"

export interface Movimiento {
  id: string
  organizacionId: string
  sucursalId: string
  productoId: string
  tipo: MovementType
  cantidad: number
  motivo?: string
  referenciaTipo?: string
  referenciaId?: string
  creadoPorId?: string
  fechaCreacion: string
  fechaActualizacion: string
}

export interface Stock {
  productoId: string
  sucursalId: string
  stockActual: number
  stockReservado: number
  stockDisponible: number
  fechaCalculo: string
}

export interface ReservaStock {
  id: string
  organizacionId: string
  sucursalId: string
  referenciaExterna?: string
  estado: string
  fechaExpiracion: string
  creadoPorId?: string
  items: ReservaStockItem[]
  fechaCreacion: string
  fechaActualizacion: string
}

export interface ReservaStockItem {
  id: string
  reservaId: string
  productoId: string
  cantidad: number
}

export interface CatalogoProducto {
  id: string
  categoriaId?: string
  unidadId?: string
  codigo?: string
  nombre: string
  descripcion?: string
  precio: number
  stockMinimo: number
  stockDisponible: number
  sucursalId: string
  fechaActualizacion: string
}

export interface AjusteRequest {
  productoId: string
  sucursalId: string
  tipo: string
  cantidad: number
  motivo?: string
}

export interface MermaRequest {
  productoId: string
  sucursalId: string
  cantidad: number
  motivo?: string
}

export interface CrearReservaRequest {
  sucursalId: string
  referenciaExterna?: string
  minutosExpiracion?: number
  items: CrearReservaItem[]
}

export interface CrearReservaItem {
  productoId: string
  cantidad: number
}
