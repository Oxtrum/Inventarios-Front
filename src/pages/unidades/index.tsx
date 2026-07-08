import { useState } from "react"
import { IconDotsVertical, IconPlus } from "@tabler/icons-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { useUnidades, useDeleteUnidad, useRestoreUnidad } from "@/hooks/useUnidades"
import { ApiError } from "@/lib/api"
import type { Unidad } from "@/types/unidad"
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
import { UnidadForm } from "./UnidadForm"

export default function UnidadesPage() {
  const [nombre, setNombre] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Unidad | undefined>(undefined)
  const [deactivating, setDeactivating] = useState<Unidad | undefined>(undefined)

  const { data: unidades, isLoading } = useUnidades(nombre ? { nombre } : undefined)
  const deleteUnidad = useDeleteUnidad()
  const restoreUnidad = useRestoreUnidad()

  function handleRestore(unidad: Unidad) {
    restoreUnidad.mutate(unidad.id, {
      onSuccess: () => toast.success("Unidad restaurada"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo restaurar la unidad"),
    })
  }

  function confirmDeactivate() {
    if (!deactivating) return
    deleteUnidad.mutate(deactivating.id, {
      onSuccess: () => {
        toast.success("Unidad desactivada")
        setDeactivating(undefined)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo desactivar la unidad"),
    })
  }

  const columns: ColumnDef<Unidad>[] = [
    { accessorKey: "simbolo", header: "Símbolo" },
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "precision", header: () => <div className="text-right">Precisión</div>, cell: ({ row }) => <div className="text-right">{row.original.precision}</div> },
    { accessorKey: "activo", header: "Estado", cell: ({ row }) => <StatusBadge activo={row.original.activo} /> },
    {
      id: "actions",
      cell: ({ row }) => {
        const unidad = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <IconDotsVertical />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => { setEditing(unidad); setFormOpen(true) }}>
                Editar
              </DropdownMenuItem>
              {unidad.activo ? (
                <DropdownMenuItem variant="destructive" onClick={() => setDeactivating(unidad)}>
                  Desactivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleRestore(unidad)}>Restaurar</DropdownMenuItem>
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
        title="Unidades"
        description="Unidades de medida para tus productos."
        action={
          <Button onClick={() => { setEditing(undefined); setFormOpen(true) }}>
            <IconPlus />
            Crear Unidad
          </Button>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <SearchInput value={nombre} onChange={setNombre} placeholder="Buscar por nombre..." className="max-w-xs" />
        <CrudTable columns={columns} data={unidades ?? []} isLoading={isLoading} emptyMessage="Sin unidades registradas." />
      </div>

      <UnidadForm open={formOpen} onOpenChange={setFormOpen} unidad={editing} />
      <ConfirmDialog
        open={!!deactivating}
        onOpenChange={(open) => !open && setDeactivating(undefined)}
        title="¿Desactivar unidad?"
        description={`La unidad "${deactivating?.nombre}" quedará marcada como inactiva.`}
        confirmLabel="Desactivar"
        variant="destructive"
        isLoading={deleteUnidad.isPending}
        onConfirm={confirmDeactivate}
      />
    </div>
  )
}
