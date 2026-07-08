import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useRoles } from "@/hooks/useRoles"
import { useUpdateUsuarioRol } from "@/hooks/useUsuarios"
import { ApiError } from "@/lib/api"
import type { Usuario } from "@/types/usuario"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ChangeRolDialogProps {
  usuario?: Usuario
  onOpenChange: (open: boolean) => void
}

export function ChangeRolDialog({ usuario, onOpenChange }: ChangeRolDialogProps) {
  const { data: roles } = useRoles()
  const updateRol = useUpdateUsuarioRol()
  const [rolId, setRolId] = useState("")

  useEffect(() => {
    setRolId(usuario?.rolId ?? "")
  }, [usuario])

  function handleConfirm() {
    if (!usuario || !rolId) return
    updateRol.mutate(
      { id: usuario.id, data: { rolId } },
      {
        onSuccess: () => {
          toast.success("Rol actualizado")
          onOpenChange(false)
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : "No se pudo actualizar el rol")
        },
      }
    )
  }

  return (
    <Dialog open={!!usuario} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar rol</DialogTitle>
          <DialogDescription>
            Selecciona el nuevo rol para {usuario?.email}.
          </DialogDescription>
        </DialogHeader>
        <Select value={rolId} onValueChange={setRolId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar rol" />
          </SelectTrigger>
          <SelectContent>
            {(roles ?? []).map((rol) => (
              <SelectItem key={rol.id} value={rol.id}>
                {rol.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button onClick={handleConfirm} disabled={updateRol.isPending || !rolId}>
            {updateRol.isPending && <Loader2 className="animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
