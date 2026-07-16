import type { PaginatedData } from "@/types/common"

export function selectPaginatedItems<T>(data: PaginatedData<T>): T[] {
  return data.items
}
