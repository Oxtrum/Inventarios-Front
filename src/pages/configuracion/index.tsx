import { useMemo, useState } from "react"
import { IconDotsVertical, IconPlus } from "@tabler/icons-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { useConfiguraciones, useDeleteConfiguracion, useRestoreConfiguracion } from "@/hooks/useConfiguraciones"
import { useSucursales } from "@/hooks/useSucursales"
import { ApiError } from "@/lib/api"
import type { Configuracion } from "@/types/configuracion"
import { PageHeader } from "@/components/shared/PageHeader"
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
import { ConfiguracionForm } from "./ConfiguracionForm"

export default function ConfiguracionPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Configuracion | undefined>(undefined)
  const [deactivating, setDeactivating] = useState<Configuracion | undefined>(undefined)

  const { data: configuraciones, isLoading } = useConfiguraciones()
  const { data: sucursales } = useSucursales()
  const deleteConfiguracion = useDeleteConfiguracion()
  const restoreConfiguracion = useRestoreConfiguracion()

  const sucursalPorId = useMemo(() => new Map((sucursales ?? []).map((s) => [s.id, s.nombre])), [sucursales])

  function handleRestore(configuracion: Configuracion) {
    restoreConfiguracion.mutate(configuracion.id, {
      onSuccess: () => toast.success("Configuración restaurada"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo restaurar la configuración"),
    })
  }

  function confirmDeactivate() {
    if (!deactivating) return
    deleteConfiguracion.mutate(deactivating.id, {
      onSuccess: () => {
        toast.success("Configuración desactivada")
        setDeactivating(undefined)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo desactivar la configuración"),
    })
  }

  const columns: ColumnDef<Configuracion>[] = [
    { accessorKey: "clave", header: "Clave" },
    {
      accessorKey: "sucursalId",
      header: "Sucursal",
      cell: ({ row }) => (row.original.sucursalId ? sucursalPorId.get(row.original.sucursalId) ?? "—" : "Global"),
    },
    {
      accessorKey: "valor",
      header: "Valor",
      cell: ({ row }) => (
        <span className="block max-w-xs truncate font-mono text-xs text-muted-foreground">
          {JSON.stringify(row.original.valor)}
        </span>
      ),
    },
    { accessorKey: "activo", header: "Estado", cell: ({ row }) => <StatusBadge activo={row.original.activo} /> },
    {
      id: "actions",
      cell: ({ row }) => {
        const configuracion = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <IconDotsVertical />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => { setEditing(configuracion); setFormOpen(true) }}>
                Editar
              </DropdownMenuItem>
              {configuracion.activo ? (
                <DropdownMenuItem variant="destructive" onClick={() => setDeactivating(configuracion)}>
                  Desactivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleRestore(configuracion)}>Restaurar</DropdownMenuItem>
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
        title="Configuración"
        description="Parámetros de configuración por clave, globales o por sucursal."
        action={
          <Button onClick={() => { setEditing(undefined); setFormOpen(true) }}>
            <IconPlus />
            Crear Configuración
          </Button>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <CrudTable columns={columns} data={configuraciones ?? []} isLoading={isLoading} emptyMessage="Sin configuraciones registradas." />
      </div>

      <ConfiguracionForm open={formOpen} onOpenChange={setFormOpen} configuracion={editing} />
      <ConfirmDialog
        open={!!deactivating}
        onOpenChange={(open) => !open && setDeactivating(undefined)}
        title="¿Desactivar configuración?"
        description={`La configuración "${deactivating?.clave}" quedará marcada como inactiva.`}
        confirmLabel="Desactivar"
        variant="destructive"
        isLoading={deleteConfiguracion.isPending}
        onConfirm={confirmDeactivate}
      />
    </div>
  )
}
