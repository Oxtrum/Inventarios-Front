import type { PaginatedData } from "@/types/common"

export function selectPaginatedItems<T>(
  data: PaginatedData<T> | T[]
): T[] {
  if (Array.isArray(data)) return data
  return Array.isArray(data.items) ? data.items : []
}
