import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { conteosService } from "@/services/conteos"
import type { CreateConteoInput, RegistrarConteoInput } from "@/types/conteo"

export const conteosKeys = {
  all: ["conteos"] as const,
  lists: () => [...conteosKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...conteosKeys.lists(), filters] as const,
  details: () => [...conteosKeys.all, "detail"] as const,
  detail: (id: string) => [...conteosKeys.details(), id] as const,
}

export function useConteos(filters?: Record<string, string>) {
  return useQuery({
    queryKey: conteosKeys.list(filters ?? {}),
    queryFn: () => conteosService.list(filters),
  })
}

export function useConteo(id: string) {
  return useQuery({
    queryKey: conteosKeys.detail(id),
    queryFn: () => conteosService.getById(id),
    enabled: !!id,
  })
}

export function useCreateConteo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateConteoInput) => conteosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conteosKeys.lists() })
    },
  })
}

export function useRegistrarConteoItems(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: RegistrarConteoInput) => conteosService.registrarItems(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conteosKeys.detail(id) })
    },
  })
}

export function useCerrarConteo(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => conteosService.cerrar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conteosKeys.lists() })
      queryClient.invalidateQueries({ queryKey: conteosKeys.detail(id) })
    },
  })
}

export function useAnularConteo(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => conteosService.anular(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conteosKeys.lists() })
      queryClient.invalidateQueries({ queryKey: conteosKeys.detail(id) })
    },
  })
}
