import { useState } from "react"
import { IconDotsVertical, IconPlus } from "@tabler/icons-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { useSucursales, useDeleteSucursal, useRestoreSucursal } from "@/hooks/useSucursales"
import { useServerPagination } from "@/hooks/useServerPagination"
import { ApiError } from "@/lib/api"
import type { Sucursal } from "@/types/sucursal"
import { PageHeader } from "@/components/shared/PageHeader"
import { SearchInput } from "@/components/shared/SearchInput"
import { CrudTable } from "@/components/shared/CrudTable"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Can } from "@/components/shared/Can"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SucursalForm } from "./SucursalForm"

export default function SucursalesPage() {
  const [nombre, setNombre] = useState("")
  const [activo, setActivo] = useState("true")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Sucursal | undefined>(undefined)
  const [deactivating, setDeactivating] = useState<Sucursal | undefined>(undefined)

  const pagination = useServerPagination(10, `${activo}:${nombre}`)
  const {
    data: sucursales,
    isLoading,
    isError,
    error,
    refetch,
  } = useSucursales({
    activo,
    ...(nombre ? { nombre } : {}),
    ...pagination.params,
  })
  const deleteSucursal = useDeleteSucursal()
  const restoreSucursal = useRestoreSucursal()

  function handleRestore(sucursal: Sucursal) {
    restoreSucursal.mutate(sucursal.id, {
      onSuccess: () => toast.success("Sucursal restaurada"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo restaurar la sucursal"),
    })
  }

  function confirmDeactivate() {
    if (!deactivating) return
    deleteSucursal.mutate(deactivating.id, {
      onSuccess: () => {
        toast.success("Sucursal desactivada")
        setDeactivating(undefined)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo desactivar la sucursal"),
    })
  }

  const columns: ColumnDef<Sucursal>[] = [
    { accessorKey: "codigo", header: "Código", cell: ({ row }) => row.original.codigo ?? "—" },
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "direccion", header: "Dirección", cell: ({ row }) => row.original.direccion ?? "—" },
    { accessorKey: "telefono", header: "Teléfono", cell: ({ row }) => row.original.telefono ?? "—" },
    { accessorKey: "activo", header: "Estado", cell: ({ row }) => <StatusBadge activo={row.original.activo} /> },
    {
      id: "actions",
      cell: ({ row }) => {
        const sucursal = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <IconDotsVertical />
                <span className="sr-only">
                  Acciones para la sucursal {sucursal.nombre}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <Can permission="sucursales:actualizar">
                <DropdownMenuItem onClick={() => { setEditing(sucursal); setFormOpen(true) }}>
                  Editar
                </DropdownMenuItem>
              </Can>
              {sucursal.activo ? (
                <Can permission="sucursales:desactivar">
                  <DropdownMenuItem variant="destructive" onClick={() => setDeactivating(sucursal)}>
                    Desactivar
                  </DropdownMenuItem>
                </Can>
              ) : (
                <Can permission="sucursales:restaurar">
                  <DropdownMenuItem onClick={() => handleRestore(sucursal)}>Restaurar</DropdownMenuItem>
                </Can>
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
        title="Sucursales"
        description="Puntos de venta y almacenes de la organización."
        action={
          <Can permission="sucursales:crear">
            <Button onClick={() => { setEditing(undefined); setFormOpen(true) }}>
              <IconPlus />
              Crear Sucursal
            </Button>
          </Can>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput value={nombre} onChange={setNombre} placeholder="Buscar por nombre..." className="max-w-xs" />
          <ToggleGroup
            type="single"
            value={activo}
            onValueChange={(value) => value && setActivo(value)}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="true">Activos</ToggleGroupItem>
            <ToggleGroupItem value="false">Inactivos</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <CrudTable
          columns={columns}
          data={sucursales ?? []}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
          pagination={sucursales?.pagination}
          onPaginationChange={pagination.setOffset}
          caption="Sucursales de la organización"
          emptyMessage={
            activo === "false"
              ? "No hay sucursales desactivadas."
              : nombre
                ? `Ninguna sucursal coincide con "${nombre}".`
                : "Sin sucursales registradas."
          }
          emptyAction={
            nombre ? (
              <Button variant="outline" size="sm" onClick={() => setNombre("")}>
                Limpiar búsqueda
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  setEditing(undefined)
                  setFormOpen(true)
                }}
              >
                <IconPlus />
                Crear Sucursal
              </Button>
            )
          }
        />
      </div>

      <SucursalForm open={formOpen} onOpenChange={setFormOpen} sucursal={editing} />
      <ConfirmDialog
        open={!!deactivating}
        onOpenChange={(open) => !open && setDeactivating(undefined)}
        title="¿Desactivar sucursal?"
        description={`La sucursal "${deactivating?.nombre}" quedará marcada como inactiva.`}
        confirmLabel="Desactivar"
        variant="destructive"
        isLoading={deleteSucursal.isPending}
        onConfirm={confirmDeactivate}
      />
    </div>
  )
}
