import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { IconAdjustments, IconDotsVertical, IconPlus } from "@tabler/icons-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { useTiposProducto, useDeleteTipoProducto, useRestoreTipoProducto } from "@/hooks/useTiposProducto"
import { useTiposNegocio } from "@/hooks/useTiposNegocio"
import { ApiError } from "@/lib/api"
import type { TipoProducto } from "@/types/tipoProducto"
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
import { TipoProductoForm } from "./TipoProductoForm"

export default function TiposProductoPage() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<TipoProducto | undefined>(undefined)
  const [deactivating, setDeactivating] = useState<TipoProducto | undefined>(undefined)

  const { data: tiposNegocio } = useTiposNegocio({ activo: "true" })
  const { data: tiposProducto, isLoading } = useTiposProducto(nombre ? { nombre } : undefined)
  const deleteTipoProducto = useDeleteTipoProducto()
  const restoreTipoProducto = useRestoreTipoProducto()

  const tipoNegocioNombrePorId = useMemo(() => {
    const map = new Map<string, string>()
    for (const tipoNegocio of tiposNegocio ?? []) map.set(tipoNegocio.id, tipoNegocio.nombre)
    return map
  }, [tiposNegocio])

  function handleRestore(tipoProducto: TipoProducto) {
    restoreTipoProducto.mutate(tipoProducto.id, {
      onSuccess: () => toast.success("Tipo de producto restaurado"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo restaurar el tipo de producto"),
    })
  }

  function confirmDeactivate() {
    if (!deactivating) return
    deleteTipoProducto.mutate(deactivating.id, {
      onSuccess: () => {
        toast.success("Tipo de producto desactivado")
        setDeactivating(undefined)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo desactivar el tipo de producto"),
    })
  }

  const columns: ColumnDef<TipoProducto>[] = [
    { accessorKey: "codigo", header: "Código" },
    { accessorKey: "nombre", header: "Nombre" },
    {
      accessorKey: "tipoNegocioId",
      header: "Tipo de Negocio",
      cell: ({ row }) => {
        const id = row.original.tipoNegocioId
        return id ? <Badge variant="outline">{tipoNegocioNombrePorId.get(id) ?? "—"}</Badge> : "—"
      },
    },
    { accessorKey: "activo", header: "Estado", cell: ({ row }) => <StatusBadge activo={row.original.activo} /> },
    {
      id: "actions",
      cell: ({ row }) => {
        const tipoProducto = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <IconDotsVertical />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate(`/tipos-producto/${tipoProducto.id}`)}>
                <IconAdjustments />
                Atributos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setEditing(tipoProducto); setFormOpen(true) }}>
                Editar
              </DropdownMenuItem>
              {tipoProducto.activo ? (
                <DropdownMenuItem variant="destructive" onClick={() => setDeactivating(tipoProducto)}>
                  Desactivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleRestore(tipoProducto)}>Restaurar</DropdownMenuItem>
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
        title="Tipos de Producto"
        description="Clasifica tus productos y define qué atributos aplican a cada tipo."
        action={
          <Button onClick={() => { setEditing(undefined); setFormOpen(true) }}>
            <IconPlus />
            Crear Tipo de Producto
          </Button>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <SearchInput value={nombre} onChange={setNombre} placeholder="Buscar por nombre..." className="max-w-xs" />
        <CrudTable columns={columns} data={tiposProducto ?? []} isLoading={isLoading} emptyMessage="Sin tipos de producto registrados." />
      </div>

      <TipoProductoForm open={formOpen} onOpenChange={setFormOpen} tipoProducto={editing} />
      <ConfirmDialog
        open={!!deactivating}
        onOpenChange={(open) => !open && setDeactivating(undefined)}
        title="¿Desactivar tipo de producto?"
        description={`El tipo de producto "${deactivating?.nombre}" quedará marcado como inactivo.`}
        confirmLabel="Desactivar"
        variant="destructive"
        isLoading={deleteTipoProducto.isPending}
        onConfirm={confirmDeactivate}
      />
    </div>
  )
}
