import { useState } from "react"
import { IconDotsVertical, IconPlus } from "@tabler/icons-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { useCategorias, useDeleteCategoria, useRestoreCategoria } from "@/hooks/useCategorias"
import { ApiError } from "@/lib/api"
import type { Categoria } from "@/types/categoria"
import { PageHeader } from "@/components/shared/PageHeader"
import { SearchInput } from "@/components/shared/SearchInput"
import { CrudTable } from "@/components/shared/CrudTable"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CategoriaForm } from "./CategoriaForm"

export default function CategoriasPage() {
  const [nombre, setNombre] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Categoria | undefined>(undefined)
  const [deactivating, setDeactivating] = useState<Categoria | undefined>(undefined)

  const { data: categorias, isLoading } = useCategorias(nombre ? { nombre } : undefined)
  const deleteCategoria = useDeleteCategoria()
  const restoreCategoria = useRestoreCategoria()

  function handleRestore(categoria: Categoria) {
    restoreCategoria.mutate(categoria.id, {
      onSuccess: () => toast.success("Categoría restaurada"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo restaurar la categoría"),
    })
  }

  function confirmDeactivate() {
    if (!deactivating) return
    deleteCategoria.mutate(deactivating.id, {
      onSuccess: () => {
        toast.success("Categoría desactivada")
        setDeactivating(undefined)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo desactivar la categoría"),
    })
  }

  const columns: ColumnDef<Categoria>[] = [
    { accessorKey: "codigo", header: "Código" },
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "descripcion", header: "Descripción", cell: ({ row }) => row.original.descripcion ?? "—" },
    { accessorKey: "activo", header: "Estado", cell: ({ row }) => <StatusBadge activo={row.original.activo} /> },
    {
      id: "actions",
      cell: ({ row }) => {
        const categoria = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <IconDotsVertical />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => { setEditing(categoria); setFormOpen(true) }}>
                Editar
              </DropdownMenuItem>
              {categoria.activo ? (
                <DropdownMenuItem variant="destructive" onClick={() => setDeactivating(categoria)}>
                  Desactivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleRestore(categoria)}>Restaurar</DropdownMenuItem>
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
        title="Categorías"
        description="Organiza tus productos por categoría."
        action={
          <Button onClick={() => { setEditing(undefined); setFormOpen(true) }}>
            <IconPlus />
            Crear Categoría
          </Button>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <SearchInput value={nombre} onChange={setNombre} placeholder="Buscar por nombre..." className="max-w-xs" />
        <CrudTable columns={columns} data={categorias ?? []} isLoading={isLoading} emptyMessage="Sin categorías registradas." />
      </div>

      <CategoriaForm open={formOpen} onOpenChange={setFormOpen} categoria={editing} />
      <ConfirmDialog
        open={!!deactivating}
        onOpenChange={(open) => !open && setDeactivating(undefined)}
        title="¿Desactivar categoría?"
        description={`La categoría "${deactivating?.nombre}" quedará marcada como inactiva.`}
        confirmLabel="Desactivar"
        variant="destructive"
        isLoading={deleteCategoria.isPending}
        onConfirm={confirmDeactivate}
      />
    </div>
  )
}
