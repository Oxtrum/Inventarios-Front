import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { categoriasService } from "@/services/categorias"
import { selectPaginatedItems } from "@/lib/pagination"
import type { CreateCategoriaInput, UpdateCategoriaInput } from "@/types/categoria"

export const categoriasKeys = {
  all: ["categorias"] as const,
  lists: () => [...categoriasKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...categoriasKeys.lists(), filters] as const,
  details: () => [...categoriasKeys.all, "detail"] as const,
  detail: (id: string) => [...categoriasKeys.details(), id] as const,
}

export function useCategorias(filters?: Record<string, string>) {
  return useQuery({
    queryKey: categoriasKeys.list(filters ?? {}),
    queryFn: () => categoriasService.list(filters),
    select: selectPaginatedItems,
  })
}

export function useCategoria(id: string) {
  return useQuery({
    queryKey: categoriasKeys.detail(id),
    queryFn: () => categoriasService.getById(id),
    enabled: !!id,
  })
}

export function useCreateCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCategoriaInput) => categoriasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriasKeys.lists() })
    },
  })
}

export function useUpdateCategoria(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateCategoriaInput) => categoriasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriasKeys.lists() })
      queryClient.invalidateQueries({ queryKey: categoriasKeys.detail(id) })
    },
  })
}

export function useDeleteCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoriasService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriasKeys.lists() })
    },
  })
}

export function useRestoreCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoriasService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriasKeys.lists() })
    },
  })
}
