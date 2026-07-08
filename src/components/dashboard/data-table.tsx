"use client"

import * as React from "react"
import {
  IconChevronLeft,
  IconChevronRight,
  IconDotsVertical,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import { toast } from "sonner"

import { useProductos, useDeleteProducto, useRestoreProducto } from "@/hooks/useProductos"
import { useCategorias } from "@/hooks/useCategorias"
import { ApiError } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import type { Producto } from "@/types/producto"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function ProductoActions({ producto }: { producto: Producto }) {
  const deleteProducto = useDeleteProducto()
  const restoreProducto = useRestoreProducto()

  function handleDelete() {
    if (!window.confirm(`¿Desactivar el producto "${producto.nombre}"?`)) return
    deleteProducto.mutate(producto.id, {
      onSuccess: () => toast.success("Producto desactivado"),
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "No se pudo desactivar el producto")
      },
    })
  }

  function handleRestore() {
    restoreProducto.mutate(producto.id, {
      onSuccess: () => toast.success("Producto restaurado"),
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "No se pudo restaurar el producto")
      },
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
          size="icon"
        >
          <IconDotsVertical />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem disabled>Editar</DropdownMenuItem>
        {producto.activo ? (
          <DropdownMenuItem variant="destructive" onClick={handleDelete}>
            Desactivar
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleRestore}>Restaurar</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function DataTable() {
  const { data: productos, isLoading } = useProductos()
  const { data: categorias } = useCategorias()

  const categoriaNombrePorId = React.useMemo(() => {
    const map = new Map<string, string>()
    for (const categoria of categorias ?? []) {
      map.set(categoria.id, categoria.nombre)
    }
    return map
  }, [categorias])

  const columns = React.useMemo<ColumnDef<Producto>[]>(
    () => [
      {
        accessorKey: "codigo",
        header: "Código",
        cell: ({ row }) => row.original.codigo ?? "—",
      },
      {
        accessorKey: "nombre",
        header: "Nombre",
      },
      {
        accessorKey: "categoriaId",
        header: "Categoría",
        cell: ({ row }) => {
          const categoriaId = row.original.categoriaId
          if (!categoriaId) return "—"
          return (
            <Badge variant="outline">
              {categoriaNombrePorId.get(categoriaId) ?? "—"}
            </Badge>
          )
        },
      },
      {
        accessorKey: "stockMinimo",
        header: () => <div className="text-right">Stock Mínimo</div>,
        cell: ({ row }) => (
          <div className="text-right">{row.original.stockMinimo}</div>
        ),
      },
      {
        accessorKey: "costo",
        header: () => <div className="text-right">Costo</div>,
        cell: ({ row }) => (
          <div className="text-right">{formatCurrency(row.original.costo)}</div>
        ),
      },
      {
        accessorKey: "precio",
        header: () => <div className="text-right">Precio</div>,
        cell: ({ row }) => (
          <div className="text-right">{formatCurrency(row.original.precio)}</div>
        ),
      },
      {
        accessorKey: "activo",
        header: "Estado",
        cell: ({ row }) => (
          <Badge variant={row.original.activo ? "default" : "outline"}>
            {row.original.activo ? "Activo" : "Inactivo"}
          </Badge>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => <ProductoActions producto={row.original} />,
      },
    ],
    [categoriaNombrePorId]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: productos ?? [],
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
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
            ) : table.getRowModel().rows?.length ? (
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Sin productos registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {Math.max(table.getPageCount(), 1)}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Ir a la página anterior</span>
            <IconChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Ir a la página siguiente</span>
            <IconChevronRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
