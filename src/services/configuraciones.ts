import { api } from "@/lib/api"
import type { PaginatedData } from "@/types/common"
import type {
  Configuracion,
  CreateConfiguracionInput,
  UpdateConfiguracionInput,
} from "@/types/configuracion"

export const configuracionesService = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedData<Configuracion>>("/configuraciones", { params }),

  getById: (id: string) =>
    api.get<Configuracion>(`/configuraciones/${id}`),

  create: (data: CreateConfiguracionInput) =>
    api.post<Configuracion>("/configuraciones", data),

  update: (id: string, data: UpdateConfiguracionInput) =>
    api.patch<Configuracion>(`/configuraciones/${id}`, data),

  remove: (id: string) =>
    api.del<Configuracion>(`/configuraciones/${id}`),

  restore: (id: string) =>
    api.patch<Configuracion>(`/configuraciones/${id}/restaurar`),
}
