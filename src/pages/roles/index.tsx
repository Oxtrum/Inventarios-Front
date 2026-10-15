import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { IconDotsVertical, IconPlus } from "@tabler/icons-react"
import type { ColumnDef } from "@tanstack/react-table"

import { useRoles } from "@/hooks/useRoles"
import { useServerPagination } from "@/hooks/useServerPagination"
import type { Rol } from "@/types/rol"
import { PageHeader } from "@/components/shared/PageHeader"
import { CrudTable } from "@/components/shared/CrudTable"
import { Can } from "@/components/shared/Can"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RolForm } from "./RolForm"

export default function RolesPage() {
  const navigate = useNavigate()
  const pagination = useServerPagination()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Rol | undefined>(undefined)

  const { data: roles, isLoading, isError, error, refetch } = useRoles(pagination.params)

  const columns: ColumnDef<Rol>[] = [
    { accessorKey: "codigo", header: "Código" },
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "descripcion", header: "Descripción", cell: ({ row }) => row.original.descripcion ?? "—" },
    {
      id: "actions",
      cell: ({ row }) => {
        const rol = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <IconDotsVertical />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <Can permission="roles:actualizar">
                <DropdownMenuItem onClick={() => { setEditing(rol); setFormOpen(true) }}>
                  Editar
                </DropdownMenuItem>
              </Can>
              <Can allOf={["roles:permisos", "permisos:leer"]}>
                <DropdownMenuItem onClick={() => navigate(`/roles/${rol.id}`)}>
                  Ver permisos
                </DropdownMenuItem>
              </Can>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title="Roles"
        description="Roles y permisos de la organización."
        action={
          <Can permission="roles:crear">
            <Button onClick={() => { setEditing(undefined); setFormOpen(true) }}>
              <IconPlus />
              Crear Rol
            </Button>
          </Can>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <CrudTable columns={columns} data={roles ?? []} isLoading={isLoading} isError={isError} error={error} onRetry={() => { void refetch() }} emptyMessage="Sin roles registrados." pagination={roles?.pagination} onPaginationChange={pagination.setOffset} />
      </div>

      <RolForm open={formOpen} onOpenChange={setFormOpen} rol={editing} />
    </div>
  )
}
