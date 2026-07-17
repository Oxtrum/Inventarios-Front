import { useQuery } from "@tanstack/react-query"
import { tiposNegocioService } from "@/services/tiposNegocio"
import { fetchPaginatedItems, selectPaginatedItems, withDefaultPagination } from "@/lib/pagination"

export const tiposNegocioKeys = {
  all: ["tiposNegocio"] as const,
  lists: () => [...tiposNegocioKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...tiposNegocioKeys.lists(), filters] as const,
}

export function useTiposNegocio(filters?: Record<string, string>) {
  const params = withDefaultPagination(filters)
  return useQuery({
    queryKey: tiposNegocioKeys.list(params),
    queryFn: () => fetchPaginatedItems(tiposNegocioService.list, filters),
    select: selectPaginatedItems,
  })
}
