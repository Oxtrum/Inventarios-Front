import { api } from "@/lib/api"
import type {
  Conteo,
  CreateConteoInput,
  RegistrarConteoInput,
} from "@/types/conteo"

export const conteosService = {
  list: (params?: Record<string, string>) =>
    api.get<Conteo[]>("/conteos", { params }),

  getById: (id: string) =>
    api.get<Conteo>(`/conteos/${id}`),

  create: (data: CreateConteoInput) =>
    api.post<Conteo>("/conteos", data),

  registrarItems: (id: string, data: RegistrarConteoInput) =>
    api.patch<Conteo>(`/conteos/${id}/items`, data),

  cerrar: (id: string) =>
    api.patch<Conteo>(`/conteos/${id}/cerrar`),

  anular: (id: string) =>
    api.patch<Conteo>(`/conteos/${id}/anular`),
}
