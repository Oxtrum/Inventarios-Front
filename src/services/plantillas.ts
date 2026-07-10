import { api } from "@/lib/api"
import type { PlantillaDetalle, AplicarPlantillaInput, AplicarPlantillaResult } from "@/types/plantilla"

export const plantillasService = {
  getDetalle: (tipoNegocioId: string) =>
    api.get<PlantillaDetalle>(`/plantillas/tipos-negocio/${tipoNegocioId}`),

  aplicar: (tipoNegocioId: string, data: AplicarPlantillaInput) =>
    api.post<AplicarPlantillaResult>(`/plantillas/tipos-negocio/${tipoNegocioId}/aplicar`, data),
}
