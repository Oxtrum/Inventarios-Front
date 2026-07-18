import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { IconDotsVertical, IconPlus } from "@tabler/icons-react"
import type { ColumnDef } from "@tanstack/react-table"

import { useConteos } from "@/hooks/useConteos"
import { useServerPagination } from "@/hooks/useServerPagination"
import { useSucursal } from "@/context/sucursal-provider"
import type { Conteo } from "@/types/conteo"
import { PageHeader } from "@/components/shared/PageHeader"
import { CrudTable } from "@/components/shared/CrudTable"
import { EstadoBadge } from "@/components/shared/StatusBadge"
import { Can } from "@/components/shared/Can"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConteoForm } from "./ConteoForm"

export default function ConteosPage() {
  const navigate = useNavigate()
  const pagination = useServerPagination()
  const [formOpen, setFormOpen] = useState(false)
  const { sucursales } = useSucursal()
  const { data: conteos, isLoading } = useConteos(pagination.params)

  const sucursalPorId = useMemo(() => new Map((sucursales ?? []).map((s) => [s.id, s.nombre])), [sucursales])

  const columns: ColumnDef<Conteo>[] = [
    {
      accessorKey: "sucursalId",
      header: "Sucursal",
      cell: ({ row }) => sucursalPorId.get(row.original.sucursalId) ?? "—",
    },
    { accessorKey: "estado", header: "Estado", cell: ({ row }) => <EstadoBadge estado={row.original.estado} /> },
    {
      accessorKey: "items",
      header: "Productos",
      cell: ({ row }) => row.original.items.length,
    },
    {
      accessorKey: "fechaCreacion",
      header: "Fecha",
      cell: ({ row }) => new Date(row.original.fechaCreacion).toLocaleDateString("es-ES"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
              <IconDotsVertical />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => navigate(`/conteos/${row.original.id}`)}>
              Ver detalle
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title="Conteos"
        description="Conteos físicos de inventario por sucursal."
        action={
          <Can permission="conteos:crear">
            <Button onClick={() => setFormOpen(true)}>
              <IconPlus />
              Crear Conteo
            </Button>
          </Can>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <CrudTable columns={columns} data={conteos ?? []} isLoading={isLoading} emptyMessage="Sin conteos registrados." pagination={conteos?.pagination} onPaginationChange={pagination.setOffset} />
      </div>

      <ConteoForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
