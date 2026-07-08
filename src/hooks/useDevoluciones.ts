import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { devolucionesService } from "@/services/devoluciones"
import type { CreateDevolucionInput } from "@/types/devolucion"

export const devolucionesKeys = {
  all: ["devoluciones"] as const,
  lists: () => [...devolucionesKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...devolucionesKeys.lists(), filters] as const,
  details: () => [...devolucionesKeys.all, "detail"] as const,
  detail: (id: string) => [...devolucionesKeys.details(), id] as const,
}

export function useDevoluciones(filters?: Record<string, string>) {
  return useQuery({
    queryKey: devolucionesKeys.list(filters ?? {}),
    queryFn: () => devolucionesService.list(filters),
  })
}

export function useDevolucion(id: string) {
  return useQuery({
    queryKey: devolucionesKeys.detail(id),
    queryFn: () => devolucionesService.getById(id),
    enabled: !!id,
  })
}

export function useCreateDevolucion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDevolucionInput) => devolucionesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: devolucionesKeys.lists() })
    },
  })
}

export function useAnularDevolucion(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => devolucionesService.anular(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: devolucionesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: devolucionesKeys.detail(id) })
    },
  })
}
