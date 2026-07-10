import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { IconAdjustments, IconDotsVertical, IconPlus } from "@tabler/icons-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { useAtributos, useDeleteAtributo, useRestoreAtributo } from "@/hooks/useAtributos"
import { ApiError } from "@/lib/api"
import type { Atributo } from "@/types/atributo"
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
import { AtributoForm } from "./AtributoForm"

const TIPO_DATO_LABELS: Record<string, string> = {
  texto: "Texto",
  numero: "Número",
  booleano: "Booleano",
  fecha: "Fecha",
  opcion: "Opción",
}

export default function AtributosPage() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Atributo | undefined>(undefined)
  const [deactivating, setDeactivating] = useState<Atributo | undefined>(undefined)

  const { data: atributos, isLoading } = useAtributos(nombre ? { nombre } : undefined)
  const deleteAtributo = useDeleteAtributo()
  const restoreAtributo = useRestoreAtributo()

  function handleRestore(atributo: Atributo) {
    restoreAtributo.mutate(atributo.id, {
      onSuccess: () => toast.success("Atributo restaurado"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo restaurar el atributo"),
    })
  }

  function confirmDeactivate() {
    if (!deactivating) return
    deleteAtributo.mutate(deactivating.id, {
      onSuccess: () => {
        toast.success("Atributo desactivado")
        setDeactivating(undefined)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo desactivar el atributo"),
    })
  }

  const columns: ColumnDef<Atributo>[] = [
    { accessorKey: "codigo", header: "Código" },
    { accessorKey: "nombre", header: "Nombre" },
    {
      accessorKey: "tipoDato",
      header: "Tipo de Dato",
      cell: ({ row }) => <Badge variant="outline">{TIPO_DATO_LABELS[row.original.tipoDato]}</Badge>,
    },
    { accessorKey: "esFiltrable", header: "Filtrable", cell: ({ row }) => (row.original.esFiltrable ? "Sí" : "No") },
    { accessorKey: "esVariante", header: "Variante", cell: ({ row }) => (row.original.esVariante ? "Sí" : "No") },
    { accessorKey: "activo", header: "Estado", cell: ({ row }) => <StatusBadge activo={row.original.activo} /> },
    {
      id: "actions",
      cell: ({ row }) => {
        const atributo = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <IconDotsVertical />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {atributo.tipoDato === "opcion" && (
                <DropdownMenuItem onClick={() => navigate(`/atributos/${atributo.id}`)}>
                  <IconAdjustments />
                  Valores
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => { setEditing(atributo); setFormOpen(true) }}>
                Editar
              </DropdownMenuItem>
              {atributo.activo ? (
                <DropdownMenuItem variant="destructive" onClick={() => setDeactivating(atributo)}>
                  Desactivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleRestore(atributo)}>Restaurar</DropdownMenuItem>
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
        title="Atributos"
        description="Catálogo de atributos disponibles para productos y variantes."
        action={
          <Button onClick={() => { setEditing(undefined); setFormOpen(true) }}>
            <IconPlus />
            Crear Atributo
          </Button>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <SearchInput value={nombre} onChange={setNombre} placeholder="Buscar por nombre..." className="max-w-xs" />
        <CrudTable columns={columns} data={atributos ?? []} isLoading={isLoading} emptyMessage="Sin atributos registrados." />
      </div>

      <AtributoForm open={formOpen} onOpenChange={setFormOpen} atributo={editing} />
      <ConfirmDialog
        open={!!deactivating}
        onOpenChange={(open) => !open && setDeactivating(undefined)}
        title="¿Desactivar atributo?"
        description={`El atributo "${deactivating?.nombre}" quedará marcado como inactivo.`}
        confirmLabel="Desactivar"
        variant="destructive"
        isLoading={deleteAtributo.isPending}
        onConfirm={confirmDeactivate}
      />
    </div>
  )
}
