import { api } from "@/lib/api"
import type { StockBajoItem, KardexItem, ValoracionInventario } from "@/types/reporte"

export const reportesService = {
  stockBajo: (params?: Record<string, string>) =>
    api.get<StockBajoItem[]>("/reportes/stock-bajo", { params }),

  kardex: (params?: Record<string, string>) =>
    api.get<KardexItem[]>("/reportes/kardex", { params }),

  valoracion: (params?: Record<string, string>) =>
    api.get<ValoracionInventario>("/reportes/valoracion", { params }),
}
