import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { transferenciasService } from "@/services/transferencias"
import { fetchPaginatedItems, selectPaginatedItems, withDefaultPagination } from "@/lib/pagination"
import type { CreateTransferenciaInput } from "@/types/transferencia"

export const transferenciasKeys = {
  all: ["transferencias"] as const,
  lists: () => [...transferenciasKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...transferenciasKeys.lists(), filters] as const,
  details: () => [...transferenciasKeys.all, "detail"] as const,
  detail: (id: string) => [...transferenciasKeys.details(), id] as const,
}

export function useTransferencias(filters?: Record<string, string>) {
  const params = withDefaultPagination(filters)
  return useQuery({
    queryKey: transferenciasKeys.list(params),
    queryFn: () => fetchPaginatedItems(transferenciasService.list, filters),
    select: selectPaginatedItems,
  })
}

export function useTransferencia(id: string) {
  return useQuery({
    queryKey: transferenciasKeys.detail(id),
    queryFn: () => transferenciasService.getById(id),
    enabled: !!id,
  })
}

export function useCreateTransferencia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTransferenciaInput) => transferenciasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transferenciasKeys.lists() })
    },
  })
}

export function useAnularTransferencia(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => transferenciasService.anular(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transferenciasKeys.lists() })
      queryClient.invalidateQueries({ queryKey: transferenciasKeys.detail(id) })
    },
  })
}
