import { api } from "@/lib/api"
import type { Proveedor, CreateProveedorInput, UpdateProveedorInput } from "@/types/proveedor"

export const proveedoresService = {
  list: (params?: Record<string, string>) =>
    api.get<Proveedor[]>("/proveedores", { params }),

  getById: (id: string) =>
    api.get<Proveedor>(`/proveedores/${id}`),

  create: (data: CreateProveedorInput) =>
    api.post<Proveedor>("/proveedores", data),

  update: (id: string, data: UpdateProveedorInput) =>
    api.patch<Proveedor>(`/proveedores/${id}`, data),

  remove: (id: string) =>
    api.del<Proveedor>(`/proveedores/${id}`),

  restore: (id: string) =>
    api.patch<Proveedor>(`/proveedores/${id}/restaurar`),
}
