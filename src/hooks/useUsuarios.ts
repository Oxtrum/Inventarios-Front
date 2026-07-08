import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { usuariosService } from "@/services/usuarios"
import type { CreateUsuarioInput, UpdateUsuarioRolInput, ResetPasswordInput } from "@/types/usuario"

export const usuariosKeys = {
  all: ["usuarios"] as const,
  lists: () => [...usuariosKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...usuariosKeys.lists(), filters] as const,
}

export function useUsuarios(filters?: Record<string, string>) {
  return useQuery({
    queryKey: usuariosKeys.list(filters ?? {}),
    queryFn: () => usuariosService.list(filters),
  })
}

export function useCreateUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUsuarioInput) => usuariosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() })
    },
  })
}

export function useDeactivateUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usuariosService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() })
    },
  })
}

export function useRestoreUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usuariosService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() })
    },
  })
}

export function useUpdateUsuarioRol() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUsuarioRolInput }) =>
      usuariosService.updateRol(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() })
    },
  })
}

export function useResetUsuarioPassword() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResetPasswordInput }) =>
      usuariosService.resetPassword(id, data),
  })
}
