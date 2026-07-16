import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { tiposProductoService } from "@/services/tiposProducto"
import { selectPaginatedItems } from "@/lib/pagination"
import type {
  CreateTipoProductoInput,
  UpdateTipoProductoInput,
  CreateTipoProductoAtributoInput,
  UpdateTipoProductoAtributoInput,
} from "@/types/tipoProducto"

export const tiposProductoKeys = {
  all: ["tiposProducto"] as const,
  lists: () => [...tiposProductoKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...tiposProductoKeys.lists(), filters] as const,
  details: () => [...tiposProductoKeys.all, "detail"] as const,
  detail: (id: string) => [...tiposProductoKeys.details(), id] as const,
  atributos: (id: string) => [...tiposProductoKeys.all, id, "atributos"] as const,
}

export function useTiposProducto(filters?: Record<string, string>) {
  return useQuery({
    queryKey: tiposProductoKeys.list(filters ?? {}),
    queryFn: () => tiposProductoService.list(filters),
    select: selectPaginatedItems,
  })
}

export function useTipoProducto(id: string) {
  return useQuery({
    queryKey: tiposProductoKeys.detail(id),
    queryFn: () => tiposProductoService.getById(id),
    enabled: !!id,
  })
}

export function useCreateTipoProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTipoProductoInput) => tiposProductoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposProductoKeys.lists() })
    },
  })
}

export function useUpdateTipoProducto(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateTipoProductoInput) => tiposProductoService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposProductoKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tiposProductoKeys.detail(id) })
    },
  })
}

export function useDeleteTipoProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tiposProductoService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposProductoKeys.lists() })
    },
  })
}

export function useRestoreTipoProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tiposProductoService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposProductoKeys.lists() })
    },
  })
}

export function useTipoProductoAtributos(tipoProductoId: string) {
  return useQuery({
    queryKey: tiposProductoKeys.atributos(tipoProductoId),
    queryFn: () => tiposProductoService.atributos(tipoProductoId),
    enabled: !!tipoProductoId,
  })
}

export function useAddTipoProductoAtributo(tipoProductoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTipoProductoAtributoInput) => tiposProductoService.addAtributo(tipoProductoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposProductoKeys.atributos(tipoProductoId) })
    },
  })
}

export function useUpdateTipoProductoAtributo(tipoProductoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ atributoId, data }: { atributoId: string; data: UpdateTipoProductoAtributoInput }) =>
      tiposProductoService.updateAtributo(tipoProductoId, atributoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposProductoKeys.atributos(tipoProductoId) })
    },
  })
}

export function useRemoveTipoProductoAtributo(tipoProductoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (atributoId: string) => tiposProductoService.removeAtributo(tipoProductoId, atributoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposProductoKeys.atributos(tipoProductoId) })
    },
  })
}
