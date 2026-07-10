import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { organizacionesService } from "@/services/organizaciones"
import type { CreateOrganizacionInput, UpdateOrganizacionInput } from "@/types/organizacion"

export const organizacionesKeys = {
  all: ["organizaciones"] as const,
  lists: () => [...organizacionesKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...organizacionesKeys.lists(), filters] as const,
  details: () => [...organizacionesKeys.all, "detail"] as const,
  detail: (id: string) => [...organizacionesKeys.details(), id] as const,
}

export function useOrganizaciones(filters?: Record<string, string>) {
  return useQuery({
    queryKey: organizacionesKeys.list(filters ?? {}),
    queryFn: () => organizacionesService.list(filters),
  })
}

export function useOrganizacion(id: string) {
  return useQuery({
    queryKey: organizacionesKeys.detail(id),
    queryFn: () => organizacionesService.getById(id),
    enabled: !!id,
  })
}

export function useCreateOrganizacion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateOrganizacionInput) => organizacionesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizacionesKeys.lists() })
    },
  })
}

export function useUpdateOrganizacion(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateOrganizacionInput) => organizacionesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizacionesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: organizacionesKeys.detail(id) })
    },
  })
}

export function useDeleteOrganizacion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => organizacionesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizacionesKeys.lists() })
    },
  })
}

export function useRestoreOrganizacion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => organizacionesService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizacionesKeys.lists() })
    },
  })
}
