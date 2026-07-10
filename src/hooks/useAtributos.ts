import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { atributosService } from "@/services/atributos"
import type {
  CreateAtributoInput,
  UpdateAtributoInput,
  CreateAtributoValorInput,
  UpdateAtributoValorInput,
} from "@/types/atributo"

export const atributosKeys = {
  all: ["atributos"] as const,
  lists: () => [...atributosKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...atributosKeys.lists(), filters] as const,
  details: () => [...atributosKeys.all, "detail"] as const,
  detail: (id: string) => [...atributosKeys.details(), id] as const,
  valores: (id: string) => [...atributosKeys.all, id, "valores"] as const,
}

export function useAtributos(filters?: Record<string, string>) {
  return useQuery({
    queryKey: atributosKeys.list(filters ?? {}),
    queryFn: () => atributosService.list(filters),
  })
}

export function useAtributo(id: string) {
  return useQuery({
    queryKey: atributosKeys.detail(id),
    queryFn: () => atributosService.getById(id),
    enabled: !!id,
  })
}

export function useCreateAtributo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAtributoInput) => atributosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: atributosKeys.lists() })
    },
  })
}

export function useUpdateAtributo(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateAtributoInput) => atributosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: atributosKeys.lists() })
      queryClient.invalidateQueries({ queryKey: atributosKeys.detail(id) })
    },
  })
}

export function useDeleteAtributo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => atributosService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: atributosKeys.lists() })
    },
  })
}

export function useRestoreAtributo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => atributosService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: atributosKeys.lists() })
    },
  })
}

export function useAtributoValores(atributoId: string) {
  return useQuery({
    queryKey: atributosKeys.valores(atributoId),
    queryFn: () => atributosService.valores(atributoId),
    enabled: !!atributoId,
  })
}

export function useAddAtributoValor(atributoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAtributoValorInput) => atributosService.addValor(atributoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: atributosKeys.valores(atributoId) })
    },
  })
}

export function useUpdateAtributoValor(atributoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ valorId, data }: { valorId: string; data: UpdateAtributoValorInput }) =>
      atributosService.updateValor(valorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: atributosKeys.valores(atributoId) })
    },
  })
}

export function useRemoveAtributoValor(atributoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (valorId: string) => atributosService.removeValor(valorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: atributosKeys.valores(atributoId) })
    },
  })
}

export function useRestoreAtributoValor(atributoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (valorId: string) => atributosService.restoreValor(valorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: atributosKeys.valores(atributoId) })
    },
  })
}
