import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { productoVariantesService, productoAtributosService } from "@/services/productoVariantes"
import type {
  CreateProductoVarianteInput,
  UpdateProductoVarianteInput,
  SetAtributoValorInput,
  UpdateAtributoValorAsignadoInput,
} from "@/types/productoVariante"

export const productoVariantesKeys = {
  all: ["productoVariantes"] as const,
  list: (productoId: string) => [...productoVariantesKeys.all, productoId] as const,
  varianteAtributos: (varianteId: string) => [...productoVariantesKeys.all, "atributos", varianteId] as const,
}

export const productoAtributosKeys = {
  all: ["productoAtributos"] as const,
  list: (productoId: string) => [...productoAtributosKeys.all, productoId] as const,
}

export function useProductoVariantes(productoId: string) {
  return useQuery({
    queryKey: productoVariantesKeys.list(productoId),
    queryFn: () => productoVariantesService.list(productoId),
    enabled: !!productoId,
  })
}

export function useCreateProductoVariante(productoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProductoVarianteInput) => productoVariantesService.create(productoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productoVariantesKeys.list(productoId) })
    },
  })
}

export function useUpdateProductoVariante(productoId: string, varianteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProductoVarianteInput) => productoVariantesService.update(varianteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productoVariantesKeys.list(productoId) })
    },
  })
}

export function useDeleteProductoVariante(productoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (varianteId: string) => productoVariantesService.remove(varianteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productoVariantesKeys.list(productoId) })
    },
  })
}

export function useRestoreProductoVariante(productoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (varianteId: string) => productoVariantesService.restore(varianteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productoVariantesKeys.list(productoId) })
    },
  })
}

export function useProductoAtributos(productoId: string) {
  return useQuery({
    queryKey: productoAtributosKeys.list(productoId),
    queryFn: () => productoAtributosService.list(productoId),
    enabled: !!productoId,
  })
}

export function useSetProductoAtributo(productoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SetAtributoValorInput) => productoAtributosService.set(productoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productoAtributosKeys.list(productoId) })
    },
  })
}

export function useUpdateProductoAtributo(productoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ atributoId, data }: { atributoId: string; data: UpdateAtributoValorAsignadoInput }) =>
      productoAtributosService.update(productoId, atributoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productoAtributosKeys.list(productoId) })
    },
  })
}

export function useRemoveProductoAtributo(productoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (atributoId: string) => productoAtributosService.remove(productoId, atributoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productoAtributosKeys.list(productoId) })
    },
  })
}

export function useVarianteAtributos(varianteId: string) {
  return useQuery({
    queryKey: productoVariantesKeys.varianteAtributos(varianteId),
    queryFn: () => productoVariantesService.varianteAtributos(varianteId),
    enabled: !!varianteId,
  })
}

export function useSetVarianteAtributo(varianteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SetAtributoValorInput) => productoVariantesService.setVarianteAtributo(varianteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productoVariantesKeys.varianteAtributos(varianteId) })
    },
  })
}

export function useRemoveVarianteAtributo(varianteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (atributoId: string) => productoVariantesService.removeVarianteAtributo(varianteId, atributoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productoVariantesKeys.varianteAtributos(varianteId) })
    },
  })
}
