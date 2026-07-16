export interface ApiResponse<T> {
  data: T
  codigo: number
  error: boolean
  mensaje: string
}

export interface PaginationParams {
  limit?: number
  offset?: number
}

export interface PaginationMetadata {
  limit: number
  offset: number
  count: number
  total: number
  hasMore: boolean
}

export interface PaginatedData<T> {
  items: T[]
  pagination: PaginationMetadata
}

export type MovementType =
  | "STOCK_INICIAL"
  | "COMPRA"
  | "VENTA"
  | "AJUSTE_ENTRADA"
  | "AJUSTE_SALIDA"
  | "TRANSFERENCIA_SALE"
  | "TRANSFERENCIA_ENTRA"
  | "DEVOLUCION_ENTRA"
  | "DEVOLUCION_SALE"
  | "PERDIDA"
