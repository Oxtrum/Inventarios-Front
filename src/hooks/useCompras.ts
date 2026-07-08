import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { comprasService } from "@/services/compras"
import type { CreateCompraInput } from "@/types/compra"

export const comprasKeys = {
  all: ["compras"] as const,
  lists: () => [...comprasKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...comprasKeys.lists(), filters] as const,
  details: () => [...comprasKeys.all, "detail"] as const,
  detail: (id: string) => [...comprasKeys.details(), id] as const,
}

export function useCompras(filters?: Record<string, string>) {
  return useQuery({
    queryKey: comprasKeys.list(filters ?? {}),
    queryFn: () => comprasService.list(filters),
  })
}

export function useCompra(id: string) {
  return useQuery({
    queryKey: comprasKeys.detail(id),
    queryFn: () => comprasService.getById(id),
    enabled: !!id,
  })
}

export function useCreateCompra() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCompraInput) => comprasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: comprasKeys.lists() })
    },
  })
}

export function useAnularCompra(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => comprasService.anular(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: comprasKeys.lists() })
      queryClient.invalidateQueries({ queryKey: comprasKeys.detail(id) })
    },
  })
}
