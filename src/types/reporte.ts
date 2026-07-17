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

export interface ResumenDashboard {
  productosActivos: number
  variantesActivas: number
  variantesStockBajo: number
  stockDisponible: number
  valorInventario: number
  reservasActivas: number
  unidadesReservadas: number
  movimientosHoy: number
  fechaCalculo: string
}

export interface MovimientoResumenItem {
  periodo: string
  entradasCantidad: number
  salidasCantidad: number
  entradasOperaciones: number
  salidasOperaciones: number
}

export interface MovimientosResumen {
  series: MovimientoResumenItem[]
  totales: Omit<MovimientoResumenItem, "periodo"> & {
    variacionNeta: number
  }
}

export type ValoracionAgrupacion = "sucursal" | "categoria"

export interface ValoracionDistribucionGrupo {
  id: string | null
  nombre: string
  totalVariantes: number
  stockDisponible: number
  valorCosto: number
  porcentajeValor: number
}

export interface ValoracionDistribucion {
  agruparPor: ValoracionAgrupacion
  totalValorCosto: number
  grupos: ValoracionDistribucionGrupo[]
}

export type ReservaEstado = "activa" | "confirmada" | "liberada" | "expirada"

export interface ReservasResumen {
  porEstado: Array<{
    estado: ReservaEstado
    totalReservas: number
    totalUnidades: number
  }>
  snapshot: {
    activasAhora: number
    unidadesReservadasAhora: number
    expiranProximos30Minutos: number
  }
}
