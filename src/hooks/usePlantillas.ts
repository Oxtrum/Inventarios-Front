import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { plantillasService } from "@/services/plantillas"
import { tiposProductoKeys } from "@/hooks/useTiposProducto"
import { atributosKeys } from "@/hooks/useAtributos"
import type { AplicarPlantillaInput } from "@/types/plantilla"

export const plantillasKeys = {
  all: ["plantillas"] as const,
  detalle: (tipoNegocioId: string) => [...plantillasKeys.all, tipoNegocioId] as const,
}

export function useDetallePlantilla(tipoNegocioId: string) {
  return useQuery({
    queryKey: plantillasKeys.detalle(tipoNegocioId),
    queryFn: () => plantillasService.getDetalle(tipoNegocioId),
    enabled: !!tipoNegocioId,
  })
}

export function useAplicarPlantilla(tipoNegocioId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AplicarPlantillaInput) => plantillasService.aplicar(tipoNegocioId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposProductoKeys.lists() })
      queryClient.invalidateQueries({ queryKey: atributosKeys.lists() })
    },
  })
}
