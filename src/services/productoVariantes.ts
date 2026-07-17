import { api } from "@/lib/api"
import type { PaginatedData } from "@/types/common"
import type {
  ProductoVariante,
  CreateProductoVarianteInput,
  UpdateProductoVarianteInput,
  ProductoAtributoValor,
  SetAtributoValorInput,
  UpdateAtributoValorAsignadoInput,
} from "@/types/productoVariante"

export const productoVariantesService = {
  list: (productoId: string) =>
    api.get<PaginatedData<ProductoVariante>>(`/productos/${productoId}/variantes`),

  create: (productoId: string, data: CreateProductoVarianteInput) =>
    api.post<ProductoVariante>(`/productos/${productoId}/variantes`, data),

  getById: (id: string) =>
    api.get<ProductoVariante>(`/producto-variantes/${id}`),

  update: (id: string, data: UpdateProductoVarianteInput) =>
    api.patch<ProductoVariante>(`/producto-variantes/${id}`, data),

  remove: (id: string) =>
    api.del<ProductoVariante>(`/producto-variantes/${id}`),

  restore: (id: string) =>
    api.patch<ProductoVariante>(`/producto-variantes/${id}/restaurar`),

  varianteAtributos: (varianteId: string) =>
    api.get<PaginatedData<ProductoAtributoValor>>(`/producto-variantes/${varianteId}/atributos`),

  setVarianteAtributo: (varianteId: string, data: SetAtributoValorInput) =>
    api.post<ProductoAtributoValor>(`/producto-variantes/${varianteId}/atributos`, data),

  updateVarianteAtributo: (varianteId: string, atributoId: string, data: UpdateAtributoValorAsignadoInput) =>
    api.patch<ProductoAtributoValor>(`/producto-variantes/${varianteId}/atributos/${atributoId}`, data),

  removeVarianteAtributo: (varianteId: string, atributoId: string) =>
    api.del<void>(`/producto-variantes/${varianteId}/atributos/${atributoId}`),
}

export const productoAtributosService = {
  list: (productoId: string) =>
    api.get<PaginatedData<ProductoAtributoValor>>(`/productos/${productoId}/atributos`),

  set: (productoId: string, data: SetAtributoValorInput) =>
    api.post<ProductoAtributoValor>(`/productos/${productoId}/atributos`, data),

  update: (productoId: string, atributoId: string, data: UpdateAtributoValorAsignadoInput) =>
    api.patch<ProductoAtributoValor>(`/productos/${productoId}/atributos/${atributoId}`, data),

  remove: (productoId: string, atributoId: string) =>
    api.del<void>(`/productos/${productoId}/atributos/${atributoId}`),
}
