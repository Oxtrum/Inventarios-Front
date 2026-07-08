import { useState } from "react"
import { IconDotsVertical, IconPlus } from "@tabler/icons-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { useProveedores, useDeleteProveedor, useRestoreProveedor } from "@/hooks/useProveedores"
import { ApiError } from "@/lib/api"
import type { Proveedor } from "@/types/proveedor"
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
import { ProveedorForm } from "./ProveedorForm"

export default function ProveedoresPage() {
  const [nombre, setNombre] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Proveedor | undefined>(undefined)
  const [deactivating, setDeactivating] = useState<Proveedor | undefined>(undefined)

  const { data: proveedores, isLoading } = useProveedores(nombre ? { nombre } : undefined)
  const deleteProveedor = useDeleteProveedor()
  const restoreProveedor = useRestoreProveedor()

  function handleRestore(proveedor: Proveedor) {
    restoreProveedor.mutate(proveedor.id, {
      onSuccess: () => toast.success("Proveedor restaurado"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo restaurar el proveedor"),
    })
  }

  function confirmDeactivate() {
    if (!deactivating) return
    deleteProveedor.mutate(deactivating.id, {
      onSuccess: () => {
        toast.success("Proveedor desactivado")
        setDeactivating(undefined)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo desactivar el proveedor"),
    })
  }

  const columns: ColumnDef<Proveedor>[] = [
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "nit", header: "NIT", cell: ({ row }) => row.original.nit ?? "—" },
    { accessorKey: "email", header: "Email", cell: ({ row }) => row.original.email ?? "—" },
    { accessorKey: "telefono", header: "Teléfono", cell: ({ row }) => row.original.telefono ?? "—" },
    { accessorKey: "activo", header: "Estado", cell: ({ row }) => <StatusBadge activo={row.original.activo} /> },
    {
      id: "actions",
      cell: ({ row }) => {
        const proveedor = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <IconDotsVertical />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => { setEditing(proveedor); setFormOpen(true) }}>
                Editar
              </DropdownMenuItem>
              {proveedor.activo ? (
                <DropdownMenuItem variant="destructive" onClick={() => setDeactivating(proveedor)}>
                  Desactivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleRestore(proveedor)}>Restaurar</DropdownMenuItem>
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
        title="Proveedores"
        description="Proveedores registrados en la organización."
        action={
          <Button onClick={() => { setEditing(undefined); setFormOpen(true) }}>
            <IconPlus />
            Crear Proveedor
          </Button>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <SearchInput value={nombre} onChange={setNombre} placeholder="Buscar por nombre..." className="max-w-xs" />
        <CrudTable columns={columns} data={proveedores ?? []} isLoading={isLoading} emptyMessage="Sin proveedores registrados." />
      </div>

      <ProveedorForm open={formOpen} onOpenChange={setFormOpen} proveedor={editing} />
      <ConfirmDialog
        open={!!deactivating}
        onOpenChange={(open) => !open && setDeactivating(undefined)}
        title="¿Desactivar proveedor?"
        description={`El proveedor "${deactivating?.nombre}" quedará marcado como inactivo.`}
        confirmLabel="Desactivar"
        variant="destructive"
        isLoading={deleteProveedor.isPending}
        onConfirm={confirmDeactivate}
      />
    </div>
  )
}
