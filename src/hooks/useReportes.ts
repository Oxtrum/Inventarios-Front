import { useQuery } from "@tanstack/react-query"
import { reportesService } from "@/services/reportes"
import { fetchPaginatedItems, selectPaginatedItems, withDefaultPagination } from "@/lib/pagination"
import type { QueryParams } from "@/lib/api"

export const reportesKeys = {
  all: ["reportes"] as const,
  stockBajo: (filters: QueryParams) => [...reportesKeys.all, "stock-bajo", filters] as const,
  kardex: (filters: QueryParams) => [...reportesKeys.all, "kardex", filters] as const,
  valoracion: (filters: QueryParams) => [...reportesKeys.all, "valoracion", filters] as const,
  resumen: (filters: QueryParams) => [...reportesKeys.all, "resumen", filters] as const,
  movimientosResumen: (filters: QueryParams) => [...reportesKeys.all, "movimientos-resumen", filters] as const,
  valoracionDistribucion: (filters: QueryParams) => [...reportesKeys.all, "valoracion-distribucion", filters] as const,
  reservasResumen: (filters: QueryParams) => [...reportesKeys.all, "reservas-resumen", filters] as const,
  sucursalesComparacion: (filters: QueryParams) => [...reportesKeys.all, "sucursales-comparacion", filters] as const,
}

export function useStockBajo(filters?: QueryParams) {
  const params = withDefaultPagination(filters)
  return useQuery({
    queryKey: reportesKeys.stockBajo(params),
    queryFn: () => fetchPaginatedItems(reportesService.stockBajo, filters),
    select: selectPaginatedItems,
    // sin sucursalId => reporte agregado de todas las sucursales
  })
}

export function useKardex(filters?: QueryParams) {
  const params = withDefaultPagination(filters)
  return useQuery({
    queryKey: reportesKeys.kardex(params),
    queryFn: () => fetchPaginatedItems(reportesService.kardex, filters),
    select: selectPaginatedItems,
    // sucursalId opcional; el producto sigue siendo obligatorio
    enabled: !!params.productoId,
  })
}

export function useValoracion(filters?: QueryParams) {
  return useQuery({
    queryKey: reportesKeys.valoracion(filters ?? {}),
    queryFn: () => reportesService.valoracion(filters),
    // sin sucursalId => valoracion agregada de todas las sucursales
  })
}

export function useResumenDashboard(filters?: QueryParams) {
  return useQuery({
    queryKey: reportesKeys.resumen(filters ?? {}),
    queryFn: () => reportesService.resumen(filters),
  })
}

export function useMovimientosResumen(filters: QueryParams) {
  return useQuery({
    queryKey: reportesKeys.movimientosResumen(filters),
    queryFn: () => reportesService.movimientosResumen(filters),
    enabled: !!filters.fechaDesde && !!filters.fechaHasta,
  })
}

export function useValoracionDistribucion(filters: QueryParams) {
  return useQuery({
    queryKey: reportesKeys.valoracionDistribucion(filters),
    queryFn: () => reportesService.valoracionDistribucion(filters),
    enabled: !!filters.agruparPor,
  })
}

export function useReservasResumen(
  filters: QueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: reportesKeys.reservasResumen(filters),
    queryFn: () => reportesService.reservasResumen(filters),
    enabled: (options?.enabled ?? true) && !!filters.fechaDesde && !!filters.fechaHasta,
  })
}

export function useSucursalesComparacion(filters: QueryParams) {
  return useQuery({
    queryKey: reportesKeys.sucursalesComparacion(filters),
    queryFn: () => reportesService.sucursalesComparacion(filters),
    enabled: !!filters.fechaDesde && !!filters.fechaHasta,
  })
}
