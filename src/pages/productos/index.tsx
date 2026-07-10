import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { IconAdjustments, IconDotsVertical, IconPlus } from "@tabler/icons-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { useProductos, useDeleteProducto, useRestoreProducto } from "@/hooks/useProductos"
import { useCategorias } from "@/hooks/useCategorias"
import { ApiError } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import type { Producto } from "@/types/producto"
import { PageHeader } from "@/components/shared/PageHeader"
import { SearchInput } from "@/components/shared/SearchInput"
import { CrudTable } from "@/components/shared/CrudTable"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProductoForm } from "./ProductoForm"

const ALL = "__all__"

export default function ProductosPage() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState("")
  const [categoriaId, setCategoriaId] = useState(ALL)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Producto | undefined>(undefined)
  const [deactivating, setDeactivating] = useState<Producto | undefined>(undefined)

  const { data: categorias } = useCategorias({})
  const { data: productos, isLoading } = useProductos({
    ...(nombre ? { nombre } : {}),
    ...(categoriaId !== ALL ? { categoriaId } : {}),
  })
  const deleteProducto = useDeleteProducto()
  const restoreProducto = useRestoreProducto()

  const categoriaNombrePorId = useMemo(() => {
    const map = new Map<string, string>()
    for (const categoria of categorias ?? []) map.set(categoria.id, categoria.nombre)
    return map
  }, [categorias])

  function handleCreate() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function handleEdit(producto: Producto) {
    setEditing(producto)
    setFormOpen(true)
  }

  function handleRestore(producto: Producto) {
    restoreProducto.mutate(producto.id, {
      onSuccess: () => toast.success("Producto restaurado"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo restaurar el producto"),
    })
  }

  function confirmDeactivate() {
    if (!deactivating) return
    deleteProducto.mutate(deactivating.id, {
      onSuccess: () => {
        toast.success("Producto desactivado")
        setDeactivating(undefined)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo desactivar el producto"),
    })
  }

  const columns: ColumnDef<Producto>[] = [
    { accessorKey: "codigo", header: "Código", cell: ({ row }) => row.original.codigo ?? "—" },
    { accessorKey: "nombre", header: "Nombre" },
    {
      accessorKey: "categoriaId",
      header: "Categoría",
      cell: ({ row }) => {
        const id = row.original.categoriaId
        return id ? <Badge variant="outline">{categoriaNombrePorId.get(id) ?? "—"}</Badge> : "—"
      },
    },
    {
      accessorKey: "stockMinimo",
      header: () => <div className="text-right">Stock Mínimo</div>,
      cell: ({ row }) => <div className="text-right">{row.original.stockMinimo}</div>,
    },
    {
      accessorKey: "costo",
      header: () => <div className="text-right">Costo</div>,
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.costo)}</div>,
    },
    {
      accessorKey: "precio",
      header: () => <div className="text-right">Precio</div>,
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.precio)}</div>,
    },
    {
      accessorKey: "activo",
      header: "Estado",
      cell: ({ row }) => <StatusBadge activo={row.original.activo} />,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const producto = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <IconDotsVertical />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleEdit(producto)}>Editar</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/productos/${producto.id}/variantes`)}>
                <IconAdjustments />
                Variantes
              </DropdownMenuItem>
              {producto.activo ? (
                <DropdownMenuItem variant="destructive" onClick={() => setDeactivating(producto)}>
                  Desactivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleRestore(producto)}>Restaurar</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title="Productos"
        description="Catálogo de productos de la organización."
        action={
          <Button onClick={handleCreate}>
            <IconPlus />
            Crear Producto
          </Button>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={nombre} onChange={setNombre} placeholder="Buscar por nombre..." className="max-w-xs" />
          <Select value={categoriaId} onValueChange={setCategoriaId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas las categorías</SelectItem>
              {(categorias ?? []).map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <CrudTable columns={columns} data={productos ?? []} isLoading={isLoading} emptyMessage="Sin productos registrados." />
      </div>

      <ProductoForm open={formOpen} onOpenChange={setFormOpen} producto={editing} />
      <ConfirmDialog
        open={!!deactivating}
        onOpenChange={(open) => !open && setDeactivating(undefined)}
        title="¿Desactivar producto?"
        description={`El producto "${deactivating?.nombre}" quedará marcado como inactivo. Podrás restaurarlo luego.`}
        confirmLabel="Desactivar"
        variant="destructive"
        isLoading={deleteProducto.isPending}
        onConfirm={confirmDeactivate}
      />
    </div>
  )
}
