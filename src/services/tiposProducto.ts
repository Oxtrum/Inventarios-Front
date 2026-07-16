import { api } from "@/lib/api"
import type { PaginatedData } from "@/types/common"
import type {
  TipoProducto,
  CreateTipoProductoInput,
  UpdateTipoProductoInput,
  TipoProductoAtributo,
  CreateTipoProductoAtributoInput,
  UpdateTipoProductoAtributoInput,
} from "@/types/tipoProducto"

export const tiposProductoService = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedData<TipoProducto>>("/tipos-producto", { params }),

  getById: (id: string) =>
    api.get<TipoProducto>(`/tipos-producto/${id}`),

  create: (data: CreateTipoProductoInput) =>
    api.post<TipoProducto>("/tipos-producto", data),

  update: (id: string, data: UpdateTipoProductoInput) =>
    api.patch<TipoProducto>(`/tipos-producto/${id}`, data),

  remove: (id: string) =>
    api.del<TipoProducto>(`/tipos-producto/${id}`),

  restore: (id: string) =>
    api.patch<TipoProducto>(`/tipos-producto/${id}/restaurar`),

  atributos: (id: string) =>
    api.get<TipoProductoAtributo[]>(`/tipos-producto/${id}/atributos`),

  addAtributo: (id: string, data: CreateTipoProductoAtributoInput) =>
    api.post<TipoProductoAtributo>(`/tipos-producto/${id}/atributos`, data),

  updateAtributo: (id: string, atributoId: string, data: UpdateTipoProductoAtributoInput) =>
    api.patch<TipoProductoAtributo>(`/tipos-producto/${id}/atributos/${atributoId}`, data),

  removeAtributo: (id: string, atributoId: string) =>
    api.del<void>(`/tipos-producto/${id}/atributos/${atributoId}`),
}
