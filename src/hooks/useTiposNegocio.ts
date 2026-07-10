import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { tiposNegocioService } from "@/services/tiposNegocio"
import type { CreateTipoNegocioInput, UpdateTipoNegocioInput } from "@/types/tipoNegocio"

export const tiposNegocioKeys = {
  all: ["tiposNegocio"] as const,
  lists: () => [...tiposNegocioKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...tiposNegocioKeys.lists(), filters] as const,
  details: () => [...tiposNegocioKeys.all, "detail"] as const,
  detail: (id: string) => [...tiposNegocioKeys.details(), id] as const,
}

export function useTiposNegocio(filters?: Record<string, string>) {
  return useQuery({
    queryKey: tiposNegocioKeys.list(filters ?? {}),
    queryFn: () => tiposNegocioService.list(filters),
  })
}

export function useTipoNegocio(id: string) {
  return useQuery({
    queryKey: tiposNegocioKeys.detail(id),
    queryFn: () => tiposNegocioService.getById(id),
    enabled: !!id,
  })
}

export function useCreateTipoNegocio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTipoNegocioInput) => tiposNegocioService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposNegocioKeys.lists() })
    },
  })
}

export function useUpdateTipoNegocio(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateTipoNegocioInput) => tiposNegocioService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposNegocioKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tiposNegocioKeys.detail(id) })
    },
  })
}

export function useDeleteTipoNegocio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tiposNegocioService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposNegocioKeys.lists() })
    },
  })
}

export function useRestoreTipoNegocio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tiposNegocioService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposNegocioKeys.lists() })
    },
  })
}
