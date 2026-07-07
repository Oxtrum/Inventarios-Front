import { api } from "@/lib/api"
import type {
  Organizacion,
  CreateOrganizacionInput,
  UpdateOrganizacionInput,
} from "@/types/organizacion"

export const organizacionesService = {
  list: (params?: Record<string, string>) =>
    api.get<Organizacion[]>("/organizaciones", { params }),

  getById: (id: string) =>
    api.get<Organizacion>(`/organizaciones/${id}`),

  create: (data: CreateOrganizacionInput) =>
    api.post<Organizacion>("/organizaciones", data),

  update: (id: string, data: UpdateOrganizacionInput) =>
    api.patch<Organizacion>(`/organizaciones/${id}`, data),

  remove: (id: string) =>
    api.del<Organizacion>(`/organizaciones/${id}`),

  restore: (id: string) =>
    api.patch<Organizacion>(`/organizaciones/${id}/restaurar`),
}
