import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { usuariosService } from "@/services/usuarios"
import { fetchPaginatedItems, selectPaginatedItems, withDefaultPagination } from "@/lib/pagination"
import type {
  CreateUsuarioInput,
  UpdateUsuarioAlcanceInput,
  UpdateUsuarioRolInput,
  ResetPasswordInput,
} from "@/types/usuario"

export const usuariosKeys = {
  all: ["usuarios"] as const,
  lists: () => [...usuariosKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...usuariosKeys.lists(), filters] as const,
  alcances: () => [...usuariosKeys.all, "alcance"] as const,
  alcance: (id: string) => [...usuariosKeys.alcances(), id] as const,
}

export function useUsuarios(filters?: Record<string, string>) {
  const params = withDefaultPagination(filters)
  return useQuery({
    queryKey: usuariosKeys.list(params),
    queryFn: () => fetchPaginatedItems(usuariosService.list, filters),
    select: selectPaginatedItems,
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

export function useUsuarioAlcance(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: usuariosKeys.alcance(id),
    queryFn: () => usuariosService.getAlcance(id),
    enabled: !!id && (options?.enabled ?? true),
  })
}

export function useUpdateUsuarioAlcance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUsuarioAlcanceInput }) =>
      usuariosService.updateAlcance(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(usuariosKeys.alcance(data.usuarioId), data)
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
