import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { rolesService, permisosService } from "@/services/roles"
import { fetchPaginatedItems, selectPaginatedItems, withDefaultPagination } from "@/lib/pagination"
import type { CreateRolInput, UpdateRolInput, CreatePermisoInput, AssignPermisoInput } from "@/types/rol"

export const rolesKeys = {
  all: ["roles"] as const,
  lists: () => [...rolesKeys.all, "list"] as const,
  permisos: (rolId: string) => [...rolesKeys.all, rolId, "permisos"] as const,
}

export const permisosKeys = {
  all: ["permisos"] as const,
  lists: () => [...permisosKeys.all, "list"] as const,
}

export function useRoles(filters?: Record<string, string>) {
  const params = withDefaultPagination(filters)
  return useQuery({
    queryKey: [...rolesKeys.lists(), params],
    queryFn: () => fetchPaginatedItems(rolesService.list, filters),
    select: selectPaginatedItems,
  })
}

export function useCreateRol() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRolInput) => rolesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() })
    },
  })
}

export function useUpdateRol(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateRolInput) => rolesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() })
    },
  })
}

export function useRolPermisos(rolId: string, filters?: Record<string, string>) {
  const params = withDefaultPagination(filters)
  return useQuery({
    queryKey: [...rolesKeys.permisos(rolId), params],
    queryFn: () => fetchPaginatedItems((pageParams) => rolesService.getPermisos(rolId, pageParams), filters),
    select: selectPaginatedItems,
    enabled: !!rolId,
  })
}

export function useAssignPermiso(rolId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AssignPermisoInput) => rolesService.assignPermiso(rolId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.permisos(rolId) })
    },
  })
}

export function useRemovePermiso(rolId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (permisoId: string) => rolesService.removePermiso(rolId, permisoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.permisos(rolId) })
    },
  })
}

export function usePermisos(filters?: Record<string, string>) {
  const params = withDefaultPagination(filters)
  return useQuery({
    queryKey: [...permisosKeys.lists(), params],
    queryFn: () => fetchPaginatedItems(permisosService.list, filters),
    select: selectPaginatedItems,
  })
}

export function useCreatePermiso() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePermisoInput) => permisosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permisosKeys.lists() })
    },
  })
}
