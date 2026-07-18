import type { PaginatedData, PaginationMetadata } from "@/types/common"
import type { QueryParams } from "@/lib/api"

export type PaginatedItems<T> = T[] & {
  pagination: PaginationMetadata
}

export const DEFAULT_LIST_LIMIT = 200

export function withDefaultPagination<T extends QueryParams = Record<string, string>>(
  filters?: T
): T & { limit: string; offset: string } {
  return {
    limit: String(DEFAULT_LIST_LIMIT),
    offset: "0",
    ...(filters ?? {}),
  } as T & { limit: string; offset: string }
}

export async function fetchPaginatedItems<T, P extends QueryParams = Record<string, string>>(
  fetchPage: (params: P) => Promise<PaginatedData<T>>,
  filters?: P
): Promise<PaginatedData<T>> {
  if (filters?.limit !== undefined || filters?.offset !== undefined) {
    return fetchPage(withDefaultPagination(filters) as unknown as P)
  }

  const items: T[] = []
  let offset = 0
  let total: number | undefined

  while (true) {
    const page = await fetchPage({
      ...(filters ?? {}),
      limit: String(DEFAULT_LIST_LIMIT),
      offset: String(offset),
    } as unknown as P)
    const pageItems = Array.isArray(page.items) ? page.items : []
    items.push(...pageItems)
    total = page.pagination?.total ?? items.length

    if (!page.pagination?.hasMore || pageItems.length === 0) break

    const nextOffset = offset + pageItems.length
    if (nextOffset <= offset) break
    offset = nextOffset
  }

  return {
    items,
    pagination: {
      limit: items.length || DEFAULT_LIST_LIMIT,
      offset: 0,
      count: items.length,
      total: total ?? items.length,
      hasMore: false,
    },
  }
}

export function selectPaginatedItems<T>(
  data: PaginatedData<T> | T[]
): PaginatedItems<T> {
  if (Array.isArray(data)) {
    return Object.assign([...data], {
      pagination: {
        limit: data.length || DEFAULT_LIST_LIMIT,
        offset: 0,
        count: data.length,
        total: data.length,
        hasMore: false,
      },
    })
  }

  const items = Array.isArray(data.items) ? data.items : []
  const pagination = data.pagination?.limit > 0
    ? data.pagination
    : {
        limit: items.length || DEFAULT_LIST_LIMIT,
        offset: 0,
        count: items.length,
        total: items.length,
        hasMore: false,
      }
  return Object.assign([...items], { pagination })
}
