import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sucursalesService } from "@/services/sucursales"
import type { CreateSucursalInput, UpdateSucursalInput } from "@/types/sucursal"

export const sucursalesKeys = {
  all: ["sucursales"] as const,
  lists: () => [...sucursalesKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...sucursalesKeys.lists(), filters] as const,
  details: () => [...sucursalesKeys.all, "detail"] as const,
  detail: (id: string) => [...sucursalesKeys.details(), id] as const,
}

export function useSucursales(filters?: Record<string, string>) {
  return useQuery({
    queryKey: sucursalesKeys.list(filters ?? {}),
    queryFn: () => sucursalesService.list(filters),
  })
}

export function useSucursal(id: string) {
  return useQuery({
    queryKey: sucursalesKeys.detail(id),
    queryFn: () => sucursalesService.getById(id),
    enabled: !!id,
  })
}

export function useCreateSucursal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSucursalInput) => sucursalesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sucursalesKeys.lists() })
    },
  })
}

export function useUpdateSucursal(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateSucursalInput) => sucursalesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sucursalesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: sucursalesKeys.detail(id) })
    },
  })
}

export function useDeleteSucursal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => sucursalesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sucursalesKeys.lists() })
    },
  })
}

export function useRestoreSucursal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => sucursalesService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sucursalesKeys.lists() })
    },
  })
}
