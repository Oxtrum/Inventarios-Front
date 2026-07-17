import { api } from "@/lib/api"
import type { PaginatedData } from "@/types/common"
import type {
  StockBajoItem,
  KardexItem,
  ValoracionInventario,
  ResumenDashboard,
  MovimientosResumen,
  ValoracionDistribucion,
  ReservasResumen,
} from "@/types/reporte"

export const reportesService = {
  stockBajo: (params?: Record<string, string>) =>
    api.get<PaginatedData<StockBajoItem>>("/reportes/stock-bajo", { params }),

  kardex: (params?: Record<string, string>) =>
    api.get<PaginatedData<KardexItem>>("/reportes/kardex", { params }),

  valoracion: (params?: Record<string, string>) =>
    api.get<ValoracionInventario>("/reportes/valoracion", { params }),

  resumen: (params?: Record<string, string>) =>
    api.get<ResumenDashboard>("/reportes/resumen", { params }),

  movimientosResumen: (params: Record<string, string>) =>
    api.get<MovimientosResumen>("/reportes/movimientos-resumen", { params }),

  valoracionDistribucion: (params: Record<string, string>) =>
    api.get<ValoracionDistribucion>("/reportes/valoracion-distribucion", { params }),

  reservasResumen: (params: Record<string, string>) =>
    api.get<ReservasResumen>("/reportes/reservas-resumen", { params }),
}
