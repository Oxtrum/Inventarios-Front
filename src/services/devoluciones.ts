import { api } from "@/lib/api"
import type { PaginatedData } from "@/types/common"
import type { Devolucion, CreateDevolucionInput } from "@/types/devolucion"

export const devolucionesService = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedData<Devolucion>>("/devoluciones", { params }),

  getById: (id: string) =>
    api.get<Devolucion>(`/devoluciones/${id}`),

  create: (data: CreateDevolucionInput) =>
    api.post<Devolucion>("/devoluciones", data),

  anular: (id: string) =>
    api.patch<Devolucion>(`/devoluciones/${id}/anular`),
}
