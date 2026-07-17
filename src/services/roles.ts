import { api } from "@/lib/api"
import type { PaginatedData } from "@/types/common"
import type { Rol, Permiso, CreateRolInput, UpdateRolInput, CreatePermisoInput, AssignPermisoInput } from "@/types/rol"

export const rolesService = {
  list: () =>
    api.get<PaginatedData<Rol>>("/roles"),

  create: (data: CreateRolInput) =>
    api.post<Rol>("/roles", data),

  update: (id: string, data: UpdateRolInput) =>
    api.patch<Rol>(`/roles/${id}`, data),

  getPermisos: (id: string) =>
    api.get<PaginatedData<Permiso>>(`/roles/${id}/permisos`),

  assignPermiso: (id: string, data: AssignPermisoInput) =>
    api.post(`/roles/${id}/permisos`, data),

  removePermiso: (rolId: string, permisoId: string) =>
    api.del(`/roles/${rolId}/permisos/${permisoId}`),
}

export const permisosService = {
  list: () =>
    api.get<PaginatedData<Permiso>>("/permisos"),

  create: (data: CreatePermisoInput) =>
    api.post<Permiso>("/permisos", data),
}
