import { api } from "@/lib/api"
import type { PaginatedData } from "@/types/common"
import type {
  Usuario,
  UsuarioAlcance,
  CreateUsuarioInput,
  UpdateUsuarioAlcanceInput,
  UpdateUsuarioRolInput,
  ResetPasswordInput,
} from "@/types/usuario"

export const usuariosService = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedData<Usuario>>("/usuarios", { params }),

  create: (data: CreateUsuarioInput) =>
    api.post<Usuario>("/usuarios", data),

  getAlcance: (id: string) =>
    api.get<UsuarioAlcance>(`/usuarios/${id}/sucursales`),

  updateAlcance: (id: string, data: UpdateUsuarioAlcanceInput) =>
    api.put<UsuarioAlcance>(`/usuarios/${id}/alcance`, data),

  deactivate: (id: string) =>
    api.patch<Usuario>(`/usuarios/${id}/desactivar`),

  restore: (id: string) =>
    api.patch<Usuario>(`/usuarios/${id}/restaurar`),

  updateRol: (id: string, data: UpdateUsuarioRolInput) =>
    api.patch<Usuario>(`/usuarios/${id}/rol`, data),

  resetPassword: (id: string, data: ResetPasswordInput) =>
    api.patch<Usuario>(`/usuarios/${id}/contrasena`, data),
}
