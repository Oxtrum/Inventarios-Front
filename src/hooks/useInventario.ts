import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { inventarioService, catalogoService } from "@/services/inventario"
import type { AjusteRequest, MermaRequest, CrearReservaRequest } from "@/types/inventario"

export const inventarioKeys = {
  all: ["inventario"] as const,
  stock: (filters: Record<string, string>) => [...inventarioKeys.all, "stock", filters] as const,
  movimientos: (filters: Record<string, string>) => [...inventarioKeys.all, "movimientos", filters] as const,
  reservas: (filters: Record<string, string>) => [...inventarioKeys.all, "reservas", filters] as const,
}

export const catalogoKeys = {
  all: ["catalogo"] as const,
  productos: (filters: Record<string, string>) => [...catalogoKeys.all, "productos", filters] as const,
}

export function useStock(filters?: Record<string, string>) {
  return useQuery({
    queryKey: inventarioKeys.stock(filters ?? {}),
    queryFn: () => inventarioService.stock(filters),
    enabled: !!filters?.productoId && !!filters?.sucursalId,
  })
}

export function useMovimientos(filters?: Record<string, string>) {
  return useQuery({
    queryKey: inventarioKeys.movimientos(filters ?? {}),
    queryFn: () => inventarioService.movimientos(filters),
  })
}

export function useAjustarStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AjusteRequest) => inventarioService.ajustar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventarioKeys.all })
    },
  })
}

export function useRegistrarMerma() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: MermaRequest) => inventarioService.merma(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventarioKeys.all })
    },
  })
}

export function useReservas(filters?: Record<string, string>) {
  return useQuery({
    queryKey: inventarioKeys.reservas(filters ?? {}),
    queryFn: () => inventarioService.reservas(filters),
  })
}

export function useCrearReserva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CrearReservaRequest) => inventarioService.crearReserva(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventarioKeys.all })
    },
  })
}

export function useConfirmarReserva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => inventarioService.confirmarReserva(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventarioKeys.all })
    },
  })
}

export function useLiberarReserva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => inventarioService.liberarReserva(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventarioKeys.all })
    },
  })
}

export function useExpirarReserva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => inventarioService.expirarReserva(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventarioKeys.all })
    },
  })
}

export function useCatalogoProductos(filters?: Record<string, string>) {
  return useQuery({
    queryKey: catalogoKeys.productos(filters ?? {}),
    queryFn: () => catalogoService.productos(filters),
  })
}
