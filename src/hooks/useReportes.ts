import { useQuery } from "@tanstack/react-query"
import { reportesService } from "@/services/reportes"

export const reportesKeys = {
  all: ["reportes"] as const,
  stockBajo: (filters: Record<string, string>) => [...reportesKeys.all, "stock-bajo", filters] as const,
  kardex: (filters: Record<string, string>) => [...reportesKeys.all, "kardex", filters] as const,
  valoracion: (filters: Record<string, string>) => [...reportesKeys.all, "valoracion", filters] as const,
}

export function useStockBajo(filters?: Record<string, string>) {
  return useQuery({
    queryKey: reportesKeys.stockBajo(filters ?? {}),
    queryFn: () => reportesService.stockBajo(filters),
    // sin sucursalId => reporte agregado de todas las sucursales
  })
}

export function useKardex(filters?: Record<string, string>) {
  return useQuery({
    queryKey: reportesKeys.kardex(filters ?? {}),
    queryFn: () => reportesService.kardex(filters),
    // sucursalId opcional; el producto sigue siendo obligatorio
    enabled: !!filters?.productoId,
  })
}

export function useValoracion(filters?: Record<string, string>) {
  return useQuery({
    queryKey: reportesKeys.valoracion(filters ?? {}),
    queryFn: () => reportesService.valoracion(filters),
    // sin sucursalId => valoracion agregada de todas las sucursales
  })
}
