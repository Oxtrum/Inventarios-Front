import { api } from "@/lib/api"
import type { Categoria, CreateCategoriaInput, UpdateCategoriaInput } from "@/types/categoria"

export const categoriasService = {
  list: (params?: Record<string, string>) =>
    api.get<Categoria[]>("/categorias", { params }),

  getById: (id: string) =>
    api.get<Categoria>(`/categorias/${id}`),

  create: (data: CreateCategoriaInput) =>
    api.post<Categoria>("/categorias", data),

  update: (id: string, data: UpdateCategoriaInput) =>
    api.patch<Categoria>(`/categorias/${id}`, data),

  remove: (id: string) =>
    api.del<Categoria>(`/categorias/${id}`),

  restore: (id: string) =>
    api.patch<Categoria>(`/categorias/${id}/restaurar`),
}
