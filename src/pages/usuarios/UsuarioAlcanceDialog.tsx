import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useSucursales } from "@/hooks/useSucursales"
import { useUpdateUsuarioAlcance, useUsuarioAlcance } from "@/hooks/useUsuarios"
import { ApiError } from "@/lib/api"
import type { Usuario, UsuarioAlcance, UpdateUsuarioAlcanceInput } from "@/types/usuario"
import { UsuarioAlcanceFields } from "./UsuarioAlcanceFields"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

interface UsuarioAlcanceDialogProps {
  usuario?: Usuario
  onOpenChange: (open: boolean) => void
}

interface AlcanceEditorProps {
  usuario: Usuario
  initial: UsuarioAlcance
  branches: ReturnType<typeof useSucursales>["data"]
  branchesLoading: boolean
  branchesError: boolean
  onClose: () => void
}

function AlcanceEditor({
  usuario,
  initial,
  branches,
  branchesLoading,
  branchesError,
  onClose,
}: AlcanceEditorProps) {
  const updateAlcance = useUpdateUsuarioAlcance()
  const [value, setValue] = useState<UpdateUsuarioAlcanceInput>(() => ({
    alcanceDatos: initial.alcanceDatos,
    sucursalIds: Array.isArray(initial.sucursalesPermitidas)
      ? initial.sucursalesPermitidas.map((item) => item.id)
      : [],
    sucursalPrincipalId: initial.sucursalPrincipalId,
  }))

  const localScopeIsValid = value.alcanceDatos === "organizacion"
    || (
      value.sucursalIds.length > 0
      && !!value.sucursalPrincipalId
      && value.sucursalIds.includes(value.sucursalPrincipalId)
    )
  const branchesUnavailable = value.alcanceDatos === "sucursales" && branchesError

  function handleSave() {
    if (!localScopeIsValid || branchesUnavailable) return
    updateAlcance.mutate(
      { id: usuario.id, data: value },
      {
        onSuccess: () => {
          toast.success("Alcance actualizado")
          onClose()
        },
        onError: (error) => {
          toast.error(error instanceof ApiError ? error.message : "No se pudo actualizar el alcance")
        },
      }
    )
  }

  return (
    <>
      <div className="px-6 py-2">
        <UsuarioAlcanceFields
          value={value}
          onChange={setValue}
          sucursales={branches}
          isLoading={branchesLoading}
          disabled={updateAlcance.isPending}
        />
        {branchesUnavailable && (
          <p className="mt-3 text-sm text-destructive">
            No se pudieron cargar las sucursales disponibles.
          </p>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={updateAlcance.isPending}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={updateAlcance.isPending || !localScopeIsValid || branchesUnavailable}
        >
          {updateAlcance.isPending && <Loader2 className="animate-spin" />}
          Guardar alcance
        </Button>
      </DialogFooter>
    </>
  )
}

export function UsuarioAlcanceDialog({ usuario, onOpenChange }: UsuarioAlcanceDialogProps) {
  const id = usuario?.id ?? ""
  const alcance = useUsuarioAlcance(id, { enabled: !!usuario })
  const branches = useSucursales(undefined, { enabled: !!usuario })

  return (
    <Dialog open={!!usuario} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Administrar alcance</DialogTitle>
          <DialogDescription>
            Define qué sucursales puede consultar u operar {usuario?.email}.
          </DialogDescription>
        </DialogHeader>

        {alcance.isLoading ? (
          <div className="space-y-3 px-6 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : alcance.isError || !alcance.data ? (
          <div className="space-y-4 px-6 py-6 text-center">
            <p className="text-sm text-muted-foreground">No se pudo cargar el alcance del usuario.</p>
            <Button variant="outline" onClick={() => alcance.refetch()}>Reintentar</Button>
          </div>
        ) : usuario ? (
          <AlcanceEditor
            key={`${usuario.id}-${alcance.dataUpdatedAt}`}
            usuario={usuario}
            initial={alcance.data}
            branches={branches.data}
            branchesLoading={branches.isLoading}
            branchesError={branches.isError}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
