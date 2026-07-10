import { useQuery } from "@tanstack/react-query"
import { tiposNegocioService } from "@/services/tiposNegocio"

export const tiposNegocioKeys = {
  all: ["tiposNegocio"] as const,
  lists: () => [...tiposNegocioKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...tiposNegocioKeys.lists(), filters] as const,
}

export function useTiposNegocio(filters?: Record<string, string>) {
  return useQuery({
    queryKey: tiposNegocioKeys.list(filters ?? {}),
    queryFn: () => tiposNegocioService.list(filters),
  })
}
