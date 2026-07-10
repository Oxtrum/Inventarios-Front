import { api } from "@/lib/api"
import type { TipoNegocio, CreateTipoNegocioInput, UpdateTipoNegocioInput } from "@/types/tipoNegocio"

export const tiposNegocioService = {
  list: (params?: Record<string, string>) =>
    api.get<TipoNegocio[]>("/tipos-negocio", { params }),

  getById: (id: string) =>
    api.get<TipoNegocio>(`/tipos-negocio/${id}`),

  create: (data: CreateTipoNegocioInput) =>
    api.post<TipoNegocio>("/tipos-negocio", data),

  update: (id: string, data: UpdateTipoNegocioInput) =>
    api.patch<TipoNegocio>(`/tipos-negocio/${id}`, data),

  remove: (id: string) =>
    api.del<TipoNegocio>(`/tipos-negocio/${id}`),

  restore: (id: string) =>
    api.patch<TipoNegocio>(`/tipos-negocio/${id}/restaurar`),
}
