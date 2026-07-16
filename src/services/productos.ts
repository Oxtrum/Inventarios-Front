import { api } from "@/lib/api"
import type { PaginatedData } from "@/types/common"
import type { Producto, CreateProductoInput, UpdateProductoInput } from "@/types/producto"

export const productosService = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedData<Producto>>("/productos", { params }),

  getById: (id: string) =>
    api.get<Producto>(`/productos/${id}`),

  create: (data: CreateProductoInput) =>
    api.post<Producto>("/productos", data),

  update: (id: string, data: UpdateProductoInput) =>
    api.patch<Producto>(`/productos/${id}`, data),

  remove: (id: string) =>
    api.del<Producto>(`/productos/${id}`),

  restore: (id: string) =>
    api.patch<Producto>(`/productos/${id}/restaurar`),
}
