import { useQuery } from "@tanstack/react-query"
import { reportesService } from "@/services/reportes"
import { fetchPaginatedItems, selectPaginatedItems, withDefaultPagination } from "@/lib/pagination"

export const reportesKeys = {
  all: ["reportes"] as const,
  stockBajo: (filters: Record<string, string>) => [...reportesKeys.all, "stock-bajo", filters] as const,
  kardex: (filters: Record<string, string>) => [...reportesKeys.all, "kardex", filters] as const,
  valoracion: (filters: Record<string, string>) => [...reportesKeys.all, "valoracion", filters] as const,
  resumen: (filters: Record<string, string>) => [...reportesKeys.all, "resumen", filters] as const,
  movimientosResumen: (filters: Record<string, string>) => [...reportesKeys.all, "movimientos-resumen", filters] as const,
  valoracionDistribucion: (filters: Record<string, string>) => [...reportesKeys.all, "valoracion-distribucion", filters] as const,
  reservasResumen: (filters: Record<string, string>) => [...reportesKeys.all, "reservas-resumen", filters] as const,
}

export function useStockBajo(filters?: Record<string, string>) {
  const params = withDefaultPagination(filters)
  return useQuery({
    queryKey: reportesKeys.stockBajo(params),
    queryFn: () => fetchPaginatedItems(reportesService.stockBajo, filters),
    select: selectPaginatedItems,
    // sin sucursalId => reporte agregado de todas las sucursales
  })
}

export function useKardex(filters?: Record<string, string>) {
  const params = withDefaultPagination(filters)
  return useQuery({
    queryKey: reportesKeys.kardex(params),
    queryFn: () => fetchPaginatedItems(reportesService.kardex, filters),
    select: selectPaginatedItems,
    // sucursalId opcional; el producto sigue siendo obligatorio
    enabled: !!params.productoId,
  })
}

export function useValoracion(filters?: Record<string, string>) {
  return useQuery({
    queryKey: reportesKeys.valoracion(filters ?? {}),
    queryFn: () => reportesService.valoracion(filters),
    // sin sucursalId => valoracion agregada de todas las sucursales
  })
}

export function useResumenDashboard(filters?: Record<string, string>) {
  return useQuery({
    queryKey: reportesKeys.resumen(filters ?? {}),
    queryFn: () => reportesService.resumen(filters),
  })
}

export function useMovimientosResumen(filters: Record<string, string>) {
  return useQuery({
    queryKey: reportesKeys.movimientosResumen(filters),
    queryFn: () => reportesService.movimientosResumen(filters),
    enabled: !!filters.fechaDesde && !!filters.fechaHasta,
  })
}

export function useValoracionDistribucion(filters: Record<string, string>) {
  return useQuery({
    queryKey: reportesKeys.valoracionDistribucion(filters),
    queryFn: () => reportesService.valoracionDistribucion(filters),
    enabled: !!filters.agruparPor,
  })
}

export function useReservasResumen(filters: Record<string, string>) {
  return useQuery({
    queryKey: reportesKeys.reservasResumen(filters),
    queryFn: () => reportesService.reservasResumen(filters),
    enabled: !!filters.fechaDesde && !!filters.fechaHasta,
  })
}
