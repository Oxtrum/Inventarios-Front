export interface StockBajoItem {
  productoId: string
  productoVarianteId: string
  codigo?: string
  nombre: string
  sucursalId: string
  stockActual: number
  stockReservado: number
  stockDisponible: number
  stockMinimo: number
}

export interface KardexItem {
  movimientoId: string
  productoId: string
  productoVarianteId: string
  sucursalId: string
  tipo: string
  cantidad: number
  efecto: number
  saldo: number
  motivo?: string
  referenciaTipo?: string
  referenciaId?: string
  fechaCreacion: string
}

export interface ValoracionInventario {
  sucursalId: string
  totalProductos: number
  stockDisponible: number
  valorCosto: number
}
