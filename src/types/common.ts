export interface ApiResponse<T> {
  data: T
  codigo: number
  error: boolean
  mensaje: string
}

export interface ApiListResponse<T> {
  data: T[]
  codigo: number
  error: boolean
  mensaje: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
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
