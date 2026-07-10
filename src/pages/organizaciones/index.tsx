import { useState } from "react"
import { IconDotsVertical, IconPlus } from "@tabler/icons-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { useOrganizaciones, useDeleteOrganizacion, useRestoreOrganizacion } from "@/hooks/useOrganizaciones"
import { ApiError } from "@/lib/api"
import type { Organizacion } from "@/types/organizacion"
import { PageHeader } from "@/components/shared/PageHeader"
import { SearchInput } from "@/components/shared/SearchInput"
import { CrudTable } from "@/components/shared/CrudTable"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { OrganizacionForm } from "./OrganizacionForm"

export default function OrganizacionesPage() {
  const [nombre, setNombre] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Organizacion | undefined>(undefined)
  const [deactivating, setDeactivating] = useState<Organizacion | undefined>(undefined)

  const { data: organizaciones, isLoading } = useOrganizaciones(nombre ? { nombre } : undefined)
  const deleteOrganizacion = useDeleteOrganizacion()
  const restoreOrganizacion = useRestoreOrganizacion()

  function handleRestore(organizacion: Organizacion) {
    restoreOrganizacion.mutate(organizacion.id, {
      onSuccess: () => toast.success("Organización restaurada"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo restaurar la organización"),
    })
  }

  function confirmDeactivate() {
    if (!deactivating) return
    deleteOrganizacion.mutate(deactivating.id, {
      onSuccess: () => {
        toast.success("Organización desactivada")
        setDeactivating(undefined)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo desactivar la organización"),
    })
  }

  const columns: ColumnDef<Organizacion>[] = [
    { accessorKey: "codigo", header: "Código" },
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "plan", header: "Plan", cell: ({ row }) => <Badge variant="outline">{row.original.plan}</Badge> },
    { accessorKey: "activo", header: "Estado", cell: ({ row }) => <StatusBadge activo={row.original.activo} /> },
    {
      id: "actions",
      cell: ({ row }) => {
        const organizacion = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <IconDotsVertical />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => { setEditing(organizacion); setFormOpen(true) }}>
                Editar
              </DropdownMenuItem>
              {organizacion.activo ? (
                <DropdownMenuItem variant="destructive" onClick={() => setDeactivating(organizacion)}>
                  Desactivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleRestore(organizacion)}>Restaurar</DropdownMenuItem>
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
        title="Organizaciones"
        description="Administra las organizaciones (tenants) del sistema."
        action={
          <Button onClick={() => { setEditing(undefined); setFormOpen(true) }}>
            <IconPlus />
            Crear Organización
          </Button>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <SearchInput value={nombre} onChange={setNombre} placeholder="Buscar por nombre..." className="max-w-xs" />
        <CrudTable columns={columns} data={organizaciones ?? []} isLoading={isLoading} emptyMessage="Sin organizaciones registradas." />
      </div>

      <OrganizacionForm open={formOpen} onOpenChange={setFormOpen} organizacion={editing} />
      <ConfirmDialog
        open={!!deactivating}
        onOpenChange={(open) => !open && setDeactivating(undefined)}
        title="¿Desactivar organización?"
        description={`La organización "${deactivating?.nombre}" quedará marcada como inactiva.`}
        confirmLabel="Desactivar"
        variant="destructive"
        isLoading={deleteOrganizacion.isPending}
        onConfirm={confirmDeactivate}
      />
    </div>
  )
}
