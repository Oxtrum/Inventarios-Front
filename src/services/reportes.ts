import { api } from "@/lib/api"
import type { PaginatedData } from "@/types/common"
import type { QueryParams } from "@/lib/api"
import type {
  StockBajoItem,
  KardexItem,
  ValoracionInventario,
  ResumenDashboard,
  MovimientosResumen,
  ValoracionDistribucion,
  ReservasResumen,
  SucursalesComparacion,
} from "@/types/reporte"

export const reportesService = {
  stockBajo: (params?: QueryParams) =>
    api.get<PaginatedData<StockBajoItem>>("/reportes/stock-bajo", { params }),

  kardex: (params?: QueryParams) =>
    api.get<PaginatedData<KardexItem>>("/reportes/kardex", { params }),

  valoracion: (params?: QueryParams) =>
    api.get<ValoracionInventario>("/reportes/valoracion", { params }),

  resumen: (params?: QueryParams) =>
    api.get<ResumenDashboard>("/reportes/resumen", { params }),

  movimientosResumen: (params: QueryParams) =>
    api.get<MovimientosResumen>("/reportes/movimientos-resumen", { params }),

  valoracionDistribucion: (params: QueryParams) =>
    api.get<ValoracionDistribucion>("/reportes/valoracion-distribucion", { params }),

  reservasResumen: (params: QueryParams) =>
    api.get<ReservasResumen>("/reportes/reservas-resumen", { params }),

  sucursalesComparacion: (params: QueryParams) =>
    api.get<SucursalesComparacion>("/reportes/sucursales-comparacion", { params }),
}
