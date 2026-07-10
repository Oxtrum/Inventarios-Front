import { useState } from "react"
import { IconDotsVertical, IconPlus } from "@tabler/icons-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { useTiposNegocio, useDeleteTipoNegocio, useRestoreTipoNegocio } from "@/hooks/useTiposNegocio"
import { ApiError } from "@/lib/api"
import type { TipoNegocio } from "@/types/tipoNegocio"
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
import { TipoNegocioForm } from "./TipoNegocioForm"

export default function TiposNegocioPage() {
  const [nombre, setNombre] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<TipoNegocio | undefined>(undefined)
  const [deactivating, setDeactivating] = useState<TipoNegocio | undefined>(undefined)

  const { data: tiposNegocio, isLoading } = useTiposNegocio(nombre ? { nombre } : undefined)
  const deleteTipoNegocio = useDeleteTipoNegocio()
  const restoreTipoNegocio = useRestoreTipoNegocio()

  function handleRestore(tipoNegocio: TipoNegocio) {
    restoreTipoNegocio.mutate(tipoNegocio.id, {
      onSuccess: () => toast.success("Tipo de negocio restaurado"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo restaurar el tipo de negocio"),
    })
  }

  function confirmDeactivate() {
    if (!deactivating) return
    deleteTipoNegocio.mutate(deactivating.id, {
      onSuccess: () => {
        toast.success("Tipo de negocio desactivado")
        setDeactivating(undefined)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo desactivar el tipo de negocio"),
    })
  }

  const columns: ColumnDef<TipoNegocio>[] = [
    { accessorKey: "codigo", header: "Código" },
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "descripcion", header: "Descripción", cell: ({ row }) => row.original.descripcion ?? "—" },
    { accessorKey: "activo", header: "Estado", cell: ({ row }) => <StatusBadge activo={row.original.activo} /> },
    {
      id: "actions",
      cell: ({ row }) => {
        const tipoNegocio = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <IconDotsVertical />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => { setEditing(tipoNegocio); setFormOpen(true) }}>
                Editar
              </DropdownMenuItem>
              {tipoNegocio.activo ? (
                <DropdownMenuItem variant="destructive" onClick={() => setDeactivating(tipoNegocio)}>
                  Desactivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleRestore(tipoNegocio)}>Restaurar</DropdownMenuItem>
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
        title="Tipos de Negocio"
        description="Catálogo global de tipos de negocio usado por las plantillas."
        action={
          <Button onClick={() => { setEditing(undefined); setFormOpen(true) }}>
            <IconPlus />
            Crear Tipo de Negocio
          </Button>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <SearchInput value={nombre} onChange={setNombre} placeholder="Buscar por nombre..." className="max-w-xs" />
        <CrudTable columns={columns} data={tiposNegocio ?? []} isLoading={isLoading} emptyMessage="Sin tipos de negocio registrados." />
      </div>

      <TipoNegocioForm open={formOpen} onOpenChange={setFormOpen} tipoNegocio={editing} />
      <ConfirmDialog
        open={!!deactivating}
        onOpenChange={(open) => !open && setDeactivating(undefined)}
        title="¿Desactivar tipo de negocio?"
        description={`El tipo de negocio "${deactivating?.nombre}" quedará marcado como inactivo.`}
        confirmLabel="Desactivar"
        variant="destructive"
        isLoading={deleteTipoNegocio.isPending}
        onConfirm={confirmDeactivate}
      />
    </div>
  )
}
