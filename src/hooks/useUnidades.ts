import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { unidadesService } from "@/services/unidades"
import type { CreateUnidadInput, UpdateUnidadInput } from "@/types/unidad"

export const unidadesKeys = {
  all: ["unidades"] as const,
  lists: () => [...unidadesKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...unidadesKeys.lists(), filters] as const,
  details: () => [...unidadesKeys.all, "detail"] as const,
  detail: (id: string) => [...unidadesKeys.details(), id] as const,
}

export function useUnidades(filters?: Record<string, string>) {
  return useQuery({
    queryKey: unidadesKeys.list(filters ?? {}),
    queryFn: () => unidadesService.list(filters),
  })
}

export function useUnidad(id: string) {
  return useQuery({
    queryKey: unidadesKeys.detail(id),
    queryFn: () => unidadesService.getById(id),
    enabled: !!id,
  })
}

export function useCreateUnidad() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUnidadInput) => unidadesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unidadesKeys.lists() })
    },
  })
}

export function useUpdateUnidad(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateUnidadInput) => unidadesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unidadesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: unidadesKeys.detail(id) })
    },
  })
}

export function useDeleteUnidad() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => unidadesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unidadesKeys.lists() })
    },
  })
}

export function useRestoreUnidad() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => unidadesService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unidadesKeys.lists() })
    },
  })
}
