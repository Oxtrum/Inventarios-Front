import { useState } from "react"
import { IconDotsVertical, IconPlus } from "@tabler/icons-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { useUsuarios, useDeactivateUsuario, useRestoreUsuario } from "@/hooks/useUsuarios"
import { ApiError } from "@/lib/api"
import type { Usuario } from "@/types/usuario"
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
import { UsuarioForm } from "./UsuarioForm"
import { ChangeRolDialog } from "./ChangeRolDialog"
import { ChangePasswordDialog } from "./ChangePasswordDialog"

export default function UsuariosPage() {
  const [email, setEmail] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [changingRol, setChangingRol] = useState<Usuario | undefined>(undefined)
  const [changingPassword, setChangingPassword] = useState<Usuario | undefined>(undefined)
  const [deactivating, setDeactivating] = useState<Usuario | undefined>(undefined)

  const { data: usuarios, isLoading } = useUsuarios(email ? { email } : undefined)
  const deactivateUsuario = useDeactivateUsuario()
  const restoreUsuario = useRestoreUsuario()

  function handleRestore(usuario: Usuario) {
    restoreUsuario.mutate(usuario.id, {
      onSuccess: () => toast.success("Usuario restaurado"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo restaurar el usuario"),
    })
  }

  function confirmDeactivate() {
    if (!deactivating) return
    deactivateUsuario.mutate(deactivating.id, {
      onSuccess: () => {
        toast.success("Usuario desactivado")
        setDeactivating(undefined)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo desactivar el usuario"),
    })
  }

  const columns: ColumnDef<Usuario>[] = [
    { accessorKey: "email", header: "Email" },
    { accessorKey: "nombres", header: "Nombres", cell: ({ row }) => row.original.nombres ?? "—" },
    { accessorKey: "apellidos", header: "Apellidos", cell: ({ row }) => row.original.apellidos ?? "—" },
    {
      accessorKey: "rolCodigo",
      header: "Rol",
      cell: ({ row }) => row.original.rolCodigo ? <Badge variant="outline">{row.original.rolCodigo}</Badge> : "—",
    },
    {
      accessorKey: "ultimoLogin",
      header: "Último Login",
      cell: ({ row }) => row.original.ultimoLogin ? new Date(row.original.ultimoLogin).toLocaleString("es-ES") : "Nunca",
    },
    { accessorKey: "activo", header: "Estado", cell: ({ row }) => <StatusBadge activo={row.original.activo} /> },
    {
      id: "actions",
      cell: ({ row }) => {
        const usuario = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <IconDotsVertical />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setChangingRol(usuario)}>Cambiar rol</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChangingPassword(usuario)}>Cambiar contraseña</DropdownMenuItem>
              {usuario.activo ? (
                <DropdownMenuItem variant="destructive" onClick={() => setDeactivating(usuario)}>
                  Desactivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleRestore(usuario)}>Restaurar</DropdownMenuItem>
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
        title="Usuarios"
        description="Usuarios con acceso a la organización."
        action={
          <Button onClick={() => setFormOpen(true)}>
            <IconPlus />
            Crear Usuario
          </Button>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <SearchInput value={email} onChange={setEmail} placeholder="Buscar por email..." className="max-w-xs" />
        <CrudTable columns={columns} data={usuarios ?? []} isLoading={isLoading} emptyMessage="Sin usuarios registrados." />
      </div>

      <UsuarioForm open={formOpen} onOpenChange={setFormOpen} />
      <ChangeRolDialog usuario={changingRol} onOpenChange={(open) => !open && setChangingRol(undefined)} />
      <ChangePasswordDialog usuario={changingPassword} onOpenChange={(open) => !open && setChangingPassword(undefined)} />
      <ConfirmDialog
        open={!!deactivating}
        onOpenChange={(open) => !open && setDeactivating(undefined)}
        title="¿Desactivar usuario?"
        description={`El usuario "${deactivating?.email}" perderá acceso a la organización.`}
        confirmLabel="Desactivar"
        variant="destructive"
        isLoading={deactivateUsuario.isPending}
        onConfirm={confirmDeactivate}
      />
    </div>
  )
}
