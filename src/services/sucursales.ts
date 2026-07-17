import { api } from "@/lib/api"
import type { PaginatedData } from "@/types/common"
import type { Sucursal, CreateSucursalInput, UpdateSucursalInput } from "@/types/sucursal"

export const sucursalesService = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedData<Sucursal>>("/sucursales", { params }),

  getById: (id: string) =>
    api.get<Sucursal>(`/sucursales/${id}`),

  create: (data: CreateSucursalInput) =>
    api.post<Sucursal>("/sucursales", data),

  update: (id: string, data: UpdateSucursalInput) =>
    api.patch<Sucursal>(`/sucursales/${id}`, data),

  remove: (id: string) =>
    api.del<Sucursal>(`/sucursales/${id}`),

  restore: (id: string) =>
    api.patch<Sucursal>(`/sucursales/${id}/restaurar`),
}
