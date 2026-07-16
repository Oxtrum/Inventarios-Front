import { api } from "@/lib/api"
import type { PaginatedData } from "@/types/common"
import type {
  Atributo,
  CreateAtributoInput,
  UpdateAtributoInput,
  AtributoValor,
  CreateAtributoValorInput,
  UpdateAtributoValorInput,
} from "@/types/atributo"

export const atributosService = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedData<Atributo>>("/atributos", { params }),

  getById: (id: string) =>
    api.get<Atributo>(`/atributos/${id}`),

  create: (data: CreateAtributoInput) =>
    api.post<Atributo>("/atributos", data),

  update: (id: string, data: UpdateAtributoInput) =>
    api.patch<Atributo>(`/atributos/${id}`, data),

  remove: (id: string) =>
    api.del<Atributo>(`/atributos/${id}`),

  restore: (id: string) =>
    api.patch<Atributo>(`/atributos/${id}/restaurar`),

  valores: (id: string) =>
    api.get<AtributoValor[]>(`/atributos/${id}/valores`),

  addValor: (id: string, data: CreateAtributoValorInput) =>
    api.post<AtributoValor>(`/atributos/${id}/valores`, data),

  updateValor: (valorId: string, data: UpdateAtributoValorInput) =>
    api.patch<AtributoValor>(`/atributo-valores/${valorId}`, data),

  removeValor: (valorId: string) =>
    api.del<AtributoValor>(`/atributo-valores/${valorId}`),

  restoreValor: (valorId: string) =>
    api.patch<AtributoValor>(`/atributo-valores/${valorId}/restaurar`),
}
