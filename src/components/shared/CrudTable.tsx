import type { ReactNode } from "react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import type { PaginationMetadata } from "@/types/common"
import { describeError } from "@/lib/apiErrors"

interface CrudTableProps<T extends { id: string }> {
  columns: ColumnDef<T>[]
  data: T[]
  isLoading?: boolean
  isError?: boolean
  error?: unknown
  onRetry?: () => void
  emptyMessage?: string
  emptyAction?: ReactNode
  caption?: string
  pageSize?: number
  pagination?: PaginationMetadata
  onPaginationChange?: (offset: number) => void
}

export function CrudTable<T extends { id: string }>({
  columns,
  data,
  isLoading = false,
  isError = false,
  error,
  onRetry,
  emptyMessage = "Sin resultados.",
  emptyAction,
  caption,
  pageSize = 10,
  pagination,
  onPaginationChange,
}: CrudTableProps<T>) {
  const usesServerPagination = !!pagination && !!onPaginationChange
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    ...(usesServerPagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    initialState: { pagination: { pageSize } },
  })

  const serverPage = pagination
    ? Math.floor(pagination.offset / pagination.limit) + 1
    : 1
  const serverPageCount = pagination
    ? Math.max(serverPage, Math.ceil(pagination.total / pagination.limit), 1)
    : 1
  const showPagination = !isError && (usesServerPagination
    ? !!pagination && (pagination.offset > 0 || pagination.hasMore)
    : table.getPageCount() > 1)

  function previousPage() {
    if (usesServerPagination && pagination && onPaginationChange) {
      onPaginationChange(Math.max(0, pagination.offset - pagination.limit))
      return
    }
    table.previousPage()
  }

  function nextPage() {
    if (usesServerPagination && pagination && onPaginationChange) {
      onPaginationChange(pagination.offset + pagination.limit)
      return
    }
    table.nextPage()
  }
  const { pageIndex, pageSize: currentPageSize } = table.getState().pagination
  const desde = data.length === 0
    ? 0
    : usesServerPagination
      ? (pagination?.offset ?? 0) + 1
      : pageIndex * currentPageSize + 1
  const hasta = usesServerPagination
    ? (pagination?.offset ?? 0) + data.length
    : Math.min((pageIndex + 1) * currentPageSize, data.length)
  const skeletonRows = Math.min(pageSize, 5)

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          {caption && <caption className="sr-only">{caption}</caption>}
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} scope="col">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-32 p-0">
                  <div
                    role="alert"
                    className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center"
                  >
                    <p className="text-sm font-medium">
                      No pudimos cargar los datos
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {describeError(error)}
                    </p>
                    {onRetry && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-1"
                        onClick={onRetry}
                      >
                        Reintentar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-24 p-0">
                  <div className="flex flex-col items-center justify-center gap-2 px-4 py-6 text-center text-muted-foreground">
                    <span className="text-sm">{emptyMessage}</span>
                    {emptyAction}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm tabular-nums text-muted-foreground">
            {desde}–{hasta} de {usesServerPagination ? pagination?.total : data.length}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm tabular-nums text-muted-foreground">
              Página {usesServerPagination ? serverPage : pageIndex + 1} de {usesServerPagination ? serverPageCount : table.getPageCount()}
            </span>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={previousPage}
              disabled={usesServerPagination ? serverPage <= 1 : !table.getCanPreviousPage()}
            >
              <span className="sr-only">Página anterior</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={nextPage}
              disabled={usesServerPagination ? !pagination?.hasMore : !table.getCanNextPage()}
            >
              <span className="sr-only">Página siguiente</span>
              <IconChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
