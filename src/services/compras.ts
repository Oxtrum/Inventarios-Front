import { api } from "@/lib/api"
import type { Compra, CreateCompraInput } from "@/types/compra"

export const comprasService = {
  list: (params?: Record<string, string>) =>
    api.get<Compra[]>("/compras", { params }),

  getById: (id: string) =>
    api.get<Compra>(`/compras/${id}`),

  create: (data: CreateCompraInput) =>
    api.post<Compra>("/compras", data),

  anular: (id: string) =>
    api.patch<Compra>(`/compras/${id}/anular`),
}
