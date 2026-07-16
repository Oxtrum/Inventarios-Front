import { api } from "@/lib/api"
import type { PaginatedData } from "@/types/common"
import type { Transferencia, CreateTransferenciaInput } from "@/types/transferencia"

export const transferenciasService = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedData<Transferencia>>("/transferencias", { params }),

  getById: (id: string) =>
    api.get<Transferencia>(`/transferencias/${id}`),

  create: (data: CreateTransferenciaInput) =>
    api.post<Transferencia>("/transferencias", data),

  anular: (id: string) =>
    api.patch<Transferencia>(`/transferencias/${id}/anular`),
}
