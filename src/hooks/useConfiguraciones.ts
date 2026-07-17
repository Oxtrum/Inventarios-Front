import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { configuracionesService } from "@/services/configuraciones"
import { selectPaginatedItems } from "@/lib/pagination"
import type { CreateConfiguracionInput, UpdateConfiguracionInput } from "@/types/configuracion"

export const configuracionesKeys = {
  all: ["configuraciones"] as const,
  lists: () => [...configuracionesKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...configuracionesKeys.lists(), filters] as const,
  details: () => [...configuracionesKeys.all, "detail"] as const,
  detail: (id: string) => [...configuracionesKeys.details(), id] as const,
}

export function useConfiguraciones(filters?: Record<string, string>) {
  return useQuery({
    queryKey: configuracionesKeys.list(filters ?? {}),
    queryFn: () => configuracionesService.list(filters),
    select: selectPaginatedItems,
  })
}

export function useConfiguracion(id: string) {
  return useQuery({
    queryKey: configuracionesKeys.detail(id),
    queryFn: () => configuracionesService.getById(id),
    enabled: !!id,
  })
}

export function useCreateConfiguracion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateConfiguracionInput) => configuracionesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configuracionesKeys.lists() })
    },
  })
}

export function useUpdateConfiguracion(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateConfiguracionInput) => configuracionesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configuracionesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: configuracionesKeys.detail(id) })
    },
  })
}

export function useDeleteConfiguracion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => configuracionesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configuracionesKeys.lists() })
    },
  })
}

export function useRestoreConfiguracion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => configuracionesService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configuracionesKeys.lists() })
    },
  })
}
