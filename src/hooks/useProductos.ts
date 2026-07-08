import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { productosService } from "@/services/productos"
import type { CreateProductoInput, UpdateProductoInput } from "@/types/producto"

export const productosKeys = {
  all: ["productos"] as const,
  lists: () => [...productosKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...productosKeys.lists(), filters] as const,
  details: () => [...productosKeys.all, "detail"] as const,
  detail: (id: string) => [...productosKeys.details(), id] as const,
}

export function useProductos(filters?: Record<string, string>) {
  return useQuery({
    queryKey: productosKeys.list(filters ?? {}),
    queryFn: () => productosService.list(filters),
  })
}

export function useProducto(id: string) {
  return useQuery({
    queryKey: productosKeys.detail(id),
    queryFn: () => productosService.getById(id),
    enabled: !!id,
  })
}

export function useCreateProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProductoInput) => productosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productosKeys.lists() })
    },
  })
}

export function useUpdateProducto(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProductoInput) => productosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productosKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productosKeys.detail(id) })
    },
  })
}

export function useDeleteProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productosService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productosKeys.lists() })
    },
  })
}

export function useRestoreProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productosService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productosKeys.lists() })
    },
  })
}
