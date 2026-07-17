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

interface CrudTableProps<T extends { id: string }> {
  columns: ColumnDef<T>[]
  data: T[]
  isLoading?: boolean
  emptyMessage?: string
  pageSize?: number
  pagination?: PaginationMetadata
  onPaginationChange?: (offset: number) => void
}

export function CrudTable<T extends { id: string }>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "Sin resultados.",
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
  const showPagination = usesServerPagination
    ? !!pagination && (pagination.offset > 0 || pagination.hasMore)
    : table.getPageCount() > 1

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

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
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
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Página {usesServerPagination ? serverPage : table.getState().pagination.pageIndex + 1} de{" "}
            {usesServerPagination ? serverPageCount : table.getPageCount()}
          </div>
          <div className="flex items-center gap-2">
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
