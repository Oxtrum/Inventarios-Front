import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { proveedoresService } from "@/services/proveedores"
import type { CreateProveedorInput, UpdateProveedorInput } from "@/types/proveedor"

export const proveedoresKeys = {
  all: ["proveedores"] as const,
  lists: () => [...proveedoresKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...proveedoresKeys.lists(), filters] as const,
  details: () => [...proveedoresKeys.all, "detail"] as const,
  detail: (id: string) => [...proveedoresKeys.details(), id] as const,
}

export function useProveedores(filters?: Record<string, string>) {
  return useQuery({
    queryKey: proveedoresKeys.list(filters ?? {}),
    queryFn: () => proveedoresService.list(filters),
  })
}

export function useProveedor(id: string) {
  return useQuery({
    queryKey: proveedoresKeys.detail(id),
    queryFn: () => proveedoresService.getById(id),
    enabled: !!id,
  })
}

export function useCreateProveedor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProveedorInput) => proveedoresService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proveedoresKeys.lists() })
    },
  })
}

export function useUpdateProveedor(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProveedorInput) => proveedoresService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proveedoresKeys.lists() })
      queryClient.invalidateQueries({ queryKey: proveedoresKeys.detail(id) })
    },
  })
}

export function useDeleteProveedor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => proveedoresService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proveedoresKeys.lists() })
    },
  })
}

export function useRestoreProveedor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => proveedoresService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proveedoresKeys.lists() })
    },
  })
}
