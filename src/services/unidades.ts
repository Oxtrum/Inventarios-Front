import { api } from "@/lib/api"
import type { Unidad, CreateUnidadInput, UpdateUnidadInput } from "@/types/unidad"

export const unidadesService = {
  list: (params?: Record<string, string>) =>
    api.get<Unidad[]>("/unidades", { params }),

  getById: (id: string) =>
    api.get<Unidad>(`/unidades/${id}`),

  create: (data: CreateUnidadInput) =>
    api.post<Unidad>("/unidades", data),

  update: (id: string, data: UpdateUnidadInput) =>
    api.patch<Unidad>(`/unidades/${id}`, data),

  remove: (id: string) =>
    api.del<Unidad>(`/unidades/${id}`),

  restore: (id: string) =>
    api.patch<Unidad>(`/unidades/${id}/restaurar`),
}
